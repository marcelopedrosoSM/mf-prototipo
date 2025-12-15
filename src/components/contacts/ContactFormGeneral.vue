<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-sm font-semibold mb-3">Geral</h3>
      <div class="space-y-2">
        <Label for="name">Nome *</Label>
        <Input
          id="name"
          v-model="name"
          placeholder="Digite o nome do contato"
          :class="errors.name ? 'border-destructive' : ''"
        />
        <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  modelValue: string;
  errors?: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const name = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

