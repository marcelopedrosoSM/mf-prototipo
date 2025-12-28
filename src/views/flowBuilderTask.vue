<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- Custom Flow Builder Header -->
    <FlowBuilderHeader 
      :flow-name="currentFlow?.nome || 'Novo Fluxo de Atividades'"
      v-model:is-active="isFlowActive"
      v-model:view-mode="viewMode"
      :has-unsaved-changes="hasUnsavedChanges"
      @toggle-active="isFlowActive = $event"
      @save="handleSave"
      @back="goBack"
      @validate="handleValidate"
      @layout="handleLayout"
      @settings="handleSettings"
      @export="handleExport"
      @import="handleImport"
      :hide-simulate="true"
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
      <FlowBuilderTaskSidebar 
        v-if="viewMode === 'edit'"
        :collapsed="isSidebarCollapsed" 
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
          <ResizablePanel :default-size="100" :min-size="20" :max-size="100" class="relative">
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
                flow-context="atividades"
                v-model="selectedNodeData"
                @close="closeConfigPanel"
                @save="handleSaveBlock"
              />
            </div>

            <!-- Activity Execution Panel -->
            <ActivityExecutionPanel
              :is-visible="isInteractiveExecutionActive && currentExecutingBlock !== null"
              :current-block="currentExecutingBlock"
              :current-step="executionStep"
              :total-steps="executionPath.length"
              @select-condition="handleConditionSelect"
              @auto-advance="handleAutoAdvance"
              @cancel="cancelInteractiveExecution"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, provide, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueFlow, useVueFlow, ConnectionMode, Position, MarkerType, applyNodeChanges, applyEdgeChanges } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@vue-flow/core';
import { cn } from '@/lib/utils';
import FlowBuilderTaskSidebar from '@/components/layout/FlowBuilderTaskSidebar.vue';
import FlowBuilderHeader from '@/components/flows/FlowBuilderHeader.vue';
import type { ViewMode } from '@/components/flows/FlowBuilderHeader.vue';
import FlowToolbar from '@/components/flow-builder/FlowToolbar.vue';
import { MOCK_FLOWS_ATIVIDADES, FLOW_DATA_MAP, type Flow } from '@/mocks/data/flows';
import CustomNode from '@/components/flow-builder/CustomNode.vue';
import CustomNodeHorizontal from '@/components/flow-builder/CustomNodeHorizontal.vue';
import CustomNodeVertical from '@/components/flow-builder/CustomNodeVertical.vue';
import CustomNodeNote from '@/components/flow-builder/CustomNodeNote.vue';
import CustomEdge from '@/components/flow-builder/CustomEdge.vue';
import BlockConfigPanel from '@/components/flow-builder/BlockConfigPanel.vue';
import ExecutionListSidebar from '@/components/flow-builder/ExecutionListSidebar.vue';
import ActivityExecutionPanel from '@/components/flow-builder/ActivityExecutionPanel.vue';

import HelperLines from '@/components/flow-builder/HelperLines.vue';
import { getHelperLines } from '@/components/flow-builder/utils';
import { useLayout } from '@/composables/useLayout';
import type { GraphNode } from '@vue-flow/core';
import { useRefHistory } from '@vueuse/core';
import { useFlowsStore, useExecutionsStore } from '@/stores';
import { useToast } from '@/components/ui/toast/use-toast';
import FlowConfigSheet from '@/components/flow-builder/FlowConfigSheet.vue';
import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';
import type { FlowConfigData } from '@/types/flow-config';
import { getDefaultFlowConfig } from '@/constants/flow-config-defaults';
import { getSeedExecutions } from '@/mocks/data/executions';
import type { FlowExecution } from '@/types/execution';


const route = useRoute();
const router = useRouter();
const { getViewport, onViewportChange, addEdges, onNodeClick, onPaneClick, fitView, zoomIn, zoomOut, project } = useVueFlow();
const { toast } = useToast();
const flowsStore = useFlowsStore();
const executionsStore = useExecutionsStore();

const flowId = computed(() => route.params.id as string);
const isNewFlow = computed(() => flowId.value === 'novo');
const isSidebarCollapsed = ref(false);
const currentFlow = ref<Flow | null>(null);
const isFlowActive = ref(false);
const viewMode = ref<ViewMode>('edit');

