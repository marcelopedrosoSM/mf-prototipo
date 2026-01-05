<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Adicionar Nota Interna</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <Textarea
          v-model="noteContent"
          placeholder="Digite sua nota aqui..."
          class="min-h-[120px]"
          auto-focus
        />
        <p class="text-xs text-muted-foreground">
          💡 Notas internas não são visíveis para o cliente
        </p>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleCancel">Cancelar</Button>
        <Button @click="handleSave" :disabled="!noteContent.trim()">Salvar Nota</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  conversationId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'save': [content: string];
}>();

const isOpen = ref(props.open);
const noteContent = ref('');

watch(() => props.open, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    noteContent.value = '';
  }
});

watch(isOpen, (newVal) => {
  emit('update:open', newVal);
});

function handleCancel() {
  isOpen.value = false;
  noteContent.value = '';
}

function handleSave() {
  if (noteContent.value.trim()) {
    emit('save', noteContent.value.trim());
    isOpen.value = false;
    noteContent.value = '';
  }
}
</script>
