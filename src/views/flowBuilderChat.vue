<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- Custom Flow Builder Header -->
    <FlowBuilderHeader 
      :flow-name="currentFlow?.nome || 'Novo Fluxo'"
      flow-type="atendimento"
      v-model:is-active="isFlowActive"
      v-model:view-mode="viewMode"
      :has-unsaved-changes="hasUnsavedChanges"
      @toggle-active="isFlowActive = $event"
      @save="handleSave"
      @back="goBack"
      @simulate="handleSimulate"
      @validate="handleValidate"
      @layout="handleLayout"
      @settings="handleSettings"
      @export="handleExport"
      @import="handleImport"
    />

    <!-- Flow Config Sheet -->
    <FlowConfigSheet
      v-model:open="configSheetOpen"
      :initial-config="flowConfig"
      @save="handleSaveConfig"
    />


    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar: Edit Mode = Block Selector, Execution Mode = Execution List -->
      <FlowBuilderChatSidebar 
        v-if="viewMode === 'edit'"
        :collapsed="isSidebarCollapsed" 
        :flow-type="currentFlow?.tipo" 
        @toggle="toggleSidebar" 
        @block-click="handleBlockClick" 
      />
      <ExecutionListSidebar
        v-else
        :collapsed="isSidebarCollapsed"
        :flow-id="currentFlow?.id || ''"
        @toggle="toggleSidebar"
        @exit="viewMode = 'edit'"
        @select-execution="handleSelectExecution"
      />

      <!-- Vue Flow Canvas -->
      <div
        :class="cn(
          'flex-1 transition-all duration-300',
          isSidebarCollapsed ? 'ml-[64px]' : 'ml-[320px]'
        )"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        <div class="h-full">
        <ResizablePanelGroup :direction="layoutMode === 'horizontal' ? 'vertical' : 'horizontal'">
          <!-- Painel Superior: Canvas VueFlow -->
          <ResizablePanel :default-size="60" :min-size="20" :max-size="80" class="relative">
            <VueFlow
              v-model:nodes="nodes"
              v-model:edges="edges"
              :default-viewport="{ zoom: 1 }"
              :min-zoom="0.2"
              :max-zoom="4"
              :node-types="nodeTypes"
              :edge-types="edgeTypes"
              :edges-updatable="true"
              :nodes-draggable="true"
              :is-valid-connection="isValidConnection"
              :elements-selectable="true"
              :delete-key-code="['Delete', 'Backspace']"
              :connection-mode="ConnectionMode.Loose"
              :connect-on-click="false"
              :connection-radius="30"
              :auto-connect="true"
              :fit-view-on-init="false"
              class="vue-flow-container"
              @connect="onConnect"
              @nodes-change="onNodesChange"
              @edges-change="onEdgesChange"
            >
              <Background variant="dots" :gap="12" :size="1" />
              
              <!-- Custom Toolbar -->
              <FlowToolbar
                :can-undo="canUndo"
                :can-redo="canRedo"
                :layout-mode="layoutMode"
                @zoom-in="zoomIn"
                @zoom-out="zoomOut"
                @undo="undo"
                @redo="redo"
                @fit-view="() => fitView({ padding: 0.2, maxZoom: 1 })"
                @layout="handleLayout"
                @toggle-layout="toggleLayoutMode"
              />

              <!-- Helper Lines -->
              <HelperLines 
                :horizontal="helperLineHorizontal"
                :vertical="helperLineVertical"
              />
              
              <!-- Minimap - aparece apenas durante zoom -->
              <MiniMap 
                v-if="showMinimap"
                :node-color="getNodeColor"
                position="bottom-right"
                pannable
                zoomable
                :mask-color="minimapMaskColor"
                class="vue-flow__minimap-custom"
                :style="{ zIndex: 50 }"
              />
            </VueFlow>

            <!-- Painel de Configuração Sliding -->
            <div 
              v-if="showConfigPanel && selectedNodeId"
              class="absolute right-0 top-0 bottom-0 z-50 shadow-xl bg-background border-l animate-in slide-in-from-right duration-200"
            >
              <BlockConfigPanel
                :block-id="selectedNodeId"
                :block-type="selectedNodeData.type"
                v-model="selectedNodeData"
                @close="closeConfigPanel"
                @save="handleSaveBlock"
              />
            </div>
          </ResizablePanel>

          <!-- Divider -->
          <ResizableHandle v-if="showSimulator" with-handle />

          <!-- Painel Inferior: Simulador -->
            <ResizablePanel 
              v-if="showSimulator" 
              :default-size="simPanelDefault" 
              :min-size="simPanelMin" 
              :max-size="simPanelMax"
              class="relative z-0"
            >
              <ChatSimulator
                :nodes="nodes"
                :edges="edges"
                :flow-id="currentFlow?.id"
                :flow-name="currentFlow?.nome"
                contact-id="mock-contact-test-1"
                :contact-data="{ name: 'Contato Teste', phone: '5511999999999', email: 'teste@exemplo.com' }"
                @close="handleCloseSimulator"
                @block-execute="handleBlockExecute"
                @execution-state-change="handleExecutionStateChange"
              />
            </ResizablePanel>
        </ResizablePanelGroup>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueFlow, useVueFlow, ConnectionMode, Position, MarkerType, applyNodeChanges, applyEdgeChanges } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@vue-flow/core';
