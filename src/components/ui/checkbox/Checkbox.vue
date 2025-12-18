<script setup lang="ts">
import type { CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Check } from "lucide-vue-next"
import { CheckboxIndicator, CheckboxRoot } from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>()

// 🚀 defineModel para simplificar o estado 'checked'
const model = defineModel<boolean | 'indeterminate'>()
</script>

<template>
  <CheckboxRoot
    v-bind="props"
    v-model:checked="model"
    :class="
      cn('grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
         props.class)"
  >
    <CheckboxIndicator class="grid place-content-center text-current">
      <slot>
        <Check class="h-4 w-4" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
