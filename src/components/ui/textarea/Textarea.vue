<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@/utils'

const props = defineProps<{
  class?: HTMLAttributes["class"]
  defaultValue?: string | number
}>()

// 🚀 defineModel simplifica toda a lógica de v-model e sincronização
const model = defineModel<string | number>({
  default: '',
})
</script>

<template>
  <textarea 
    v-model="model" 
    :class="cn('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none', props.class)" 
  />
</template>
