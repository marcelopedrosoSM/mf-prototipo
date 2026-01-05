<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Times</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="openHelpDialog = true"
                >
                  <HelpCircle class="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <p class="text-sm text-muted-foreground mt-1">
                Gerencie os times da sua organização
              </p>
            </div>
            <Button @click="handleCreate">
              <Plus class="mr-2 h-4 w-4" />
              Novo Time
            </Button>
          </div>

          <!-- Table -->
          <TimesTable
            :times="times"
            :agentes="agents"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="handleCreate"
          />

          <!-- Create/Edit Dialog -->
          <TimeDialog
            :open="dialogOpen"
            :time="selectedTime"
            :agentes="agents"
            @open-change="handleDialogOpenChange"
            @save="handleSave"
          />

          <!-- Delete Confirmation Dialog -->
          <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o time <strong>{{ itemToDelete?.nome }}</strong>?
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

          <!-- Help Dialog -->
          <Dialog :open="openHelpDialog" @update:open="openHelpDialog = $event">
            <DialogContent class="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                  <Info class="h-5 w-5 text-primary" />
                  Times
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  Os <strong>Times</strong> permitem que você organize seus agentes em grupos para facilitar o gerenciamento e distribuição de trabalho.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Criar Times</h4>
                  <p class="text-sm text-muted-foreground">
                    Você pode criar times e atribuir agentes a eles. Um agente pode pertencer a múltiplos times, permitindo flexibilidade na organização.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button @click="openHelpDialog = false">Entendi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, HelpCircle, Info } from 'lucide-vue-next';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TimesTable from '@/components/settings/TimesTable.vue';
import TimeDialog from '@/components/settings/TimeDialog.vue';
import { useToast } from '@/composables/useToast';
import { useTeamsStore } from '@/stores/teams';
import { useAgentsStore } from '@/stores/agents';
import type { Time } from '@/types/times';
import type { TimeFormData } from '@/schemas/times';

const toast = useToast();
const teamsStore = useTeamsStore();
const agentsStore = useAgentsStore();

const times = computed(() => teamsStore.allTeams);
const agents = computed(() => agentsStore.allAgents);
const loading = ref(false);

const dialogOpen = ref(false);
const selectedTime = ref<Time | null>(null);
const deleteDialogOpen = ref(false);
const itemToDelete = ref<Time | null>(null);
const openHelpDialog = ref(false);

onMounted(() => {
  loading.value = true;
  teamsStore.initialize();
  agentsStore.initialize();
  // Simulate loading delay for UX matching previous behavior
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

function handleCreate() {
  selectedTime.value = null;
  dialogOpen.value = true;
}

function handleEdit(time: Time) {
  selectedTime.value = { ...time };
  dialogOpen.value = true;
}

function handleDelete(time: Time) {
  itemToDelete.value = time;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    const success = teamsStore.removeTeam(itemToDelete.value.id);
    if (success) {
      toast.success('Time excluído', `${itemToDelete.value.nome} foi removido com sucesso.`);
    } else {
      toast.error('Erro', 'Não foi possível excluir o time.');
    }
    itemToDelete.value = null;
  }
  deleteDialogOpen.value = false;
}

function setDeleteDialogOpen(open: boolean) {
  deleteDialogOpen.value = open;
  if (!open) {
    itemToDelete.value = null;
  }
}

function handleSave(data: TimeFormData) {
  if (selectedTime.value?.id) {
    // Update
    teamsStore.updateTeam(selectedTime.value.id, {
      nome: data.name,
      users: data.users,
    });
    toast.success('Time atualizado', `${data.name} foi atualizado com sucesso.`);
  } else {
    // Create
    teamsStore.createTeam({
      nome: data.name,
      users: data.users,
    });
    toast.success('Time criado', `${data.name} foi criado com sucesso.`);
  }
  dialogOpen.value = false;
  selectedTime.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedTime.value = null;
  }
}
</script>

