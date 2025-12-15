<template>
  <div class="relative">
    <Input
      :type="showPassword ? 'text' : 'password'"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :class="cn('pr-10', error ? 'border-destructive' : '', $attrs.class)"
      v-bind="$attrs"
    />
    <button
      type="button"
      @click="showPassword = !showPassword"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      tabindex="-1"
    >
      <Eye v-if="!showPassword" class="h-4 w-4" />
      <EyeOff v-else class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { Input } from './input';
import { cn } from '@/utils';

interface Props {
  modelValue?: string;
  error?: string | boolean;
  class?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  error: false,
});

defineEmits<{
  'update:modelValue': [value: string];
}>();

const showPassword = ref(false);
</script>