import { cn } from '@/lib/utils';
import FlowBuilderChatSidebar from '@/components/layout/FlowBuilderChatSidebar.vue';
import FlowBuilderHeader from '@/components/flows/FlowBuilderHeader.vue';
import FlowToolbar from '@/components/flow-builder/FlowToolbar.vue';
import { MOCK_FLOWS_ATENDIMENTO, FLOW_DATA_MAP, type Flow } from '@/mocks/data/flows';
import type { FlowExecution } from '@/types/execution';
import CustomNode from '@/components/flow-builder/CustomNode.vue';
import CustomNodeHorizontal from '@/components/flow-builder/CustomNodeHorizontal.vue';
import CustomNodeVertical from '@/components/flow-builder/CustomNodeVertical.vue';
import CustomNodeNote from '@/components/flow-builder/CustomNodeNote.vue';
import CustomEdge from '@/components/flow-builder/CustomEdge.vue';
import BlockConfigPanel from '@/components/flow-builder/BlockConfigPanel.vue';
import ExecutionListSidebar from '@/components/flow-builder/ExecutionListSidebar.vue';

import HelperLines from '@/components/flow-builder/HelperLines.vue';
import { getHelperLines } from '@/components/flow-builder/utils';
import { useLayout } from '@/composables/useLayout';
import type { GraphNode } from '@vue-flow/core';
import { useRefHistory } from '@vueuse/core';
import { useFlowsStore } from '@/stores';
import { useToast } from '@/components/ui/toast/use-toast';
import ChatSimulator from '@/components/flow-builder/ChatSimulator.vue';
import FlowConfigSheet from '@/components/flow-builder/FlowConfigSheet.vue';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import type { FlowConfigData } from '@/types/flow-config';
import { getDefaultFlowConfig } from '@/constants/flow-config-defaults';
import type { ViewMode } from '@/components/flows/FlowBuilderHeader.vue';

const route = useRoute();
const router = useRouter();
const { getViewport, onViewportChange, addEdges, onNodeClick, onPaneClick, fitView, zoomIn, zoomOut, project } = useVueFlow();
const { toast } = useToast();
const flowsStore = useFlowsStore();

const flowId = computed(() => route.params.id as string);
const isNewFlow = computed(() => flowId.value === 'novo');
const isSidebarCollapsed = ref(false);
const currentFlow = ref<Flow | null>(null);
const isFlowActive = ref(false);
const viewMode = ref<ViewMode>('edit');

// 🆕 Estado do FlowConfigSheet
const configSheetOpen = ref(false);
const flowConfig = ref<Partial<FlowConfigData>>(getDefaultFlowConfig());

// 🆕 Vue Flow elements - SEPARADOS em nodes e edges
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
let nodeIdCounter = 0;

// History Support
const { undo, redo, canUndo, canRedo } = useRefHistory(nodes, { 
  deep: true,
  capacity: 20 
});

// Dirty state tracking - tracks unsaved changes
const hasUnsavedChanges = ref(true); // Start as true for new flows
const lastSavedState = ref(false); // Flag to track if we've saved at least once

// Watch for ANY changes (including position changes from dragging)
watch([nodes, edges, isFlowActive], () => {
  // If we have a saved state, any change marks as dirty
  if (lastSavedState.value) {
    hasUnsavedChanges.value = true;
  }
}, { deep: true });

// 🆕 Estado para o painel de configuração
const selectedNodeId = ref<string | null>(null);
const selectedNodeData = ref<any>(null);

const showConfigPanel = ref(false);


// Estado do Simulador
const showSimulator = ref(false);
// Layout Mode: 'horizontal' (simulator bottom) or 'vertical' (simulator right)
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal');
// Provide layoutMode to child components (CustomNode, etc.)
provide('layoutMode', layoutMode);
// Tamanhos do painel do simulador em % do group (sem cálculo dinâmico px)
const simPanelDefault = 70; // default 40%
const simPanelMin = 20;     // min 20%
const simPanelMax = 80;     // max 80%

// Helper Lines state
const helperLineHorizontal = ref<number | undefined>(undefined);
const helperLineVertical = ref<number | undefined>(undefined);

