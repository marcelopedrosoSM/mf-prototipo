<template>
  <div class="space-y-6">
    <!-- Summary Metrics -->
    <div class="grid grid-cols-4 gap-4">
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Users class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ metrics.activeContacts }}</p>
            <p class="text-xs text-muted-foreground">Contatos Ativos</p>
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 class="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ metrics.completionRate }}%</p>
            <p class="text-xs text-muted-foreground">Taxa de Conclusão</p>
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Clock class="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ metrics.avgDuration }}</p>
            <p class="text-xs text-muted-foreground">Tempo Médio</p>
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <TrendingDown class="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ metrics.dropoffRate }}%</p>
            <p class="text-xs text-muted-foreground">Taxa de Abandono</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Status Breakdown -->
    <Card class="p-4">
      <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
        <BarChart3 class="h-4 w-4" />
        Detalhamento por Status
      </h3>
      
      <div class="space-y-3">
        <!-- Ativos -->
        <Collapsible v-model:open="expandedSections.active">
          <CollapsibleTrigger class="w-full">
            <div class="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Users class="h-4 w-4 text-blue-600" />
                </div>
                <div class="text-left">
                  <p class="font-medium text-blue-900 dark:text-blue-100">Ativos</p>
                  <p class="text-xs text-blue-600 dark:text-blue-400">Contatos em execução no fluxo</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-blue-600">{{ statusBreakdown.active }}</span>
                <ChevronDown v-if="!expandedSections.active" class="h-5 w-5 text-blue-600" />
                <ChevronUp v-else class="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="mt-2 ml-4 space-y-2">
              <div 
                v-for="contact in contactsByStatus.active" 
                :key="contact.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">{{ getInitials(contact.name) }}</AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ contact.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ contact.phone }}</p>
                </div>
                <Badge variant="outline" class="text-xs">{{ contact.entryDate }}</Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <!-- Concluídos -->
        <Collapsible v-model:open="expandedSections.completed">
          <CollapsibleTrigger class="w-full">
            <div class="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                  <CheckCircle2 class="h-4 w-4 text-green-600" />
                </div>
                <div class="text-left">
                  <p class="font-medium text-green-900 dark:text-green-100">Concluídos</p>
                  <p class="text-xs text-green-600 dark:text-green-400">Finalizaram todas as etapas</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-green-600">{{ statusBreakdown.completed }}</span>
                <ChevronDown v-if="!expandedSections.completed" class="h-5 w-5 text-green-600" />
                <ChevronUp v-else class="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="mt-2 ml-4 space-y-2">
              <div 
                v-for="contact in contactsByStatus.completed" 
                :key="contact.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">{{ getInitials(contact.name) }}</AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ contact.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ contact.phone }}</p>
                </div>
                <Badge variant="outline" class="text-xs">{{ contact.entryDate }}</Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <!-- Abandonados -->
        <Collapsible v-model:open="expandedSections.dropped">
          <CollapsibleTrigger class="w-full">
            <div class="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                  <TrendingDown class="h-4 w-4 text-orange-600" />
                </div>
                <div class="text-left">
                  <p class="font-medium text-orange-900 dark:text-orange-100">Abandonados</p>
                  <p class="text-xs text-orange-600 dark:text-orange-400">Saíram antes de concluir</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-orange-600">{{ statusBreakdown.dropped }}</span>
                <ChevronDown v-if="!expandedSections.dropped" class="h-5 w-5 text-orange-600" />
                <ChevronUp v-else class="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="mt-2 ml-4 space-y-2">
              <div 
                v-for="contact in contactsByStatus.dropped" 
                :key="contact.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">{{ getInitials(contact.name) }}</AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ contact.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ contact.phone }}</p>
                </div>
                <Badge variant="outline" class="text-xs">{{ contact.entryDate }}</Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <!-- Pausados -->
        <Collapsible v-model:open="expandedSections.paused">
          <CollapsibleTrigger class="w-full">
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <PauseCircle class="h-4 w-4 text-slate-600" />
                </div>
                <div class="text-left">
                  <p class="font-medium text-slate-900 dark:text-slate-100">Pausados</p>
                  <p class="text-xs text-slate-600 dark:text-slate-400">Execução temporariamente suspensa</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-slate-600">{{ statusBreakdown.paused }}</span>
                <ChevronDown v-if="!expandedSections.paused" class="h-5 w-5 text-slate-600" />
                <ChevronUp v-else class="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="mt-2 ml-4 space-y-2">
              <div 
                v-for="contact in contactsByStatus.paused" 
                :key="contact.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">{{ getInitials(contact.name) }}</AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ contact.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ contact.phone }}</p>
                </div>
                <Badge variant="outline" class="text-xs">{{ contact.entryDate }}</Badge>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <!-- Total -->
      <div class="mt-4 pt-4 border-t flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Total de contatos no fluxo</span>
        <span class="text-lg font-bold">{{ statusBreakdown.total }}</span>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  BarChart3,
  PauseCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Flow } from '@/mocks/data/flows';

interface Props {
  flow: Flow;
}

const props = defineProps<Props>();

// Track expanded sections
const expandedSections = ref<Record<string, boolean>>({
  active: false,
  completed: false,
  dropped: false,
  paused: false,
});

// Mock metrics based on flow
const metrics = computed(() => ({
  activeContacts: props.flow.metrics?.activeCount || 0,
  completionRate: props.flow.metrics?.conversionRate || 0,
  avgDuration: '3,2 dias',
  dropoffRate: 12,
}));

// Mock contacts by status
const contactsByStatus = computed(() => ({
  active: [
    { id: '1', name: 'Ana Souza', phone: '(11) 99999-1234', entryDate: 'há 2 horas' },
    { id: '2', name: 'João Silva', phone: '(11) 98888-5678', entryDate: 'há 1 dia' },
    { id: '3', name: 'Maria Costa', phone: '(21) 97777-9012', entryDate: 'há 3 dias' },
  ],
  completed: [
    { id: '4', name: 'Pedro Lima', phone: '(11) 96666-3456', entryDate: 'há 5 dias' },
    { id: '5', name: 'Fernanda Oliveira', phone: '(31) 95555-7890', entryDate: 'há 8 dias' },
    { id: '6', name: 'Roberto Alves', phone: '(21) 94444-1234', entryDate: 'há 10 dias' },
    { id: '7', name: 'Carla Mendes', phone: '(11) 93333-5678', entryDate: 'há 12 dias' },
    { id: '8', name: 'Lucas Santos', phone: '(41) 92222-9012', entryDate: 'há 15 dias' },
  ],
  dropped: [
    { id: '9', name: 'Juliana Rocha', phone: '(11) 91111-3456', entryDate: 'há 4 dias' },
    { id: '10', name: 'Marcos Pereira', phone: '(21) 90000-7890', entryDate: 'há 7 dias' },
  ],
  paused: [
    { id: '11', name: 'Patricia Dias', phone: '(31) 89999-1234', entryDate: 'há 6 dias' },
  ],
}));

// Status breakdown with counts
const statusBreakdown = computed(() => {
  const active = contactsByStatus.value.active.length;
  const completed = contactsByStatus.value.completed.length;
  const dropped = contactsByStatus.value.dropped.length;
  const paused = contactsByStatus.value.paused.length;
  
  return {
    active,
    completed,
    dropped,
    paused,
    total: active + completed + dropped + paused,
  };
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
</script>
