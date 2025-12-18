<script setup lang="ts">
import type { ListboxContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ListboxContent, useForwardProps } from "reka-ui"
import { cn } from '@/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps<ListboxContentProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ListboxContent v-bind="forwarded" :class="cn('max-h-[300px] overflow-hidden', props.class)">
    <ScrollArea class="h-[300px] w-full">
      <div role="presentation">
        <slot />
      </div>
    </ScrollArea>
  </ListboxContent>
</template>