// 🆕 Registrar tipos de nodes customizados
const nodeTypes = {
  customNode: CustomNode,
  customNodeHorizontal: CustomNodeHorizontal,
  customNodeVertical: CustomNodeVertical,
  noteNode: CustomNodeNote,
  default: CustomNode,
};

// 🆕 Registrar tipos de edges customizados
const edgeTypes = {
  default: CustomEdge,
  custom: CustomEdge,
  smoothstep: CustomEdge, // 🆕 Mapeando smoothstep também
};

// 🆕 Estados para controle do MiniMap
const showMinimap = ref(false);
const lastZoom = ref<number | null>(null);
let minimapTimeout: number | null = null;

// 🎨 Cores do MiniMap usando variáveis do index.css
const minimapMaskColor = computed(() => {
  // Usa a variável --background definida no index.css com opacidade
  return 'hsl(var(--background) / 0.8)';
});

// 🆕 Função para colorir nodes no MiniMap usando variáveis do index.css
const getNodeColor = (): string => {
  // Usa a variável --muted-foreground definida no index.css
  return 'hsl(var(--muted-foreground))';
};

// 🆕 Handler para mudança de viewport
const handleViewportChange = () => {
  const currentViewport = getViewport();
  const currentZoom = currentViewport.zoom;

  // Verificar se houve mudança de zoom (não apenas pan)
  if (lastZoom.value !== null && lastZoom.value !== currentZoom) {
    showMinimap.value = true;

    // Limpar timeout anterior
    if (minimapTimeout) {
      clearTimeout(minimapTimeout);
    }

    // Esconder minimap após 2 segundos sem zoom
    minimapTimeout = setTimeout(() => {
      showMinimap.value = false;
    }, 2000);
  }

  lastZoom.value = currentZoom;
};



// 🆕 Handler para clique no node
onNodeClick(({ node }) => {
  if (node.type === 'noteNode') return; // Notas não têm configuração rica por enquanto
  if (['start', 'end'].includes(node.data.type)) return; // Início e Fim não têm configuração
  
  selectedNodeId.value = node.id;
  // Clona os dados para evitar mutação direta sem salvar
  selectedNodeData.value = JSON.parse(JSON.stringify(node.data));
  showConfigPanel.value = true;
});

// Handler para clique no canvas (fecha o painel)
onPaneClick(() => {
  if (showConfigPanel.value) {
    closeConfigPanel();
  }
});

const handleSaveBlock = ({ id, data }: { id: string, data: any }) => {
  // Encontrar o node e atualizar seus dados
  const nodeIndex = nodes.value.findIndex(n => n.id === id);
  if (nodeIndex !== -1) {
    // Atualizar de forma reativa
    // Precisamos criar um novo objeto para o VueFlow detectar a mudança profundamente em 'data'
    // se necessário, mas geralmente substituir o objeto 'data' é suficiente.
    // Vamos garantir que a reatividade funcione:
    nodes.value[nodeIndex] = {
      ...nodes.value[nodeIndex],
      data: { ...data }
    };
    
    // Disparar atualização de nodes (trick para forçar reactivity se profundidade falhar)
    nodes.value = [...nodes.value];
  }
  showConfigPanel.value = false;
  selectedNodeId.value = null;
};

const closeConfigPanel = () => {
  showConfigPanel.value = false;
  selectedNodeId.value = null;
};

// Watcher para fechar o painel quando selectedNodeId for null
watch(selectedNodeId, (newId) => {
  if (!newId) {
    showConfigPanel.value = false;
  }
});

// Handlers moved to bottom of script section to consolidate logic


// Carregar dados do fluxo se for edição
onMounted(() => {
  if (!isNewFlow.value) {
    loadFlow();
  } else {
    // Inicializar com um node de gatilho apenas para novos fluxos
    initializeFlow();
  }

  // Ajustar visualização inicial
  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1 });
  });
  
  // 🆕 Inicializar zoom e registrar listener de viewport
  const viewport = getViewport();
  lastZoom.value = viewport.zoom;
  
  // Registrar listener para mudanças de viewport
  onViewportChange(handleViewportChange);

  // Handlers para notas
  window.addEventListener('note-color-change', handleNoteColorChange as any);
  window.addEventListener('note-content-change', handleNoteContentChange as any);
});

onUnmounted(() => {
  window.removeEventListener('note-color-change', handleNoteColorChange as any);
  window.removeEventListener('note-content-change', handleNoteContentChange as any);
});

function handleNoteColorChange(e: CustomEvent) {
  const { id, color } = e.detail;
  nodes.value = nodes.value.map(n => n.id === id ? { ...n, data: { ...n.data, color } } : n);
}

function handleNoteContentChange(e: CustomEvent) {
  const { id, content } = e.detail;
  nodes.value = nodes.value.map(n => n.id === id ? { ...n, data: { ...n.data, content } } : n);
}

