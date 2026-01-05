<template>
  <div class="flex items-center gap-3 py-3">
    <div class="flex-1 h-px bg-border" />
    <span class="text-xs text-muted-foreground font-medium px-2">
      {{ formattedDate }}
    </span>
    <div class="flex-1 h-px bg-border" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  date: Date | string
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  const date = typeof props.date === 'string' ? new Date(props.date) : props.date
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Check if same day
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  
  if (isSameDay(date, today)) {
    return 'Hoje'
  }
  
  if (isSameDay(date, yesterday)) {
    return 'Ontem'
  }
  
  // Check if this week
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  
  if (date >= startOfWeek) {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' })
  }
  
  // Fallback to full date
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
})
</script>
