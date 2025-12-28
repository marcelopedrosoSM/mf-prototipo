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

      <!-- Scrollable Content Container (usando ScrollArea como em /conversations) -->
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
import { PanelLeftClose, PanelLeftOpen, Search, MessageSquare, HelpCircle, Split, Sparkles, Globe, Clock, StickyNote } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Props {
  collapsed: boolean;
  flowType?: 'atendimento' | 'atividades';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  'block-click': [block: any];
}>();

const searchQuery = ref('');

const blocks = [
  // Início e Fim ocultos - sempre existem no canvas
  // {
  //   key: 'start',
  //   label: 'Início',
  //   description: 'Ponto de partida do fluxo',
  //   icon: h(Zap),
  //   colorClass: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 dark:text-[hsl(var(--primary))]',
  // },
  // {
  //   key: 'end',
  //   label: 'Fim',
  //   description: 'Encerrar o fluxo',
  //   icon: h(ZapOff),
  //   colorClass: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-500',
  // },
  {
    key: 'message',
    label: 'Mensagem',
    description: 'Enviar mensagem ao contato',
    icon: h(MessageSquare),
    colorClass: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/20 dark:text-[hsl(var(--success))]',
  },
  {
    key: 'question',
    label: 'Pergunta',
    description: 'Fazer pergunta e salvar resposta (texto livre ou múltipla escolha)',
    icon: h(HelpCircle),
    colorClass: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/20 dark:text-[hsl(var(--success))]',
  },
  {
    key: 'decision',
    label: 'Decisão',
    description: 'Avaliar condição e seguir diferentes caminhos',
    icon: h(Split),
    colorClass: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] dark:bg-[hsl(var(--warning))]/20 dark:text-[hsl(var(--warning))]',
  },
  {
    key: 'action',
    label: 'Ação',
    description: 'Executar ação do sistema',
    icon: h(Sparkles),
    colorClass: 'bg-[hsl(var(--primary-lighten-1))]/10 text-[hsl(var(--primary-lighten-1))] dark:bg-[hsl(var(--primary-lighten-1))]/20 dark:text-[hsl(var(--primary-lighten-1))]',
  },
  {
    key: 'integration',
    label: 'Integração',
    description: 'Chamada HTTP para API',
    icon: h(Globe),
    colorClass: 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]',
  },
  {
    key: 'wait',
    label: 'Espera',
    description: 'Pausar execução',
    icon: h(Clock),
    colorClass: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-500',
  },
  {
    key: 'note',
    label: 'Nota',
    description: 'Adicionar anotação ou comentário no fluxo',
    icon: h(StickyNote),
    colorClass: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  },
];

const filteredBlocks = computed(() => {
  let filtered = blocks;

  // Filtrar blocos baseados no tipo do fluxo
  if (props.flowType === 'atendimento') {
    filtered = filtered.filter(b => 
      !['condition_holiday', 'condition_weekday', 'condition_time_range'].includes(b.key)
    );
  }

  if (!searchQuery.value) return filtered;
  
  const query = searchQuery.value.toLowerCase();
  return filtered.filter(
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

