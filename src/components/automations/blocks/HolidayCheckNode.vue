<template>
  <BaseNodeCard
    accent-color="#F59E0B"
    :title="data.title || 'Verificar Feriado'"
    :selected="selected"
    :is-entry-exit="false"
  >
    <!-- Icon Slot -->
    <template #icon>
      <CalendarOff class="h-4 w-4" style="color: #F59E0B" />
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
            Verifica se hoje é feriado ou dia de inatividade no sistema.
          </p>
        </div>
      </div>

      <!-- Multiple Outputs Area -->
      <div class="mt-auto border-t divide-y" :style="{ borderColor: colors.previewBorder }">
        <template v-if="!data.invertOutputs">
          <!-- Default: Holiday First -->
            <!-- Output: Sim -->
            <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/20">
              <span class="font-medium" :style="{ color: colors.text }">Feriado/Inatividade</span>
              <Handle 
                type="source" 
                :position="Position.Right" 
                id="source-holiday"
                class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5 pointer-events-auto"
                :style="{ backgroundColor: '#b1b1b7' }"
              />
            </div>
            <!-- Output: Não -->
            <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/20 rounded-b-xl">
              <span class="font-medium" :style="{ color: colors.text }">Dia Normal</span>
              <Handle 
                type="source" 
                :position="Position.Right" 
                id="source-not-holiday"
                class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5 pointer-events-auto"
                :style="{ backgroundColor: '#b1b1b7' }"
              />
            </div>
        </template>
        <template v-else>
          <!-- Inverted: Normal First -->
            <!-- Output: Não -->
            <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/20">
              <span class="font-medium" :style="{ color: colors.text }">Dia Normal</span>
              <Handle 
                type="source" 
                :position="Position.Right" 
                id="source-not-holiday"
                class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5 pointer-events-auto"
                :style="{ backgroundColor: '#b1b1b7' }"
              />
            </div>
            <!-- Output: Sim -->
            <div class="relative px-3 py-2 text-[11px] flex items-center justify-between bg-muted/20 rounded-b-xl">
              <span class="font-medium" :style="{ color: colors.text }">Feriado/Inatividade</span>
              <Handle 
                type="source" 
                :position="Position.Right" 
                id="source-holiday"
                class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5 pointer-events-auto"
                :style="{ backgroundColor: '#b1b1b7' }"
              />
            </div>
        </template>
      </div>
    </template>

    <!-- Handles Slot -->
    <template #handles>
      <!-- Input Handle -->
      <Handle 
        type="target" 
        :position="Position.Left" 
        id="target-default"
        class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5 !-left-2 pointer-events-auto"
        :style="{ backgroundColor: '#b1b1b7' }"
      />
    </template>
  </BaseNodeCard>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { CalendarOff } from 'lucide-vue-next';
import BaseNodeCard from '@/components/flow-builder/BaseNodeCard.vue';

interface Props {
  id: string;
  data: {
    type: string;
    title?: string;
    invertOutputs?: boolean;
  };
  selected?: boolean;
}

defineProps<Props>();
</script>
