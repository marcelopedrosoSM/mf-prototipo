<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <ScrollArea class="flex-1">
        <div class="p-6">
          <div class="mx-auto max-w-7xl">
            <!-- Header -->
            <div class="mb-6">
              <h1 class="text-2xl font-semibold">Painel</h1>
              <p class="text-sm text-muted-foreground mt-1">
                Visão geral das atividades e conversas
              </p>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Atividades Pendentes"
                :value="stats.pendingActivities"
                :icon="ClipboardList"
                variant="warning"
                :trend="stats.pendingTrend"
                description="Aguardando execução"
              />
              <StatsCard
                title="Conversas Ativas"
                :value="stats.activeConversations"
                :icon="MessageSquare"
                variant="primary"
                :trend="stats.conversationsTrend"
                description="Em andamento agora"
              />
              <StatsCard
                title="Concluídas Hoje"
                :value="stats.completedToday"
                :icon="CheckCircle2"
                variant="success"
                :trend="stats.completedTrend"
                description="Atividades finalizadas"
              />
              <StatsCard
                title="Taxa de Resolução"
                :value="stats.resolutionRate"
                :icon="TrendingUp"
                variant="info"
                format="percentage"
                description="Últimos 7 dias"
              />
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <!-- Volume Chart -->
              <div class="lg:col-span-2">
                <PerformanceChart
                  title="Volume de Interações"
                  subtitle="Últimos 7 dias"
                  :data="interactionData"
                />
              </div>
              
              <!-- Status Distribution -->
              <DonutChart
                title="Distribuição de Status"
                subtitle="Atividades atuais"
                :data="statusDistribution"
              />
            </div>

            <!-- Quick Actions & Recent Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Quick Actions -->
              <Card class="p-6">
                <h3 class="text-sm font-medium text-muted-foreground mb-4">Ações Rápidas</h3>
                <div class="grid grid-cols-2 gap-3">
                  <Button variant="outline" class="h-20 flex-col gap-2" @click="$router.push('/execucao')">
                    <Play class="h-5 w-5" />
                    <span>Modo Execução</span>
                  </Button>
                  <Button variant="outline" class="h-20 flex-col gap-2" @click="$router.push('/conversas')">
                    <MessageSquare class="h-5 w-5" />
                    <span>Conversas</span>
                  </Button>
                  <Button variant="outline" class="h-20 flex-col gap-2" @click="$router.push('/configuracoes/fluxos')">
                    <Workflow class="h-5 w-5" />
                    <span>Fluxos</span>
                  </Button>
                  <Button variant="outline" class="h-20 flex-col gap-2" @click="$router.push('/contatos')">
                    <Users class="h-5 w-5" />
                    <span>Contatos</span>
                  </Button>
                </div>
              </Card>

              <!-- Recent Activity -->
              <Card class="p-6">
                <h3 class="text-sm font-medium text-muted-foreground mb-4">Atividade Recente</h3>
                <div class="space-y-3">
                  <div 
                    v-for="activity in recentActivities" 
                    :key="activity.id"
                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div 
                      class="h-8 w-8 rounded-full flex items-center justify-center"
                      :class="getActivityIconBg(activity.type)"
                    >
                      <component 
                        :is="getActivityIcon(activity.type)" 
                        class="h-4 w-4"
                        :class="getActivityIconColor(activity.type)"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">{{ activity.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
                    </div>
                    <Badge :variant="activity.status === 'completed' ? 'default' : 'secondary'">
                      {{ activity.status === 'completed' ? 'Concluída' : 'Pendente' }}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { 
  ClipboardList, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp,
  Play,
  Workflow,
  Users,
  Mail,
  Phone,
  ListTodo
} from 'lucide-vue-next';
import AppLayout from '@/components/layout/AppLayout.vue';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard.vue';
import PerformanceChart from '@/components/dashboard/PerformanceChart.vue';
import DonutChart from '@/components/dashboard/DonutChart.vue';
import { useActivityStore } from '@/stores/activities';
import { useConversationsStore } from '@/stores/conversations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSeedActivities } from '@/mocks/data/activities';

const activityStore = useActivityStore();
const conversationsStore = useConversationsStore();

