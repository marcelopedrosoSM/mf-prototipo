<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@/utils'

const props = defineProps<{
  defaultValue?: string | number
  class?: HTMLAttributes["class"]
}>()

// 🚀 defineModel simplifica toda a lógica de v-model e sincronização
const model = defineModel<string | number>({
  default: '',
})
</script>

<template>
  <input 
    v-model="model" 
    :class="cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', props.class)"
  >
</template>
