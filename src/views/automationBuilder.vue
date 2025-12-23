<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- Header -->
    <AutomationBuilderHeader 
      :automation-name="automationName"
      :trigger-type="triggerType"
      :is-active="isActive"
      v-model:view-mode="viewMode"
      @update:is-active="isActive = $event"
      @save="handleSave"
      @back="handleBack"
    />

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar -->
      <AutomationsSidebar 
        v-if="viewMode === 'edit'"
        :collapsed="isSidebarCollapsed" 
        :trigger-type="triggerType"
        @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
      />

      <!-- Vue Flow Canvas -->
      <div
        :class="cn(
          'flex-1 transition-all duration-300',
          viewMode === 'edit' ? (isSidebarCollapsed ? 'ml-16' : 'ml-80') : 'ml-0'
        )"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        <div class="h-full">
          <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            :default-viewport="{ zoom: 1 }"
            :min-zoom="0.2"
            :max-zoom="4"
            :snap-to-grid="true"
            :snap-grid="[20, 20]"
            :connection-mode="ConnectionMode.Loose"
            :delete-key-code="['Backspace', 'Delete']"
            :node-types="nodeTypes"
            :edge-types="edgeTypes"
            :edges-updatable="true"
            :connect-on-click="false"
            :connection-radius="30"
            :auto-connect="true"
            :fit-view-on-init="false"
            :is-valid-connection="isValidConnection"
            :nodes-draggable="true"
            :elements-selectable="true"
            class="vue-flow-container"
            @connect="onConnect"
            @nodes-change="onNodesChange"
            @edges-change="onEdgesChange"
            @pane-ready="onPaneReady"
          >
            <Background variant="dots" :gap="12" :size="1" />
            
            <!-- Custom Toolbar -->
            <FlowToolbar
              :can-undo="canUndo"
              :can-redo="canRedo"
              :layout-mode="layoutMode"
              @undo="undo"
              @redo="redo"
              @zoom-in="zoomIn"
              @zoom-out="zoomOut"
              @fit-view="() => fitView({ padding: 0.2, maxZoom: 1 })"
              @layout="handleAutoLayout"
              @toggle-layout="toggleLayoutMode"
            />

            <!-- Helper Lines -->
            <HelperLines 
              :horizontal="helperLineHorizontal"
              :vertical="helperLineVertical"
            />

            <!-- MiniMap -->
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

          <!-- Config Panel -->
          <div 
            v-if="showConfigPanel && selectedNodeId && viewMode === 'edit'"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  VueFlow, 
  useVueFlow, 
  ConnectionMode, 
  MarkerType,
  applyNodeChanges, 
  applyEdgeChanges,
  type Node, 
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection
} from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Background } from '@vue-flow/background';
import { cn } from '@/lib/utils';
import { useRefHistory } from '@vueuse/core';

// Components
import AutomationBuilderHeader from '@/components/automations/AutomationBuilderHeader.vue';
import AutomationsSidebar from '@/components/automations/AutomationsSidebar.vue';
import FlowToolbar from '@/components/flow-builder/FlowToolbar.vue';
import BlockConfigPanel from '@/components/flow-builder/BlockConfigPanel.vue';
import HelperLines from '@/components/flow-builder/HelperLines.vue';
import CustomNode from '@/components/flow-builder/CustomNode.vue';
import CustomNodeHorizontal from '@/components/flow-builder/CustomNodeHorizontal.vue';
import CustomNodeVertical from '@/components/flow-builder/CustomNodeVertical.vue';
import CustomEdge from '@/components/flow-builder/CustomEdge.vue';
import AvailabilityCheckNode from '@/components/automations/blocks/AvailabilityCheckNode.vue';
import TriggerNode from '@/components/automations/blocks/TriggerNode.vue';

// Composables & Stores
import { useLayout } from '@/composables/useLayout';
import { useAutomationsStore } from '@/stores/automations';
// Mocks
import { createDefaultNodes } from '@/mocks/data/automations';
import { useToast } from '@/composables/useToast';
import type { AutomationTrigger } from '@/types/automation';

// Types
type ViewMode = 'edit' | 'execution';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const automationsStore = useAutomationsStore();

// VueFlow
const { 
  getViewport,
  onViewportChange,
  addEdges,
  onNodeClick,
  project,
  fitView,
  zoomIn,
  zoomOut
} = useVueFlow();

