<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Mensagens Rápidas</h1>
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
                Gerencie mensagens pré-definidas para agilizar o atendimento
              </p>
            </div>
            <Button @click="handleCreate">
              <Plus class="mr-2 h-4 w-4" />
              Cadastrar mensagem rápida
            </Button>
          </div>

          <!-- Table -->
          <MensagensRapidasTable
            :mensagens="mensagens"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="handleCreate"
          />

          <!-- Create/Edit Dialog -->
          <MensagemRapidaDialog
            :open="dialogOpen"
            :mensagem="selectedMensagem"
            @open-change="handleDialogOpenChange"
            @save="handleSave"
          />

          <!-- Delete Confirmation Dialog -->
          <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a mensagem rápida <strong>{{ itemToDelete?.title }}</strong>?
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
                  Mensagens Rápidas
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  As <strong>Mensagens Rápidas</strong> são templates de mensagens que podem ser usados para agilizar o atendimento aos clientes.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Criar Mensagens</h4>
                  <p class="text-sm text-muted-foreground">
                    Você pode criar mensagens com título e conteúdo. O título deve ter no máximo 160 caracteres e o conteúdo no máximo 2000 caracteres.
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
import { ref, onMounted } from 'vue';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MensagensRapidasTable from '@/components/settings/MensagensRapidasTable.vue';
import MensagemRapidaDialog from '@/components/settings/MensagemRapidaDialog.vue';
import {
  getMensagensRapidas,
  addMensagemRapida,
  updateMensagemRapida,
  deleteMensagemRapida,
} from '@/mocks/data/mensagens-rapidas';
import { useToast } from '@/composables/useToast';
import type { MensagemRapida } from '@/types/mensagens-rapidas';
import type { MensagemRapidaFormData } from '@/schemas/mensagens-rapidas';

const toast = useToast();
const mensagens = ref<MensagemRapida[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const selectedMensagem = ref<MensagemRapida | null>(null);
const deleteDialogOpen = ref(false);
const itemToDelete = ref<MensagemRapida | null>(null);
const openHelpDialog = ref(false);

onMounted(() => {
  loadMensagens();
});

function loadMensagens() {
  loading.value = true;
  setTimeout(() => {
    mensagens.value = [...getMensagensRapidas()];
    loading.value = false;
  }, 500);
}

function handleCreate() {
  selectedMensagem.value = null;
  dialogOpen.value = true;
}

function handleEdit(mensagem: MensagemRapida) {
  selectedMensagem.value = { ...mensagem };
  dialogOpen.value = true;
}

function handleDelete(mensagem: MensagemRapida) {
  itemToDelete.value = mensagem;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    deleteMensagemRapida(itemToDelete.value.id);
    mensagens.value = mensagens.value.filter(
      (mensagem) => mensagem.id !== itemToDelete.value!.id
    );
    toast.success('Mensagem excluída', `${itemToDelete.value.title} foi removida com sucesso.`);
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

function handleSave(data: MensagemRapidaFormData) {
  if (selectedMensagem.value?.id) {
    // Update
    const updated = updateMensagemRapida(selectedMensagem.value.id, data);
    if (updated) {
      const index = mensagens.value.findIndex(
        (mensagem) => mensagem.id === selectedMensagem.value!.id
      );
      if (index !== -1) {
        mensagens.value[index] = updated;
        toast.success('Mensagem atualizada', `${data.title} foi atualizada com sucesso.`);
      }
    }
  } else {
    // Create
    const newMensagem = addMensagemRapida(data);
    mensagens.value.push(newMensagem);
    toast.success('Mensagem criada', `${data.title} foi criada com sucesso.`);
  }
  dialogOpen.value = false;
  selectedMensagem.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedMensagem.value = null;
  }
}
</script>

