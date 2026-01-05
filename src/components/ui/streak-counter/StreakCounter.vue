<template>
  <div class="flex items-center gap-1.5">
    <Flame 
      class="h-4 w-4 transition-colors" 
      :class="isActive ? 'text-orange-500' : 'text-muted-foreground'"
    />
    <span 
      class="text-sm font-semibold tabular-nums"
      :class="isActive ? 'text-foreground' : 'text-muted-foreground'"
    >
      {{ count }}
    </span>
    <span class="text-xs text-muted-foreground">
      {{ count === 1 ? 'dia' : 'dias' }}
    </span>
    
    <!-- Tooltip with history -->
    <Tooltip v-if="showHistory && history.length > 0">
      <TooltipTrigger as-child>
        <button class="ml-1 p-1 rounded hover:bg-muted">
          <Calendar class="h-3 w-3 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" class="p-3">
        <div class="space-y-1">
          <p class="text-xs font-medium mb-2">Últimos {{ history.length }} dias</p>
          <div class="flex gap-0.5">
            <div 
              v-for="(day, idx) in history" 
              :key="idx"
              class="w-3 h-3 rounded-sm"
              :class="day ? 'bg-green-500' : 'bg-muted'"
              :title="day ? 'Completado' : 'Não completado'"
            />
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Flame, Calendar } from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  count: number;
  showHistory?: boolean;
  history?: boolean[]; // Last N days, true = completed
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  showHistory: false,
  history: () => [],
});

const isActive = computed(() => props.count > 0);
</script>
