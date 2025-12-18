<template>
  <ToastDescriptionPrimitive :class="cn('text-sm opacity-90', props.class)">
    <slot />
  </ToastDescriptionPrimitive>
</template>

<script setup lang="ts">
import { ToastDescription as ToastDescriptionPrimitive } from 'reka-ui'
import { cn } from '@/utils'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})
</script>
