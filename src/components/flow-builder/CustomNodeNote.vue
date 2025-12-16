<template>
  <div class="relative">
    <!-- Card da Nota (sem handles) -->
    <div
      class="relative w-[200px] min-h-[150px] rounded-xl shadow-md transition-all duration-200 cursor-move"
      :style="{
        backgroundColor: noteColors[color].bg,
        borderColor: noteColors[color].border,
        borderWidth: selected ? '2px' : '1px',
        borderStyle: 'solid',
        boxShadow: selected 
          ? `0 0 0 3px ${noteColors[color].glow}, 0 4px 16px -2px ${noteColors[color].shadow}`
          : `0 2px 8px ${noteColors[color].shadow}`,
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }"
    >
      <!-- Header da nota -->
      <div class="flex items-center justify-between p-3 border-b" :style="{ borderColor: noteColors[color].border }">
        <div class="flex items-center gap-2">
          <StickyNote class="w-4 h-4" :style="{ color: noteColors[color].icon }" />
          <span class="text-xs font-medium" :style="{ color: noteColors[color].text }">Nota</span>
        </div>
        <div class="flex items-center gap-1">
          <!-- Seletor de cor -->
          <div class="flex gap-1">
            <button
              v-for="colorOption in colorOptions"
              :key="colorOption"
              @click.stop="changeColor(colorOption)"
              class="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
              :style="{
                backgroundColor: noteColors[colorOption].bg,
                borderColor: color === colorOption ? noteColors[colorOption].icon : 'transparent',
              }"
              :title="`Cor: ${colorOption}`"
            />
          </div>
        </div>
      </div>

      <!-- Conteúdo da nota -->
      <div class="p-3">
        <p 
          class="text-sm whitespace-pre-wrap break-words"
          :style="{ color: noteColors[color].text }"
        >
          {{ data.content || 'Clique para editar a nota...' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import { StickyNote } from 'lucide-vue-next';

interface NoteNodeData {
  type: 'note';
  title?: string;
  content?: string;
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'orange';
  [key: string]: unknown;
}

const props = defineProps<NodeProps<NoteNodeData>>();

const color = computed(() => props.data.color || 'yellow');
const colorOptions: Array<'yellow' | 'blue' | 'green' | 'pink' | 'orange'> = ['yellow', 'blue', 'green', 'pink', 'orange'];

// Cores das notas
const noteColors = {
  yellow: {
    bg: '#fef3c7',
    border: '#fbbf24',
    text: '#78350f',
    icon: '#f59e0b',
    glow: 'rgba(251, 191, 36, 0.25)',
    shadow: 'rgba(251, 191, 36, 0.2)',
  },
  blue: {
    bg: '#dbeafe',
    border: '#3b82f6',
    text: '#1e3a8a',
    icon: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.25)',
    shadow: 'rgba(59, 130, 246, 0.2)',
  },
  green: {
    bg: '#d1fae5',
    border: '#10b981',
    text: '#064e3b',
    icon: '#059669',
    glow: 'rgba(16, 185, 129, 0.25)',
    shadow: 'rgba(16, 185, 129, 0.2)',
  },
  pink: {
    bg: '#fce7f3',
    border: '#ec4899',
    text: '#831843',
    icon: '#db2777',
    glow: 'rgba(236, 72, 153, 0.25)',
    shadow: 'rgba(236, 72, 153, 0.2)',
  },
  orange: {
    bg: '#fed7aa',
    border: '#f97316',
    text: '#7c2d12',
    icon: '#ea580c',
    glow: 'rgba(249, 115, 22, 0.25)',
    shadow: 'rgba(249, 115, 22, 0.2)',
  },
};

const changeColor = (newColor: 'yellow' | 'blue' | 'green' | 'pink' | 'orange') => {
  // Emitir evento customizado para atualizar a cor
  const event = new CustomEvent('note-color-change', {
    detail: { id: props.id, color: newColor },
    bubbles: true,
  });
  window.dispatchEvent(event);
};
</script>
