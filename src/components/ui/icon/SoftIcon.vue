<template>
  <div 
    class="flex items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 flex-shrink-0 transition-colors"
    :class="props.class"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>