// 🆕 Cleanup do timeout do minimap
onUnmounted(() => {
  if (minimapTimeout) {
    clearTimeout(minimapTimeout);
  }
});

function initializeFlow() {
  const nodeType = layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
  const sourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
  const targetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;
  
  nodes.value = [
    {
      id: 'start-1',
      type: nodeType,
      position: { x: 100, y: 100 },
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      deletable: false, // Não permitir remoção do início
      data: { 
        title: 'Início',
        type: 'start',
        content: 'Início do Fluxo',
        triggerType: 'conversation_created',
      },
    },
    {
      id: 'end-1',
      type: nodeType,
      position: { x: 500, y: 100 },
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      deletable: false, // Não permitir remoção do fim
      data: { 
        title: 'Fim',
        type: 'end',
        content: 'Fim do Fluxo',
      },
    },
  ];
  
  // Conectar início ao fim por padrão
  edges.value = [
    {
      id: 'edge-start-end',
      source: 'start-1',
      target: 'end-1',
      type: 'smoothstep',
      markerEnd: MarkerType.ArrowClosed,
    },
  ];
}

// Função para garantir que início e fim sempre existam
function ensureStartEndNodes() {
  const nodeType = layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
  const sourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
  const targetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;
  
  // Verificar se existe início
  const hasStart = nodes.value.some(n => n.data?.type === 'start');
  if (!hasStart) {
    nodes.value = [
      {
        id: 'start-1',
        type: nodeType,
        position: { x: 100, y: 100 },
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        deletable: false,
        data: { 
          title: 'Início',
          type: 'start',
          content: 'Início do Fluxo',
          triggerType: 'conversation_created',
        },
      },
      ...nodes.value,
    ];
  } else {
    // Garantir que início tenha deletable: false
    nodes.value = nodes.value.map(node => {
      if (node.data?.type === 'start') {
        return { ...node, deletable: false };
      }
      return node;
    });
  }
  
  // Verificar se existe fim
  const hasEnd = nodes.value.some(n => n.data?.type === 'end');
  if (!hasEnd) {
    nodes.value = [
      ...nodes.value,
      {
        id: 'end-1',
        type: nodeType,
        position: { x: 500, y: 100 },
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        deletable: false,
        data: { 
          title: 'Fim',
          type: 'end',
          content: 'Fim do Fluxo',
        },
      },
    ];
  } else {
    // Garantir que fim tenha deletable: false
    nodes.value = nodes.value.map(node => {
      if (node.data?.type === 'end') {
        return { ...node, deletable: false };
      }
      return node;
    });
  }
  
  // Garantir que só existe 1 início e 1 fim
  const startNodes = nodes.value.filter(n => n.data?.type === 'start');
  const endNodes = nodes.value.filter(n => n.data?.type === 'end');
  
  if (startNodes.length > 1) {
    // Manter apenas o primeiro início
    const otherStarts = startNodes.slice(1);
    nodes.value = nodes.value.filter(n => !otherStarts.some(os => os.id === n.id));
  }
  
  if (endNodes.length > 1) {
    // Manter apenas o primeiro fim
    const otherEnds = endNodes.slice(1);
    nodes.value = nodes.value.filter(n => !otherEnds.some(oe => oe.id === n.id));
  }
}

function loadFlow() {
  // Tentar carregar da Pinia store
  const savedFlow = flowsStore.loadFlow(flowId.value);
  
  if (savedFlow) {
    currentFlow.value = {
      id: savedFlow.id,
      nome: savedFlow.nome,
      descricao: savedFlow.descricao || '',
      ativo: savedFlow.isActive,
      tipo: 'atendimento',
      status: 'ativo',
      createdAt: savedFlow.createdAt || new Date().toISOString(),
      updatedAt: savedFlow.updatedAt || new Date().toISOString(),
    } as Flow;
    
    // Carregar nodes e edges com normalização para o layout atual
    const currentNodeType = layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
    const currentSourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
    const currentTargetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;

    nodes.value = savedFlow.nodes.map(node => {
      // Ignorar noteNode
      if (node.type === 'noteNode') return node;

      return {
        ...node,
        type: currentNodeType,
        sourcePosition: currentSourcePos,
        targetPosition: currentTargetPos,
      };
    });
    edges.value = savedFlow.edges;
    isFlowActive.value = savedFlow.isActive;
    
    // Garantir que início e fim sempre existam
    ensureStartEndNodes();

    // Sincronizar nodeIdCounter com os nodes carregados para evitar duplicidade de IDs
    if (nodes.value.length > 0) {
      const ids = nodes.value.map(n => {
        const parts = n.id.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart) || 0;
      });
      nodeIdCounter = Math.max(...ids, 0);
    }
    
    toast({
      title: 'Fluxo carregado',
      description: `Fluxo "${savedFlow.nome}" carregado com sucesso.`,
    });
    
    return;
  }
  
  // Fallback: carregar dos mocks
    const flow = MOCK_FLOWS_ATENDIMENTO.find(f => f.id === flowId.value);
    if (flow) {
      currentFlow.value = flow;
      
      // Carregar nodes/edges do mock data
      const flowData = FLOW_DATA_MAP[flowId.value];
      if (flowData) {
        const currentNodeType = layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
        const currentSourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
        const currentTargetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;

        nodes.value = flowData.nodes.map(node => {
          if (node.type === 'noteNode') return node;
          return {
            ...node,
            type: currentNodeType,
            sourcePosition: currentSourcePos,
            targetPosition: currentTargetPos,
          };
        });
        edges.value = flowData.edges;
      }
      
      // Garantir que início e fim sempre existam
      ensureStartEndNodes();
      
      toast({
        title: 'Fluxo carregado',
        description: `Fluxo "${flow.nome}" carregado dos dados de exemplo.`,
      });
    }
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

