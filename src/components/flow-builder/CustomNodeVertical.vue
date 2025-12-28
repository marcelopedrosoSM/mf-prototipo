<template>
  <BaseNodeCard
    :accent-color="accentColor"
    :title="data.title"
    :selected="selected"
    :is-entry-exit="isEntryExit"
  >
    <!-- Icon Slot -->
    <template #icon>
      <component 
        :is="iconComponent" 
        :class="isEntryExit ? 'h-5 w-5' : 'h-4 w-4'" 
        :style="{ color: accentColor }" 
      />
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
          <p :style="{ color: colors.textSecondary }" class="text-[10px] leading-relaxed line-clamp-3">
            {{ previewContent }}
          </p>
        </div>

        <!-- Metadata -->
        <div v-if="data.variable || optionsCount > 0" class="text-[10px] space-y-1">
          <div v-if="data.variable" class="flex items-center gap-1.5 px-1.5 py-0.5">
            <Variable class="w-3 h-3 text-primary" />
            <span class="font-medium truncate text-primary">{{ data.variable }}</span>
          </div>
          <div v-if="optionsCount > 0 && data.type !== 'question'" class="flex items-center gap-1.5 px-1.5 py-0.5">
            <ListChecks class="w-3 h-3" :style="{ color: accentColor }" />
            <span class="font-medium" :style="{ color: accentColor }">{{ optionsCount }} opções</span>
          </div>
        </div>

        <!-- Vertical Mode Legend -->
        <div v-if="hasMultipleOutputs" class="mt-2 space-y-1">
          <div 
            v-for="(output, index) in visibleOutputs" 
            :key="index"
            class="flex items-start gap-1.5 text-[10px]"
          >
            <span class="font-bold shrink-0 w-3 h-3 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
              {{ index + 1 }}
            </span>
            <span class="leading-tight text-muted-foreground line-clamp-2" :title="output.label">
              {{ output.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Multi-Output Labels (Numbers at bottom) -->
      <div 
        v-if="hasMultipleOutputs" 
        class="mt-auto flex justify-center gap-4 px-2 pb-3"
      >
        <div 
          v-for="(output, index) in visibleOutputs" 
          :key="index"
          class="flex flex-col items-center w-4"
          :title="output.label"
        >
          <span class="font-bold shrink-0 w-3 h-3 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] select-none pointer-events-none">{{ index + 1 }}</span>
        </div>
      </div>
    </template>

    <!-- Handles Slot -->
    <template #handles>
      <!-- Input Handle - TOP -->
      <Handle 
        v-if="data.type !== 'start'"
        type="target" 
        :position="Position.Top" 
        id="target-default"
        class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5 !-top-2 pointer-events-auto"
        :style="{ backgroundColor: '#b1b1b7' }"
      />

      <!-- Multi-Output Handles at bottom -->
      <div 
        v-if="hasMultipleOutputs" 
        class="absolute bottom-0 left-0 w-full flex justify-center gap-4 z-50 pointer-events-none"
      >
        <div 
          v-for="(output, index) in visibleOutputs" 
          :key="index"
          class="relative w-4 h-0 flex justify-center items-center"
        >
          <Handle
            :id="output.id"
            type="source"
            :position="Position.Bottom"
            class="!w-4 !h-4 !border-4 !border-background pointer-events-auto transition-all hover:!w-5 hover:!h-5 !-bottom-2"
            :style="{ backgroundColor: '#b1b1b7' }"
          />
        </div>
      </div>

      <!-- Output Handle (default) - BOTTOM -->
      <Handle 
        v-if="!hasMultipleOutputs && data.type !== 'end'"
        type="source" 
        :position="Position.Bottom" 
        id="source-default"
        class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5 !-bottom-2 pointer-events-auto"
        :style="{ backgroundColor: '#b1b1b7' }"
      />
    </template>
  </BaseNodeCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { BLOCK_COLORS, TRIGGER_TYPES, ACTION_TYPES, type CustomNodeData, type BlockType } from '@/types/flow-builder';
import BaseNodeCard from './BaseNodeCard.vue';
import { 
  MessageSquare, 
  HelpCircle, 
  Split, 
  Globe, 
  Sparkles, 
  Clock, 
  Zap,
  ZapOff,
  Variable,
  ListChecks,
  StickyNote,
  MessageSquarePlus,
  CheckCircle2,
  Webhook,
  Play,
  Calendar,
  CalendarDays,
  Mail,
  Phone,
  CheckSquare,
  Workflow,
} from 'lucide-vue-next';

const props = defineProps<NodeProps<CustomNodeData>>();

// Block icons mapping
const BLOCK_ICONS: Record<BlockType, any> = {
  message: MessageSquare,
  question: HelpCircle,
  switch: Split,
  decision: Split,
  api: Globe,
  integration: Globe,
  action: Sparkles,
  wait: Clock,
  start: Zap,
  end: ZapOff,
  note: StickyNote,
  condition_holiday: Calendar,
  condition_weekday: CalendarDays,
  condition_time_range: Clock,
  email: Mail,
  call: Phone,
  task: CheckSquare,
  chat_flow: Workflow,
  task_flow: Workflow,
  trigger_manual: Play,
  trigger_message_received: MessageSquare,
  trigger_conversation_created: MessageSquarePlus,
  trigger_conversation_closed: CheckCircle2,
  availability_check: CalendarDays,
};

const getTriggerIcon = (type: string) => {
  switch (type) {
    case 'message_received': return MessageSquare;
    case 'conversation_created': return MessageSquarePlus;
    case 'conversation_finished': return CheckCircle2;
    case 'schedule': return Clock;
    case 'webhook': return Webhook;
    case 'manual': return Play;
    default: return Zap;
  }
};

const type = computed(() => (props.data?.type || 'message') as BlockType);
const isEntryExit = computed(() => type.value === 'start' || type.value === 'end');
const accentColor = computed(() => BLOCK_COLORS[type.value] || BLOCK_COLORS.message);

const iconComponent = computed(() => {
  if (type.value === 'start' && props.data.triggerType) {
    return getTriggerIcon(props.data.triggerType);
  }
  return BLOCK_ICONS[type.value] || BLOCK_ICONS.message;
});

const optionsCount = computed(() => Array.isArray(props.data.options) ? props.data.options.length : 0);
const conditionsCount = computed(() => Array.isArray(props.data.conditions) ? props.data.conditions.length : 0);

const hasMultipleOutputs = computed(() => {
  const typesWithConditions = ['question', 'switch', 'condition_weekday', 'condition_time_range', 'condition_holiday', 'chat_flow', 'task', 'call', 'email'];
  if (type.value === 'question' && optionsCount.value > 0) return true;
  if (type.value === 'condition_holiday') return true;
  return typesWithConditions.includes(type.value) && conditionsCount.value > 0;
});

const visibleOutputs = computed(() => {
  if (type.value === 'question' && props.data.options) {
    return props.data.options.map((opt, i) => ({
      id: `option-${i}`,
      label: opt.label || opt.value
    }));
  }
  
  const typesWithConditions = ['switch', 'condition_weekday', 'condition_time_range', 'condition_holiday', 'chat_flow', 'task', 'call', 'email'];
  if (typesWithConditions.includes(type.value) && Array.isArray(props.data.conditions)) {
    return props.data.conditions.map((cond, i) => ({
      id: `condition-${i}`,
      label: typeof cond === 'string' ? cond : (cond.label || `Condição ${i + 1}`)
    }));
  }
  return [];
});

const previewContent = computed(() => {
  if (type.value === 'action') {
    if (props.data.actionType) {
      const actionConfig = ACTION_TYPES.find(a => a.value === props.data.actionType);
      if (props.data.actionType === 'add_tag' && props.data['tag_name']) {
        return `Etiqueta: ${props.data['tag_name']}`;
      }
      return actionConfig?.label || 'Selecione uma ação';
    }
    return 'Selecione uma ação';
  }

  if (type.value === 'api') {
    if (props.data.api_method && props.data.api_endpoint) {
      return `${props.data.api_method} ${props.data.api_endpoint}`;
    }
    return 'Configure a API';
  }

  if (type.value === 'start') {
    if (props.data.triggerType) {
      const triggerConfig = TRIGGER_TYPES.find(t => t.value === props.data.triggerType);
      return triggerConfig?.label || 'Início do Fluxo';
    }
    return 'Início do Fluxo';
  }

  if (type.value === 'end') return 'Finaliza o fluxo';
  
  if (type.value === 'wait') {
    if (props.data.waitDuration) {
      return formatWaitDuration(Number(props.data.waitDuration), props.data.waitUnit as string);
    }
    return 'Defina o tempo de espera';
  }

  if (type.value === 'condition_holiday') return 'Verifica se hoje é feriado ou dia de inatividade.';
  if (type.value === 'condition_weekday') return 'Verifica o dia da semana atual.';
  if (type.value === 'condition_time_range') return 'Verifica se está dentro do horário configurado.';

  return props.data.content || 'Configure este bloco';
});

// Função para formatar duração de espera com unidade
function formatWaitDuration(milliseconds: number, unit?: string) {
  const seconds = milliseconds / 1000;
  
  // Se tem unidade definida, usar ela
  if (unit) {
    const value = getWaitValueFromMs(milliseconds, unit);
    const labels: Record<string, string> = {
      seconds: 'segundo',
      minutes: 'minuto',
      hours: 'hora',
      days: 'dia',
    };
    const label = labels[unit] || 'segundo';
    const plural = value !== 1 ? 's' : '';
    return `Aguardando ${value} ${label}${plural}...`;
  }
  
  // Se não tem unidade, inferir a melhor
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `Aguardando ${days} ${days === 1 ? 'dia' : 'dias'}...`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `Aguardando ${hours} ${hours === 1 ? 'hora' : 'horas'}...`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `Aguardando ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}...`;
  }
  return `Aguardando ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}...`;
}

function getWaitValueFromMs(milliseconds: number, unit: string) {
  const seconds = milliseconds / 1000;
  switch (unit) {
    case 'days':
      return Math.floor(seconds / 86400);
    case 'hours':
      return Math.floor(seconds / 3600);
    case 'minutes':
      return Math.floor(seconds / 60);
    default:
      return seconds;
  }
}
</script>

<style scoped>
:deep(.vue-flow__handle) {
  left: 50% !important;
  transform: translateX(-50%) !important;
}
</style>