// Estado do FlowConfigSheet
const configSheetOpen = ref(false);
const flowConfig = ref<Partial<FlowConfigData>>(getDefaultFlowConfig());

// Interactive Execution State
const isInteractiveExecutionActive = ref(false);
const currentExecutingBlockId = ref<string | null>(null);
const executionPath = ref<string[]>([]);
const executionStep = ref(0);

const currentExecutingBlock = computed(() => {
  if (!currentExecutingBlockId.value) return null;
  return nodes.value.find(n => n.id === currentExecutingBlockId.value) || null;
});

// Vue Flow elements
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
let nodeIdCounter = 0;

// History Support
const { undo, redo, canUndo, canRedo } = useRefHistory(nodes, { 
  deep: true,
  capacity: 20 
});

// Dirty state tracking
const hasUnsavedChanges = ref(true);
const lastSavedState = ref(false);

// Watch for ANY changes (including position changes from dragging)
watch([nodes, edges, isFlowActive], () => {
  if (lastSavedState.value) {
    hasUnsavedChanges.value = true;
  }
}, { deep: true });

// Estado para o painel de configuração
const selectedNodeId = ref<string | null>(null);
const selectedNodeData = ref<any>(null);

const showConfigPanel = ref(false);

// Layout Mode: 'horizontal' or 'vertical'
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal');
// Provide layoutMode to child components
provide('layoutMode', layoutMode);

// Helper Lines state
const helperLineHorizontal = ref<number | undefined>(undefined);
const helperLineVertical = ref<number | undefined>(undefined);

// Registrar tipos de nodes customizados
const nodeTypes = {
  customNode: CustomNode,
  customNodeHorizontal: CustomNodeHorizontal,
  customNodeVertical: CustomNodeVertical,
  noteNode: CustomNodeNote,
  default: CustomNode,
};

// Registrar tipos de edges customizados
const edgeTypes = {
  default: CustomEdge,
  custom: CustomEdge,
  smoothstep: CustomEdge,
};

// Estados para controle do MiniMap
const showMinimap = ref(false);
const lastZoom = ref<number | null>(null);
let minimapTimeout: number | null = null;

// Cores do MiniMap
const minimapMaskColor = computed(() => {
  return 'hsl(var(--background) / 0.8)';
});

const getNodeColor = (): string => {
  return 'hsl(var(--muted-foreground))';
};

// Handler para mudança de viewport
const handleViewportChange = () => {
  const currentViewport = getViewport();
  const currentZoom = currentViewport.zoom;

  if (lastZoom.value !== null && lastZoom.value !== currentZoom) {
    showMinimap.value = true;

    if (minimapTimeout) {
      clearTimeout(minimapTimeout);
    }

    minimapTimeout = setTimeout(() => {
      showMinimap.value = false;
    }, 2000);
  }

  lastZoom.value = currentZoom;
};



// Handler para clique no node
onNodeClick(({ node }) => {
  if (node.type === 'noteNode') return;
  if (['start', 'end'].includes(node.data.type)) return;
  
  selectedNodeId.value = node.id;
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
  const nodeIndex = nodes.value.findIndex(n => n.id === id);
  if (nodeIndex !== -1) {
    nodes.value[nodeIndex] = {
      ...nodes.value[nodeIndex],
      data: { ...data }
    };
    
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

// Handlers para FlowConfigSheet
const handleSettings = () => {
  configSheetOpen.value = true;
};

const handleSaveConfig = (config: FlowConfigData) => {
  flowConfig.value = config;
  toast({
    title: 'Configuração salva',
    description: 'As configurações do fluxo foram atualizadas.',
  });
};

// Carregar dados do fluxo se for edição
onMounted(() => {
  if (!isNewFlow.value) {
    loadFlow();
  } else {
    initializeFlow();
  }

  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1 });
  });
  
  const viewport = getViewport();
  lastZoom.value = viewport.zoom;
  
  onViewportChange(handleViewportChange);

});

