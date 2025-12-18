<template>
  <aside
    :class="cn(
      'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-80'
    )"
  >
    <nav class="flex h-full flex-col p-4">
      <!-- Header -->
      <div class="mb-4 flex items-center gap-2">
        <button
          @click="$emit('toggle')"
          class="flex h-8 w-8 items-center justify-center rounded-md p-2 interactive flex-shrink-0"
          :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <PanelLeftOpen v-if="collapsed" class="h-4 w-4" />
          <PanelLeftClose v-else class="h-4 w-4" />
        </button>
        <span v-if="!collapsed" class="text-base font-semibold truncate">
          Blocos
        </span>
      </div>

      <!-- Scrollable Content Container -->
      <ScrollArea v-if="!collapsed" class="flex-1">
        <div class="flex flex-col gap-2 p-2">
          <!-- Search Bar -->
          <div class="pb-2">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar blocos..."
                class="pl-9"
              />
            </div>
          </div>

          <!-- Blocks List -->
          <div class="space-y-1">
            <div
              v-for="block in filteredBlocks"
              :key="block.key"
              draggable="true"
              @dragstart="handleDragStart($event, block)"
              @click="handleBlockClick(block)"
              class="flex items-start gap-2 rounded-md p-2 cursor-move interactive hover:bg-muted/50"
            >
              <div :class="cn('flex-shrink-0 rounded-md p-1.5', block.colorClass)">
                <component :is="block.icon" class="h-4 w-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium leading-tight">{{ block.label }}</p>
                <p class="text-xs text-muted-foreground leading-tight mt-0.5">{{ block.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <!-- Collapsed Blocks -->
      <div v-else class="flex-1 space-y-1">
        <button
          v-for="block in blocks"
          :key="block.key"
          draggable="true"
          @dragstart="handleDragStart($event, block)"
          @click="handleBlockClick(block)"
          :title="block.label"
          :class="cn('flex h-8 w-8 items-center justify-center rounded-md p-1.5 interactive cursor-move', block.colorClass)"
        >
          <component :is="block.icon" class="h-4 w-4" />
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Zap, 
  ZapOff,
  Mail,
  Phone,
  CheckSquare,
  Workflow,
  StickyNote
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Props {
  collapsed: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  'block-click': [block: any];
}>();

const searchQuery = ref('');

const blocks = [
  {
    key: 'start',
    label: 'Início',
    description: 'Ponto de partida do fluxo',
    icon: h(Zap),
    colorClass: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 dark:text-[hsl(var(--primary))]',
  },
  {
    key: 'end',
    label: 'Fim',
    description: 'Encerrar o fluxo',
    icon: h(ZapOff),
    colorClass: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500',
  },
  {
    key: 'email',
    label: 'E-mail',
    description: 'Enviar e-mail ao contato',
    icon: h(Mail),
    colorClass: 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]',
  },
  {
    key: 'message',
    label: 'Mensagem',
    description: 'Enviar mensagem WhatsApp',
    icon: h(MessageSquare),
    colorClass: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/20 dark:text-[hsl(var(--success))]',
  },
  {
    key: 'call',
    label: 'Ligação',
    description: 'Registrar ligação telefônica',
    icon: h(Phone),
    colorClass: 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/20 dark:text-teal-500',
  },
  {
    key: 'action',
    label: 'Ação',
    description: 'Executar ação do sistema',
    icon: h(Sparkles),
    colorClass: 'bg-[hsl(var(--primary-lighten-1))]/10 text-[hsl(var(--primary-lighten-1))] dark:bg-[hsl(var(--primary-lighten-1))]/20 dark:text-[hsl(var(--primary-lighten-1))]',
  },
  {
    key: 'task',
    label: 'Tarefa',
    description: 'Criar tarefa para um agente',
    icon: h(CheckSquare),
    colorClass: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-500',
  },
  {
    key: 'wait',
    label: 'Espera',
    description: 'Aguardar tempo ou condição',
    icon: h(Clock),
    colorClass: 'bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))] dark:bg-[hsl(var(--secondary))]/20 dark:text-[hsl(var(--secondary))]',
  },
  {
    key: 'chat_flow',
    label: 'Fluxo de Atendimento',
    description: 'Disparar um fluxo de atendimento',
    icon: h(Workflow),
    colorClass: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 dark:text-[hsl(var(--primary))]',
  },
  {
    key: 'note',
    label: 'Nota',
    description: 'Adicionar anotação no fluxo',
    icon: h(StickyNote),
    colorClass: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  },
];

const filteredBlocks = computed(() => {
  if (!searchQuery.value) return blocks;
  
  const query = searchQuery.value.toLowerCase();
  return blocks.filter(
    (block) =>
      block.label.toLowerCase().includes(query) ||
      block.description.toLowerCase().includes(query)
  );
});

function handleBlockClick(block: any) {
  emit('block-click', block);
}

function handleDragStart(event: DragEvent, block: any) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/vueflow', JSON.stringify(block));
    event.dataTransfer.setData('text/plain', block.key);
  }
}
</script>
