<script setup lang="ts">
import type { ComboboxItemEmits, ComboboxItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxItem, useForwardPropsEmits } from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<ComboboxItemProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ComboboxItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ComboboxItem
    v-bind="forwarded"
    :class="cn('relative flex cursor-default gap-2 select-none justify-between items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none transition-colors hover:bg-[hsl(var(--interactive-hover-bg))] hover:text-[hsl(var(--interactive-hover-text))] data-[highlighted]:bg-[hsl(var(--interactive-hover-bg))] data-[highlighted]:text-[hsl(var(--interactive-hover-text))] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0', props.class)"
  >
    <slot />
  </ComboboxItem>
</template>
