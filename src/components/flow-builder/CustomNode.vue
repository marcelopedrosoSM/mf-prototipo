<template>
  <!-- Input Handle - triggers não têm entrada -->
  <Handle
    v-if="data.type !== 'trigger'"
    type="target"
    :position="Position.Left"
  />

  <!-- Card do Node -->
  <div
    class="relative w-[200px] rounded-xl shadow-md transition-all duration-200"
    :style="{
      backgroundColor: colors.bg,
      borderColor: borderColor,
      borderWidth: selected || isExecuting || wasExecuted ? '2px' : '0',
      borderStyle: 'solid',
      boxShadow: boxShadow,
      transform: selected && !isExecuting ? 'scale(1.02)' : 'scale(1)',
      minHeight: '220px',
      height: 'auto',
      overflow: 'visible',
    }"
  >
    <!-- Conteúdo do Node -->
    <div class="flex flex-col h-full">
      <!-- Header com ícone e título -->
      <div class="flex flex-col items-center pt-3 pb-2 px-3">
        <div class="mb-2 transition-transform hover:scale-110">
          <component
            :is="iconComponent"
            class="w-7 h-7"
            :style="{ color: isExecuting ? '#10b981' : accentColor }"
          />
        </div>
        <h3 class="text-sm font-medium truncate px-1 w-full text-center" :style="{ color: colors.text }">
          {{ data.title }}
        </h3>
      </div>

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
          <div v-if="optionsCount > 0" class="flex items-center gap-1.5 px-1.5 py-0.5">
            <ListChecks class="w-3 h-3" :style="{ color: accentColor }" />
            <span class="font-medium" :style="{ color: accentColor }">{{ optionsCount }} opções</span>
          </div>
          <div v-if="data.type === 'switch' && conditionsCount > 0" class="flex items-center gap-1.5 px-1.5 py-0.5">
            <Split class="w-3 h-3" :style="{ color: accentColor }" />
            <span class="font-medium" :style="{ color: accentColor }">{{ conditionsCount }} condições</span>
          </div>
        </div>
      </div>
      
      <!-- Multi-Output Area -->
      <div v-if="hasMultipleOutputs" class="mt-auto border-t divide-y" :style="{ borderColor: colors.previewBorder }">
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
            class="!bg-primary !w-3.5 !h-3.5 !border-2 !border-background !right-[-7px]"
          />
        </div>
      </div>

    </div>
  </div>

  <!-- Output Handle (Padrão para blocos sem múltiplas saídas) -->
  <Handle
    v-if="!hasMultipleOutputs"
    type="source"
    :position="Position.Right"
    class="!bg-primary !w-3.5 !h-3.5 !border-2 !border-background"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  Variable,
  ListChecks,
  StickyNote,
} from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<NodeProps<CustomNodeData>>();

// Hook para tema (usando composable customizado - NÃO vueuse!)
const { resolvedTheme } = useTheme();
const isDark = computed(() => resolvedTheme.value === 'dark');

// Mapeamento de ícones por tipo
const BLOCK_ICONS: Record<BlockType, any> = {
  message: MessageSquare,
  question: HelpCircle,
  switch: Split,
  api: Globe,
  action: Sparkles,
  wait: Clock,
  trigger: Zap,
  note: StickyNote,
};

const type = computed(() => (props.data?.type || 'message') as BlockType);
const accentColor = computed(() => BLOCK_COLORS[type.value] || BLOCK_COLORS.message);
const iconComponent = computed(() => BLOCK_ICONS[type.value] || BLOCK_ICONS.message);

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

// Lógica de Múltiplas Saídas
const hasMultipleOutputs = computed(() => {
  return (type.value === 'question' && optionsCount.value > 0) || 
         (type.value === 'switch' && conditionsCount.value > 0);
});

const visibleOutputs = computed(() => {
  if (type.value === 'question' && props.data.options) {
    return props.data.options.map((opt, i) => ({
      id: `option-${i}`, // Convenção de ID
      label: opt.label || opt.value
    }));
  }
  if (type.value === 'switch' && props.data.conditions) {
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

  if (type.value === 'trigger') {
    if (props.data.triggerType) {
      const triggerConfig = TRIGGER_TYPES.find(t => t.value === props.data.triggerType);
      if (props.data.triggerType === 'schedule' && props.data['scheduleCron']) {
        return `Cron: ${props.data['scheduleCron']}`;
      }
      if (props.data.triggerType === 'webhook' && props.data['webhookUrl']) {
        return `Webhook: ${String(props.data['webhookUrl']).substring(0, 30)}...`;
      }
      
      // Mostrar informações de caixa e agente configurados
      const caixaId = props.data['caixaEntradaId'] as string | undefined;
      const agenteId = props.data['agenteVirtualId'] as string | undefined;
      if (caixaId && agenteId) {
        return `${triggerConfig?.label || 'Gatilho'} ✓`;
      }
      if (caixaId || agenteId) {
        return `${triggerConfig?.label || 'Gatilho'} (incompleto)`;
      }
      
      return triggerConfig?.label || 'Selecione um gatilho';
    }
    return 'Selecione um gatilho';
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

  return props.data.content || 'Configure este bloco';
});

// Cor da borda
const borderColor = computed(() => {
  if (hasError.value) return '#ef4444';
  if (isExecuting.value) return '#10b981';
  if (wasExecuted.value && !isExecuting.value) return '#10b981';
  if (props.selected) return '#9ca3af';
  return 'transparent';
});

// Box shadow
const boxShadow = computed(() => {
  if (hasError.value) {
    return '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 12px -2px rgba(239, 68, 68, 0.3)';
  }
  if (isExecuting.value) {
    return '0 0 25px rgba(16, 185, 129, 0.6), 0 10px 30px -5px rgba(16, 185, 129, 0.4), inset 0 0 0 2px rgba(16, 185, 129, 0.8)';
  }
  if (props.selected && !wasExecuted.value) {
    return '0 0 0 3px rgba(156, 163, 175, 0.25), 0 4px 16px -2px rgba(156, 163, 175, 0.35), 0 8px 24px -4px rgba(0, 0, 0, 0.12)';
  }
  if (wasExecuted.value && !isExecuting.value) {
    return '0 2px 8px -2px rgba(16, 185, 129, 0.2), inset 0 0 0 1px rgba(16, 185, 129, 0.15)';
  }
  return isDark.value ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)';
});

</script>
