<script setup lang="ts">
import type { MenubarTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { MenubarTrigger, useForwardProps } from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<MenubarTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium text-popover-foreground outline-none transition-colors hover:bg-[hsl(var(--interactive-hover-bg))] hover:text-[hsl(var(--interactive-hover-text))] focus:bg-[hsl(var(--interactive-hover-bg))] focus:text-[hsl(var(--interactive-hover-text))] data-[state=open]:bg-[hsl(var(--interactive-hover-bg))] data-[state=open]:text-[hsl(var(--interactive-hover-text))]',
        props.class,
      )
    "
  >
    <slot />
  </MenubarTrigger>
</template>
