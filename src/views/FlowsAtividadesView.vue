<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Fluxos de Atividades</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Gerencie os fluxos de atividades automatizadas
            </p>
          </div>
          <Button @click="handleCreate">
            <Plus class="mr-2 h-4 w-4" />
            Novo Fluxo
          </Button>
        </div>

        <!-- Table -->
        <FlowsTable
          :flows="flows"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @create="handleCreate"
        />

        <!-- Create/Edit Dialog -->
        <FlowDialog
          :open="dialogOpen"
          :flow="selectedFlow"
          flow-type="atividades"
          @update:open="handleDialogOpenChange"
          @save="handleSave"
        />

        <!-- Delete Confirmation Dialog -->
        <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o fluxo <strong>{{ flowToDelete?.nome }}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel @click="setDeleteDialogOpen(false)">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                @click="confirmDelete"
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { MOCK_FLOWS_ATIVIDADES, type Flow } from '@/mocks/data/flows';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const flows = ref<Flow[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const selectedFlow = ref<Flow | null>(null);
const deleteDialogOpen = ref(false);
const flowToDelete = ref<Flow | null>(null);

onMounted(() => {
  loadFlows();
});

function loadFlows() {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    flows.value = [...MOCK_FLOWS_ATIVIDADES];
    loading.value = false;
  }, 500);
}

function handleCreate() {
  selectedFlow.value = null;
  dialogOpen.value = true;
}

function handleEdit(flow: Flow) {
  selectedFlow.value = { ...flow };
  dialogOpen.value = true;
}

function handleDelete(flow: Flow) {
  flowToDelete.value = flow;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (flowToDelete.value) {
    flows.value = flows.value.filter(f => f.id !== flowToDelete.value!.id);
    toast.success('Fluxo excluído', `${flowToDelete.value.nome} foi removido com sucesso.`);
    flowToDelete.value = null;
  }
  deleteDialogOpen.value = false;
}

function setDeleteDialogOpen(open: boolean) {
  deleteDialogOpen.value = open;
  if (!open) {
    flowToDelete.value = null;
  }
}

function handleSave(data: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>) {
  if (selectedFlow.value?.id) {
    // Update
    const index = flows.value.findIndex(f => f.id === selectedFlow.value!.id);
    if (index !== -1) {
      flows.value[index] = {
        ...data,
        id: selectedFlow.value.id,
        createdAt: selectedFlow.value.createdAt,
        updatedAt: new Date().toISOString(),
      };
      toast.success('Fluxo atualizado', `${data.nome} foi atualizado com sucesso.`);
    }
  } else {
    // Create
    const newFlow: Flow = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    flows.value.push(newFlow);
    toast.success('Fluxo criado', `${data.nome} foi criado com sucesso.`);
  }
  dialogOpen.value = false;
  selectedFlow.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedFlow.value = null;
  }
}
</script>

