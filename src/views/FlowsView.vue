<template>
  <AppLayout>
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
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold">Fluxos de Atendimento por IA</h2>
                  <p class="text-sm text-muted-foreground mt-1">
                    Gerencie os fluxos de atendimento automatizados por inteligência artificial
                  </p>
                </div>
                <Button @click="handleCreateAtendimento">
                  <Plus class="mr-2 h-4 w-4" />
                  Novo Fluxo
                </Button>
              </div>

              <FlowsTable
                :flows="flowsAtendimento"
                :loading="loadingAtendimento"
                @edit="handleEditAtendimento"
                @delete="handleDeleteAtendimento"
                @create="handleCreateAtendimento"
                @row-click="handleEditAtendimento"
              />

              <FlowDialog
                :open="dialogOpenAtendimento"
                :flow="selectedFlowAtendimento"
                flow-type="atendimento"
                @update:open="handleDialogOpenChangeAtendimento"
                @save="handleSaveAtendimento"
              />

              <AlertDialog :open="deleteDialogOpenAtendimento" @update:open="setDeleteDialogOpenAtendimento">
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o fluxo <strong>{{ flowToDeleteAtendimento?.nome }}</strong>?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel @click="setDeleteDialogOpenAtendimento(false)">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      @click="confirmDeleteAtendimento"
                      class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>

            <!-- Tab Content: Atividades -->
            <TabsContent value="atividades" class="mt-6">
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold">Fluxos de Atividades</h2>
                  <p class="text-sm text-muted-foreground mt-1">
                    Gerencie os fluxos de atividades automatizadas
                  </p>
                </div>
                <Button @click="handleCreateAtividades">
                  <Plus class="mr-2 h-4 w-4" />
                  Novo Fluxo
                </Button>
              </div>

              <FlowsTable
                :flows="flowsAtividades"
                :loading="loadingAtividades"
                @edit="handleEditAtividades"
                @delete="handleDeleteAtividades"
                @create="handleCreateAtividades"
                @row-click="handleEditAtividades"
              />

              <FlowDialog
                :open="dialogOpenAtividades"
                :flow="selectedFlowAtividades"
                flow-type="atividades"
                @update:open="handleDialogOpenChangeAtividades"
                @save="handleSaveAtividades"
              />

              <AlertDialog :open="deleteDialogOpenAtividades" @update:open="setDeleteDialogOpenAtividades">
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o fluxo <strong>{{ flowToDeleteAtividades?.nome }}</strong>?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel @click="setDeleteDialogOpenAtividades(false)">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      @click="confirmDeleteAtividades"
                      class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </ScrollArea>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, BotIcon, CheckCircle2 } from 'lucide-vue-next';
import AppLayout from '@/components/layout/AppLayout.vue';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import FlowsTable from '@/components/flows/FlowsTable.vue';
import FlowDialog from '@/components/flows/FlowDialog.vue';
import { MOCK_FLOWS_ATENDIMENTO, MOCK_FLOWS_ATIVIDADES, type Flow } from '@/mocks/data/flows';
import { useToast } from '@/composables/useToast';
import { generateFlowId } from '@/utils/idGenerator';

const toast = useToast();
const router = useRouter();
const activeTab = ref('atendimento');

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
  loadFlowsAtendimento();
  loadFlowsAtividades();
});

// Atendimento functions
function loadFlowsAtendimento() {
  loadingAtendimento.value = true;
  setTimeout(() => {
    flowsAtendimento.value = [...MOCK_FLOWS_ATENDIMENTO];
    loadingAtendimento.value = false;
  }, 500);
}

function handleCreateAtendimento() {
  router.push('/fluxos/novo');
}

function handleEditAtendimento(flow: Flow) {
  router.push(`/fluxos/${flow.id}`);
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
    router.push(`/fluxos/${newFlow.id}`);
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
    flowsAtividades.value = [...MOCK_FLOWS_ATIVIDADES];
    loadingAtividades.value = false;
  }, 500);
}

function handleCreateAtividades() {
  router.push('/fluxos-atividades/novo');
}

function handleEditAtividades(flow: Flow) {
  router.push(`/fluxos-atividades/${flow.id}`);
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
    // TODO: Implementar navegação para o flow builder
    // router.push(`/flows/atividades/${newFlow.id}`);
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

