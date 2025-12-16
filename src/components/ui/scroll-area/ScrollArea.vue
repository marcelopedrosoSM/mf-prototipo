<script setup lang="ts">
import { computed } from 'vue'
import type { ScrollAreaRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "reka-ui"
import { cn } from '@/utils'
import ScrollBar from "./ScrollBar.vue"

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

// Detectar se tem max-height na classe
const hasMaxHeight = computed(() => {
  const classStr = props.class?.toString() || ''
  return /max-h-/.test(classStr)
})

// Extrair a classe max-h-* para aplicar no root também
const maxHeightClass = computed(() => {
  if (!hasMaxHeight.value) return ''
  const classStr = props.class?.toString() || ''
  const match = classStr.match(/max-h-\[?[\w-]+\]?/)
  return match ? match[0] : ''
})

const rootClass = computed(() => {
  return cn(
    'relative overflow-hidden',
    hasMaxHeight.value ? maxHeightClass.value : '',
    props.class
  )
})

const viewportClass = computed(() => {
  return hasMaxHeight.value 
    ? 'h-full w-full rounded-[inherit]' 
    : 'h-full w-full rounded-[inherit]'
})
</script>

<template>
  <ScrollAreaRoot v-bind="delegatedProps" :class="rootClass">
    <ScrollAreaViewport :class="viewportClass">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
