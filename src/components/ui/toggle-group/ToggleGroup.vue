<script setup lang="ts">
import type { VariantProps } from "class-variance-authority"
import type { ToggleGroupRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { toggleVariants } from '@/components/ui/toggle'
import { ToggleGroupRoot } from "reka-ui"
import { provide } from "vue"
import { cn } from '@/utils'

type ToggleGroupVariants = VariantProps<typeof toggleVariants>

const props = defineProps<ToggleGroupRootProps & {
  class?: HTMLAttributes["class"]
  variant?: ToggleGroupVariants["variant"]
  size?: ToggleGroupVariants["size"]
}>()

const model = defineModel<string | string[]>()

provide("toggleGroup", {
  variant: props.variant,
  size: props.size,
})
</script>

<template>
  <ToggleGroupRoot 
    v-slot="slotProps" 
    v-bind="props" 
    v-model="model"
    :class="cn('flex items-center justify-center gap-1', props.class)"
  >
    <slot v-bind="slotProps" />
  </ToggleGroupRoot>
</template>
