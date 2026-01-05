<template>
    <component :is="isSettings ? 'div' : AppLayout">
      <div class="flex h-full flex-col">
        <ScrollArea class="flex-1">
          <div class="p-6">
            <div class="mx-auto max-w-7xl">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-semibold">Fluxos</h1>
                <p class="text-sm text-muted-foreground mt-1">
                  Gerencie seus fluxos de atendimento automatizados e atividades
                </p>
              </div>
              <Button @click="openCreateDialog" v-if="!readOnly">
                <Plus class="mr-2 h-4 w-4" />
                Novo Fluxo
              </Button>
            </div>

            <!-- Tabs -->
            <Tabs v-model="activeTab" class="w-full">
              <TabsList class="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="atendimento" class="flex items-center justify-center gap-2">
                  <BotIcon class="h-4 w-4" />
                  <span>Atendimento por IA</span>
                </TabsTrigger>
                <TabsTrigger value="atividades" class="flex items-center justify-center gap-2">
                  <CheckCircle2 class="h-4 w-4" />
                  <span>Atividades</span>
                </TabsTrigger>
              </TabsList>

              <!-- Tab Content: Atendimento -->
              <TabsContent value="atendimento" class="mt-6">
                <div class="mb-6">
                  <h2 class="text-xl font-semibold">Fluxos de Atendimento por IA</h2>
                  <p class="text-sm text-muted-foreground mt-1">
                    Gerencie os fluxos de atendimento automatizados por inteligência artificial
                  </p>
                </div>

                <FlowsList
                    :flows="flowsAtendimento"
                    :loading="loadingAtendimento"
                    :read-only="readOnly"
                    @edit="handleEditAtendimento"
                    @delete="handleDeleteAtendimento"
                    @create="handleCreateAtendimento"
                    @toggle="handleToggleAtendimento"
                    @view="handleViewFlow"
                  />

                <FlowDialog
                  :open="dialogOpenAtendimento"
                  :flow="selectedFlowAtendimento"
                  flow-type="atendimento"
                  @update:open="handleDialogOpenChangeAtendimento"
                  @save="handleSaveAtendimento"
                />

                <ConfirmDialog
                  :open="deleteDialogOpenAtendimento"
                  title="Excluir fluxo"
                  :description="`Tem certeza que deseja excluir o fluxo ${flowToDeleteAtendimento?.nome}? Esta ação não pode ser desfeita.`"
                  confirm-text="Excluir"
                  cancel-text="Cancelar"
                  action-type="delete"
                  @update:open="setDeleteDialogOpenAtendimento"
                  @confirm="confirmDeleteAtendimento"
                />
              </TabsContent>

              <!-- Tab Content: Atividades -->
              <TabsContent value="atividades" class="mt-6">
                <div class="mb-6">
                  <h2 class="text-xl font-semibold">Fluxos de Atividades</h2>
                  <p class="text-sm text-muted-foreground mt-1">
                    Gerencie os fluxos de atividades automatizadas
                  </p>
                </div>

                <FlowsList
                    :flows="flowsAtividades"
                    :loading="loadingAtividades"
                    :read-only="readOnly"
                    @edit="handleEditAtividades"
                    @delete="handleDeleteAtividades"
                    @create="handleCreateAtividades"
                    @toggle="handleToggleAtividades"
                    @view="handleViewFlow"
                  />

                <FlowDialog
                  :open="dialogOpenAtividades"
                  :flow="selectedFlowAtividades"
                  flow-type="atividades"
                  @update:open="handleDialogOpenChangeAtividades"
                  @save="handleSaveAtividades"
                />

                <ConfirmDialog
                  :open="deleteDialogOpenAtividades"
                  title="Excluir fluxo"
                  :description="`Tem certeza que deseja excluir o fluxo ${flowToDeleteAtividades?.nome}? Esta ação não pode ser desfeita.`"
                  confirm-text="Excluir"
                  cancel-text="Cancelar"
                  action-type="delete"
                  @update:open="setDeleteDialogOpenAtividades"
                  @confirm="confirmDeleteAtividades"
                />
              </TabsContent>
            </Tabs>
            </div>
          </div>
        </ScrollArea>
        
        <!-- Bottom Sheet for Flow Details -->
        <BottomSheet
          :open="sheetOpen"
          :title="selectedFlowView?.nome || ''"
          :subtitle="selectedFlowView?.descricao || 'Visualização de execução do fluxo'"
          @close="sheetOpen = false"
        >
          <div class="px-6 py-4">
            <FlowExecutionPanel 
              v-if="selectedFlowView"
              :flow="selectedFlowView" 
            />
          </div>
        </BottomSheet>

        <!-- Create Flow Dialog -->
        <AlertDialog :open="createDialogOpen" @update:open="setCreateDialogOpen">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Criar Novo Fluxo</AlertDialogTitle>
              <AlertDialogDescription>
                Selecione o tipo de fluxo e informe os dados básicos
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div class="space-y-4 py-4">
              <!-- Flow Type Selection -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Tipo de Fluxo</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="newFlowType = 'atendimento'"
                    :class="[
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      newFlowType === 'atendimento'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    ]"
                  >
                    <BotIcon :class="['h-6 w-6', newFlowType === 'atendimento' ? 'text-primary' : 'text-muted-foreground']" />
                    <span :class="['text-sm font-medium', newFlowType === 'atendimento' ? 'text-primary' : '']">
                      Atendimento por IA
                    </span>
                  </button>
                  <button
                    @click="newFlowType = 'atividades'"
                    :class="[
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      newFlowType === 'atividades'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    ]"
                  >
                    <CheckCircle2 :class="['h-6 w-6', newFlowType === 'atividades' ? 'text-primary' : 'text-muted-foreground']" />
                    <span :class="['text-sm font-medium', newFlowType === 'atividades' ? 'text-primary' : '']">
                      Atividades
                    </span>
                  </button>
                </div>
              </div>

              <!-- Flow Name -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Nome do Fluxo *</label>
                <input
                  v-model="newFlowName"
                  type="text"
                  placeholder="Ex: Boas-vindas, Qualificação de Leads..."
                  class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  @keydown.enter="handleConfirmCreate"
                />
                <p v-if="showNameError" class="text-xs text-destructive">O nome do fluxo é obrigatório</p>
              </div>

              <!-- Flow Description -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Descrição (opcional)</label>
                <textarea
                  v-model="newFlowDescription"
                  placeholder="Descreva o objetivo deste fluxo..."
                  rows="3"
                  class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel @click="setCreateDialogOpen(false)">Cancelar</AlertDialogCancel>
              <AlertDialogAction @click="handleConfirmCreate">
                Criar Fluxo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </component>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Plus, BotIcon, CheckCircle2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout.vue';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import BottomSheet from '@/components/ui/bottom-sheet/BottomSheet.vue';
