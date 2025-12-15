<script setup lang="ts">
import type { ContextMenuSubTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronRight } from "lucide-vue-next"
import {
  ContextMenuSubTrigger,
  useForwardProps,
} from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<ContextMenuSubTriggerProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <ContextMenuSubTrigger
    v-bind="forwardedProps"
    :class="cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none transition-colors hover:bg-[hsl(var(--interactive-hover-bg))] hover:text-[hsl(var(--interactive-hover-text))] focus:bg-[hsl(var(--interactive-hover-bg))] focus:text-[hsl(var(--interactive-hover-text))] data-[state=open]:bg-[hsl(var(--interactive-hover-bg))] data-[state=open]:text-[hsl(var(--interactive-hover-text))]',
      inset && 'pl-8',
      props.class,
    )"
  >
    <slot />
    <ChevronRight class="ml-auto h-4 w-4" />
  </ContextMenuSubTrigger>
</template>