// Handle execution selection - highlight flowpath
function handleSelectExecution(execution: FlowExecution) {
  // Apply flowpath highlighting to nodes
  nodes.value = nodes.value.map(node => ({
    ...node,
    data: {
      ...node.data,
      isExecuted: execution.executionPath.includes(node.id),
      isCurrentBlock: execution.currentBlockId === node.id,
      hasError: execution.status === 'error' && execution.currentBlockId === node.id,
    },
  }));

  // Apply flowpath highlighting to edges based on execution path
  const executedEdges = new Set<string>();
  for (let i = 0; i < execution.executionPath.length - 1; i++) {
    const source = execution.executionPath[i];
    const target = execution.executionPath[i + 1];
    executedEdges.add(`${source}-${target}`);
  }

  edges.value = edges.value.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      wasExecuted: executedEdges.has(`${edge.source}-${edge.target}`),
      isExecuting: execution.currentBlockId === edge.target && execution.status === 'running',
    },
  }));

  toast({
    title: `Execução #${execution.executionNumber}`,
    description: `Visualizando flowpath de ${execution.contactName}`,
  });
}

function handleBlockClick(block: any) {
  // Adicionar novo node ao canvas
  const isNote = block.key === 'note';
  const nodeType = isNote ? 'noteNode' : (layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical');
  const sourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
  const targetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;
  
  // Determinar posição baseada no layout e nós existentes
  let position = { x: 100, y: 100 };
  if (nodes.value.length > 0) {
    const maxX = Math.max(...nodes.value.map(n => n.position.x));
    const maxY = Math.max(...nodes.value.map(n => n.position.y));
    
    if (layoutMode.value === 'horizontal') {
      position = { x: maxX + 250, y: 100 };
    } else {
      position = { x: 100, y: maxY + 250 };
    }
  }

  const newNode: Node = {
    id: `${block.key}-${++nodeIdCounter}`,
    type: nodeType,
    position,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    data: {
      title: block.label,
      type: block.key === 'decision' ? 'switch' : block.key === 'integration' ? 'api' : block.key,
      content: block.description,
      ...(block.key === 'note' ? { color: 'yellow' } : {}),
    },
  };
  
  nodes.value = [...nodes.value, newNode];
}

function onConnect(params: Connection) {
  console.log('✅ onConnect triggered:', params);
  // Usar addEdges do VueFlow para garantir que a conexão seja feita corretamente
  addEdges([{
    id: `edge-${params.source}-${params.target}`,
    source: params.source!,
    target: params.target!,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'smoothstep',
    markerEnd: MarkerType.ArrowClosed,
  }]);
}

// Permitir todas as conexões para debug
function isValidConnection(_connection: Connection) {
  // Opcional: Adicionar lógica para impedir conexões cíclicas ou inválidas aqui
  // Por enquanto, permitir tudo para garantir que o bug não é validacao
  return true; 
}

function updateHelperLines(changes: NodeChange[], nodes: GraphNode[]) {
  helperLineHorizontal.value = undefined;
  helperLineVertical.value = undefined;

  if (changes.length === 1 && changes[0].type === 'position' && changes[0].dragging && changes[0].position) {
    const helperLines = getHelperLines(changes[0] as any, nodes);

    // Snap position
    changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
    changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

    // Set helper lines
    helperLineHorizontal.value = helperLines.horizontal;
    helperLineVertical.value = helperLines.vertical;
  }

  return changes;
}

function onNodesChange(changes: NodeChange[]) {
  // Verificar se há tentativa de remover nós protegidos (início ou fim)
  const protectedNodesToRestore: Node[] = [];
  let showMessage = false;
  let messageTitle = '';
  let messageDescription = '';
  
  // Verificar todas as tentativas de remoção
  changes.forEach(change => {
    if (change.type === 'remove') {
      const nodeToRemove = nodes.value.find(n => n.id === change.id);
      
      if (nodeToRemove) {
        const isStart = nodeToRemove.data?.type === 'start';
        const isEnd = nodeToRemove.data?.type === 'end';
        
        if (isStart || isEnd) {
          protectedNodesToRestore.push(nodeToRemove);
          showMessage = true;
          
          if (isStart) {
            messageTitle = 'Ação não permitida';
            messageDescription = 'Não é possível remover o bloco "Início" do fluxo. O bloco "Início" é obrigatório e deve sempre existir.';
          } else if (isEnd) {
            messageTitle = 'Ação não permitida';
            messageDescription = 'Não é possível remover o bloco "Fim" do fluxo. O bloco "Fim" é obrigatório e deve sempre existir.';
          }
        }
      }
    }
  });
  
  // Mostrar mensagem de erro ANTES de processar as mudanças
  if (showMessage) {
    toast({
      title: messageTitle,
      description: messageDescription,
      variant: 'destructive',
    });
  }
  
  // Check if selected node is being removed
  if (selectedNodeId.value) {
    const isRemovingSelected = changes.some(c => c.type === 'remove' && c.id === selectedNodeId.value);
    if (isRemovingSelected) {
      closeConfigPanel();
    }
  }

  // Filtrar mudanças de remoção para nós protegidos
  const filteredChanges = changes.filter(change => {
    if (change.type === 'remove') {
      const isProtected = protectedNodesToRestore.some(n => n.id === change.id);
      return !isProtected; // Não permitir remoção de nós protegidos
    }
    return true; // Permitir outras mudanças
  });

  const updatedChanges = updateHelperLines(filteredChanges, nodes.value as unknown as GraphNode[]);
  nodes.value = applyNodeChanges(updatedChanges, nodes.value as any);
  
  // Restaurar nós protegidos que foram removidos
  if (protectedNodesToRestore.length > 0) {
    protectedNodesToRestore.forEach(protectedNode => {
      const nodeExists = nodes.value.some(n => n.id === protectedNode.id);
      if (!nodeExists) {
        nodes.value = [...nodes.value, { ...protectedNode, deletable: false } as any];
      }
    });
  }
  
  // Sempre garantir que início e fim existam e tenham deletable: false
  ensureStartEndNodes();
}

function onEdgesChange(changes: EdgeChange[]) {
  edges.value = applyEdgeChanges(changes, edges.value as any);
}

// 🆕 Handler para atualização de estado do simulador
const handleExecutionStateChange = ({ 
  path, 
  currentBlockId, 
  hasError, 
  errorBlockId 
}: { 
  path: string[], 
  currentBlockId: string | null,
  hasError: boolean, 
  errorBlockId: string | null
}) => {
  // Atualizar Nodes
  nodes.value = nodes.value.map(node => {
    const wasExecuted = path.includes(node.id);
    const isExecuting = node.id === currentBlockId;
    // Se houve erro, o bloco atual é o bloco com erro
    const nodeHasError = hasError && node.id === errorBlockId;
    
    // Otimização: Só atualizar se mudar
    if (
      node.data.wasExecuted === wasExecuted && 
      node.data.isExecuting === isExecuting &&
      node.data.hasError === nodeHasError
    ) {
      return node;
    }

    return {
      ...node,
      data: {
        ...node.data,
        wasExecuted,
        isExecuting,
        hasError: nodeHasError
      }
    };
  });

  // Atualizar Edges
  edges.value = edges.value.map(edge => {
    const sourceExecuted = path.includes(edge.source);
    const targetExecuted = path.includes(edge.target);
    const sourceExecuting = edge.source === currentBlockId;
    const targetExecuting = edge.target === currentBlockId;

    const wasExecuted = sourceExecuted && targetExecuted;
    const isExecuting = (sourceExecuting && targetExecuted) || (targetExecuting && sourceExecuted);
    
    // Conexões ativas devem ficar por cima das inativas
    const zIndex = (wasExecuted || isExecuting) ? 1000 : 0;

    if (
      edge.data?.wasExecuted === wasExecuted && 
      edge.data?.isExecuting === isExecuting &&
      edge.zIndex === zIndex
    ) {
      return edge;
    }

    return {
      ...edge,
      zIndex,
      data: {
        ...edge.data,
        wasExecuted,
        isExecuting
      }
    };
  });
};

const handleCloseSimulator = () => {
  showSimulator.value = false;
  
  // Limpar estado visual dos Nodes
  nodes.value = nodes.value.map(node => ({
    ...node,
    data: {
      ...node.data,
      wasExecuted: false,
      isExecuting: false
    }
  }));

  // Limpar estado visual das Edges e resetar zIndex
  edges.value = edges.value.map(edge => ({
    ...edge,
    zIndex: 0,
    data: {
      ...edge.data,
      wasExecuted: false,
      isExecuting: false
    }
  }));
};

function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  
  if (!event.dataTransfer) return;

  const blockData = event.dataTransfer.getData('application/vueflow');
  if (!blockData) return;

  try {
    const block = JSON.parse(blockData);
    
    // Obter o container do VueFlow para coordenadas corretas
    const container = (event.currentTarget as HTMLElement).querySelector('.vue-flow-container') || (event.currentTarget as HTMLElement);
    const rect = container.getBoundingClientRect();

    // Calcular posição relativa ao container
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Usar project para converter coordenadas de tela para coordenadas do fluxo (considerando zoom e pan)
    const position = project({ x, y });

    // Ajustar para centralizar o nó no cursor (aprox. metade da largura/altura do card)
    position.x -= 100;
    position.y -= 110;

    addNodeAtPosition(block, position);
  } catch (error) {
    console.error('Error parsing block data:', error);
  }
}