// Cleanup do timeout do minimap
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
        content: 'Início do Fluxo de Atividades',
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
        content: 'Fim do Fluxo de Atividades',
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
          content: 'Início do Fluxo de Atividades',
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
          content: 'Fim do Fluxo de Atividades',
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
    const firstStart = startNodes[0];
    const otherStarts = startNodes.slice(1);
    nodes.value = nodes.value.filter(n => !otherStarts.some(os => os.id === n.id));
  }
  
  if (endNodes.length > 1) {
    // Manter apenas o primeiro fim
    const firstEnd = endNodes[0];
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
      tipo: 'atividades',
      status: 'ativo',
      createdAt: savedFlow.createdAt || new Date().toISOString(),
      updatedAt: savedFlow.updatedAt || new Date().toISOString(),
    } as Flow;
    
    // Carregar nodes e edges com normalização para o layout atual
    const currentNodeType = layoutMode.value === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
    const currentSourcePos = layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom;
    const currentTargetPos = layoutMode.value === 'horizontal' ? Position.Left : Position.Top;

    nodes.value = savedFlow.nodes.map(node => {
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

    // Sincronizar nodeIdCounter
    if (nodes.value.length > 0) {
      const ids = nodes.value.map(n => {
        const parts = n.id.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart) || 0;
      });
      nodeIdCounter = Math.max(...ids, 0);
    }
    
    // Garantir que início e fim sempre existam
    ensureStartEndNodes();
    
    toast({
      title: 'Fluxo carregado',
      description: `Fluxo "${savedFlow.nome}" carregado com sucesso.`,
    });
    
    return;
  }
  
  // Fallback: carregar dos mocks
  const flow = MOCK_FLOWS_ATIVIDADES.find(f => f.id === flowId.value);
  if (flow) {
    currentFlow.value = flow;
    
    // Carregar nodes e edges do FLOW_DATA_MAP
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
      
      // Sincronizar nodeIdCounter
      if (nodes.value.length > 0) {
        const ids = nodes.value.map(n => {
          const parts = n.id.split('-');
          const lastPart = parts[parts.length - 1];
          return parseInt(lastPart) || 0;
        });
        nodeIdCounter = Math.max(...ids, 0);
      }
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
  // Apply flowpath highlighting to nodes (use wasExecuted/isExecuting to match CustomNode)
  nodes.value = nodes.value.map(node => {
    const wasExecuted = execution.executionPath.includes(node.id);
    const isExecuting = execution.currentBlockId === node.id && execution.status === 'running';
    const hasError = execution.status === 'error' && execution.currentBlockId === node.id;
    
    return {
      ...node,
      zIndex: (wasExecuted || isExecuting || hasError) ? 1000 : 0,
      data: {
        ...node.data,
        wasExecuted,
        isExecuting,
        hasError,
      },
    };
  });

  // Apply flowpath highlighting to edges based on execution path
  const executedEdges = new Set<string>();
  for (let i = 0; i < execution.executionPath.length - 1; i++) {
    const source = execution.executionPath[i];
    const target = execution.executionPath[i + 1];
    executedEdges.add(`${source}-${target}`);
  }

  edges.value = edges.value.map(edge => {
    const wasExecuted = executedEdges.has(`${edge.source}-${edge.target}`);
    const isExecuting = execution.currentBlockId === edge.target && execution.status === 'running';
    
    return {
      ...edge,
      zIndex: (wasExecuted || isExecuting) ? 1000 : 0,
      data: {
        ...edge.data,
        wasExecuted,
        isExecuting,
      },
    };
  });

  toast({
    title: `Execução #${execution.executionNumber}`,
    description: `Visualizando flowpath de ${execution.contactName}`,
  });

  // Start interactive execution mode
  startInteractiveExecution(execution.executionPath[0] || 'start-1');
}

// ========================================
// INTERACTIVE EXECUTION FUNCTIONS
// ========================================

function startInteractiveExecution(startBlockId: string) {
  isInteractiveExecutionActive.value = true;
  executionPath.value = [];
  executionStep.value = 1;
  
  // Clear all states
  clearExecutionStates();
  
  // Set start block as executing
  setBlockExecuting(startBlockId);
  executionPath.value.push(startBlockId);
  
  // Auto-advance from start block
  const startBlock = nodes.value.find(n => n.id === startBlockId);
  if (startBlock?.data?.type === 'start') {
    // Auto-advance after a short delay
    setTimeout(() => handleAutoAdvance(), 500);
  }
}

