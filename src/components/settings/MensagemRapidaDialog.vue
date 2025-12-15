<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ mensagem ? 'Editar Mensagem Rápida' : 'Nova Mensagem Rápida' }}
        </DialogTitle>
        <DialogDescription>
          {{ mensagem ? 'Atualize a mensagem rápida' : 'Preencha os dados para criar uma nova mensagem rápida' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div class="px-6 py-4 space-y-4">
          <!-- Título -->
          <div class="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              v-model="formData.title"
              placeholder="Digite o título para identificar a mensagem rápida"
              :class="errors.title ? 'border-destructive' : ''"
              maxlength="160"
            />
            <div class="flex justify-between items-center">
              <p v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</p>
              <p v-else class="text-sm text-muted-foreground">
                {{ formData.title.length }}/160 caracteres
              </p>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="space-y-2">
            <Label htmlFor="content">Mensagem *</Label>
            <Textarea
              id="content"
              v-model="formData.content"
              placeholder="Digite sua mensagem aqui..."
              :class="errors.content ? 'border-destructive' : ''"
              :rows="10"
              maxlength="2000"
            />
            <div class="flex justify-between items-center">
              <p v-if="errors.content" class="text-sm text-destructive">{{ errors.content }}</p>
              <p v-else class="text-sm text-muted-foreground">
                {{ formData.content.length }}/2000 caracteres
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button variant="secondary" @click="handleOpenChange(false)">
          Cancelar
        </Button>
        <Button @click="handleSave" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ mensagem ? 'Salvar Alterações' : 'Criar Mensagem Rápida' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { mensagemRapidaSchema, type MensagemRapidaFormData } from '@/schemas/mensagens-rapidas';
import type { MensagemRapida } from '@/types/mensagens-rapidas';

interface Props {
  open: boolean;
  mensagem?: MensagemRapida | null;
}

const props = withDefaults(defineProps<Props>(), {
  mensagem: null,
});

const emit = defineEmits<{
  'open-change': [open: boolean];
  save: [data: MensagemRapidaFormData];
}>();

const formData = ref<MensagemRapidaFormData>({
  title: '',
  content: '',
});

const errors = ref<Record<string, string>>({});
const isSaving = ref(false);

watch(() => props.mensagem, (newMensagem) => {
  if (newMensagem) {
    formData.value = {
      title: newMensagem.title || '',
      content: newMensagem.content || '',
    };
  } else {
    formData.value = {
      title: '',
      content: '',
    };
  }
  errors.value = {};
}, { immediate: true, deep: true });

function validate(): boolean {
  errors.value = {};
  
  const result = mensagemRapidaSchema.safeParse(formData.value);
  
  if (!result.success) {
    result.error.errors.forEach((error) => {
      if (error.path[0]) {
        errors.value[error.path[0] as string] = error.message;
      }
    });
    return false;
  }
  
  return true;
}

function handleSave() {
  if (!validate()) {
    return;
  }

  isSaving.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('save', {
      ...formData.value,
    });
    isSaving.value = false;
  }, 500);
}

function handleOpenChange(open: boolean) {
  emit('open-change', open);
}
</script>


