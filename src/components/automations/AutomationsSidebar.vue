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
          @click="$emit('toggle-collapse')"
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
        <div class="flex flex-col gap-4 p-2">
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

          <!-- Gatilhos Section - OCULTA -->
          <!-- <div v-if="triggerBlocks.length > 0" class="space-y-2">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">Gatilhos</p>
            <div class="space-y-1">
              <div
                v-for="block in triggerBlocks"
                :key="block.type"
                draggable="true"
                @dragstart="handleDragStart($event, block)"
                class="flex items-start gap-2 rounded-md p-2 cursor-move interactive hover:bg-muted/50 border border-dashed border-primary/30"
              >
                <div 
                  class="flex-shrink-0 rounded-md p-1.5"
                  :style="{ backgroundColor: block.color + '20', color: block.color }"
                >
                  <component :is="getIcon(block.icon)" class="h-4 w-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium leading-tight">{{ block.label }}</p>
                  <p class="text-xs text-muted-foreground leading-tight mt-0.5">{{ block.description }}</p>
                </div>
              </div>
            </div>
          </div> -->

          <!-- Blocos (sem separação de seção) -->
          <div v-if="actionBlocks.length > 0" class="space-y-1">
            <div
              v-for="block in actionBlocks"
              :key="block.type"
              draggable="true"
              @dragstart="handleDragStart($event, block)"
              class="flex items-start gap-2 rounded-md p-2 cursor-move interactive hover:bg-muted/50"
            >
              <div 
                class="flex-shrink-0 rounded-md p-1.5"
                :style="{ backgroundColor: block.color + '20', color: block.color }"
              >
                <component :is="getIcon(block.icon)" class="h-4 w-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium leading-tight">{{ block.label }}</p>
                <p class="text-xs text-muted-foreground leading-tight mt-0.5">{{ block.description }}</p>
              </div>
            </div>
          </div>

          <!-- Empty state if no blocks for this trigger -->
          <div 
            v-if="filteredBlocks.length === 0 && searchQuery"
            class="text-center py-8 text-sm text-muted-foreground"
          >
            <p>Nenhum bloco encontrado</p>
          </div>

          <!-- Fixed Blocks: Fim - OCULTA -->
          <!-- <div class="space-y-1 mt-2">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">Fim</p>
            <div class="flex items-start gap-2 rounded-md p-2 opacity-50 cursor-not-allowed">
              <div class="flex-shrink-0 rounded-md p-1.5 bg-red-500/10 text-red-500">
                <ZapOff class="h-4 w-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium leading-tight">Fim</p>
                <p class="text-xs text-muted-foreground leading-tight mt-0.5">Já adicionado</p>
              </div>
            </div>
          </div> -->
        </div>
      </ScrollArea>

      <!-- Collapsed Blocks -->
      <div v-else class="flex-1 space-y-1">
        <!-- Draggable blocks -->
        <button
          v-for="block in availableBlocks"
          :key="block.type"
          draggable="true"
          @dragstart="handleDragStart($event, block)"
          :title="block.label"
          class="flex h-8 w-8 items-center justify-center rounded-md p-1.5 interactive cursor-move"
          :style="{ backgroundColor: block.color + '20', color: block.color }"
        >
          <component :is="getIcon(block.icon)" class="h-4 w-4" />
        </button>
        
        <!-- Fim (disabled) - OCULTA -->
        <!-- <div class="flex h-8 w-8 items-center justify-center rounded-md p-1.5 opacity-50 cursor-not-allowed bg-red-500/10 text-red-500" title="Fim">
          <ZapOff class="h-4 w-4" />
        </div> -->
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PanelLeftClose, PanelLeftOpen, Search, CalendarOff, Clock, MessageSquare, MessageSquarePlus, CheckCircle2, HelpCircle, Sparkles, Calendar, Play, CalendarClock, Workflow, ListTodo } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  AUTOMATION_BLOCKS,
  getDefaultBlockData,
  type AutomationTrigger,
  type AutomationBlockType 
} from '@/types/automation';

interface Props {
  collapsed: boolean;
  triggerType: AutomationTrigger;
}

const props = defineProps<Props>();

defineEmits<{
  'toggle-collapse': [];
}>();

const searchQuery = ref('');

const availableBlocks = computed(() => {
  const blocks = AUTOMATION_BLOCKS[props.triggerType];
  // If specific trigger has no blocks defined, use fluxo_unificado blocks
  if (!blocks || blocks.length === 0) {
    return AUTOMATION_BLOCKS.fluxo_unificado || [];
  }
  return blocks;
});



const actionBlocks = computed(() => {
  const blocks = availableBlocks.value.filter(b => !b.type.startsWith('trigger_'));
  if (!searchQuery.value) return blocks;
  const query = searchQuery.value.toLowerCase();
  return blocks.filter(b => b.label.toLowerCase().includes(query) || b.description.toLowerCase().includes(query));
});

const filteredBlocks = computed(() => {
  if (!searchQuery.value) return availableBlocks.value;
  
  const query = searchQuery.value.toLowerCase();
  return availableBlocks.value.filter(
    (block) =>
      block.label.toLowerCase().includes(query) ||
      block.description.toLowerCase().includes(query)
  );
});

const ICON_MAP: Record<string, any> = {
  CalendarOff,
  Clock,
  MessageSquare,
  MessageSquarePlus,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Calendar,
  Play,
  CalendarClock,
  Workflow,
  ListTodo,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] || Clock;
}

function handleDragStart(event: DragEvent, block: any) {
  if (!event.dataTransfer) return;
  
  const blockData = getDefaultBlockData(block.type as AutomationBlockType);
  
  // Use same data format as FlowBuilderChatSidebar
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('application/vueflow', JSON.stringify({
    key: block.type,
    ...block,
    data: blockData,
  }));
  event.dataTransfer.setData('text/plain', block.type);
}
</script>
