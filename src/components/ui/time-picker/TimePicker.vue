<script setup lang="ts">
import { Input } from '@/components/ui/input'

interface Props {
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'HH:MM'
})

// 🚀 defineModel simplifica toda a lógica de v-model e sincronização
const model = defineModel<string>({
  default: '08:00'
})

// Validar formato HH:MM
const isValidTime = (time: string): boolean => {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
  return regex.test(time)
}

// Formatar para HH:MM
const formatTime = (value: string): string => {
  // Remover caracteres não numéricos exceto ':'
  const cleaned = value.replace(/[^\d:]/g, '')
  
  // Se só tem números, adicionar ':' após 2 dígitos
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
  
  // Auto-completar formato
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
    // Restaurar valor anterior se inválido
    target.value = model.value || '08:00'
  }
}
</script>

<template>
  <Input
    type="text"
    v-model="model"
    :disabled="disabled"
    :placeholder="placeholder"
    class="w-24 text-center"
    maxlength="5"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>
