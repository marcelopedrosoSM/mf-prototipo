<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <Textarea
    data-slot="input-group-control"
    :class="props.class"
  />
</template>