function addNodeAtPosition(block: any, position: { x: number; y: number }) {
  const isNote = block.key === 'note';
  const nodeType = isNote ? 'noteNode' : (layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical');
  const sourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
  const targetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;
  
  // Default conditions for chat_flow block
  const defaultConditions = block.key === 'chat_flow' 
    ? ['Ganho', 'Perdido'] 
    : undefined;
  
  const newNode: Node = {
    id: `${block.key}-${++nodeIdCounter}`,
    type: nodeType,
    position,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    data: {
      title: block.label,
      type: block.key === 'decision' ? 'switch' : block.key === 'integration' ? 'api' : block.key,
      content: block.description,
      ...(block.key === 'note' ? { color: 'yellow' } : {}),
      ...(defaultConditions ? { conditions: defaultConditions } : {}),
    },
  };
  
  nodes.value = [...nodes.value, newNode];
}

// Handlers para Configuração do Fluxo
function handleSettings() {
  configSheetOpen.value = true;
}

function handleSaveConfig(config: any) {
  if (currentFlow.value) {
    currentFlow.value.nome = config.name || currentFlow.value.nome;
    currentFlow.value.descricao = config.description || currentFlow.value.descricao;
    // Opcionalmente atualizar status se vier na config
    if (typeof config.isActive !== 'undefined') {
        currentFlow.value.status = config.isActive ? 'ativo' : 'inativo';
        isFlowActive.value = config.isActive;
    }
    
    // Salvar alterações e fechar sheet
    handleSave();
    configSheetOpen.value = false;
  }
}

function handleSave() {
  console.log('🔵 handleSave called');
  try {
    // Gerar ID se for novo fluxo
    const saveFlowId = isNewFlow.value ? `flow-${Date.now()}` : flowId.value;
    console.log('🔵 Flow ID:', saveFlowId, 'isNew:', isNewFlow.value);
    
    // Preparar dados do fluxo
    const flowData = {
      id: saveFlowId,
      nome: currentFlow.value?.nome || 'Novo Fluxo',
      descricao: currentFlow.value?.descricao || '',
      nodes: nodes.value,
      edges: edges.value,
      isActive: isFlowActive.value,
      createdAt: currentFlow.value?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🔵 Flow data to save:', {
      id: flowData.id,
      nome: flowData.nome,
      nodesCount: flowData.nodes.length,
      edgesCount: flowData.edges.length,
      isActive: flowData.isActive,
    });
    
    // Salvar na Pinia store (que persiste automaticamente no localStorage)
    console.log('🔵 Calling flowsStore.saveFlow...');
    flowsStore.saveFlow(flowData);
    console.log('🔵 flowsStore.saveFlow completed');
    
    // Atualizar currentFlow
    if (isNewFlow.value) {
      currentFlow.value = {
        id: saveFlowId,
        nome: flowData.nome,
        descricao: flowData.descricao,
        status: flowData.isActive ? 'ativo' : 'inativo',
        tipo: 'atendimento',
        createdAt: flowData.createdAt,
        updatedAt: flowData.updatedAt,
      } as Flow;
      
      // Redirecionar para a URL do fluxo salvo
      console.log('🔵 Redirecting to:', `/fluxos/${saveFlowId}`);
      router.replace(`/fluxos/${saveFlowId}`);
    }
    
    console.log('🔵 Showing success toast');
    toast({
      title: 'Fluxo salvo',
      description: `Fluxo "${flowData.nome}" salvo com sucesso.`,
    });
    
    // Mark as saved
    lastSavedState.value = true;
    hasUnsavedChanges.value = false;
    
    console.log('✅ Fluxo salvo:', flowData);
  } catch (error) {
    console.error('❌ Erro ao salvar fluxo:', error);
    toast({
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar o fluxo. Tente novamente.',
      variant: 'destructive',
    });
  }
}

