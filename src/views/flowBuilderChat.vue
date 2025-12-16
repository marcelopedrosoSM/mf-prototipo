<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- Custom Flow Builder Header -->
    <FlowBuilderHeader 
      :flow-name="currentFlow?.nome || 'Novo Fluxo'"
      v-model:is-active="isFlowActive"
      @toggle-active="isFlowActive = $event"
      @save="handleSave"
      @back="goBack"
      @simulate="handleSimulate"
      @validate="handleValidate"
      @layout="handleLayout"
    />

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Flow Builder Chat Sidebar -->
      <FlowBuilderChatSidebar 
        :collapsed="isSidebarCollapsed" 
        @toggle="toggleSidebar" 
        @block-click="handleBlockClick" 
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
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-viewport="{ zoom: 1 }"
          :min-zoom="0.2"
          :max-zoom="4"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :node-types="nodeTypes"
          :edges-updatable="true"
          :nodes-draggable="true"
          :elements-selectable="true"
          :delete-key-code="['Delete', 'Backspace']"
          :connection-mode="ConnectionMode.Strict"
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
            @zoom-in="zoomIn"
            @zoom-out="zoomOut"
            @undo="undo"
            @redo="redo"
            @fit-view="() => fitView({ padding: 0.2, maxZoom: 1 })"
            @layout="handleLayout"
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
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueFlow, useVueFlow, ConnectionMode, Position, MarkerType, applyNodeChanges, applyEdgeChanges } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@vue-flow/core';
import { cn } from '@/lib/utils';
import FlowBuilderChatSidebar from '@/components/layout/FlowBuilderChatSidebar.vue';
import FlowBuilderHeader from '@/components/flows/FlowBuilderHeader.vue';
import FlowToolbar from '@/components/flow-builder/FlowToolbar.vue';
import { MOCK_FLOWS_ATENDIMENTO, type Flow } from '@/mocks/data/flows';
import CustomNode from '@/components/flow-builder/CustomNode.vue';
import CustomNodeNote from '@/components/flow-builder/CustomNodeNote.vue';
import BlockConfigPanel from '@/components/flow-builder/BlockConfigPanel.vue';
import HelperLines from '@/components/flow-builder/HelperLines.vue';
import { getHelperLines } from '@/components/flow-builder/utils';
import { useLayout } from '@/composables/useLayout';
import type { GraphNode } from '@vue-flow/core';
import { useRefHistory } from '@vueuse/core';





const route = useRoute();
const router = useRouter();
const { getViewport, onViewportChange, addEdges, onNodeClick, fitView, zoomIn, zoomOut, project } = useVueFlow();

const flowId = computed(() => route.params.id as string);
const isNewFlow = computed(() => flowId.value === 'novo');
const isSidebarCollapsed = ref(false);
const currentFlow = ref<Flow | null>(null);
const isFlowActive = ref(false);

// 🆕 Vue Flow elements - SEPARADOS em nodes e edges
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
let nodeIdCounter = 0;

// History Support
const { undo, redo, canUndo, canRedo } = useRefHistory(nodes, { 
  deep: true,
  capacity: 20 
});

// 🆕 Estado para o painel de configuração
const selectedNodeId = ref<string | null>(null);
const selectedNodeData = ref<any>(null);
const showConfigPanel = ref(false);

// Helper Lines state
const helperLineHorizontal = ref<number | undefined>(undefined);
const helperLineVertical = ref<number | undefined>(undefined);

// 🆕 Registrar tipos de nodes customizados
const nodeTypes = {
  customNode: CustomNode,
  noteNode: CustomNodeNote,
  default: CustomNode, // Fallback para nodes sem tipo definido
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
  
  selectedNodeId.value = node.id;
  // Clona os dados para evitar mutação direta sem salvar
  selectedNodeData.value = JSON.parse(JSON.stringify(node.data));
  showConfigPanel.value = true;
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

// Carregar dados do fluxo se for edição
onMounted(() => {
  if (!isNewFlow.value) {
    loadFlow();
  }
  // Inicializar com um node de gatilho
  initializeFlow();

  // Ajustar visualização inicial
  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1 });
  });
  
  // 🆕 Inicializar zoom e registrar listener de viewport
  const viewport = getViewport();
  lastZoom.value = viewport.zoom;
  
  // Registrar listener para mudanças de viewport
  onViewportChange(handleViewportChange);
});

// 🆕 Cleanup do timeout do minimap
onUnmounted(() => {
  if (minimapTimeout) {
    clearTimeout(minimapTimeout);
  }
});

function initializeFlow() {
  nodes.value = [
    {
      id: 'trigger-1',
      type: 'customNode',
      position: { x: 100, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { 
        title: 'Gatilho',
        type: 'trigger',
        content: 'Conversa Iniciada',
        triggerType: 'conversation_created',
      },
    },
  ];
}

function loadFlow() {
  const flow = MOCK_FLOWS_ATENDIMENTO.find(f => f.id === flowId.value);
  if (flow) {
    currentFlow.value = flow;
  }
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function handleBlockClick(block: any) {
  // Adicionar novo node ao canvas
  const nodeType = block.key === 'note' ? 'noteNode' : 'customNode';
  const newNode: Node = {
    id: `${block.key}-${++nodeIdCounter}`,
    type: nodeType,
    position: { 
      x: Math.random() * 400 + 200, 
      y: Math.random() * 400 + 200 
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
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
  // Usar addEdges do VueFlow para garantir que a conexão seja feita corretamente
  addEdges([{
    id: `edge-${params.source}-${params.target}`,
    source: params.source!,
    target: params.target!,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'default',
    //type: 'smoothstep',
    markerEnd: MarkerType.ArrowClosed,
  }]);
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
  // Check if selected node is being removed
  if (selectedNodeId.value) {
    const isRemovingSelected = changes.some(c => c.type === 'remove' && c.id === selectedNodeId.value);
    if (isRemovingSelected) {
      closeConfigPanel();
    }
  }

  const updatedChanges = updateHelperLines(changes, nodes.value as unknown as GraphNode[]);
  nodes.value = applyNodeChanges(updatedChanges, nodes.value as any);
}

function onEdgesChange(changes: EdgeChange[]) {
  edges.value = applyEdgeChanges(changes, edges.value as any);
}

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
  const nodeType = block.key === 'note' ? 'noteNode' : 'customNode';
  const newNode: Node = {
    id: `${block.key}-${++nodeIdCounter}`,
    type: nodeType,
    position,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      title: block.label,
      type: block.key === 'decision' ? 'switch' : block.key === 'integration' ? 'api' : block.key,
      content: block.description,
      ...(block.key === 'note' ? { color: 'yellow' } : {}),
    },
  };
  
  nodes.value = [...nodes.value, newNode];
}

function handleSave() {
  // Implementar lógica de salvamento
  console.log('Salvando fluxo...', { nodes: nodes.value, edges: edges.value });
}

function handleSimulate() {
  // TODO: Abrir modal ou painel de simulação
  console.log('Iniciando simulação do fluxo...');
}

function handleValidate() {
  // TODO: Implementar validação de conexões e propriedades
  console.log('Validando fluxo...');
}

const { layout } = useLayout();

function handleLayout() {
  nodes.value = layout(nodes.value, edges.value, 'LR');
  // Ajustar visualização após layout
  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1, duration: 500 });
  });
}

function goBack() {
  router.push('/flows');
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

