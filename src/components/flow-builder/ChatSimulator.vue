<template>
  <div class="h-full bg-background flex flex-col w-full overflow-hidden">
    <!-- Unified Header -->
    <div class="px-3 py-2 border-b flex items-center justify-between shrink-0 bg-card">
      <div class="flex items-center gap-2">
        <MessageSquare class="h-4 w-4 text-primary" />
        <h3 class="font-semibold text-sm leading-none">Simulação do Fluxo</h3>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon" class="h-7 w-7" @click="$emit('close')" title="Fechar">
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Main Content Area (Split) -->
    <div class="flex-1 flex min-h-0">
      <!-- Chat Area (Left) -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Messages -->
        <ScrollArea ref="scrollAreaRef" class="flex-1 p-4">
          <div class="space-y-4 pr-4" ref="messagesContainerRef">
            <!-- Empty State -->
            <div v-if="simulator.messages.value.filter((m) => m.type !== 'system').length === 0" class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Play class="h-8 w-8 text-primary" />
              </div>
              <p class="text-xs text-muted-foreground max-w-[200px]">
                Clique no botão abaixo para iniciar a simulação
              </p>
              <Button 
                class="mt-4" 
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

            <!-- Messages List -->
            <template v-else>
              <ChatMessage 
                v-for="message in simulator.messages.value" 
                :key="message.id" 
                :message="message"
                :show-timestamp="false"
              />
              
              <!-- Typing Indicator -->
              <div v-if="simulator.isRunning.value" class="flex items-center gap-2">
                <div class="animate-pulse flex items-center gap-1 p-2 bg-muted rounded-lg">
                  <div class="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </template>
            
            <!-- Scroll anchor -->
            <div ref="messagesEndRef"></div>
          </div>
        </ScrollArea>

        <!-- Input Area -->
        <div class="p-4 border-t bg-muted/20 shrink-0">
          <div v-if="simulator.isCompleted.value" class="text-center py-2">
            <Button 
              variant="outline" 
              size="sm" 
              class="w-full"
              @click="handleReset"
            >
              <RotateCcw class="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          <div v-else-if="simulator.hasError.value" class="text-center py-2">
            <Badge variant="destructive" class="gap-1">
              <AlertCircle class="h-3 w-3" />
              Erro na simulação
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              class="mt-2 w-full"
              @click="handleReset"
            >
              <RotateCcw class="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          <form v-else-if="simulator.isWaiting.value" @submit.prevent="handleSendMessage" class="flex items-center gap-2">
            <!-- Botão de Anexo -->
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-9 w-9 flex-shrink-0"
              title="Anexar arquivo"
              :disabled="!simulator.isWaiting.value"
            >
              <Paperclip class="h-5 w-5 text-muted-foreground" />
            </Button>

            <!-- Campo de Texto -->
            <Input 
              v-model="userInput"
              placeholder="Digite sua mensagem..."
              class="flex-1"
              :disabled="!simulator.isWaiting.value"
              autofocus
            />

            <!-- Botão de Enviar -->
            <Button 
              type="submit" 
              :disabled="!userInput.trim()"
              class="h-9 px-4"
            >
              Enviar
            </Button>
          </form>

          <div v-else-if="simulator.isIdle.value" class="flex gap-2">
            <Input 
              placeholder="Inicie a simulação para interagir..."
              class="flex-1"
              disabled
            />
            <Button @click="handleStart" :disabled="!hasStart" title="Iniciar Simulação">
              <Play class="h-4 w-4" />
            </Button>
          </div>

          <div v-else class="flex items-center justify-center py-2 text-sm text-muted-foreground">
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Executando...
          </div>
        </div>
      </div>

      <!-- Variables Sidebar (Right) -->
      <div class="w-[300px] border-l flex flex-col bg-muted/10 shrink-0">
        <!-- Removed secondary header -->
        <ScrollArea class="flex-1">
          <div class="p-4 space-y-2">
            <div class="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Variable class="h-3 w-3" />
              VARIÁVEIS
            </div>

            <div 
              v-for="(value, key) in simulator.variables.value" 
              :key="String(key)"
              class="p-3 rounded-lg bg-card border shadow-sm space-y-1"
            >
              <div class="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                {{ key }}
              </div>
              <div class="text-sm font-mono break-all pl-2.5 text-foreground/90">
                {{ value }}
              </div>
            </div>
            
            <div v-if="Object.keys(simulator.variables.value).length === 0" class="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2 opacity-60">
              <p class="text-xs">
                Nenhuma variável definida
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, toRef } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import type { CustomNodeData } from '@/types/flow-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  X, 
  RotateCcw, 
  Play, 
  Variable,
  AlertCircle,
  Loader2,
  Paperclip
} from 'lucide-vue-next';
import ChatMessage from './ChatMessage.vue';
import { useFlowSimulator } from '@/composables/useFlowSimulator';

