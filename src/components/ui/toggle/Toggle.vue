<script setup lang="ts">
import type { ToggleProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ToggleVariants } from "."
import { Toggle } from "reka-ui"
import { cn } from '@/utils'
import { toggleVariants } from "."

const props = withDefaults(defineProps<ToggleProps & {
  class?: HTMLAttributes["class"]
  variant?: ToggleVariants["variant"]
  size?: ToggleVariants["size"]
}>(), {
  variant: "default",
  size: "default",
  disabled: false,
})

const model = defineModel<boolean>()
</script>

<template>
  <Toggle
    v-slot="slotProps"
    v-bind="props"
    v-model:pressed="model"
    :class="cn(toggleVariants({ variant, size }), props.class)"
  >
    <slot v-bind="slotProps" />
  </Toggle>
</template>
