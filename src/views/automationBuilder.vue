<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
    <!-- Header -->
    <AutomationBuilderHeader 
      :automation-name="automationName"
      :trigger-type="triggerType"
      :inbox-name="inboxName"
      :is-active="isActive"
      :has-unsaved-changes="hasUnsavedChanges"
      v-model:view-mode="viewMode"
      @update:is-active="isActive = $event"
      @save="handleSave"
      @back="handleBack"
      @export="handleExport"
      @import="handleImport"
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
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue';
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
  type Connection,
  type GraphNode
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
import { getHelperLines } from '@/components/flow-builder/utils';
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
import { getCaixaEntradaById } from '@/mocks/data/caixas-entrada';
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
  onPaneClick,
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

// Get inbox name
const inboxName = computed(() => {
  const caixa = getCaixaEntradaById(caixaId.value);
  return caixa?.nome || 'Caixa de Entrada';
});

// State
const isSidebarCollapsed = ref(false);
const automationName = ref('Nova Automação');
const isActive = ref(true);
const layoutMode = ref<'horizontal' | 'vertical'>('horizontal');
// Provide layoutMode to child components
provide('layoutMode', layoutMode);
const viewMode = ref<ViewMode>('edit');

// Vue Flow elements managed as local refs
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

// History Support (Undo/Redo)
const { undo, redo, canUndo, canRedo } = useRefHistory(nodes, { 
  deep: true,
  capacity: 20 
});

// Dirty state tracking
const hasUnsavedChanges = ref(true);
const lastSavedState = ref(false);

// Watch for ANY changes (including position changes from dragging)
watch([nodes, edges, isActive], () => {
  if (lastSavedState.value) {
    hasUnsavedChanges.value = true;
  }
}, { deep: true });

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


function updateHelperLines(changes: NodeChange[], nodesList: GraphNode[]) {
  helperLineHorizontal.value = undefined;
  helperLineVertical.value = undefined;

  if (changes.length === 1 && changes[0].type === 'position' && changes[0].dragging && changes[0].position) {
    const helperLines = getHelperLines(changes[0] as any, nodesList);

    // Snap position
    changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
    changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

    // Set helper lines
    helperLineHorizontal.value = helperLines.horizontal;
    helperLineVertical.value = helperLines.vertical;
  }

  return changes;
}

// Handle element changes
function onNodesChange(changes: NodeChange[]) {
  // Verificar se há tentativa de remover nós protegidos (gatilho ou fim)
  const protectedNodesToRestore: Node[] = [];
  let showMessage = false;
  let messageTitle = '';
  let messageDescription = '';
  
  // Primeiro, verificar todas as tentativas de remoção
  changes.forEach(change => {
    if (change.type === 'remove') {
      // Buscar o nó na lista atual antes da remoção
      const nodeToRemove = nodes.value.find(n => n.id === change.id);
      
      if (nodeToRemove) {
        // Verificar se é um nó de gatilho (trigger)
        const isTrigger = nodeToRemove.type === 'triggerNode' || nodeToRemove.data?.type?.startsWith('trigger_');
        // Verificar se é o bloco "Fim"
        const isEnd = nodeToRemove.data?.type === 'end';
        
        if (isTrigger || isEnd) {
          // Adicionar à lista de nós protegidos para restaurar
          protectedNodesToRestore.push(nodeToRemove);
          showMessage = true;
          
          // Definir mensagem de erro
          if (isTrigger) {
            messageTitle = 'Ação não permitida';
            messageDescription = 'Não é possível remover o gatilho da automação. O gatilho é obrigatório e deve sempre existir.';
          } else if (isEnd) {
            messageTitle = 'Ação não permitida';
            messageDescription = 'Não é possível remover o bloco "Fim" da automação. O bloco "Fim" é obrigatório e deve sempre existir.';
          }
        }
      }
    }
  });
  
  // Mostrar mensagem de erro ANTES de processar as mudanças
  if (showMessage) {
    toast.error(messageTitle, messageDescription);
  }
  
  // Filtrar mudanças de remoção para nós protegidos
  const filteredChanges = changes.filter(change => {
    if (change.type === 'remove') {
      const isProtected = protectedNodesToRestore.some(n => n.id === change.id);
      return !isProtected; // Não permitir remoção de nós protegidos
    }
    return true; // Permitir outras mudanças
  });
  
  // Update helper lines and apply node changes
  const updatedChanges = updateHelperLines(filteredChanges, nodes.value as unknown as GraphNode[]);
  nodes.value = applyNodeChanges(updatedChanges, nodes.value as any);
  
  // Restaurar nós protegidos que foram removidos (garantir que sempre existam)
  if (protectedNodesToRestore.length > 0) {
    protectedNodesToRestore.forEach(protectedNode => {
      // Verificar se o nó ainda não existe (foi removido)
      const nodeExists = nodes.value.some(n => n.id === protectedNode.id);
      if (!nodeExists) {
        // Restaurar o nó protegido com deletable: false
        nodes.value = [...nodes.value, { ...protectedNode, deletable: false } as any];
      }
    });
  }
  
  // Sempre garantir que nós protegidos tenham deletable: false
  ensureProtectedNodes();
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
    
    // Garantir que nós protegidos tenham deletable: false
    ensureProtectedNodes();
    // Get name from query parameter or use default
    const nomeFromQuery = route.query.nome as string;
    automationName.value = nomeFromQuery ? decodeURIComponent(nomeFromQuery) : 'Nova Automação';
    isActive.value = true;
  } else {
    // Load existing automation
    const automation = automationsStore.getAutomationById(automationId.value);
    if (automation) {
      nodes.value = [...automation.nodes] as any;
      edges.value = [...automation.edges] as any;
      automationName.value = automation.nome;
      isActive.value = automation.ativo;
      
      // Garantir que nós protegidos tenham deletable: false
      ensureProtectedNodes();
    } else {
      toast.error('Erro', 'Automação não encontrada');
      router.push('/configuracoes/automacoes');
    }
  }
}

