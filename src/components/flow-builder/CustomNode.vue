<template>
  <!-- Input Handle - triggers não têm entrada -->
  <Handle
    v-if="data.type !== 'start'"
    id="target-default"
    type="target"
    :position="inputPosition"
    class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5"
    :class="{ '!ml-1.5': isEntryExit && layoutMode === 'horizontal', '!mt-1.5': isEntryExit && layoutMode === 'vertical' }"
    :style="{ backgroundColor: handleColor }"
  />

  <!-- Card do Node -->
  <div
    class="relative shadow-md transition-all duration-200"
    :class="[
      isEntryExit ? 'w-[140px] rounded-full' : 'w-[200px] rounded-xl'
    ]"
    :style="{
      backgroundColor: colors.bg,
      borderColor: borderColor,
      borderWidth: selected || isExecuting || wasExecuted || hasError ? '2px' : '0',
      borderStyle: 'solid',
      boxShadow: boxShadow,
      transform: selected && !isExecuting ? 'scale(1.02)' : 'scale(1)',
      minHeight: isEntryExit ? '44px' : '220px',
      height: 'auto',
      overflow: 'visible',
    }"
  >
    <!-- Conteúdo do Node -->
    <div class="flex flex-col h-full">
      <!-- Header com ícone e título -->
      <div 
        class="flex items-center px-3"
        :class="[
          isEntryExit ? 'h-[44px] gap-2 justify-center' : 'flex-col pt-3 pb-2'
        ]"
      >
        <div 
          :class="[
            isEntryExit ? '' : 'mb-2 hover:scale-110'
          ]"
          class="transition-transform flex-shrink-0"
        >
          <component
            :is="iconComponent"
            :class="[
              isEntryExit ? 'w-5 h-5' : 'w-7 h-7'
            ]"
            :style="{ color: isExecuting ? 'hsl(var(--success))' : accentColor }"
          />
        </div>
        <h3 
          class="text-sm font-medium truncate"
          :class="{ 
            'text-center px-1 w-full': !isEntryExit,
            'text-center': isEntryExit
          }"
          :style="{ color: colors.text }"
        >
          {{ data.title }}
        </h3>
      </div>

      <template v-if="!isEntryExit">
        <!-- Preview do conteúdo -->
        <div class="px-3 pb-6 flex-1 flex flex-col justify-center gap-2">
          <div
            class="rounded-lg p-2 border"
            :style="{
              backgroundColor: colors.previewBg,
              borderColor: colors.previewBorder,
            }"
          >
            <p :style="{ color: colors.textSecondary }" class="text-xs leading-relaxed line-clamp-3">
              {{ previewContent }}
            </p>
          </div>

        <!-- Metadados (variável, opções, condições) -->
          <div v-if="data.variable || optionsCount > 0 || conditionsCount > 0" class="text-[11px] space-y-1">
            <div v-if="data.variable" class="flex items-center gap-1.5 px-1.5 py-0.5">
              <Variable class="w-3 h-3 text-primary" />
              <span class="font-medium truncate text-primary">{{ data.variable }}</span>
            </div>
            <div v-if="optionsCount > 0 && data.type !== 'question'" class="flex items-center gap-1.5 px-1.5 py-0.5">
              <ListChecks class="w-3 h-3" :style="{ color: accentColor }" />
              <span class="font-medium" :style="{ color: accentColor }">{{ optionsCount }} opções</span>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Multi-Output Area: HORIZONTAL MODE (outputs on right, with labels) -->
      <div v-if="hasMultipleOutputs && layoutMode === 'horizontal'" class="mt-auto border-t divide-y" :style="{ borderColor: colors.previewBorder }">
        <div 
          v-for="(output, index) in visibleOutputs" 
          :key="index"
          class="relative px-3 py-2 text-xs flex items-center justify-between group bg-muted/30"
        >
          <span class="font-medium truncate max-w-[150px]" :style="{ color: colors.text }">{{ output.label }}</span>
          
          <!-- Handle individual -->
          <Handle
            :id="output.id"
            type="source"
            :position="Position.Right"
            class="!w-4 !h-4 !border-4 !border-background !right-0 z-50 transition-all hover:!w-5 hover:!h-5"
            :style="{ backgroundColor: handleColor }"
          />
        </div>
      </div>

      <!-- Multi-Output Area: VERTICAL MODE (numbered outputs at bottom) -->
      <div 
        v-if="hasMultipleOutputs && layoutMode === 'vertical'" 
        class="mt-auto border-t flex justify-center gap-4 pt-0 pb-1 px-2 bg-muted/30"
        :style="{ borderColor: colors.previewBorder }"
      >
        <div 
          v-for="(output, index) in visibleOutputs" 
          :key="index"
          class="relative flex flex-col items-center -mt-1"
          :title="output.label"
        >
          <span class="text-[10px] font-bold text-muted-foreground mb-0">{{ index + 1 }}</span>
          <Handle
            :id="output.id"
            type="source"
            :position="Position.Bottom"
            class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5 !relative !transform-none"
            :style="{ backgroundColor: handleColor }"
          />
        </div>
      </div>

    </div>
  </div>

  <!-- Output Handle (Padrão para blocos sem múltiplas saídas e que não são Fim) -->
  <Handle
    v-if="!hasMultipleOutputs && data.type !== 'end'"
    id="source-default"
    type="source"
    :position="outputPosition"
    class="!w-4 !h-4 !border-4 !border-background z-50 transition-all hover:!w-5 hover:!h-5"
    :class="{ '!mr-1.5': isEntryExit && layoutMode === 'horizontal', '!mb-1.5': isEntryExit && layoutMode === 'vertical' }"
    :style="{ backgroundColor: handleColor }"
  />
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { BLOCK_COLORS, TRIGGER_TYPES, ACTION_TYPES, type CustomNodeData, type BlockType } from '@/types/flow-builder';
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
import { useThemeStore } from '@/stores';

