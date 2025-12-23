<template>
  <BaseNodeCard
    accent-color="#3B82F6"
    :title="data.title || 'Horário de Atendimento'"
    :selected="selected"
    :is-entry-exit="false"
  >
    <!-- Icon Slot -->
    <template #icon>
      <Clock class="h-4 w-4" style="color: #3B82F6" />
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
            Verifica se o horário atual corresponde a algum intervalo configurado.
          </p>
        </div>
      </div>

      <!-- Multiple Outputs Area -->
      <div class="mt-auto border-t divide-y" :style="{ borderColor: colors.previewBorder }">
        <!-- Interval Outputs -->
        <div 
          v-for="interval in data.intervals" 
          :key="interval.id"
          class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/10 group"
        >
          <div class="flex flex-col min-w-0 pr-4 text-left">
            <span class="font-medium truncate" :style="{ color: colors.text }">{{ interval.label }}</span>
            <span class="text-[9px] text-muted-foreground truncate">{{ formatDays(interval.days) }} ({{ interval.startTime }}-{{ interval.endTime }})</span>
          </div>
          <Handle 
            type="source" 
            :position="Position.Right" 
            :id="`source-${interval.id}`"
            class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5"
            :style="{ backgroundColor: '#b1b1b7' }"
          />
        </div>

        <!-- Default Output: Fora do Horário -->
        <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/30 rounded-b-xl">
          <span class="font-medium" :style="{ color: colors.text }">Fora do Horário</span>
          <Handle 
            type="source" 
            :position="Position.Right" 
            id="source-default-out"
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
import { Clock } from 'lucide-vue-next';
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
