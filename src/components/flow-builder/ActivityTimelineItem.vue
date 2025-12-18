<template>
  <div 
    class="relative flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group"
    :class="[
      step.status === 'running' ? 'bg-primary/10 ring-2 ring-primary' : '',
      step.status === 'completed' ? 'bg-success/5' : '',
      step.status === 'skipped' ? 'bg-muted/50 opacity-60' : '',
      step.status === 'error' ? 'bg-destructive/10' : '',
      step.status === 'pending' ? 'hover:bg-muted/50' : '',
      isActive ? 'ring-2 ring-primary/50' : '',
    ]"
    @click="$emit('click', step)"
  >
    <!-- Timeline Connector -->
    <div class="flex flex-col items-center">
      <!-- Status Icon -->
      <div 
        class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all"
        :class="statusClasses"
      >
        <component :is="statusIcon" class="w-5 h-5" />
      </div>
      
      <!-- Connector Line -->
      <div 
        v-if="!isLast"
        class="w-0.5 flex-1 mt-2 min-h-[20px]"
        :class="step.status === 'completed' || step.status === 'skipped' ? 'bg-success' : 'bg-border'"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 pt-1">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-1">
        <component :is="blockIcon" class="w-4 h-4 flex-shrink-0" :style="{ color: accentColor }" />
        <h4 class="font-medium text-sm truncate">{{ step.title }}</h4>
        
        <!-- Skip Wait Button -->
        <Button 
          v-if="step.type === 'wait' && step.status === 'running'"
          variant="ghost" 
          size="sm"
          class="ml-auto h-6 text-xs"
          @click.stop="$emit('skip-wait')"
        >
          <FastForward class="w-3 h-3 mr-1" />
          Pular
        </Button>
      </div>

      <!-- Description -->
      <p v-if="step.description" class="text-xs text-muted-foreground mb-2 line-clamp-2">
        {{ step.description }}
      </p>

      <!-- Preview (Expandable) -->
      <div 
        v-if="hasPreview"
        class="mt-2 p-2 rounded border bg-muted/30 text-xs space-y-1"
      >
        <!-- Email Preview -->
        <template v-if="step.preview.email">
          <div class="flex gap-2">
            <span class="text-muted-foreground">Para:</span>
            <span class="font-mono">{{ step.preview.email.to }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground">Assunto:</span>
            <span>{{ step.preview.email.subject }}</span>
          </div>
        </template>

        <!-- Call Preview -->
        <template v-if="step.preview.call">
          <div class="flex gap-2">
            <span class="text-muted-foreground">Telefone:</span>
            <span class="font-mono">{{ step.preview.call.phone }}</span>
          </div>
        </template>

        <!-- Task Preview -->
        <template v-if="step.preview.task">
          <div class="flex gap-2">
            <span class="text-muted-foreground">Tarefa:</span>
            <span>{{ step.preview.task.title }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-muted-foreground">Responsável:</span>
            <span>{{ step.preview.task.assignee }}</span>
          </div>
        </template>

        <!-- Wait Preview -->
        <template v-if="step.preview.wait">
          <div class="flex gap-2">
            <span class="text-muted-foreground">Aguardar:</span>
            <span>{{ step.preview.wait.duration }} {{ unitLabel }}</span>
          </div>
        </template>

        <!-- Chat Flow Preview -->
        <template v-if="step.preview.chatFlow">
          <div class="flex gap-2">
            <span class="text-muted-foreground">Fluxo:</span>
            <span>{{ step.preview.chatFlow.flowName }}</span>
          </div>
        </template>
      </div>

      <!-- Timestamp -->
      <div v-if="step.completedAt" class="mt-2 text-[10px] text-muted-foreground">
        {{ step.status === 'skipped' ? 'Pulado' : 'Concluído' }} às {{ formatTime(step.completedAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Check, 
  Circle, 
  Loader2, 
  AlertCircle, 
  FastForward,
  Mail,
  Phone,
  CheckSquare,
  Workflow,
  MessageSquare,
  Clock,
  Zap,
  ZapOff,
  Sparkles,
  StickyNote,
  SkipForward,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { ActivityStep } from '@/composables/useActivitySimulator';
import { BLOCK_COLORS } from '@/types/flow-builder';

const props = defineProps<{
  step: ActivityStep;
  isActive?: boolean;
  isLast?: boolean;
}>();

defineEmits<{
  click: [step: ActivityStep];
  'skip-wait': [];
}>();

// Icon mapping
const BLOCK_ICONS: Record<string, any> = {
  message: MessageSquare,
  email: Mail,
  call: Phone,
  task: CheckSquare,
  chat_flow: Workflow,
  wait: Clock,
  start: Zap,
  end: ZapOff,
  action: Sparkles,
  note: StickyNote,
};

const blockIcon = computed(() => BLOCK_ICONS[props.step.type] || Circle);

const accentColor = computed(() => BLOCK_COLORS[props.step.type] || BLOCK_COLORS.message);

const statusIcon = computed(() => {
  switch (props.step.status) {
    case 'completed': return Check;
    case 'running': return Loader2;
    case 'error': return AlertCircle;
    case 'skipped': return SkipForward;
    default: return Circle;
  }
});

const statusClasses = computed(() => {
  switch (props.step.status) {
    case 'completed':
      return 'bg-success text-success-foreground border-success';
    case 'running':
      return 'bg-primary text-primary-foreground border-primary animate-pulse';
    case 'error':
      return 'bg-destructive text-destructive-foreground border-destructive';
    case 'skipped':
      return 'bg-muted text-muted-foreground border-muted-foreground';
    default:
      return 'bg-background text-muted-foreground border-border';
  }
});

const hasPreview = computed(() => {
  const preview = props.step.preview;
  return preview.email || preview.call || preview.task || preview.wait || preview.chatFlow;
});

const unitLabel = computed(() => {
  const unit = props.step.preview.wait?.unit;
  const duration = props.step.preview.wait?.duration || 1;
  
  switch (unit) {
    case 'days': return duration === 1 ? 'dia' : 'dias';
    case 'hours': return duration === 1 ? 'hora' : 'horas';
    case 'minutes': return duration === 1 ? 'minuto' : 'minutos';
    default: return '';
  }
});

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
</script>