const props = defineProps<{
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'block-execute', blockId: string): void;
  (e: 'block-complete', blockId: string): void;
  (e: 'flow-complete'): void;
  (e: 'execution-state-change', payload: { 
    path: string[], 
    currentBlockId: string | null,
    hasError: boolean,
    errorBlockId: string | null
  }): void;
}>();

// Refs
const userInput = ref('');
const messagesEndRef = ref<HTMLDivElement | null>(null);
const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null);

// Create refs from props for the composable
const nodesRef = toRef(props, 'nodes');
const edgesRef = toRef(props, 'edges');

// Initialize simulator
const simulator = useFlowSimulator({
  nodes: nodesRef,
  edges: edgesRef,
  onBlockExecute: (blockId) => emit('block-execute', blockId),
  onBlockComplete: (blockId) => emit('block-complete', blockId),
  onFlowComplete: () => emit('flow-complete')
});

// Computed
const hasStart = computed(() => {
  return props.nodes.some(n => n.data.type === 'start');
});

// Watch messages to auto-scroll
watch(() => simulator.messages.value.length, async () => {
  await nextTick();
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' });
  }
});

// Handlers
const handleStart = async () => {
  console.log('[ChatSimulator] handleStart: Iniciando...');
  
  // Aguardar que o Vue renderize o DOM
  await nextTick();
  console.log('[ChatSimulator] handleStart: Após primeiro nextTick');
  
  // Aguardar múltiplos ticks para garantir que o chat está totalmente renderizado
  await nextTick();
  await nextTick();
  console.log('[ChatSimulator] handleStart: Após múltiplos nextTick');
  
  // Verificar se o ScrollArea está visível (sempre existe, mesmo no estado vazio)
  // Aguardar até que o elemento esteja no DOM e visível
  let attempts = 0;
  console.log('[ChatSimulator] handleStart: Iniciando verificação de visibilidade...');
  while (attempts < 15) {
    await nextTick();
    if (scrollAreaRef.value) {
      // Tentar acessar o elemento do ScrollArea
      const scrollAreaEl = scrollAreaRef.value.$el || scrollAreaRef.value;
      if (scrollAreaEl) {
        const rect = scrollAreaEl.getBoundingClientRect();
        console.log(`[ChatSimulator] handleStart: Tentativa ${attempts + 1} - rect:`, rect);
        if (rect.width > 0 && rect.height > 0) {
          console.log('[ChatSimulator] handleStart: Chat está visível!');
          // Chat está visível, aguardar um frame para garantir renderização
          await new Promise(resolve => requestAnimationFrame(resolve));
          console.log('[ChatSimulator] handleStart: Chat pronto!');
          break;
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  console.log('[ChatSimulator] handleStart: Chamando simulator.start()...');
  // Agora que o chat está garantidamente pronto, iniciar o fluxo
  await simulator.start();
  console.log('[ChatSimulator] handleStart: simulator.start() concluído');
};

const handleReset = () => {
  simulator.reset();
  userInput.value = '';
};

const handleSendMessage = () => {
  if (!userInput.value.trim()) return;
  simulator.sendUserMessage(userInput.value.trim());
  userInput.value = '';
};

// Emitir estado de execução para o pai (visual highlighting)
watch([simulator.flowPath, simulator.currentBlockId, simulator.state], ([newPath, newCurrentId, newState]) => {
  emit('execution-state-change', {
    path: [...newPath],
    currentBlockId: newCurrentId,
    hasError: newState === 'ERROR',
    errorBlockId: newState === 'ERROR' ? newCurrentId : null
  });
}, { deep: true });
</script>
