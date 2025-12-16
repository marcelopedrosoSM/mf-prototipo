<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ label ? 'Editar Etiqueta' : 'Adicionar Etiqueta' }}
        </DialogTitle>
        <DialogDescription>
          {{ label ? 'Atualize as informações da etiqueta' : 'Crie uma nova etiqueta para organizar suas conversas' }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Nome -->
        <div class="space-y-2">
          <Label htmlFor="label-name">Nome *</Label>
          <Input
            id="label-name"
            v-model="formData.name"
            placeholder="Digite o nome da etiqueta"
            :class="errors.name ? 'border-destructive' : ''"
            @keyup.enter="handleSave"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <!-- Cor -->
        <div class="space-y-2">
          <Label>Cor *</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in availableColors"
              :key="color"
              type="button"
              class="h-10 w-10 rounded-md border-2 transition-all"
              :class="formData.color === color ? 'border-foreground scale-110' : 'border-border hover:scale-105'"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
            />
          </div>
          <p v-if="errors.color" class="text-sm text-destructive">{{ errors.color }}</p>
        </div>

        <!-- Preview -->
        <div class="space-y-2">
          <Label>Preview</Label>
          <div class="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/50">
            <div
              class="px-1.5 py-0.5 rounded text-xs font-bold"
              :style="{
                backgroundColor: `${formData.color}20`,
                color: formData.color,
                border: `1px solid ${formData.color}40`,
              }"
            >
              {{ formData.name || 'Nome da etiqueta' }}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">
          Cancelar
        </Button>
        <Button @click="handleSave" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : label ? 'Salvar' : 'Criar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Label as LabelType } from '@/types/conversations';
import { createLabel, updateLabel, type CreateLabelData } from '@/mocks/data/labels';

interface Props {
  open: boolean;
  label?: LabelType | null;
  existingLabels?: LabelType[];
}

const props = withDefaults(defineProps<Props>(), {
  label: null,
  existingLabels: () => [],
});

const emit = defineEmits<{
  'open-change': [open: boolean];
  'saved': [label: LabelType];
}>();

const isSaving = ref(false);
const errors = ref<Record<string, string>>({});

const availableColors = [
  '#FF6B6B', // Vermelho coral
  '#8B5CF6', // Roxo
  '#F97316', // Laranja
  '#EF4444', // Vermelho
  '#6366F1', // Índigo
  '#10B981', // Verde
  '#3B82F6', // Azul
  '#F59E0B', // Amarelo
  '#EC4899', // Rosa
  '#14B8A6', // Ciano
  '#8B5CF6', // Roxo escuro
  '#6366F1', // Índigo escuro
];

const formData = ref<CreateLabelData>({
  name: '',
  color: availableColors[0],
});

// Resetar formulário quando o dialog abrir/fechar ou label mudar
watch([() => props.open, () => props.label], ([open, label]) => {
  if (open) {
    if (label) {
      formData.value = {
        name: label.name,
        color: label.color,
      };
    } else {
      formData.value = {
        name: '',
        color: availableColors[0],
      };
    }
    errors.value = {};
  }
}, { immediate: true });

function validate(): boolean {
  errors.value = {};

  if (!formData.value.name || formData.value.name.trim() === '') {
    errors.value.name = 'Nome é obrigatório';
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Nome deve ter pelo menos 2 caracteres';
  } else {
    // Verificar se já existe uma etiqueta com o mesmo nome (exceto a atual)
    const existing = props.existingLabels.find(
      (l) => l.id !== props.label?.id && l.name.toLowerCase() === formData.value.name.toLowerCase().trim()
    );
    
    if (existing) {
      errors.value.name = 'Já existe uma etiqueta com este nome';
    }
  }

  if (!formData.value.color) {
    errors.value.color = 'Cor é obrigatória';
  }

  return Object.keys(errors.value).length === 0;
}

function handleSave() {
  if (!validate()) {
    return;
  }

  isSaving.value = true;

  // Simular chamada de API
  setTimeout(() => {
    try {
      let savedLabel: LabelType;

      if (props.label) {
        // Editar
        savedLabel = updateLabel(props.label.id, {
          name: formData.value.name,
          color: formData.value.color,
        });
      } else {
        // Criar
        savedLabel = createLabel({
          name: formData.value.name,
          color: formData.value.color,
        });
      }

      emit('saved', savedLabel);
      handleOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        errors.value.name = error.message;
      }
    } finally {
      isSaving.value = false;
    }
  }, 300);
}

function handleCancel() {
  handleOpenChange(false);
}

function handleOpenChange(open: boolean) {
  if (!open) {
    errors.value = {};
  }
  emit('open-change', open);
}
</script>

