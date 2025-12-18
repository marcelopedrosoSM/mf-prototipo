<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <ScrollArea class="flex-1">
        <div class="p-6">
          <div class="mx-auto max-w-7xl space-y-6">
            <!-- Header com saudação -->
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold">
                  Olá, {{ userName }}!
                </h1>
                <p class="text-muted-foreground mt-1">
                  {{ getGreeting() }} - Aqui está um resumo das suas atividades
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="text-sm">
                  <Clock class="mr-1.5 h-3.5 w-3.5" />
                  {{ currentTime }}
                </Badge>
              </div>
            </div>

            <!-- Cards de Estatísticas -->
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">
                    Conversas Abertas
                  </CardTitle>
                  <MessageSquare class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ openConversationsCount }}</div>
                  <p class="text-xs text-muted-foreground">
                    {{ waitingConversationsCount }} aguardando resposta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">
                    Mensagens Hoje
                  </CardTitle>
                  <Send class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ messagesToday }}</div>
                  <p class="text-xs text-muted-foreground">
                    +{{ messagesToday - messagesYesterday }} desde ontem
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">
                    Fluxos Ativos
                  </CardTitle>
                  <Workflow class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ activeFlowsCount }}</div>
                  <p class="text-xs text-muted-foreground">
                    {{ totalFlowsCount }} fluxos no total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">
                    Taxa de Resposta
                  </CardTitle>
                  <TrendingUp class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ responseRate }}%</div>
                  <p class="text-xs text-muted-foreground">
                    Tempo médio: {{ averageResponseTime }}
                  </p>
                </CardContent>
              </Card>
            </div>

            <!-- Grid Principal: Conversas e Atividades -->
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <!-- Conversas Abertas -->
              <Card class="lg:col-span-2">
                <CardHeader>
                  <div class="flex items-center justify-between">
                    <CardTitle>Conversas Abertas</CardTitle>
                    <Button variant="ghost" size="sm" @click="navigateToConversations">
                      Ver todas
                      <ArrowRight class="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div v-if="openConversations.length === 0" class="flex flex-col items-center justify-center py-8">
                    <MessageSquare class="h-12 w-12 text-muted-foreground mb-4" />
                    <p class="text-sm text-muted-foreground">Nenhuma conversa aberta no momento</p>
                  </div>
                  <div v-else class="space-y-3">
                    <div
                      v-for="conversation in openConversations.slice(0, 5)"
                      :key="conversation.id"
                      class="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      @click="navigateToConversation(conversation.id)"
                    >
                      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                        <span class="text-xs font-medium">{{ getInitials(conversation.contactName) }}</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <p class="text-sm font-medium truncate">{{ conversation.contactName }}</p>
                          <Badge
                            v-if="conversation.unreadCount > 0"
                            variant="default"
                            class="ml-2 h-5 min-w-5 px-1.5 text-xs"
                          >
                            {{ conversation.unreadCount }}
                          </Badge>
                        </div>
                        <p class="text-xs text-muted-foreground truncate mb-1">
                          {{ conversation.lastMessage }}
                        </p>
                        <div class="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{{ formatTime(conversation.lastMessageTime) }}</span>
                          <span>•</span>
                          <span class="truncate">{{ conversation.inboxName }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Atividades do Dia -->
              <Card>
                <CardHeader>
                  <CardTitle>Atividades do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div v-if="activitiesToday.length === 0" class="flex flex-col items-center justify-center py-8">
                    <ActivityIcon class="h-12 w-12 text-muted-foreground mb-4" />
                    <p class="text-sm text-muted-foreground">Nenhuma atividade hoje</p>
                  </div>
                  <ScrollArea class="h-[400px]">
                    <div class="space-y-4">
                      <div
                        v-for="activity in activitiesToday"
                        :key="activity.id"
                        class="flex gap-3"
                      >
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0 mt-0.5">
                          <component
                            :is="getActivityIcon(activity.icon)"
                            class="h-4 w-4 text-muted-foreground"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium">{{ activity.title }}</p>
                          <p class="text-xs text-muted-foreground mt-0.5">{{ activity.description }}</p>
                          <p class="text-xs text-muted-foreground mt-1">{{ formatTime(activity.time) }}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <!-- Fluxos Recentes -->
            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <CardTitle>Fluxos Recentes</CardTitle>
                  <Button variant="ghost" size="sm" @click="navigateToFlows">
                    Ver todos
                    <ArrowRight class="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div v-if="recentFlows.length === 0" class="flex flex-col items-center justify-center py-8">
                  <Workflow class="h-12 w-12 text-muted-foreground mb-4" />
                  <p class="text-sm text-muted-foreground">Nenhum fluxo encontrado</p>
                </div>
                <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div
                    v-for="flow in recentFlows"
                    :key="flow.id"
                    class="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    @click="navigateToFlow(flow.id)"
                  >
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                      <Workflow class="h-5 w-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <p class="text-sm font-medium truncate">{{ flow.nome }}</p>
                        <Badge
                          :variant="getFlowStatusVariant(flow.status)"
                          :class="getFlowStatusClass(flow.status)"
                        >
                          {{ getFlowStatusLabel(flow.status) }}
                        </Badge>
                      </div>
                      <p class="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {{ flow.descricao || 'Sem descrição' }}
                      </p>
                      <div class="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{{ formatDate(flow.updatedAt) }}</span>
                        <span>•</span>
                        <span>{{ getFlowTypeLabel(flow.tipo) }}</span>
                      </div>
                    </div>
                  </div>
      </div>
              </CardContent>
            </Card>

            <!-- Resumo Rápido -->
            <div class="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle class="text-base">Contatos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ totalContacts }}</div>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ newContactsToday }} novos hoje
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle class="text-base">Caixas de Entrada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ totalInboxes }}</div>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ activeInboxes }} ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle class="text-base">Agentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ totalAgents }}</div>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ onlineAgents }} online agora
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  MessageSquare,
  Send,
  Workflow,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity as ActivityIcon,
  UserPlus,
  RefreshCw,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/components/layout/AppLayout.vue';
