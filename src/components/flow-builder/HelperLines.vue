<template>
  <svg
    class="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible z-50"
  >
    <line
      v-if="horizontal !== undefined"
      :x1="0"
      :y1="projectedHorizontal"
      :x2="'100%'"
      :y2="projectedHorizontal"
      stroke="hsl(var(--primary))"
      stroke-width="1"
      stroke-dasharray="4 4"
    />
    <line
      v-if="vertical !== undefined"
      :x1="projectedVertical"
      :y1="0"
      :x2="projectedVertical"
      :y2="'100%'"
      stroke="hsl(var(--primary))"
      stroke-width="1"
      stroke-dasharray="4 4"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  horizontal?: number | undefined
  vertical?: number | undefined
}>()

const { viewport } = useVueFlow()

const projectedHorizontal = computed(() => {
  if (props.horizontal === undefined) return 0
  return props.horizontal * viewport.value.zoom + viewport.value.y
})

const projectedVertical = computed(() => {
  if (props.vertical === undefined) return 0
  return props.vertical * viewport.value.zoom + viewport.value.x
})
</script>
