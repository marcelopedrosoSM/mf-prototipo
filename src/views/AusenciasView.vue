<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-semibold">Ausências</h1>
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
              Configure períodos de ausência do atendimento
            </p>
          </div>
          <Button @click="handleCreate">
            <Plus class="mr-2 h-4 w-4" />
            Nova Ausência
          </Button>
        </div>

        <!-- Table -->
        <HolidaysAndInactivitiesTable
          :holidays-and-inactivities="holidaysAndInactivities"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @create="handleCreate"
        />

        <!-- Create/Edit Dialog -->
        <HolidayAndInactivityDialog
          :open="dialogOpen"
          :item="selectedItem"
          @update:open="handleDialogOpenChange"
          @save="handleSave"
        />

        <!-- Delete Confirmation Dialog -->
        <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{{ itemToDelete?.name }}</strong>?
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
                Ausências
              </DialogTitle>
            </DialogHeader>
            <div class="space-y-4">
              <p class="text-sm text-muted-foreground">
                As <strong>Ausências</strong> permitem que você configure períodos em que não haverá atendimento, seja por feriados, férias ou qualquer outro motivo de indisponibilidade.
              </p>
              
              <div>
                <h4 class="text-sm font-semibold mb-2">Feriados</h4>
                <p class="text-sm text-muted-foreground">
                  Configure feriados nacionais, regionais ou específicos da sua empresa. Durante esses períodos, o sistema pode ser configurado para não enviar mensagens automáticas ou para exibir mensagens informativas aos contatos.
                </p>
              </div>

              <div>
                <h4 class="text-sm font-semibold mb-2">Inatividades</h4>
                <p class="text-sm text-muted-foreground">
                  Defina períodos de inatividade planejada, como manutenções programadas, férias coletivas ou outros eventos que exijam que o sistema fique temporariamente indisponível.
                </p>
              </div>

              <div>
                <h4 class="text-sm font-semibold mb-2">Periodicidade</h4>
                <p class="text-sm text-muted-foreground">
                  Você pode configurar ausências como eventos únicos ou recorrentes (anual), facilitando o gerenciamento de períodos que se repetem todos os anos.
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import HolidaysAndInactivitiesTable from '@/components/settings/HolidaysAndInactivitiesTable.vue';
import HolidayAndInactivityDialog from '@/components/settings/HolidayAndInactivityDialog.vue';
import {
  getHolidaysAndInactivities,
  addHolidayAndInactivity,
  updateHolidayAndInactivity,
  deleteHolidayAndInactivity,
  type HolidayAndInactivity,
} from '@/mocks/data/holidays-and-inactivities';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const holidaysAndInactivities = ref<HolidayAndInactivity[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const selectedItem = ref<HolidayAndInactivity | null>(null);
const deleteDialogOpen = ref(false);
const itemToDelete = ref<HolidayAndInactivity | null>(null);
const openHelpDialog = ref(false);

onMounted(() => {
  loadHolidaysAndInactivities();
});

function loadHolidaysAndInactivities() {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    holidaysAndInactivities.value = [...getHolidaysAndInactivities()];
    loading.value = false;
  }, 500);
}

function handleCreate() {
  selectedItem.value = null;
  dialogOpen.value = true;
}

function handleEdit(item: HolidayAndInactivity) {
  selectedItem.value = { ...item };
  dialogOpen.value = true;
}

function handleDelete(item: HolidayAndInactivity) {
  itemToDelete.value = item;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    deleteHolidayAndInactivity(itemToDelete.value.id);
    holidaysAndInactivities.value = holidaysAndInactivities.value.filter(
      (item) => item.id !== itemToDelete.value!.id
    );
    toast.success('Ausência excluída', `${itemToDelete.value.name} foi removida com sucesso.`);
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

function handleSave(data: Omit<HolidayAndInactivity, 'id' | 'createdAt'>) {
  if (selectedItem.value?.id) {
    // Update
    const updated = updateHolidayAndInactivity(selectedItem.value.id, data);
    if (updated) {
      const index = holidaysAndInactivities.value.findIndex(
        (item) => item.id === selectedItem.value!.id
      );
      if (index !== -1) {
        holidaysAndInactivities.value[index] = updated;
        toast.success('Ausência atualizada', `${data.name} foi atualizada com sucesso.`);
      }
    }
  } else {
    // Create
    const newItem = addHolidayAndInactivity(data);
    holidaysAndInactivities.value.push(newItem);
    toast.success('Ausência criada', `${data.name} foi criada com sucesso.`);
  }
  dialogOpen.value = false;
  selectedItem.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedItem.value = null;
  }
}
</script>