import { MOCK_USER } from '@/mocks/data/auth';
import { MOCK_FLOWS_ATENDIMENTO, MOCK_FLOWS_ATIVIDADES, type Flow } from '@/mocks/data/flows';
import {
  getOpenConversations,
  getTotalMessagesToday,
  type Conversation,
} from '@/mocks/data/conversations';
import { getActivitiesToday, type Activity } from '@/mocks/data/activities';
import { getAgentes } from '@/mocks/data/agentes';
import { getCaixasEntrada } from '@/mocks/data/caixas-entrada';
import { getContacts } from '@/mocks/data/contacts';
import { formatDate } from '@/utils/date';

const router = useRouter();

const userName = computed(() => MOCK_USER.name.split(' ')[0]);
const currentTime = ref('');
const openConversations = ref<Conversation[]>([]);
const activitiesToday = ref<Activity[]>([]);
const recentFlows = ref<Flow[]>([]);

// Estatísticas
const openConversationsCount = computed(() => openConversations.value.length);
const waitingConversationsCount = computed(() => 
  openConversations.value.filter(c => c.status === 'waiting').length
);
const messagesToday = computed(() => getTotalMessagesToday());
const messagesYesterday = ref(42); // Mock
const activeFlowsCount = computed(() => 
  recentFlows.value.filter(f => f.status === 'ativo').length
);
const totalFlowsCount = computed(() => recentFlows.value.length);
const responseRate = ref(94); // Mock
const averageResponseTime = ref('2 min'); // Mock
const totalContacts = computed(() => getContacts().length);
const newContactsToday = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getContacts().filter(c => {
    const createdDate = new Date(c.createdAt);
    return createdDate >= today;
  }).length;
});
const totalInboxes = computed(() => getCaixasEntrada().length);
const activeInboxes = computed(() => 
  getCaixasEntrada().filter(i => i.tipo === 'oficial').length
);
const totalAgents = computed(() => getAgentes().length);
const onlineAgents = ref(3); // Mock

function updateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  return formatDate(dateString);
}

function getActivityIcon(iconName: string) {
  const icons: Record<string, any> = {
    MessageSquare,
    Workflow,
    UserPlus,
    Send,
    RefreshCw,
  };
  return icons[iconName] || ActivityIcon;
}

function getFlowStatusVariant(status: Flow['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ativo':
      return 'default';
    case 'inativo':
      return 'secondary';
    case 'rascunho':
      return 'outline';
    default:
      return 'outline';
  }
}

function getFlowStatusClass(status: Flow['status']): string {
  switch (status) {
    case 'ativo':
      return 'bg-primary text-primary-foreground';
    case 'inativo':
      return 'bg-muted text-muted-foreground';
    case 'rascunho':
      return 'border-muted-foreground/30 text-muted-foreground bg-transparent';
    default:
      return '';
  }
}

function getFlowStatusLabel(status: Flow['status']): string {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'inativo':
      return 'Inativo';
    case 'rascunho':
      return 'Rascunho';
    default:
      return status;
  }
}

function getFlowTypeLabel(type: Flow['tipo']): string {
  switch (type) {
    case 'atendimento':
      return 'Atendimento';
    case 'atividades':
      return 'Atividades';
    default:
      return type;
  }
}

function navigateToConversations() {
  router.push('/conversations');
}

function navigateToConversation(id: string) {
  router.push(`/conversations/${id}`);
}

function navigateToFlows() {
  router.push('/flows');
}

function navigateToFlow(_id: string) {
  // TODO: Implementar navegação para detalhes do fluxo
  // router.push(`/flows/${_id}`);
  router.push('/flows');
}

let timeInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 60000); // Update every minute
  
  // Load data
  openConversations.value = getOpenConversations();
  activitiesToday.value = getActivitiesToday();
  recentFlows.value = [
    ...MOCK_FLOWS_ATENDIMENTO,
    ...MOCK_FLOWS_ATIVIDADES,
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>
