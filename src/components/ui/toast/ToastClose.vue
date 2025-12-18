<template>
  <ToastClosePrimitive
    :class="cn(
      'absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-100 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      props.class
    )"
  >
    <X class="h-4 w-4" />
  </ToastClosePrimitive>
</template>

<script setup lang="ts">
import { ToastClose as ToastClosePrimitive } from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '@/utils'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})
</script>
