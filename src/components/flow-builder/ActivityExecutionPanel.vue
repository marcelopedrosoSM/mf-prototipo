<template>
  <div 
    v-if="isVisible"
    class="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border rounded-xl shadow-2xl p-4 min-w-[320px] max-w-[400px] animate-in slide-in-from-bottom duration-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center"
          :style="{ backgroundColor: `${blockColor}20` }"
        >
          <component :is="blockIcon" class="w-4 h-4" :style="{ color: blockColor }" />
        </div>
        <div>
          <h3 class="font-semibold text-sm">{{ currentBlock?.data?.title || 'Bloco' }}</h3>
          <p class="text-xs text-muted-foreground">Escolha uma opção para continuar</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" class="h-7 w-7" @click="$emit('cancel')">
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- Block Content Preview -->
    <div class="bg-muted/50 rounded-lg p-3 mb-4 text-sm text-muted-foreground">
      {{ currentBlock?.data?.content || 'Sem conteúdo' }}
    </div>

    <!-- Condition Buttons -->
    <div class="space-y-2">
      <Button
        v-for="(condition, index) in conditions"
        :key="index"
        variant="outline"
        class="w-full justify-start gap-2 h-10 hover:bg-primary/10 hover:border-primary/50 transition-colors"
        @click="handleSelectCondition(condition, index)"
      >
        <div class="w-2 h-2 rounded-full bg-primary" />
        {{ condition.label }}
      </Button>
    </div>

    <!-- Auto-advance for blocks without conditions -->
    <div v-if="!hasConditions" class="mt-4">
      <Button class="w-full" @click="handleAutoAdvance">
        <ArrowRight class="h-4 w-4 mr-2" />
        Continuar
      </Button>
    </div>

    <!-- Execution Progress -->
    <div class="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
      <span>{{ currentStep }}/{{ totalSteps }}</span>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span>Em execução</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Mail, Phone, MessageSquare, Clock, Zap, CheckSquare, Workflow } from 'lucide-vue-next';
import type { Node } from '@vue-flow/core';
import { BLOCK_COLORS, type BlockType } from '@/types/flow-builder';

interface Condition {
  label: string;
  value: string;
}

const props = defineProps<{
  isVisible: boolean;
  currentBlock: Node | null;
  currentStep: number;
  totalSteps: number;
}>();

const emit = defineEmits<{
  (e: 'select-condition', payload: { conditionValue: string; conditionIndex: number }): void;
  (e: 'auto-advance'): void;
  (e: 'cancel'): void;
}>();

const conditions = computed<Condition[]>(() => {
  return props.currentBlock?.data?.conditions || [];
});

const hasConditions = computed(() => conditions.value.length > 0);

const blockType = computed<BlockType>(() => {
  return (props.currentBlock?.data?.type || 'action') as BlockType;
});

const blockColor = computed(() => {
  return BLOCK_COLORS[blockType.value] || BLOCK_COLORS.action;
});

const BLOCK_ICONS: Record<string, any> = {
  email: Mail,
  call: Phone,
  message: MessageSquare,
  wait: Clock,
  action: Zap,
  task: CheckSquare,
  chat_flow: Workflow,
};

const blockIcon = computed(() => {
  return BLOCK_ICONS[blockType.value] || Zap;
});

function handleSelectCondition(condition: Condition, index: number) {
  emit('select-condition', { 
    conditionValue: condition.value, 
    conditionIndex: index 
  });
}

function handleAutoAdvance() {
  emit('auto-advance');
}
</script>
