<template>
  <div class="relative group">

    <!-- Card da Nota -->
    <div
      class="relative w-[240px] min-h-[180px] rounded-[2px] shadow-lg transition-all duration-300 cursor-move border-l-[8px] overflow-hidden"
      :class="[selected ? 'scale-[1.02] z-30' : 'scale-100 rotate-[0.5deg]']"
      :style="{
        backgroundColor: noteColors[color].bg,
        borderLeftColor: noteColors[color].border,
        boxShadow: selected 
          ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 2px ${noteColors[color].border}`
          : `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
      }"
    >
      <!-- Efeito Dog-Ear (canto dobrado) -->
      <div 
        class="absolute top-0 right-0 w-8 h-8 pointer-events-none transition-all duration-300"
        :style="{
          background: `linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 100%)`,
          boxShadow: '-1px 1px 2px rgba(0,0,0,0.1)'
        }"
      ></div>

      <!-- Header da nota (apenas seletor de cores) -->
      <div class="flex items-center justify-end px-3 py-2 bg-black/5">
        
        <!-- Seletor de cor simplificado -->
        <div class="flex gap-1.5 translate-x-1">
          <button
            v-for="colorOption in colorOptions"
            :key="colorOption"
            @click.stop="changeColor(colorOption)"
            class="w-3 h-3 rounded-full border border-black/10 transition-all hover:scale-125 hover:shadow-sm"
            :class="{ 'ring-2 ring-offset-1 ring-black/20 scale-110': color === colorOption }"
            :style="{ backgroundColor: noteColors[colorOption].border }"
            :title="`Cor: ${colorOption}`"
          />
        </div>
      </div>

      <!-- Conteúdo da nota com Edição In-line -->
      <div class="p-4 pt-3">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="w-full bg-transparent border-none focus:ring-0 p-0 text-sm leading-relaxed resize-none overflow-hidden placeholder:italic placeholder:opacity-50 transition-all"
          :style="{ 
            color: noteColors[color].text,
            fontFamily: 'inherit'
          }"
          placeholder="Escreva algo..."
          @input="handleInput"
          @mousedown.stop
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import type { NodeProps } from '@vue-flow/core';

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

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const content = ref(props.data.content || '');

// Auto-ajuste do tamanho da textarea
const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

onMounted(() => {
  adjustTextareaHeight();
});

// Sincronizar quando o prop mudar externamente
watch(() => props.data.content, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal || '';
    nextTick(adjustTextareaHeight);
  }
});

const handleInput = () => {
  adjustTextareaHeight();
  
  // Emitir evento customizado para atualizar o conteúdo no parent
  const event = new CustomEvent('note-content-change', {
    detail: { id: props.id, content: content.value },
    bubbles: true,
  });
  window.dispatchEvent(event);
};

// Cores das notas modernizadas (Glassmorphism inspired)
const noteColors = {
  yellow: {
    bg: '#fff9db',
    border: '#fcc419',
    text: '#826a0d',
    icon: '#f59e0b',
  },
  blue: {
    bg: '#e7f5ff',
    border: '#339af0',
    text: '#1864ab',
    icon: '#2563eb',
  },
  green: {
    bg: '#ebfbee',
    border: '#51cf66',
    text: '#2b8a3e',
    icon: '#059669',
  },
  pink: {
    bg: '#fff0f6',
    border: '#f06595',
    text: '#a61e4d',
    icon: '#db2777',
  },
  orange: {
    bg: '#fff4e6',
    border: '#ff922b',
    text: '#d9480f',
    icon: '#ea580c',
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

<style scoped>
textarea {
  outline: none !important;
  box-shadow: none !important;
}

/* Efeito sutil de textura de papel */
.relative.w-\[240px\] {
  background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 0);
  background-size: 20px 20px;
}
</style>
