<script setup lang="ts">
import type { RadioGroupRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { RadioGroupRoot } from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes["class"] }>()
const model = defineModel<string>()
</script>

<template>
  <RadioGroupRoot
    v-bind="props"
    v-model="model"
    :class="cn('grid gap-2', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
