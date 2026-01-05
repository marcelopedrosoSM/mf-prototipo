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
          :agentes="agents"
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
          :existingAgentes="agents"
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
import { ref, onMounted, computed } from 'vue';
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
import type { Agente } from '@/mocks/data/agentes';
import { useToast } from '@/composables/useToast';
import { useAgentsStore } from '@/stores/agents';
import { useTeamsStore } from '@/stores/teams';

const toast = useToast();
const agentsStore = useAgentsStore();
const teamsStore = useTeamsStore();

// Use store state
const agents = computed(() => agentsStore.allAgents);
const times = computed(() => teamsStore.allTeams);
const loading = computed(() => agentsStore.loading);

const dialogOpen = ref(false);
const selectedAgente = ref<Agente | null>(null);
const deleteDialogOpen = ref(false);
const agenteToDelete = ref<Agente | null>(null);

onMounted(() => {
  // Initialize stores if not already
  agentsStore.initialize();
  teamsStore.initialize();
});

function handleCreate() {
  selectedAgente.value = null;
  dialogOpen.value = true;
}

function handleEdit(agente: Agente) {
  // Criar uma cópia profunda
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
    const success = agentsStore.removeAgent(agenteToDelete.value.id);
    if (success) {
      toast.success('Agente excluído', `${agenteToDelete.value.nome} foi removido com sucesso.`);
    } else {
      toast.error('Erro', 'Não foi possível excluir o agente.');
    }
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
    agentsStore.updateAgent(selectedAgente.value.id, data);
    toast.success('Agente atualizado', `${data.nome} foi atualizado com sucesso.`);
  } else {
    // Create
    agentsStore.createAgent(data);
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

