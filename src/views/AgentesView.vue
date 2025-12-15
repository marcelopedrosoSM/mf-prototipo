<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold">Agentes</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Gerencie os agentes da sua conta
            </p>
          </div>
          <Button @click="handleCreate">
            <Plus class="mr-2 h-4 w-4" />
            Novo Agente
          </Button>
        </div>

        <!-- Table -->
        <AgentesTable
          :agentes="agentes"
          :times="times"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @create="handleCreate"
        />

        <!-- Create/Edit Dialog -->
        <AgenteDialog
          :open="dialogOpen"
          :agente="selectedAgente"
          :times="times"
          :existingAgentes="agentes"
          @open-change="handleDialogOpenChange"
          @save="handleSave"
        />

        <!-- Delete Confirmation Dialog -->
        <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o agente <strong>{{ agenteToDelete?.nome }}</strong>?
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
import AgentesTable from '@/components/settings/AgentesTable.vue';
import AgenteDialog from '@/components/settings/AgenteDialog.vue';
import { MOCK_AGENTES, MOCK_TIMES, type Agente, type Time } from '@/mocks/data/agentes';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const agentes = ref<Agente[]>([]);
const times = ref<Time[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const selectedAgente = ref<Agente | null>(null);
const deleteDialogOpen = ref(false);
const agenteToDelete = ref<Agente | null>(null);

onMounted(() => {
  loadAgentes();
  loadTimes();
});

function loadAgentes() {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    agentes.value = [...MOCK_AGENTES];
    loading.value = false;
  }, 500);
}

function loadTimes() {
  times.value = [...MOCK_TIMES];
}

function handleCreate() {
  selectedAgente.value = null;
  dialogOpen.value = true;
}

function handleEdit(agente: Agente) {
  // Criar uma cópia profunda para garantir que timesIds seja um novo array
  selectedAgente.value = {
    ...agente,
    timesIds: agente.timesIds ? [...agente.timesIds] : [],
  };
  dialogOpen.value = true;
}

function handleDelete(agente: Agente) {
  agenteToDelete.value = agente;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (agenteToDelete.value) {
    agentes.value = agentes.value.filter(a => a.id !== agenteToDelete.value!.id);
    toast.success('Agente excluído', `${agenteToDelete.value.nome} foi removido com sucesso.`);
    agenteToDelete.value = null;
  }
  deleteDialogOpen.value = false;
}

function setDeleteDialogOpen(open: boolean) {
  deleteDialogOpen.value = open;
  if (!open) {
    agenteToDelete.value = null;
  }
}

function handleSave(data: Agente) {
  if (selectedAgente.value?.id) {
    // Update
    const index = agentes.value.findIndex(a => a.id === selectedAgente.value!.id);
    if (index !== -1) {
      // Garantir que timesIds seja um novo array
      agentes.value[index] = {
        ...data,
        id: selectedAgente.value.id,
        timesIds: data.timesIds ? [...data.timesIds] : [],
        createdAt: agentes.value[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      toast.success('Agente atualizado', `${data.nome} foi atualizado com sucesso.`);
    }
  } else {
    // Create
    const newAgente: Agente = {
      ...data,
      id: String(Date.now()),
      timesIds: data.timesIds ? [...data.timesIds] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    agentes.value.push(newAgente);
    toast.success('Agente criado', `${data.nome} foi criado com sucesso.`);
  }
  dialogOpen.value = false;
  selectedAgente.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedAgente.value = null;
  }
}
</script>