// Watcher para limpar o estado visual quando o simulador for fechado
watch(showSimulator, (isOpen) => {
  if (!isOpen) {
    handleCloseSimulator();
  }
  // Se abriu, fazer fitView após render
  if (isOpen) {
    nextTick(() => {
      setTimeout(() => {
        fitView({ padding: 0.2, maxZoom: 1 });
      }, 50);
    });
  }
});

function handleSimulate() {
  // Fechar painel de config se aberto
  showConfigPanel.value = false;
  // Alternar simulador (a limpeza é feita pelo watcher se fechar)
  showSimulator.value = !showSimulator.value;
}

// Handler para highlight de bloco em execução
function handleBlockExecute(blockId: string) {
  // Poderia adicionar highlight visual no bloco
  console.log('Executando bloco:', blockId);
}

function toggleLayoutMode() {
  const newMode = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal';
  layoutMode.value = newMode;
  
  // Determine new node type and positions
  const newNodeType = newMode === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
  const newSourcePos = newMode === 'horizontal' ? Position.Right : Position.Bottom;
  const newTargetPos = newMode === 'horizontal' ? Position.Left : Position.Top;
  
  // Update all nodes to use the new type and positions
  nodes.value = nodes.value.map(node => {
    // Skip note nodes
    if (node.type === 'noteNode') return node;
    
    return {
      ...node,
      type: newNodeType,
      sourcePosition: newSourcePos,
      targetPosition: newTargetPos,
    };
  });
  
  // Re-layout blocks to match the new direction and fit view
  nextTick(() => {
    handleLayout();
    // Auto-fit after layout change
    setTimeout(() => {
      fitView({ padding: 0.2, maxZoom: 1, duration: 300 });
    }, 100);
  });
}

