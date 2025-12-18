<template>
  <div 
    v-if="items.length > 0"
    class="tiptap-suggestion-list"
  >
    <div class="suggestion-header">
      <span class="text-xs text-muted-foreground font-medium">Variáveis disponíveis</span>
    </div>
    <div class="suggestion-items">
      <button
        v-for="(item, index) in items"
        :key="item.name"
        type="button"
        class="suggestion-item"
        :class="{ 'is-selected': index === selectedIndex }"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <code class="text-sm font-mono text-primary font-medium truncate">
            {{ item.name }}
          </code>
          <code class="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
            {{ formatVariable(item.name) }}
          </code>
        </div>
        <Badge 
          v-if="item.category"
          variant="secondary" 
          class="text-xs flex-shrink-0"
          :class="getCategoryClass(item.category)"
        >
          {{ getCategoryLabel(item.category) }}
        </Badge>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'

export interface VariableItem {
  name: string
  description?: string
  category?: string
  example?: string
}

const props = defineProps<{
  items: VariableItem[]
  command: (item: VariableItem) => void
}>()

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    props.command(item)
  }
}

function formatVariable(name: string): string {
  return `{{${name}}}`
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    contato: 'Contato',
    execucao: 'Execução',
    data_hora: 'Data/Hora',
    flow: 'Fluxo',
    token: 'Token',
  }
  return labels[category] || category
}

function getCategoryClass(category: string): string {
  const classes: Record<string, string> = {
    contato: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    execucao: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    data_hora: 'bg-green-500/10 text-green-700 dark:text-green-300',
    flow: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    token: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }
  return classes[category] || ''
}

function onKeyDown({ event }: { event: KeyboardEvent }) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }

  if (event.key === 'Enter') {
    selectItem(selectedIndex.value)
    return true
  }

  return false
}

defineExpose({
  onKeyDown,
})
</script>

<style scoped>
.tiptap-suggestion-list {
  background: hsl(var(--popover));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  min-width: 280px;
  max-width: 400px;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.suggestion-header {
  padding: 8px 12px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.3);
}

.suggestion-items {
  padding: 4px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.1s ease;
  background: transparent;
  border: none;
  color: inherit;
}

.suggestion-item:hover,
.suggestion-item.is-selected {
  background: hsl(var(--muted));
}

.suggestion-item.is-selected {
  background: hsl(var(--accent));
}
</style>
