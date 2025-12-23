<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  disabled?: boolean
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'HH:MM'
})

// 🚀 defineModel simplifica toda a lógica de v-model e sincronização
const model = defineModel<string>({
  default: '08:00'
})

const open = ref(false)

// Gerar horários de 30 em 30 min
const timeOptions = computed(() => {
  const times = []
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0')
    times.push(`${hour}:00`)
    times.push(`${hour}:30`)
  }
  return times
})

// Validar formato HH:MM
const isValidTime = (time: string): boolean => {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
  return regex.test(time)
}

// Formatar para HH:MM
const formatTime = (value: string): string => {
  const cleaned = value.replace(/[^\d:]/g, '')
  
  if (!cleaned.includes(':') && cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`
  }
  
  return cleaned.slice(0, 5)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatTime(target.value)
  target.value = formatted
  
  if (isValidTime(formatted) || formatted === '') {
    model.value = formatted
  }
}

const handleBlur = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value
  
  if (value.length === 1) {
    value = `0${value}:00`
  } else if (value.length === 2 && !value.includes(':')) {
    value = `${value}:00`
  } else if (value.length === 4 && value.includes(':')) {
    value = `${value}0`
  }
  
  if (isValidTime(value)) {
    target.value = value
    model.value = value
  } else {
    target.value = model.value || '08:00'
  }
}

const selectTime = (time: string) => {
  model.value = time
  open.value = false
}
</script>

<template>
  <div class="relative w-full">
    <Input
      type="text"
      v-model="model"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="cn('w-full pr-10 text-center', props.class)"
      maxlength="5"
      @input="handleInput"
      @blur="handleBlur"
    />
    
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="absolute right-0 top-0 h-full px-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
          :disabled="disabled"
        >
          <Clock class="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-48 p-0" align="end">
        <div class="h-[200px] overflow-y-auto p-1">
          <Button
            v-for="time in timeOptions"
            :key="time"
            variant="ghost"
            class="w-full justify-start text-sm font-normal h-8"
            :class="{ 'bg-accent text-accent-foreground': model === time }"
            @click="selectTime(time)"
          >
            {{ time }}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