import FlowsList from '@/components/flows/FlowsList.vue';
import FlowDialog from '@/components/flows/FlowDialog.vue';
import FlowExecutionPanel from '@/components/flows/FlowExecutionPanel.vue';
import { MOCK_FLOWS_ATENDIMENTO, MOCK_FLOWS_ATIVIDADES, type Flow } from '@/mocks/data/flows';
import { useToast } from '@/composables/useToast';
import { generateFlowId } from '@/utils/idGenerator';
import { useFlowsStore } from '@/stores/flows';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const flowsStore = useFlowsStore();

const isSettings = computed(() => route.path.includes('/configuracoes'));
const readOnly = computed(() => !isSettings.value);

const sheetOpen = ref(false);
const selectedFlowView = ref<Flow | null>(null);

function handleViewFlow(flow: Flow) {
  selectedFlowView.value = flow;
  sheetOpen.value = true;
}

// Create Flow Dialog state
const createDialogOpen = ref(false);
const newFlowType = ref<'atendimento' | 'atividades'>('atendimento');
const newFlowName = ref('');
const newFlowDescription = ref('');
const showNameError = ref(false);

function openCreateDialog() {
  // Reset form
  newFlowType.value = activeTab.value === 'atividades' ? 'atividades' : 'atendimento';
  newFlowName.value = '';
  newFlowDescription.value = '';
  showNameError.value = false;
  createDialogOpen.value = true;
}