function handleValidate() {
  // TODO: Implementar validação de conexões e propriedades
  console.log('Validando fluxo...');
}

const { layout } = useLayout();

function handleLayout() {
  const direction = layoutMode.value === 'horizontal' ? 'LR' : 'TB';
  nodes.value = layout(nodes.value, edges.value, direction);
  // Ajustar visualização após layout
  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1, duration: 500 });
  });
}

// Export flow as JSON file
function handleExport() {
  const flowData = {
    id: flowId.value,
    nome: currentFlow.value?.nome || 'Fluxo Exportado',
    descricao: currentFlow.value?.descricao || '',
    tipo: 'atendimento',
    nodes: nodes.value,
    edges: edges.value,
    isActive: isFlowActive.value,
    config: flowConfig.value,
    exportedAt: new Date().toISOString(),
  };
  
  const dataStr = JSON.stringify(flowData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = (flowData.nome || 'fluxo').toLowerCase().replace(/\s+/g, '-');
  link.download = `fluxo-${fileName}-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  toast({
    title: 'Fluxo exportado',
    description: 'O arquivo JSON foi baixado com sucesso.',
  });
}

// Import flow from JSON file
async function handleImport(file: File) {
  try {
    const text = await file.text();
    const flowData = JSON.parse(text);
    
    // Validate basic structure
    if (!flowData.nodes || !flowData.edges) {
      throw new Error('Arquivo JSON inválido: deve conter nodes e edges');
    }
    
    // Generate new ID to avoid conflicts
    const newId = `imported-${Date.now()}`;
    
    // Save to store
    flowsStore.saveFlow({
      id: newId,
      nome: flowData.nome || 'Fluxo Importado',
      descricao: flowData.descricao || '',
      nodes: flowData.nodes,
      edges: flowData.edges,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    toast({
      title: 'Fluxo importado',
      description: `"${flowData.nome || 'Fluxo Importado'}" foi importado com sucesso.`,
    });
    
    // Navigate to the imported flow
    router.push(`/fluxos/${newId}`);
  } catch (error) {
    console.error('Erro ao importar fluxo:', error);
    toast({
      title: 'Erro ao importar',
      description: error instanceof Error ? error.message : 'Arquivo JSON inválido.',
      variant: 'destructive',
    });
  }
}

function goBack() {
  router.push('/configuracoes/fluxos/atendimento');
}
</script>

<style>
.vue-flow-container {
  width: 100%;
  height: 100%;
  background-color: hsl(var(--muted) / 0.4);
}

/* .vue-flow__node removed to prevent double styling on custom nodes */

.vue-flow__handle {
  background: hsl(var(--primary));
  width: 14px;
  height: 14px;
  border: 3px solid hsl(var(--background));
  border-radius: 50%;
  transition: all 0.2s ease;
}

.vue-flow__handle:hover {
  width: 18px;
  height: 18px;
  background: hsl(var(--primary) / 0.9);
}

.vue-flow__edge-path {
  stroke: hsl(var(--muted-foreground));
  stroke-width: 2;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: hsl(var(--primary));
}

</style>