const props = defineProps<NodeProps<CustomNodeData>>();

// Hook para tema usando Pinia store
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

// Inject layoutMode from parent (flowBuilderChat.vue)
const layoutMode = inject<Ref<'horizontal' | 'vertical'>>('layoutMode', ref('horizontal'));

// Dynamic handle positions based on layout mode
const inputPosition = computed(() => layoutMode.value === 'horizontal' ? Position.Left : Position.Top);
const outputPosition = computed(() => layoutMode.value === 'horizontal' ? Position.Right : Position.Bottom);

// Mapeamento de ícones por tipo
const BLOCK_ICONS: Record<BlockType, any> = {
  message: MessageSquare,
  question: HelpCircle,
  switch: Split,
  api: Globe,
  action: Sparkles,
  wait: Clock,
  start: Zap,
  end: ZapOff,
  note: StickyNote,
  condition_holiday: Calendar,
  condition_weekday: CalendarDays,
  condition_time_range: Clock,
  // Activity-specific blocks
  email: Mail,
  call: Phone,
  task: CheckSquare,
  chat_flow: Workflow,
};

// Função para obter o ícone do gatilho
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

// Usar ícone específico do gatilho se houver triggerType, senão usar o ícone padrão do bloco
const iconComponent = computed(() => {
  if (type.value === 'start' && props.data.triggerType) {
    return getTriggerIcon(props.data.triggerType);
  }
  return BLOCK_ICONS[type.value] || BLOCK_ICONS.message;
});

const optionsCount = computed(() => Array.isArray(props.data.options) ? props.data.options.length : 0);
const conditionsCount = computed(() => Array.isArray(props.data.conditions) ? props.data.conditions.length : 0);

// Estados de execução
const isExecuting = computed(() => props.data.isExecuting || false);
const wasExecuted = computed(() => props.data.wasExecuted || false);
const hasError = computed(() => props.data.hasError || false);

// Cores dinâmicas baseadas no tema
const colors = computed(() => ({
  bg: isDark.value ? '#1a1a1a' : '#ffffff',
  text: isDark.value ? '#e5e7eb' : '#111827',
  textSecondary: isDark.value ? '#9ca3af' : '#4b5563',
  previewBg: isDark.value ? '#2d2d2d' : '#f3f4f6',
  previewBorder: isDark.value ? '#3f3f3f' : '#e5e7eb',
}));

const hasMultipleOutputs = computed(() => {
  return (type.value === 'question' && optionsCount.value > 0) || 
         (type.value === 'switch' && conditionsCount.value > 0) ||
         (type.value === 'condition_weekday' && conditionsCount.value > 0) ||
         (type.value === 'condition_time_range' && conditionsCount.value > 0) ||
         (type.value === 'condition_holiday'); // Feriado sempre tem saída dupla (Sim/Não) ou definida por condições
});

