<script setup lang="ts">
/**
 * BaseNodeCard - Componente Base para Nós do Flow Builder
 * 
 * Este componente encapsula a estrutura visual exata do HolidayCheckNode:
 * - Card com border-2 colorida
 * - Header com fundo colorido (cor + 15) e icon wrapper (cor + 30)
 * - Preview area
 * - Outputs area com handles externos
 * 
 * Props:
 * - accentColor: string (HEX) - Cor principal do bloco
 * - title: string - Título do bloco
 * - icon: Component - Ícone Lucide do bloco
 * - selected: boolean - Se o nó está selecionado
 * - isEntryExit: boolean - Se é nó de entrada/saída (pill shape)
 */

import { computed } from 'vue';
import { useThemeStore } from '@/stores';

interface Props {
  accentColor: string;
  title: string;
  selected?: boolean;
  isEntryExit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  isEntryExit: false,
});

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const colors = computed(() => ({
  bg: isDark.value ? '#1a1a1a' : '#ffffff',
  text: isDark.value ? '#e5e7eb' : '#111827',
  textSecondary: isDark.value ? '#9ca3af' : '#4b5563',
  previewBg: isDark.value ? '#2d2d2d' : '#f8f9fa',
  previewBorder: isDark.value ? '#3f3f3f' : '#e5e7eb',
}));

// Expose colors for child components
defineExpose({ colors });
</script>

<template>
  <div 
    class="relative transition-all duration-200 rounded-xl border-2 overflow-visible"
    :class="[
      isEntryExit ? 'w-[140px] rounded-full' : 'w-[200px]',
    ]"
    :style="{
      backgroundColor: colors.bg,
      borderColor: selected ? 'hsl(var(--primary))' : '#9ca3af',
      boxShadow: selected 
        ? `0 8px 16px -4px hsl(var(--primary) / 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.1)`
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    }"
  >
    <!-- Content Wrapper -->
    <div class="flex flex-col h-full overflow-visible">
      <!-- Header (standard blocks) -->
      <div 
        v-if="!isEntryExit"
        class="flex items-center gap-2 px-3 py-2 border-b rounded-t-xl"
        :style="{ backgroundColor: accentColor + '15', borderColor: accentColor + '20' }"
      >
        <div 
          class="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: accentColor + '30' }"
        >
          <slot name="icon" />
        </div>
        <h3 class="text-xs font-semibold truncate" :style="{ color: colors.text }">
          {{ title }}
        </h3>
      </div>

      <!-- Header (entry/exit - pill style) -->
      <div 
        v-else
        class="flex items-center gap-2 px-4 h-[44px] justify-center"
      >
        <slot name="icon" />
        <h3 class="text-sm font-medium" :style="{ color: colors.text }">
          {{ title }}
        </h3>
      </div>

      <!-- Body slot (preview, metadata, outputs) -->
      <template v-if="!isEntryExit">
        <slot name="body" :colors="colors" />
      </template>
    </div>

    <!-- Handles slot (positioned outside the card) -->
    <slot name="handles" />
  </div>
</template>

<style scoped>
/* Centralização para handles laterais (Left/Right) */
:deep(.vue-flow__handle-left),
:deep(.vue-flow__handle-right) {
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* Centralização para handles horizontais (Top/Bottom) */
:deep(.vue-flow__handle-top),
:deep(.vue-flow__handle-bottom) {
  left: 50% !important;
  transform: translateX(-50%) !important;
}

/* Garante que o handle seja clicável e fique por cima de tudo */
:deep(.vue-flow__handle) {
  pointer-events: auto !important;
  z-index: 100 !important;
}
</style>