function handleConditionSelect(payload: { conditionValue: string; conditionIndex: number }) {
  if (!currentExecutingBlockId.value) return;
  
  const { conditionIndex } = payload;
  const handleId = `condition-${conditionIndex}`;
  
  // Find the edge that connects from this block with this handle
  const nextEdge = edges.value.find(
    e => e.source === currentExecutingBlockId.value && e.sourceHandle === handleId
  );
  
  if (nextEdge) {
    advanceToBlock(nextEdge.target);
  } else {
    toast({
      title: 'Caminho não encontrado',
      description: 'Não há conexão para esta condição. Verifique as conexões do fluxo.',
      variant: 'destructive',
    });
  }
}

function handleAutoAdvance() {
  if (!currentExecutingBlockId.value) return;
  
  // Find the next block (first edge from current block)
  const nextEdge = edges.value.find(e => e.source === currentExecutingBlockId.value);
  
  if (nextEdge) {
    advanceToBlock(nextEdge.target);
  } else {
    // End of flow
    completeInteractiveExecution();
  }
}

function advanceToBlock(targetBlockId: string) {
  if (!currentExecutingBlockId.value) return;
  
  // Mark current block as executed
  markBlockAsExecuted(currentExecutingBlockId.value);
  
  // Mark edge as executed
  markEdgeAsExecuted(currentExecutingBlockId.value, targetBlockId);
  
  // Move to next block
  setBlockExecuting(targetBlockId);
  executionPath.value.push(targetBlockId);
  executionStep.value++;
  
  // Check if we reached an end block
  const targetBlock = nodes.value.find(n => n.id === targetBlockId);
  if (targetBlock?.data?.type === 'end') {
    setTimeout(() => completeInteractiveExecution(), 500);
  } else if (!targetBlock?.data?.conditions || targetBlock.data.conditions.length === 0) {
    // Auto-advance for blocks without conditions (after delay)
    // Only auto-advance for simple blocks like wait, action without conditions
    if (['start'].includes(targetBlock?.data?.type)) {
      setTimeout(() => handleAutoAdvance(), 500);
    }
  }
}

function setBlockExecuting(blockId: string) {
  currentExecutingBlockId.value = blockId;
  nodes.value = nodes.value.map(n => ({
    ...n,
    zIndex: n.id === blockId ? 1000 : (executionPath.value.includes(n.id) ? 500 : 0),
    data: {
      ...n.data,
      wasExecuted: executionPath.value.includes(n.id) && n.id !== blockId,
      isExecuting: n.id === blockId,
      hasError: false,
    },
  }));
}

function markBlockAsExecuted(blockId: string) {
  nodes.value = nodes.value.map(n => {
    if (n.id === blockId) {
      return {
        ...n,
        data: { ...n.data, wasExecuted: true, isExecuting: false },
      };
    }
    return n;
  });
}

function markEdgeAsExecuted(sourceId: string, targetId: string) {
  edges.value = edges.value.map(e => {
    if (e.source === sourceId && e.target === targetId) {
      return {
        ...e,
        zIndex: 1000,
        data: { ...e.data, wasExecuted: true, isExecuting: false },
      };
    }
    return e;
  });
}

function clearExecutionStates() {
  nodes.value = nodes.value.map(n => ({
    ...n,
    zIndex: 0,
    data: { ...n.data, wasExecuted: false, isExecuting: false, hasError: false },
  }));
  edges.value = edges.value.map(e => ({
    ...e,
    zIndex: 0,
    data: { ...e.data, wasExecuted: false, isExecuting: false },
  }));
}

function completeInteractiveExecution() {
  toast({
    title: 'Execução Concluída! 🎉',
    description: `Fluxo percorreu ${executionPath.value.length} blocos.`,
  });
  isInteractiveExecutionActive.value = false;
}

function cancelInteractiveExecution() {
  isInteractiveExecutionActive.value = false;
  currentExecutingBlockId.value = null;
  executionPath.value = [];
  executionStep.value = 0;
  clearExecutionStates();
  
  toast({
    title: 'Execução Cancelada',
    description: 'A execução interativa foi cancelada.',
  });
}

function handleBlockClick(block: any) {
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
      type: block.key,
      content: block.description,
      ...(block.key === 'note' ? { color: 'yellow' } : {}),
    },
  };
  
  nodes.value = [...nodes.value, newNode];
}

