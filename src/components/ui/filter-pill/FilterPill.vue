<template>
  <button
    type="button"
    :class="mergedClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  active?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'default' | 'lg'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  size: 'xs',
})

const emit = defineEmits<{
  'update:active': [value: boolean]
  'click': []
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-6 px-2.5 text-xs'
    case 'sm': return 'h-8 px-3 text-xs'
    case 'lg': return 'h-10 px-4 text-sm'
    default: return 'h-9 px-3 text-sm'
  }
})

const stateClasses = computed(() => {
  if (props.active) {
    return 'bg-primary text-primary-foreground border border-primary hover:bg-primary/90'
  }
  return 'bg-muted/50 text-foreground border border-input hover:bg-muted'
})

const mergedClasses = computed(() => {
  return cn(
    'inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    sizeClasses.value,
    stateClasses.value,
    props.class
  )
})

const handleClick = () => {
  emit('update:active', !props.active)
  emit('click')
}
</script>
