<template>
  <aside
    :class="cn(
      'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-80'
    )"
  >
    <nav class="flex h-full flex-col p-4">
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            @click="$emit('toggle')"
            class="flex h-8 w-8 items-center justify-center rounded-md p-2 interactive flex-shrink-0"
            :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
          >
            <PanelLeftOpen v-if="collapsed" class="h-4 w-4" />
            <PanelLeftClose v-else class="h-4 w-4" />
          </button>
          <span v-if="!collapsed" class="text-base font-semibold truncate">
            Execuções
          </span>
        </div>
        <Button 
          v-if="!collapsed"
          variant="ghost" 
          size="sm"
          @click="$emit('exit')"
        >
          Sair
        </Button>
      </div>

      <!-- Content when expanded -->
      <template v-if="!collapsed">
        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por ID ou contato..."
              class="pl-9"
            />
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" class="flex-1" @click="handleRefresh">
            <RefreshCw class="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <!-- Executions List -->
        <ScrollArea class="flex-1">
          <div v-if="groupedExecutions.length === 0" class="text-center py-8 text-muted-foreground">
            <Play class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">Nenhuma execução encontrada</p>
          </div>
          
          <Accordion type="multiple" :default-value="['running', 'completed']" class="space-y-2">
            <AccordionItem 
              v-for="group in groupedExecutions" 
              :key="group.status" 
              :value="group.status"
              class="border-none"
            >
              <AccordionTrigger class="py-2 text-sm font-medium hover:no-underline">
                <div class="flex items-center gap-2">
                  <div 
                    class="h-2 w-2 rounded-full" 
                    :class="statusDotColor(group.status)"
                  />
                  {{ group.label }}
                </div>
              </AccordionTrigger>
              <AccordionContent class="pb-0">
                <div class="space-y-2.5">
                  <div
                    v-for="execution in group.executions"
                    :key="execution.id"
                    @click="handleSelectExecution(execution)"
                    :class="cn(
                      'group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-200',
                      selectedExecutionId === execution.id 
                        ? 'bg-primary/15 border-primary/80 shadow-md' 
                        : 'border-border/60 bg-card hover:border-border hover:bg-accent/60 hover:shadow-sm'
                    )"
                  >
                    <!-- Selected indicator bar -->
                    <div 
                      v-if="selectedExecutionId === execution.id"
                      class="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                    />
                    
                    <div class="p-4">
                      <!-- Header: ID e Status -->
                      <div class="flex items-center justify-between gap-3 mb-3">
                        <div class="flex items-baseline gap-1.5 min-w-0">
                          <span class="text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase">#</span>
                          <span class="text-base font-bold text-foreground tracking-tight">{{ execution.executionNumber }}</span>
                        </div>
                        <Badge 
                          :variant="statusBadgeVariant(execution.status)" 
                          class="text-[10px] px-2 py-0.5 h-5 font-semibold shrink-0 shadow-sm"
                        >
                          {{ statusLabel(execution.status) }}
                        </Badge>
                      </div>

                      <!-- Contact Name -->
                      <div class="mb-3">
                        <p class="text-sm font-semibold text-foreground truncate leading-snug">
                          {{ execution.contactName }}
                        </p>
                      </div>

                      <!-- Divider -->
                      <div class="h-px bg-border/50 mb-3" />

                      <!-- Metadata -->
                      <div class="space-y-2">
                        <!-- Block Info -->
                        <div class="flex items-center gap-2 text-xs text-muted-foreground">
                          <div class="flex items-center justify-center h-4 w-4 rounded bg-muted/50">
                            <MessageSquare class="h-2.5 w-2.5" />
                          </div>
                          <span class="truncate font-medium">{{ execution.currentBlockTitle || 'Início' }}</span>
                        </div>

                        <!-- Time Info -->
                        <div class="flex items-center gap-2 text-xs text-muted-foreground">
                          <div class="flex items-center justify-center h-4 w-4 rounded bg-muted/50">
                            <Clock class="h-2.5 w-2.5" />
                          </div>
                          <span class="font-medium">{{ formatRelativeTime(execution.startedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </template>

      <!-- Collapsed State -->
      <div v-else class="flex-1 flex flex-col items-center gap-2">
        <button
          v-for="group in groupedExecutions"
          :key="group.status"
          :title="`${group.label}`"
          :class="cn(
            'flex h-8 w-8 items-center justify-center rounded-md p-1.5 interactive',
            statusBgColor(group.status)
          )"
        >
          <span class="text-xs font-bold">{{ group.executions.length }}</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search,
  RefreshCw,
  Clock,
  MessageSquare,
  Play
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useExecutionsStore } from '@/stores/executions';
import type { FlowExecution, ExecutionStatus } from '@/types/execution';

interface Props {
  collapsed: boolean;
  flowId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  exit: [];
  'select-execution': [execution: FlowExecution];
}>();

const executionsStore = useExecutionsStore();
const searchQuery = ref('');

const selectedExecutionId = computed(() => executionsStore.selectedExecutionId);

const groupedExecutions = computed(() => {
  const groups = executionsStore.getGroupedExecutions(props.flowId);
  
  if (!searchQuery.value) return groups;
  
  const query = searchQuery.value.toLowerCase();
  return groups.map(group => ({
    ...group,
    executions: group.executions.filter(e => 
      e.executionNumber.toString().includes(query) ||
      e.contactName.toLowerCase().includes(query)
    )
  })).filter(g => g.executions.length > 0);
});

const handleSelectExecution = (execution: FlowExecution) => {
  executionsStore.selectExecution(execution.id);
  emit('select-execution', execution);
};

const handleRefresh = () => {
  // In a real app, this would reload from API
  console.log('Refreshing executions...');
};

const statusDotColor = (status: ExecutionStatus) => {
  switch (status) {
    case 'running': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    case 'error': return 'bg-red-500';
    case 'paused': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const statusBgColor = (status: ExecutionStatus) => {
  switch (status) {
    case 'running': return 'bg-blue-500/10 text-blue-500';
    case 'completed': return 'bg-green-500/10 text-green-500';
    case 'error': return 'bg-red-500/10 text-red-500';
    case 'paused': return 'bg-yellow-500/10 text-yellow-500';
    default: return 'bg-gray-500/10 text-gray-500';
  }
};

const statusBadgeVariant = (status: ExecutionStatus) => {
  switch (status) {
    case 'running': return 'secondary' as const;
    case 'completed': return 'default' as const;
    case 'error': return 'destructive' as const;
    case 'paused': return 'outline' as const;
    default: return 'secondary' as const;
  }
};

const statusLabel = (status: ExecutionStatus) => {
  switch (status) {
    case 'running': return 'Em Andamento';
    case 'completed': return 'Concluída';
    case 'error': return 'Erro';
    case 'paused': return 'Pausada';
    default: return status;
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
};
</script>
