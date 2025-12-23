<template>
  <div 
    class="flex items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 flex-shrink-0 transition-colors"
    :class="props.class"
  >
    <span class="font-semibold">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  class?: string;
}

const props = defineProps<Props>();

const initials = computed(() => {
  return props.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});
</script>
