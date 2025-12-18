<template>
  <ToastViewportPrimitive
    :class="cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none',
      props.class
    )"
  />
</template>

<script setup lang="ts">
import { ToastViewport as ToastViewportPrimitive } from 'reka-ui'
import { cn } from '@/utils'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})
</script>
