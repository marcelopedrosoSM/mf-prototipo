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
          class="flex h-10 w-10 items-center justify-center rounded-md p-2 interactive flex-shrink-0"
          :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <PanelLeftOpen v-if="collapsed" class="h-4 w-4" />
          <PanelLeftClose v-else class="h-4 w-4" />
        </button>
        <span v-if="!collapsed" class="text-base font-semibold truncate">
          Blocos Disponíveis
        </span>
      </div>

      <!-- Scrollable Content Container (usando ScrollArea como em /conversations) -->
      <ScrollArea v-if="!collapsed" class="flex-1">
        <div class="flex flex-col gap-2 p-2">
          <!-- Search Bar -->
          <div class="pb-2">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar blocos..."
                class="w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
import { PanelLeftClose, PanelLeftOpen, Search, Zap, MessageSquare, HelpCircle, GitBranch, Sparkles, Globe, Clock, StickyNote } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  collapsed: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  'block-click': [block: any];
}>();

const searchQuery = ref('');

const blocks = [
  {
    key: 'trigger',
    label: 'Gatilho',
    description: 'Define quando o fluxo será executado',
    icon: h(Zap),
    colorClass: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  },
  {
    key: 'message',
    label: 'Mensagem',
    description: 'Enviar mensagem ao contato',
    icon: h(MessageSquare),
    colorClass: 'bg-info/10 text-info dark:bg-info/20 dark:text-info',
  },
  {
    key: 'question',
    label: 'Pergunta',
    description: 'Fazer pergunta e salvar resposta (texto livre ou múltipla escolha)',
    icon: h(HelpCircle),
    colorClass: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  },
  {
    key: 'decision',
    label: 'Decisão',
    description: 'Avaliar condição e seguir diferentes caminhos',
    icon: h(GitBranch),
    colorClass: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  },
  {
    key: 'action',
    label: 'Ação',
    description: 'Executar ação do sistema',
    icon: h(Sparkles),
    colorClass: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  },
  {
    key: 'integration',
    label: 'Integração',
    description: 'Chamada HTTP para API',
    icon: h(Globe),
    colorClass: 'bg-info/10 text-info dark:bg-info/20 dark:text-info',
  },
  {
    key: 'wait',
    label: 'Espera',
    description: 'Pausar execução',
    icon: h(Clock),
    colorClass: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
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