// Route params
const caixaId = computed(() => route.params.caixaId as string);
const triggerType = computed(() => route.params.gatilhoTipo as AutomationTrigger);
const automationId = computed(() => route.params.automacaoId as string);
const isNewAutomation = computed(() => automationId.value === 'novo');

// State
const isSidebarCollapsed = ref(false);
const automationName = ref('Nova Automação');
const isActive = ref(true);
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal');
const viewMode = ref<ViewMode>('edit');

// Vue Flow elements managed as local refs
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

// History Support (Undo/Redo)
const { undo, redo, canUndo, canRedo } = useRefHistory(nodes, { 
  deep: true,
  capacity: 20 
});

// Config panel state
const showConfigPanel = ref(false);
const selectedNodeId = ref<string | null>(null);
const selectedNodeData = ref<any>(null);

// Helper Lines state
const helperLineHorizontal = ref<number | undefined>(undefined);
const helperLineVertical = ref<number | undefined>(undefined);

// MiniMap state
const showMinimap = ref(false);
const lastZoom = ref<number | null>(null);
let minimapTimeout: number | null = null;

// Node & Edge types
const nodeTypes = {
  customNode: CustomNode,
  customNodeHorizontal: CustomNodeHorizontal,
  customNodeVertical: CustomNodeVertical,
  availabilityCheckNode: AvailabilityCheckNode,
  triggerNode: TriggerNode,
  default: CustomNode,
};

const edgeTypes = {
  default: CustomEdge,
  custom: CustomEdge,
  smoothstep: CustomEdge,
};


// MiniMap colors
const minimapMaskColor = computed(() => 'hsl(var(--background) / 0.8)');
const getNodeColor = (): string => 'hsl(var(--muted-foreground))';

// Layout composable
const { layout } = useLayout();

// Provide layout mode to child components
provide('layoutMode', layoutMode);

// Connection validation
function isValidConnection(_connection: Connection): boolean {
  return true; // Permitir tudo para garantir funcionamento
}


// Handle element changes
function onNodesChange(changes: NodeChange[]) {
  nodes.value = applyNodeChanges(changes, nodes.value as any);
}

function onEdgesChange(changes: EdgeChange[]) {
  edges.value = applyEdgeChanges(changes, edges.value as any);
}

// Handle new connections - COPIADO DO flowBuilderChat
function onConnect(params: Connection) {
  console.log('✅ onConnect triggered:', params);
  
  // Se o auto-connect estiver ON, o Vue Flow já vai adicionar uma edge.
  // Mas queremos customizar o ID e o estilo, então usamos addEdges.
  // Para evitar duplicatas, o Vue Flow geralmente lida bem, mas vamos garantir:
  addEdges([{
    id: `edge-${params.source}-${params.target}-${Date.now()}`,
    source: params.source!,
    target: params.target!,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'smoothstep',
    markerEnd: MarkerType.ArrowClosed,
  }]);
}

// Viewport change handler (show/hide minimap)
const handleViewportChange = () => {
  const currentViewport = getViewport();
  const currentZoom = currentViewport.zoom;

  if (lastZoom.value !== null && lastZoom.value !== currentZoom) {
    showMinimap.value = true;

    if (minimapTimeout) {
      clearTimeout(minimapTimeout);
    }

    minimapTimeout = window.setTimeout(() => {
      showMinimap.value = false;
    }, 2000);
  }

  lastZoom.value = currentZoom;
};

// Load automation data
onMounted(() => {
  // Initialize viewport listener
  onViewportChange(handleViewportChange);
});

// Vue Flow Pane Ready handler - melhor lugar para fitView e inicialização
function onPaneReady() {
  loadAutomation();
  
  window.requestAnimationFrame(() => {
    fitView({ padding: 0.2, maxZoom: 1 });
  });
}

onUnmounted(() => {
  if (minimapTimeout) {
    clearTimeout(minimapTimeout);
  }
});

