<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from "reka-ui"
import { cn } from '@/utils'

interface Props {
  class?: string
  checked?: boolean
  defaultChecked?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

// Handler para mudanças
const handleCheckedChange = (value: boolean) => {
  emit('update:checked', value)
}
</script>

<template>
  <SwitchRoot
    :model-value="props.checked"
    :default-value="props.defaultChecked"
    @update:model-value="handleCheckedChange"
    :class="cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      props.class,
    )"
  >
    <SwitchThumb
      :class="cn('pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5')"
    >
      <slot name="thumb" />
    </SwitchThumb>
  </SwitchRoot>
</template>
