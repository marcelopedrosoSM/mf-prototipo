<template>
  <div class="h-full bg-background flex flex-col w-full overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b flex items-center justify-between shrink-0 bg-card">
      <div class="flex items-center gap-2">
        <ListOrdered class="h-5 w-5 text-primary" />
        <span class="font-semibold text-sm">Simulador de Atividades</span>
        <Badge v-if="simulator.state.value !== 'idle'" :variant="statusBadgeVariant">
          {{ statusText }}
        </Badge>
      </div>
      <Button variant="ghost" size="icon" class="h-7 w-7" @click="$emit('close')" title="Fechar">
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- Progress Bar -->
    <div v-if="simulator.steps.value.length > 0" class="h-1 bg-muted shrink-0">
      <div 
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${simulator.progress.value}%` }"
      />
    </div>

    <!-- Timeline Content -->
    <ScrollArea class="flex-1">
      <div class="p-4">
        <!-- Empty State -->
        <div 
          v-if="simulator.steps.value.length === 0 && simulator.state.value === 'idle'"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Play class="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 class="font-medium mb-1">Pronto para simular</h3>
          <p class="text-sm text-muted-foreground mb-4 max-w-[200px]">
            Clique em iniciar para ver a execução do fluxo de atividades passo a passo
          </p>
          <Button 
            @click="handleStart" 
            :disabled="!hasStart"
          >
            <Play class="h-4 w-4 mr-2" />
            Iniciar Simulação
          </Button>
          <p v-if="!hasStart" class="text-xs text-destructive mt-2">
            Adicione um bloco de Início para iniciar
          </p>
        </div>

        <!-- Timeline List -->
        <div v-else class="space-y-1">
          <ActivityTimelineItem
            v-for="(step, index) in simulator.steps.value"
            :key="step.id"
            :step="step"
            :is-active="index === simulator.currentStepIndex.value"
            :is-last="index === simulator.steps.value.length - 1"
            @click="handleStepClick(index)"
            @skip-wait="simulator.skipWait"
          />
        </div>

        <!-- Completion Summary -->
        <div 
          v-if="simulator.isCompleted.value"
          class="mt-6 p-4 rounded-lg border bg-success/10 text-center"
        >
          <CheckCircle2 class="h-8 w-8 text-success mx-auto mb-2" />
          <h3 class="font-medium text-success mb-1">Simulação Concluída!</h3>
          <p class="text-sm text-muted-foreground mb-3">
            {{ completedStepsCount }} de {{ simulator.steps.value.length }} atividades executadas
          </p>
          <Button variant="outline" size="sm" @click="handleReset">
            <RotateCcw class="h-4 w-4 mr-2" />
            Simular Novamente
          </Button>
        </div>
      </div>
    </ScrollArea>

    <!-- Control Bar -->
    <div class="px-4 py-3 border-t bg-muted/20 shrink-0">
      <div class="flex items-center justify-center gap-2">
        <!-- Previous -->
        <Button 
          variant="outline" 
          size="icon" 
          class="h-9 w-9"
          :disabled="!simulator.canGoPrevious.value"
          @click="simulator.previousStep"
          title="Anterior"
        >
          <SkipBack class="h-4 w-4" />
        </Button>

        <!-- Play/Pause/Reset -->
        <template v-if="simulator.state.value === 'idle' || simulator.state.value === 'completed'">
          <Button 
            size="icon" 
            class="h-10 w-10"
            :disabled="!hasStart"
            @click="handleStart"
            title="Iniciar"
          >
            <Play class="h-5 w-5" />
          </Button>
        </template>
        <template v-else-if="simulator.isRunning.value">
          <Button 
            size="icon" 
            class="h-10 w-10"
            @click="simulator.pause"
            title="Pausar"
          >
            <Pause class="h-5 w-5" />
          </Button>
        </template>
        <template v-else>
          <Button 
            size="icon" 
            class="h-10 w-10"
            @click="simulator.resume"
            title="Continuar"
          >
            <Play class="h-5 w-5" />
          </Button>
        </template>

        <!-- Next -->
        <Button 
          variant="outline" 
          size="icon" 
          class="h-9 w-9"
          :disabled="!simulator.canGoNext.value || simulator.isRunning.value"
          @click="handleNextStep"
          title="Próximo"
        >
          <SkipForward class="h-4 w-4" />
        </Button>

        <!-- Reset -->
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-9 w-9 ml-2"
          :disabled="simulator.state.value === 'idle'"
          @click="handleReset"
          title="Reiniciar"
        >
          <RotateCcw class="h-4 w-4" />
        </Button>
      </div>

      <!-- Step Counter -->
      <div v-if="simulator.steps.value.length > 0" class="text-center mt-2 text-xs text-muted-foreground">
        Passo {{ Math.max(0, simulator.currentStepIndex.value + 1) }} de {{ simulator.steps.value.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import type { CustomNodeData } from '@/types/flow-builder';
import { 
  ListOrdered, 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  CheckCircle2,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ActivityTimelineItem from './ActivityTimelineItem.vue';
import { useActivitySimulator } from '@/composables/useActivitySimulator';

const props = defineProps<{
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
}>();

const emit = defineEmits<{
  close: [];
  'block-execute': [blockId: string];
  'block-complete': [blockId: string];
  'flow-complete': [];
}>();

// Create refs from props
const nodesRef = toRef(props, 'nodes');
const edgesRef = toRef(props, 'edges');

// Initialize simulator
const simulator = useActivitySimulator({
  nodes: nodesRef,
  edges: edgesRef,
  onBlockExecute: (blockId) => emit('block-execute', blockId),
  onBlockComplete: (blockId) => emit('block-complete', blockId),
  onFlowComplete: () => emit('flow-complete'),
  stepDelay: 800,
});

// Computed
const hasStart = computed(() => {
  return props.nodes.some(n => n.data.type === 'start');
});

const statusText = computed(() => {
  switch (simulator.state.value) {
    case 'running': return 'Executando';
    case 'paused': return 'Pausado';
    case 'completed': return 'Concluído';
    default: return '';
  }
});

const statusBadgeVariant = computed(() => {
  switch (simulator.state.value) {
    case 'running': return 'default';
    case 'paused': return 'secondary';
    case 'completed': return 'outline';
    default: return 'secondary';
  }
});

const completedStepsCount = computed(() => {
  return simulator.steps.value.filter(s => s.status === 'completed' || s.status === 'skipped').length;
});

// Handlers
const handleStart = () => {
  simulator.start();
};

const handleReset = () => {
  simulator.reset();
};

const handleNextStep = async () => {
  await simulator.nextStep();
};

const handleStepClick = (index: number) => {
  // Allow clicking to go to a specific step when paused
  if (simulator.state.value === 'paused' || simulator.state.value === 'idle') {
    simulator.goToStep(index);
  }
};
</script>