// Função para garantir que nós protegidos sempre tenham deletable: false
function ensureProtectedNodes() {
  nodes.value = nodes.value.map(node => {
    const isTrigger = node.type === 'triggerNode' || node.data?.type?.startsWith('trigger_');
    const isEnd = node.data?.type === 'end';
    
    if (isTrigger || isEnd) {
      return {
        ...node,
        deletable: false,
      };
    }
    return node;
  });
}

// Handlers
function handleBack() {
  router.push('/configuracoes/automacoes');
}

function handleSave() {
  if (isNewAutomation.value) {
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
    automationsStore.updateAutomation(automationId.value, {
      nome: automationName.value,
      ativo: isActive.value,
      nodes: nodes.value as any,
      edges: edges.value as any,
    });
    toast.success('Automação salva', `${automationName.value} foi atualizada`);
  }
  
  // Mark as saved
  lastSavedState.value = true;
  hasUnsavedChanges.value = false;
}

// Export automation as JSON file
function handleExport() {
  const automationData = {
    id: automationId.value,
    nome: automationName.value,
    caixaId: caixaId.value,
    gatilho: triggerType.value,
    ativo: isActive.value,
    nodes: nodes.value,
    edges: edges.value,
    exportedAt: new Date().toISOString(),
  };
  
  const dataStr = JSON.stringify(automationData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = automationName.value.toLowerCase().replace(/\s+/g, '-');
  link.download = `automacao-${fileName}-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  
  toast.success('Automação exportada', 'O arquivo JSON foi baixado com sucesso.');
}

// Import automation from JSON file
async function handleImport(file: File) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.nodes || !data.edges) {
      throw new Error('Arquivo JSON inválido: deve conter nodes e edges');
    }
    
    // Apply imported data to current automation
    nodes.value = data.nodes;
    edges.value = data.edges;
    if (data.nome) automationName.value = data.nome;
    
    toast.success('Automação importada', 'Os dados foram carregados. Clique em Salvar para persistir.');
  } catch (error) {
    console.error('Erro ao importar automação:', error);
    toast.error('Erro ao importar', error instanceof Error ? error.message : 'Arquivo JSON inválido.');
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

// Handler para clique no canvas (fecha o painel)
onPaneClick(() => {
  if (showConfigPanel.value) {
    closeConfigPanel();
  }
});

function closeConfigPanel() {
  showConfigPanel.value = false;
  selectedNodeId.value = null;
}

// Watcher para fechar o painel quando selectedNodeId for null
watch(selectedNodeId, (newId) => {
  if (!newId) {
    showConfigPanel.value = false;
  }
});

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
    
    // Check if dropping a trigger block when one already exists
    if (block.key.startsWith('trigger_')) {
      const existingTrigger = nodes.value.find((n: any) => 
        n.type === 'triggerNode' || n.data?.type?.startsWith('trigger_')
      );
      if (existingTrigger) {
        toast.error('Gatilho duplicado', 'Já existe um gatilho nesta automação. Cada automação pode ter apenas um gatilho.');
        return;
      }
    }
    
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
    // Default conditions for chat_flow block
    const defaultConditions = block.key === 'chat_flow' 
      ? ['Ganho', 'Perdido'] 
      : undefined;
    
    const newNode = {
      id: `${block.key}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        ...(block.data || { type: block.key, title: block.label }),
        ...(defaultConditions ? { conditions: defaultConditions } : {}),
      },
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
