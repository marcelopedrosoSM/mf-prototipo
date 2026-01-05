<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Finalizar Conversa</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <p class="text-sm text-muted-foreground">
          Tem certeza que deseja finalizar esta conversa? Esta ação marcará a conversa como resolvida.
        </p>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleCancel">Cancelar</Button>
        <Button variant="default" @click="handleConfirm">
          <Check class="h-4 w-4 mr-2" />
          Finalizar
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Check } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'confirm': [];
}>();

const isOpen = ref(props.open);

watch(() => props.open, (newVal) => {
  isOpen.value = newVal;
});

watch(isOpen, (newVal) => {
  emit('update:open', newVal);
});

function handleCancel() {
  isOpen.value = false;
}

function handleConfirm() {
  emit('confirm');
  isOpen.value = false;
}
</script>