function setCreateDialogOpen(open: boolean) {
  createDialogOpen.value = open;
  if (!open) {
    showNameError.value = false;
  }
}

function handleConfirmCreate() {
  // Validate name
  if (!newFlowName.value.trim()) {
    showNameError.value = true;
    return;
  }

  // Close dialog
  createDialogOpen.value = false;

  // Navigate to builder based on type
  const basePath = isSettings.value 
    ? (newFlowType.value === 'atendimento' ? '/configuracoes/fluxos' : '/configuracoes/fluxos-atividades')
    : (newFlowType.value === 'atendimento' ? '/fluxos' : '/fluxos-atividades');
  
  // Store the flow data in flowsStore for the builder to use
  const newFlowId = generateFlowId();
  flowsStore.saveFlow({
    id: newFlowId,
    nome: newFlowName.value,
    descricao: newFlowDescription.value,
    nodes: [],
    edges: [],
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  router.push(`${basePath}/${newFlowId}`);
}

// Initialize active tab based on route
const getTabFromRoute = () => {
  if (route.path.includes('/atividades')) return 'atividades';
  return 'atendimento';
};

const activeTab = ref(getTabFromRoute());

// Watch for route changes (e.g. browser back button)
watch(
  () => route.path,
  () => {
    const newTab = getTabFromRoute();
    if (activeTab.value !== newTab) {
      activeTab.value = newTab;
    }
  }
);

// Update route when tab changes
watch(activeTab, (newTab) => {
  const currentTabInRoute = getTabFromRoute();
  if (currentTabInRoute !== newTab) {
    const basePath = isSettings.value ? '/configuracoes/fluxos' : '/fluxos';
    router.push(`${basePath}/${newTab}`);
  }
});

// Atendimento state
const flowsAtendimento = ref<Flow[]>([]);
const loadingAtendimento = ref(false);
const dialogOpenAtendimento = ref(false);
const selectedFlowAtendimento = ref<Flow | null>(null);
const deleteDialogOpenAtendimento = ref(false);
const flowToDeleteAtendimento = ref<Flow | null>(null);

// Atividades state
const flowsAtividades = ref<Flow[]>([]);
const loadingAtividades = ref(false);
const dialogOpenAtividades = ref(false);
const selectedFlowAtividades = ref<Flow | null>(null);
const deleteDialogOpenAtividades = ref(false);
const flowToDeleteAtividades = ref<Flow | null>(null);

onMounted(() => {
  // Sincronizar fluxos do mock com a store (só cria se não existir)
  const allMockFlows = [...MOCK_FLOWS_ATENDIMENTO, ...MOCK_FLOWS_ATIVIDADES];
  allMockFlows.forEach(flow => {
    const savedFlow = flowsStore.savedFlows.find(f => f.id === flow.id);
    if (!savedFlow) {
      // Só cria se não existe na store - usa status do mock como inicial
      flowsStore.saveFlow({
        id: flow.id,
        nome: flow.nome,
        descricao: flow.descricao,
        nodes: [],
        edges: [],
        isActive: flow.status === 'ativo',
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      });
    }
    // Se já existe na store, respeita o status atual (mudanças do usuário)
  });
  
  loadFlowsAtendimento();
  loadFlowsAtividades();
});

// Atendimento functions
function loadFlowsAtendimento() {
  loadingAtendimento.value = true;
  setTimeout(() => {
    // Carregar do mock com cópia profunda e sincronizar status da store
    const mockFlows: Flow[] = MOCK_FLOWS_ATENDIMENTO.map(flow => {
      const savedFlow = flowsStore.savedFlows.find(f => f.id === flow.id);
      // Determinar status: store tem prioridade, depois mock
      const status: Flow['status'] = savedFlow 
        ? (savedFlow.isActive ? 'ativo' : 'inativo')
        : (flow.status || 'ativo');
      
      return {
        ...flow,
        status,
      };
    });
    
    flowsAtendimento.value = mockFlows;
    loadingAtendimento.value = false;
  }, 500);
}

function handleCreateAtendimento() {
  const basePath = isSettings.value ? '/configuracoes/fluxos' : '/fluxos';
  router.push(`${basePath}/novo`);
}

function handleEditAtendimento(flow: Flow) {
  const basePath = isSettings.value ? '/configuracoes/fluxos' : '/fluxos';
  router.push(`${basePath}/${flow.id}`);
}

function handleToggleAtendimento(flow: Flow, active: boolean) {
  const index = flowsAtendimento.value.findIndex(f => f.id === flow.id);
  if (index !== -1) {
    // Substituir o objeto inteiro para garantir reatividade
    const newStatus = active ? 'ativo' : 'inativo';
    flowsAtendimento.value[index] = {
      ...flowsAtendimento.value[index],
      status: newStatus as Flow['status'],
    };
    
    // Sincronizar com a store
    flowsStore.updateFlowStatus(flow.id, active);
    
    // Na vida real aqui chamaria API
    toast.success(
      active ? 'Fluxo ativado' : 'Fluxo desativado',
      `${flow.nome} foi ${active ? 'ativado' : 'desativado'} com sucesso.`
    );
  }
}

function handleDeleteAtendimento(flow: Flow) {
  flowToDeleteAtendimento.value = flow;
  deleteDialogOpenAtendimento.value = true;
}

function confirmDeleteAtendimento() {
  if (flowToDeleteAtendimento.value) {
    flowsAtendimento.value = flowsAtendimento.value.filter(f => f.id !== flowToDeleteAtendimento.value!.id);
    toast.success('Fluxo excluído', `${flowToDeleteAtendimento.value.nome} foi removido com sucesso.`);
    flowToDeleteAtendimento.value = null;
  }
  deleteDialogOpenAtendimento.value = false;
}

function setDeleteDialogOpenAtendimento(open: boolean) {
  deleteDialogOpenAtendimento.value = open;
  if (!open) {
    flowToDeleteAtendimento.value = null;
  }
}

function handleSaveAtendimento(data: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>) {
  if (selectedFlowAtendimento.value?.id) {
    const index = flowsAtendimento.value.findIndex(f => f.id === selectedFlowAtendimento.value!.id);
    if (index !== -1) {
      flowsAtendimento.value[index] = {
        ...data,
        id: selectedFlowAtendimento.value.id,
        createdAt: selectedFlowAtendimento.value.createdAt,
        updatedAt: new Date().toISOString(),
      };
      toast.success('Fluxo atualizado', `${data.nome} foi atualizado com sucesso.`);
    }
  } else {
    const newFlow: Flow = {
      ...data,
      id: generateFlowId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    flowsAtendimento.value.push(newFlow);
    toast.success('Fluxo criado', `${data.nome} foi criado com sucesso.`);
    const basePath = isSettings.value ? '/configuracoes/fluxos' : '/fluxos';
    router.push(`${basePath}/${newFlow.id}`);
    return;
  }
  dialogOpenAtendimento.value = false;
  selectedFlowAtendimento.value = null;
}

function handleDialogOpenChangeAtendimento(open: boolean) {
  dialogOpenAtendimento.value = open;
  if (!open) {
    selectedFlowAtendimento.value = null;
  }
}

// Atividades functions
function loadFlowsAtividades() {
  loadingAtividades.value = true;
  setTimeout(() => {
    // Carregar do mock com cópia profunda para não mutar os originais
    const mockFlows: Flow[] = MOCK_FLOWS_ATIVIDADES.map(flow => {
      const savedFlow = flowsStore.savedFlows.find(f => f.id === flow.id);
      // Determinar status: store tem prioridade, depois mock
      const status: Flow['status'] = savedFlow 
        ? (savedFlow.isActive ? 'ativo' : 'inativo')
        : (flow.status || 'ativo');
      
      return {
        ...flow,
        status,
      };
    });
    
    flowsAtividades.value = mockFlows;
    loadingAtividades.value = false;
  }, 500);
}

function handleCreateAtividades() {
  const basePath = isSettings.value ? '/configuracoes/fluxos-atividades' : '/fluxos-atividades';
  router.push(`${basePath}/novo`);
}

function handleEditAtividades(flow: Flow) {
  const basePath = isSettings.value ? '/configuracoes/fluxos-atividades' : '/fluxos-atividades';
  router.push(`${basePath}/${flow.id}`);
}

function handleToggleAtividades(flow: Flow, active: boolean) {
  const index = flowsAtividades.value.findIndex(f => f.id === flow.id);
  if (index !== -1) {
    // Substituir o objeto inteiro para garantir reatividade
    const newStatus = active ? 'ativo' : 'inativo';
    flowsAtividades.value[index] = {
      ...flowsAtividades.value[index],
      status: newStatus as Flow['status'],
    };
    
    // Sincronizar com a store
    flowsStore.updateFlowStatus(flow.id, active);
    
    // Na vida real aqui chamaria API
    toast.success(
      active ? 'Fluxo ativado' : 'Fluxo desativado',
      `${flow.nome} foi ${active ? 'ativado' : 'desativado'} com sucesso.`
    );
  }
}

function handleDeleteAtividades(flow: Flow) {
  flowToDeleteAtividades.value = flow;
  deleteDialogOpenAtividades.value = true;
}

function confirmDeleteAtividades() {
  if (flowToDeleteAtividades.value) {
    flowsAtividades.value = flowsAtividades.value.filter(f => f.id !== flowToDeleteAtividades.value!.id);
    toast.success('Fluxo excluído', `${flowToDeleteAtividades.value.nome} foi removido com sucesso.`);
    flowToDeleteAtividades.value = null;
  }
  deleteDialogOpenAtividades.value = false;
}

function setDeleteDialogOpenAtividades(open: boolean) {
  deleteDialogOpenAtividades.value = open;
  if (!open) {
    flowToDeleteAtividades.value = null;
  }
}

function handleSaveAtividades(data: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>) {
  if (selectedFlowAtividades.value?.id) {
    const index = flowsAtividades.value.findIndex(f => f.id === selectedFlowAtividades.value!.id);
    if (index !== -1) {
      flowsAtividades.value[index] = {
        ...data,
        id: selectedFlowAtividades.value.id,
        createdAt: selectedFlowAtividades.value.createdAt,
        updatedAt: new Date().toISOString(),
      };
      toast.success('Fluxo atualizado', `${data.nome} foi atualizado com sucesso.`);
    }
  } else {
    const newFlow: Flow = {
      ...data,
      id: generateFlowId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    flowsAtividades.value.push(newFlow);
    toast.success('Fluxo criado', `${data.nome} foi criado com sucesso.`);
    
    // Navigate to the correct builder route
    router.push(`/configuracoes/fluxos-atividades/${newFlow.id}`);
    return;
  }
  dialogOpenAtividades.value = false;
  selectedFlowAtividades.value = null;
}

function handleDialogOpenChangeAtividades(open: boolean) {
  dialogOpenAtividades.value = open;
  if (!open) {
    selectedFlowAtividades.value = null;
  }
}
</script>