const visibleOutputs = computed(() => {
  if (type.value === 'question' && props.data.options) {
    return props.data.options.map((opt, i) => ({
      id: `option-${i}`, // Convenção de ID
      label: opt.label || opt.value
    }));
  }
  
  // Blocos condicionais usam a lista de condições como saídas
  if (['switch', 'condition_weekday', 'condition_time_range', 'condition_holiday'].includes(type.value) && Array.isArray(props.data.conditions)) {
    return props.data.conditions.map((cond, i) => ({
      id: `condition-${i}`,
      label: cond.label || `Condição ${i + 1}`
    }));
  }
  return [];
});

// Preview do conteúdo
const previewContent = computed(() => {
  if (type.value === 'action') {
    if (props.data.actionType) {
      const actionConfig = ACTION_TYPES.find(a => a.value === props.data.actionType);
      if (props.data.actionType === 'add_tag' && props.data['tag_name']) {
        return `Etiqueta: ${props.data['tag_name']}`;
      }
      if (props.data.actionType === 'assign_agent' && props.data['agent_id']) {
        return `Agente: ${props.data['agent_id']}`;
      }
      if (props.data.actionType === 'assign_team' && props.data['team_id']) {
        return `Time: ${props.data['team_id']}`;
      }
      return actionConfig?.label || 'Selecione uma ação';
    }
    return 'Selecione uma ação';
  }

  if (type.value === 'api') {
    if (props.data.api_method && props.data.api_endpoint) {
      return `${props.data.api_method} ${props.data.api_endpoint}`;
    }
    if (props.data.api_endpoint) {
      return props.data.api_endpoint;
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

  if (type.value === 'end') {
     return 'Finaliza o fluxo';
  }

  if (type.value === 'wait') {
    if (props.data.waitDuration) {
      const seconds = props.data.waitDuration / 1000;
      return `Aguardando ${seconds} segundos...`;
    }
    return 'Defina o tempo de espera';
  }

  if (type.value === 'message') {
    return props.data.content || 'Texto da mensagem';
  }

  if (type.value === 'question') {
    return props.data.content || 'Texto da pergunta';
  }

  if (type.value === 'switch') {
    return props.data.content || 'Expressão condicional';
  }

  if (type.value === 'condition_holiday') {
    return 'Verificar Feriados';
  }

  if (type.value === 'condition_weekday') {
    if (props.data.conditions && props.data.conditions.length > 0) {
      return props.data.conditions.map(c => c.label).join(', ');
    }
    return 'Configurar dias da semana';
  }

  if (type.value === 'condition_time_range') {
    if (props.data.conditions && props.data.conditions.length > 0) {
      return props.data.conditions.map(c => `${c.label} (${c.value})`).join(', ');
    }
    return 'Configurar horários';
  }

  return props.data.content || 'Configure este bloco';
});

// Cor do Handle (match com Edge)
const handleColor = computed(() => {
  if (isExecuting.value || wasExecuted.value) return 'hsl(var(--success))';
  return '#b1b1b7'; // Cor padrão da edge (cinza)
});

// Cor da borda
const borderColor = computed(() => {
  if (hasError.value) return '#ef4444'; // Error -> Vermelho
  if (isExecuting.value) return 'hsl(var(--success))'; // Executing -> Verde
  if (wasExecuted.value) return 'hsl(var(--success))'; // Executed -> Verde
  if (props.selected) return '#9ca3af';
  return 'transparent';
});

// Box shadow
const boxShadow = computed(() => {
  if (hasError.value) {
    return '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 12px -2px rgba(239, 68, 68, 0.3)';
  }
  if (isExecuting.value) {
    // Verde Destacado (Glow forte)
    return '0 0 25px hsl(var(--success) / 0.6), 0 10px 30px -5px hsl(var(--success) / 0.4), inset 0 0 0 2px hsl(var(--success) / 0.8)';
  }
  if (wasExecuted.value) {
    // Verde normal (Sem glow forte, apenas sombra suave padrão para manter o contexto)
    return isDark.value ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)';
  }
  if (props.selected) {
    return '0 0 0 3px rgba(156, 163, 175, 0.25), 0 4px 16px -2px rgba(156, 163, 175, 0.35)';
  }
  return isDark.value ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)';
});

</script>