// --- Computed Stats ---

const stats = computed(() => {
  const pending = activityStore.pendingCount;
  const activeConvos = conversationsStore.conversations.filter(c => c.status === 'open').length;
  
  // Calculate completed today
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  
  const completedTodayCount = activityStore.completedActivities.filter(a => {
    if (!a.completedAt) return false;
    const date = new Date(a.completedAt);
    return date >= startOfToday;
  }).length;
  
  // Calculate Resolution Rate (Simulated based on completed vs total)
  // In a real app, this would be: completed / (completed + abandoned) or similar
  const totalClosed = activityStore.completedActivities.length;
  const total = activityStore.totalCount;
  const resolutionRate = total > 0 ? Math.round((totalClosed / total) * 100) : 0;

  return {
    pendingActivities: pending,
    pendingTrend: 0, // Need historical data for trend
    activeConversations: activeConvos,
    conversationsTrend: 0,
    completedToday: completedTodayCount,
    completedTrend: 0,
    resolutionRate: resolutionRate,
  };
});

// --- Chart Data ---

// Interaction Volume (Mocked slightly based on dates, but mostly random for prototype lack of history)
// Ideally we would group activities by createdAt date
const interactionData = computed(() => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Create a map of date -> count from actual activities
  const activityCounts: Record<string, number> = {};
  activityStore.activities.forEach(a => {
    const date = new Date(a.createdAt).toDateString(); // Group by day
    activityCounts[date] = (activityCounts[date] || 0) + 1;
  });

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * dayMs);
    const dateStr = d.toDateString();
    
    // Mix real data with some randomness so chart isn't empty on fresh load
    const realCount = activityCounts[dateStr] || 0;
    const baseRandom = Math.floor(Math.random() * 5) + 2; 
    
    return {
      x: d.getTime(),
      y: realCount > 0 ? realCount : baseRandom, 
    };
  });
});

// Status Distribution
const statusDistribution = computed(() => {
  const pending = activityStore.pendingCount;
  const inProgress = activityStore.inProgressActivities.length;
  const completed = activityStore.completedActivities.length;
  
  return [
    { label: 'Pendentes', value: pending, color: 'hsl(45, 93%, 47%)' },
    { label: 'Em Progresso', value: inProgress, color: 'hsl(217, 91%, 60%)' },
    { label: 'Concluídas', value: completed, color: 'hsl(142, 71%, 45%)' },
    // 'Atrasadas' requires date logic, simplifying for now or adding if needed
    { label: 'Total', value: 0, color: 'transparent' } // Placeholder to avoid empty chart logic issues if needed
  ].filter(item => item.value > 0);
});

// --- Recent Activity ---

const recentActivities = computed(() => {
  // Sort activities by createdAt desc
  const sorted = [...activityStore.activities].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Take top 5
  return sorted.slice(0, 5).map(a => ({
    id: a.id,
    title: a.title,
    type: a.type,
    status: a.status,
    time: formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: ptBR })
  }));
});

// --- Icons Helpers ---

const getActivityIcon = (type: string) => {
  const icons: Record<string, any> = {
    call: Phone,
    email: Mail,
    task: ListTodo,
    message: MessageSquare,
    chat_flow: Workflow
  };
  return icons[type] || ListTodo;
};

const getActivityIconBg = (type: string) => {
  const colors: Record<string, string> = {
    call: 'bg-teal-500/10',
    email: 'bg-blue-500/10',
    task: 'bg-amber-500/10',
    message: 'bg-green-500/10',
    chat_flow: 'bg-purple-500/10'
  };
  return colors[type] || 'bg-muted';
};

const getActivityIconColor = (type: string) => {
  const colors: Record<string, string> = {
    call: 'text-teal-500',
    email: 'text-blue-500',
    task: 'text-amber-500',
    message: 'text-green-500',
    chat_flow: 'text-purple-500'
  };
  return colors[type] || 'text-muted-foreground';
};

onMounted(() => {
   // Always initialize with fresh seed data (dates relative to now)
   if (activityStore.activities.length === 0) {
     activityStore.initializeWithSeedData(getSeedActivities()); 
   }
});
</script>
