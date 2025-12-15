<script setup lang="ts">
import type { MenubarItemEmits, MenubarItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  MenubarItem,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from '@/utils'

const props = defineProps<MenubarItemProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const emits = defineEmits<MenubarItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarItem
    v-bind="forwarded"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none transition-colors hover:bg-[hsl(var(--interactive-hover-bg))] hover:text-[hsl(var(--interactive-hover-text))] focus:bg-[hsl(var(--interactive-hover-bg))] focus:text-[hsl(var(--interactive-hover-text))] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      props.class,
    )"
  >
    <slot />
  </MenubarItem>
</template>
