<template>
  <BaseNodeCard
    accent-color="#F59E0B"
    :title="data.title || 'Disponibilidade'"
    :selected="selected"
    :is-entry-exit="false"
  >
    <!-- Icon Slot -->
    <template #icon>
      <CalendarClock class="h-4 w-4" style="color: #F59E0B" />
    </template>

    <!-- Body Slot -->
    <template #body="{ colors }">
      <!-- Preview Area -->
      <div class="px-3 py-3 flex-1 flex flex-col gap-2">
        <div
          class="rounded-lg p-2 border"
          :style="{
            backgroundColor: colors.previewBg,
            borderColor: colors.previewBorder,
          }"
        >
          <p :style="{ color: colors.textSecondary }" class="text-[10px] leading-relaxed">
            Verifica <strong>Ausências</strong> e <strong>Horário de Atendimento</strong>.
          </p>
        </div>
        
        <!-- Interval Summary -->
        <div v-if="data.intervals && data.intervals.length > 0" class="mt-1 space-y-1">
           <p class="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Horários Configurados:</p>
           <div 
             v-for="interval in data.intervals" 
             :key="interval.id"
             class="text-[10px] truncate pl-1 border-l-2 border-primary/20"
             :style="{ color: colors.text }"
           >
             {{ interval.days ? formatDays(interval.days) : 'Dias' }}: {{ interval.startTime }}-{{ interval.endTime }}
           </div>
        </div>
        <div v-else class="mt-1 text-[10px] text-muted-foreground italic">
           Nenhum horário configurado (Sempre Indisponível)
        </div>
      </div>

      <!-- Two Fixed Outputs -->
      <div class="mt-auto border-t divide-y" :style="{ borderColor: colors.previewBorder }">
        <!-- Output 1: Disponível -->
        <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/50 group">
          <div class="flex items-center gap-1.5">
             <span class="font-medium text-muted-foreground">Disponível</span>
          </div>
          <Handle 
            type="source" 
            :position="Position.Right" 
            id="source-available"
            class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5"
            :style="{ backgroundColor: '#b1b1b7' }"
          />
        </div>

        <!-- Output 2: Indisponível -->
        <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/50 rounded-b-xl">
          <div class="flex items-center gap-1.5">
             <span class="font-medium text-muted-foreground">Indisponível</span>
          </div>
          <Handle 
            type="source" 
            :position="Position.Right" 
            id="source-unavailable"
            class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5"
            :style="{ backgroundColor: '#b1b1b7' }"
          />
        </div>
      </div>
    </template>

    <!-- Handles Slot -->
    <template #handles>
      <!-- Input Handle -->
      <Handle 
        type="target" 
        :position="Position.Left" 
        id="target-default"
        class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5 !-left-2"
        :style="{ backgroundColor: '#b1b1b7' }"
      />
    </template>
  </BaseNodeCard>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { CalendarClock } from 'lucide-vue-next';
import BaseNodeCard from '@/components/flow-builder/BaseNodeCard.vue';
import type { BusinessHoursInterval } from '@/types/automation';

interface Props {
  id: string;
  data: {
    type: string;
    title?: string;
    intervals: BusinessHoursInterval[];
  };
  selected?: boolean;
}

defineProps<Props>();

const DAY_LABELS: Record<string, string> = {
  'dom': 'Dom',
  'seg': 'Seg',
  'ter': 'Ter',
  'qua': 'Qua',
  'qui': 'Qui',
  'sex': 'Sex',
  'sab': 'Sab'
};

function formatDays(days: string[]) {
  if (!days || days.length === 0) return 'Nenhum dia';
  if (days.length === 7) return 'Todos os dias';
  return days.map(d => DAY_LABELS[d] || d).join(', ');
}
</script>
