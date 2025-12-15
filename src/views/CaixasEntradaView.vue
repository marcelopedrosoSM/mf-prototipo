<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Caixas de Entrada</h1>
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
                Gerencie as caixas de entrada do WhatsApp
              </p>
            </div>
            <Button @click="handleCreate">
              <Plus class="mr-2 h-4 w-4" />
              Cadastrar caixa de entrada
            </Button>
          </div>

          <!-- Table -->
          <CaixasTable
            :caixas="caixas"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="handleCreate"
          />

          <!-- Create/Edit Dialog -->
          <CaixaEntradaDialog
            :open="dialogOpen"
            :caixa="selectedCaixa"
            @open-change="handleDialogOpenChange"
            @save="handleSave"
          />

          <!-- Delete Confirmation Dialog -->
          <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a caixa de entrada <strong>{{ itemToDelete?.nome }}</strong>?
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
                  Caixas de Entrada
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  As <strong>Caixas de Entrada</strong> são os canais de comunicação do WhatsApp conectados à sua conta.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Tipos de Caixas</h4>
                  <p class="text-sm text-muted-foreground">
                    Você pode configurar caixas oficiais (WhatsApp Business API) ou não oficiais (Baileys). As caixas oficiais requerem configurações adicionais como chave da API e IDs da conta de negócios.
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
import CaixasTable from '@/components/settings/CaixasTable.vue';
import CaixaEntradaDialog from '@/components/settings/CaixaEntradaDialog.vue';
import {
  getCaixasEntrada,
  addCaixaEntrada,
  updateCaixaEntrada,
  deleteCaixaEntrada,
} from '@/mocks/data/caixas-entrada';
import { useToast } from '@/composables/useToast';
import type { CaixaEntrada } from '@/types/caixas-entrada';
import type { CaixaEntradaFormData } from '@/schemas/caixas-entrada';

const toast = useToast();
const caixas = ref<CaixaEntrada[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const selectedCaixa = ref<CaixaEntrada | null>(null);
const deleteDialogOpen = ref(false);
const itemToDelete = ref<CaixaEntrada | null>(null);
const openHelpDialog = ref(false);

onMounted(() => {
  loadCaixas();
});

function loadCaixas() {
  loading.value = true;
  setTimeout(() => {
    caixas.value = [...getCaixasEntrada()];
    loading.value = false;
  }, 500);
}

function handleCreate() {
  selectedCaixa.value = null;
  dialogOpen.value = true;
}

function handleEdit(caixa: CaixaEntrada) {
  selectedCaixa.value = { ...caixa };
  dialogOpen.value = true;
}

function handleDelete(caixa: CaixaEntrada) {
  itemToDelete.value = caixa;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    deleteCaixaEntrada(itemToDelete.value.id);
    caixas.value = caixas.value.filter(
      (caixa) => caixa.id !== itemToDelete.value!.id
    );
    toast.success('Caixa excluída', `${itemToDelete.value.nome} foi removida com sucesso.`);
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

function handleSave(data: CaixaEntradaFormData & { tipo: 'oficial' | 'nao-oficial' }) {
  if (selectedCaixa.value?.id) {
    // Update - apenas nome pode ser editado
    const updated = updateCaixaEntrada(selectedCaixa.value.id, {
      nome: data.name,
    });
    if (updated) {
      const index = caixas.value.findIndex(
        (caixa) => caixa.id === selectedCaixa.value!.id
      );
      if (index !== -1) {
        caixas.value[index] = updated;
        toast.success('Caixa atualizada', `${data.name} foi atualizada com sucesso.`);
      }
    }
  } else {
    // Create
    const newCaixa = addCaixaEntrada({
      nome: data.name,
      tipo: data.tipo,
      phoneNumber: data.phoneNumber,
      phoneNumberId: data.phoneNumberId,
      apiKey: data.apiKey,
      businessAccountId: data.businessAccountId,
    });
    caixas.value.push(newCaixa);
    toast.success('Caixa criada', `${data.name} foi criada com sucesso.`);
  }
  dialogOpen.value = false;
  selectedCaixa.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedCaixa.value = null;
  }
}
</script>