function loadAutomation() {
  if (isNewAutomation.value) {
    // Create new automation with default nodes
    const defaults = createDefaultNodes(triggerType.value);
    nodes.value = defaults.nodes as any;
    edges.value = defaults.edges as any;
    automationName.value = 'Nova Automação';
    isActive.value = true;
  } else {
    // Load existing automation
    const automation = automationsStore.getAutomationById(automationId.value);
    if (automation) {
      nodes.value = [...automation.nodes] as any;
      edges.value = [...automation.edges] as any;
      automationName.value = automation.nome;
      isActive.value = automation.ativo;
    } else {
      toast.error('Erro', 'Automação não encontrada');
      router.push('/settings/automacoes');
    }
  }
}

// Handlers
function handleBack() {
  router.push('/settings/automacoes');
}

function handleSave() {
  if (isNewAutomation.value) {
    // Create new automation
    const newAutomation = automationsStore.addAutomation({
      nome: automationName.value,
      caixaId: caixaId.value,
      gatilho: triggerType.value,
      ativo: isActive.value,
      nodes: nodes.value as any,
      edges: edges.value as any,
    });
    toast.success('Automação criada', `${newAutomation.nome} foi criada com sucesso`);
    router.replace(`/automacoes/${caixaId.value}/${triggerType.value}/${newAutomation.id}`);
  } else {
    // Update existing automation
    automationsStore.updateAutomation(automationId.value, {
      nome: automationName.value,
      ativo: isActive.value,
      nodes: nodes.value as any,
      edges: edges.value as any,
    });
    toast.success('Automação salva', `${automationName.value} foi atualizada`);
  }
}

function handleAutoLayout() {
  layout(nodes.value, edges.value, layoutMode.value);
  setTimeout(() => fitView(), 100);
}

function toggleLayoutMode() {
  layoutMode.value = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal';
}

// Handle node click - usando o composable do VueFlow igual ao flowBuilderChat
onNodeClick(({ node }) => {
  // Block config for start/end nodes
  if (['start', 'end'].includes(node.data?.type)) return;
  
  selectedNodeId.value = node.id;
  // Deep clone to prevent accidental mutations
  selectedNodeData.value = JSON.parse(JSON.stringify(node.data));
  showConfigPanel.value = true;
});

function closeConfigPanel() {
  showConfigPanel.value = false;
  selectedNodeId.value = null;
}

function handleSaveBlock({ id, data }: { id: string, data: any }) {
  const nodeIndex = nodes.value.findIndex(n => n.id === id);
  if (nodeIndex !== -1) {
    nodes.value[nodeIndex] = {
      ...nodes.value[nodeIndex],
      data: { ...data }
    };
    // Force reactivity
    nodes.value = [...nodes.value];
  }
  showConfigPanel.value = false;
  selectedNodeId.value = null;
}

// Handle drag over
function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

// Handle drop from sidebar
function onDrop(event: DragEvent) {
  event.preventDefault();
  
  if (!event.dataTransfer) return;
  
  const blockDataStr = event.dataTransfer.getData('application/vueflow');
  if (!blockDataStr) return;
  
  try {
    const block = JSON.parse(blockDataStr);
    
    // Get the VueFlow container for correct coordinates
    const container = (event.currentTarget as HTMLElement).querySelector('.vue-flow-container') || (event.currentTarget as HTMLElement);
    const rect = container.getBoundingClientRect();
    
    // Calculate position relative to container
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Use project to convert screen coordinates to flow coordinates
    const position = project({ x, y });
    
    // Center the node on cursor
    position.x -= 100;
    position.y -= 50;
    
    // Determine node type based on block type
    let nodeType = 'customNodeHorizontal';
    if (block.key === 'availability_check') {
      nodeType = 'availabilityCheckNode';
    } else if (block.key.startsWith('trigger_')) {
      nodeType = 'triggerNode';
    }
    
    // Create new node
    const newNode = {
      id: `${block.key}-${Date.now()}`,
      type: nodeType,
      position,
      data: block.data || { type: block.key, title: block.label },
    };
    
    // Add node using direct array assignment (avoids VueFlow reactivity issues)
    nodes.value = [...nodes.value, newNode] as any;
    
    // Select the new node
    selectedNodeId.value = newNode.id;
    selectedNodeData.value = { ...newNode.data };
    showConfigPanel.value = true;
  } catch (e) {
    console.error('Failed to parse dropped block data', e);
  }
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow-container {
  width: 100%;
  height: 100%;
}

.vue-flow__minimap-custom {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
}
</style>
