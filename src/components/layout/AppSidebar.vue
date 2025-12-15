<template>
  <aside
    :class="cn(
      'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )"
  >
    <nav class="flex h-full flex-col p-4">
      <!-- Toggle Button -->
      <div class="mb-4 flex items-center gap-2">
        <button
          @click="$emit('toggle')"
          class="flex h-10 w-10 items-center justify-center rounded-md p-2 interactive flex-shrink-0"
          :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <PanelLeftOpen v-if="collapsed" class="h-5 w-5" />
          <PanelLeftClose v-else class="h-5 w-5" />
        </button>
        <span v-if="!collapsed" class="text-base font-semibold truncate">
          Conversas
        </span>
      </div>

      <!-- Sidebar content -->
      <div class="flex-1 space-y-1">
        <!-- Conteúdo para /conversations - Em construção -->
        <div v-if="!collapsed" class="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
          <div class="rounded-full bg-muted p-4 mb-4">
            <Construction class="h-8 w-8 text-muted-foreground" />
          </div>
          <p class="text-sm font-medium text-muted-foreground">Em construção</p>
          <p class="text-xs text-muted-foreground mt-2">Esta seção está sendo desenvolvida</p>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen, Construction } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

interface Props {
  collapsed: boolean;
}

defineProps<Props>();

defineEmits<{
  toggle: [];
}>();
</script>

