<script setup lang="ts">
import type { ToggleProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ToggleVariants } from "."
import { Toggle } from "reka-ui"
import { computed, toRef } from "vue"
import { cn } from '@/utils'
import { toggleVariants } from "."

const props = withDefaults(defineProps<ToggleProps & {
  class?: HTMLAttributes["class"]
  variant?: ToggleVariants["variant"]
  size?: ToggleVariants["size"]
  pressed?: boolean
}>(), {
  variant: "default",
  size: "default",
  disabled: false,
  pressed: false,
})

const emit = defineEmits<{
  'update:pressed': [value: boolean]
}>()

// Use the pressed prop directly for styling
const isPressed = toRef(props, 'pressed')

// Compute active classes based on pressed prop
const activeClasses = computed(() => {
  if (props.variant === 'pill' && isPressed.value) {
    return 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
  }
  return ''
})

const handleUpdate = (value: boolean) => {
  emit('update:pressed', value)
}
</script>

<template>
  <Toggle
    v-slot="slotProps"
    :pressed="props.pressed"
    :disabled="props.disabled"
    :class="cn(toggleVariants({ variant, size }), activeClasses, props.class)"
    @update:pressed="handleUpdate"
  >
    <slot v-bind="slotProps" />
  </Toggle>
</template>
