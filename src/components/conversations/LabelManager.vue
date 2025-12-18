<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle class="flex items-center gap-2">
          <Tag class="h-5 w-5" />
          Gerenciar Etiquetas
        </DialogTitle>
        <DialogDescription>
          Crie, edite ou exclua etiquetas para organizar suas conversas
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-hidden flex flex-col">
        <!-- Busca -->
        <div class="px-6 pb-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Pesquisar..."
              class="pl-9"
            />
            <Button
              v-if="searchQuery"
              variant="ghost"
              size="icon"
              class="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              @click="searchQuery = ''"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Lista de Etiquetas -->
        <ScrollArea class="flex-1 min-h-0">
          <div class="px-6 pb-4">
          <div v-if="filteredLabels.length === 0" class="flex flex-col items-center justify-center py-12">
            <Tag class="h-12 w-12 text-muted-foreground mb-4" />
            <p class="text-sm text-muted-foreground">
              {{ searchQuery ? 'Nenhuma etiqueta encontrada' : 'Nenhuma etiqueta cadastrada' }}
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="label in filteredLabels"
              :key="label.id"
              class="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
              :style="selectedLabelId === label.id ? {
                backgroundColor: `${label.color}10`,
                borderColor: label.color,
              } : {}"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  class="h-4 w-4 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: label.color }"
                />
                <div
                  class="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                  :style="{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    border: `1px solid ${label.color}40`,
                  }"
                >
                  {{ label.name }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">
                    {{ label.name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ label.color }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="handleEdit(label)">
                      <Pencil class="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="text-destructive focus:text-destructive"
                      @click="handleDelete(label)"
                    >
                      <Trash2 class="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          </div>
        </ScrollArea>
      </div>

      <DialogFooter class="px-6 pb-6 pt-4 border-t border-border">
        <Button variant="outline" @click="handleOpenChange(false)">
          Fechar
        </Button>
        <Button @click="handleCreate">
          <Plus class="h-4 w-4 mr-2" />
          Nova Etiqueta
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Dialog de Edição/Criação -->
  <LabelDialog
    :open="editDialogOpen"
    :label="editingLabel"
    :existing-labels="labels"
    @open-change="editDialogOpen = $event"
    @saved="handleLabelSaved"
  />

  <!-- Dialog de Confirmação de Exclusão -->
  <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir Etiqueta</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir a etiqueta "{{ deletingLabel?.name }}"? Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="deleteDialogOpen = false">
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="confirmDelete"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Tag, Search, X, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import LabelDialog from './LabelDialog.vue';
import { getLabels, deleteLabel, searchLabels, type Label } from '@/mocks/data/labels';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'open-change': [open: boolean];
  'label-updated': [];
}>();

const labels = ref<Label[]>(getLabels());
const searchQuery = ref('');
const selectedLabelId = ref<string | null>(null);
const editDialogOpen = ref(false);
const editingLabel = ref<Label | null>(null);
const deleteDialogOpen = ref(false);
const deletingLabel = ref<Label | null>(null);

const filteredLabels = computed(() => {
  if (!searchQuery.value.trim()) {
    return labels.value;
  }
  return searchLabels(searchQuery.value);
});

// Recarregar labels quando o dialog abrir
watch(() => props.open, (open) => {
  if (open) {
    labels.value = getLabels();
    searchQuery.value = '';
    selectedLabelId.value = null;
  }
});

function handleOpenChange(open: boolean) {
  if (!open) {
    searchQuery.value = '';
    selectedLabelId.value = null;
  }
  emit('open-change', open);
}

function handleCreate() {
  editingLabel.value = null;
  editDialogOpen.value = true;
}

function handleEdit(label: Label) {
  editingLabel.value = label;
  selectedLabelId.value = label.id;
  editDialogOpen.value = true;
}

function handleDelete(label: Label) {
  deletingLabel.value = label;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (!deletingLabel.value) return;

  try {
    deleteLabel(deletingLabel.value.id);
    labels.value = getLabels();
    deleteDialogOpen.value = false;
    deletingLabel.value = null;
    emit('label-updated');
  } catch (error) {
    console.error('Erro ao excluir etiqueta:', error);
  }
}

function handleLabelSaved() {
  labels.value = getLabels();
  editingLabel.value = null;
  selectedLabelId.value = null;
  emit('label-updated');
}
</script>

