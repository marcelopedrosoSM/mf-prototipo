<template>
  <ToastTitlePrimitive :class="cn('text-sm font-semibold', props.class)">
    <slot />
  </ToastTitlePrimitive>
</template>

<script setup lang="ts">
import { ToastTitle as ToastTitlePrimitive } from 'radix-vue'
import { cn } from '@/utils'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})
</script>
