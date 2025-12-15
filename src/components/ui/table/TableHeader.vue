<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@/utils'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <thead :class="cn('[&_tr]:border-b [&_tr]:bg-muted [&_tr]:border-muted-foreground/20 dark:[&_tr]:border-muted-foreground/30', props.class)">
    <slot />
  </thead>
</template>