function onConnect(params: Connection) {
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

function isValidConnection(_connection: Connection) {
  return true; 
}

function updateHelperLines(changes: NodeChange[], nodes: GraphNode[]) {
  helperLineHorizontal.value = undefined;
  helperLineVertical.value = undefined;

  if (changes.length === 1 && changes[0].type === 'position' && changes[0].dragging && changes[0].position) {
    const helperLines = getHelperLines(changes[0] as any, nodes);

    changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
    changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

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
    
    const container = (event.currentTarget as HTMLElement).querySelector('.vue-flow-container') || (event.currentTarget as HTMLElement);
    const rect = container.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const position = project({ x, y });

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
      type: block.key,
      content: block.description,
      ...(block.key === 'note' ? { color: 'yellow' } : {}),
      ...(defaultConditions ? { conditions: defaultConditions } : {}),
    },
  };
  
  nodes.value = [...nodes.value, newNode];
}

function handleSave() {
  try {
    const saveFlowId = isNewFlow.value ? `flow-task-${Date.now()}` : flowId.value;
    
    const flowData = {
      id: saveFlowId,
      nome: currentFlow.value?.nome || 'Novo Fluxo de Atividades',
      descricao: currentFlow.value?.descricao || '',
      nodes: nodes.value,
      edges: edges.value,
      isActive: isFlowActive.value,
      createdAt: currentFlow.value?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    flowsStore.saveFlow(flowData);
    
    if (isNewFlow.value) {
      currentFlow.value = {
        id: saveFlowId,
        nome: flowData.nome,
        descricao: flowData.descricao,
        ativo: flowData.isActive,
        tipo: 'atividades',
        status: 'ativo',
        createdAt: flowData.createdAt,
        updatedAt: flowData.updatedAt,
      } as Flow;
      
      router.replace(`/fluxos-atividades/${saveFlowId}`);
    }
    
    toast({
      title: 'Fluxo salvo',
      description: `Fluxo "${flowData.nome}" salvo com sucesso.`,
    });
    
    // Mark as saved
    lastSavedState.value = true;
    hasUnsavedChanges.value = false;
    
  } catch (error) {
    console.error('Erro ao salvar fluxo:', error);
    toast({
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar o fluxo. Tente novamente.',
      variant: 'destructive',
    });
  }
}

function toggleLayoutMode() {
  const newMode = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal';
  layoutMode.value = newMode;
  
  const newNodeType = newMode === 'horizontal' ? 'customNodeHorizontal' : 'customNodeVertical';
  const newSourcePos = newMode === 'horizontal' ? Position.Right : Position.Bottom;
  const newTargetPos = newMode === 'horizontal' ? Position.Left : Position.Top;
  
  nodes.value = nodes.value.map(node => {
    if (node.type === 'noteNode') return node;
    
    return {
      ...node,
      type: newNodeType,
      sourcePosition: newSourcePos,
      targetPosition: newTargetPos,
    };
  });
  
  nextTick(() => {
    handleLayout();
    setTimeout(() => {
      fitView({ padding: 0.2, maxZoom: 1, duration: 300 });
    }, 100);
  });
}

function handleValidate() {
  console.log('Validando fluxo de atividades...');
}

const { layout } = useLayout();

function handleLayout() {
  const direction = layoutMode.value === 'horizontal' ? 'LR' : 'TB';
  nodes.value = layout(nodes.value, edges.value, direction);
  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1, duration: 500 });
  });
}

// Initialize executions store with seed data
onMounted(() => {
  // Force reload seed data to ensure mocks are available
  executionsStore.initializeWithSeedData(getSeedExecutions(), true);

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

// Export flow as JSON file
function handleExport() {
  const flowData = {
    id: flowId.value,
    nome: currentFlow.value?.nome || 'Fluxo Exportado',
    descricao: currentFlow.value?.descricao || '',
    tipo: 'atividades',
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
  link.download = `fluxo-atividades-${fileName}-${Date.now()}.json`;
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
    
    if (!flowData.nodes || !flowData.edges) {
      throw new Error('Arquivo JSON inválido: deve conter nodes e edges');
    }
    
    const newId = `imported-task-${Date.now()}`;
    
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
    
    router.push(`/fluxos-atividades/${newId}`);
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
  router.push('/configuracoes/fluxos/atividades');
}
</script>

<style>
.vue-flow-container {
  width: 100%;
  height: 100%;
  background-color: hsl(var(--muted) / 0.4);
}

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
