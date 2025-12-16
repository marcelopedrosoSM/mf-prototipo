<template>
  <div class="flex flex-col h-full bg-muted border-r border-border">
    <!-- Header -->
    <div class="flex items-center gap-2 p-4 bg-background border-b border-border">
      <!-- Dropdown de Caixas - Ocupa espaço restante -->
      <Select v-model="selectedInboxId" @update:model-value="handleInboxChange" class="flex-1 min-w-0">
        <SelectTrigger class="w-full">
          <SelectValue :placeholder="selectedInbox?.name || 'Selecione uma caixa'" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="inbox in inboxes"
            :key="inbox.id"
            :value="inbox.id"
          >
            {{ inbox.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Botões à direita -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Botão Filtro -->
        <Popover v-model:open="isFilterOpen">
          <PopoverTrigger as-child>
            <Button variant="ghost" size="icon" :class="{ 'bg-primary/10': hasActiveFilters }">
              <Filter class="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-80 p-0" align="end">
            <div class="h-[500px] overflow-hidden">
              <ScrollArea class="h-full">
                <div class="p-4 space-y-4 pr-4">
                <h3 class="text-sm font-semibold text-foreground mb-3">Filtros</h3>
              
                <!-- Filtro por Agentes -->
                <div class="space-y-2">
                  <label class="text-xs font-medium text-muted-foreground">Agentes</label>
                  <div class="max-h-48 overflow-hidden">
                    <ScrollArea class="h-full">
                      <div class="space-y-2 pr-4">
                        <label
                          v-for="agent in agents"
                          :key="agent.id"
                          class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            :checked="selectedAgentIds.includes(agent.id)"
                            @update:checked="(checked) => toggleAgent(agent.id, checked)"
                          />
                          <span class="text-sm text-foreground">{{ agent.nome }}</span>
                        </label>
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <!-- Filtro por Times -->
                <div class="space-y-2">
                  <label class="text-xs font-medium text-muted-foreground">Times</label>
                  <div class="max-h-48 overflow-hidden">
                    <ScrollArea class="h-full">
                      <div class="space-y-2 pr-4">
                        <label
                          v-for="team in teams"
                          :key="team.id"
                          class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            :checked="selectedTeamIds.includes(team.id)"
                            @update:checked="(checked) => toggleTeam(team.id, checked)"
                          />
                          <span class="text-sm text-foreground">{{ team.nome }}</span>
                        </label>
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <!-- Filtro por Etiquetas -->
                <div class="space-y-2">
                  <label class="text-xs font-medium text-muted-foreground">Etiquetas</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="label in labels"
                      :key="label.id"
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-md transition-colors border',
                        selectedLabelIds.includes(label.id)
                          ? 'text-foreground border-2'
                          : 'bg-background text-foreground border-border hover:bg-muted',
                      ]"
                      :style="selectedLabelIds.includes(label.id) ? {
                        backgroundColor: `${label.color}20`,
                        borderColor: label.color,
                        color: label.color,
                      } : {}"
                      @click="toggleLabel(label.id)"
                    >
                      {{ label.name }}
                    </button>
                  </div>
                </div>

                  <!-- Botão Limpar Filtros -->
                  <div class="flex justify-end pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="clearAllFilters"
                      :disabled="!hasActiveFilters"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>

        <!-- Botão Novo Chat -->
        <Button variant="ghost" size="icon">
          <MessageSquarePlus class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Barra de Busca -->
    <div class="p-3 bg-background border-b border-border">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Buscar"
          class="pl-9"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Filtros Rápidos e Badges de Filtros Aplicados -->
    <div class="px-3 py-2 bg-background border-b border-border">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Filtro: Não lidas -->
        <button
          :class="[
            'h-6 px-2.5 text-xs font-medium rounded-full transition-colors cursor-pointer flex items-center justify-center',
            activeFilters.has('unread')
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          ]"
          @click="toggleFilter('unread')"
        >
          Não lidas
        </button>
        <!-- Filtro: Eu -->
        <button
          :class="[
            'h-6 px-2.5 text-xs font-medium rounded-full transition-colors cursor-pointer flex items-center justify-center',
            activeFilters.has('me')
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          ]"
          @click="toggleFilter('me')"
        >
          Eu
        </button>
        <!-- Outros filtros adicionais -->
        <button
          v-for="filter in additionalFilters"
          :key="filter.id"
          :class="[
            'h-6 px-2.5 text-xs font-medium rounded-full transition-colors cursor-pointer flex items-center justify-center',
            activeFilters.has(filter.id)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          ]"
          @click="toggleFilter(filter.id)"
        >
          {{ filter.label }}
        </button>

        <!-- Badges de Filtros Aplicados -->
        <!-- Badge Agentes -->
        <div
          v-for="agentId in selectedAgentIds"
          :key="`agent-${agentId}`"
          class="h-6 px-2.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/20"
          @click="removeAgentFilter(agentId)"
        >
          <span>{{ getAgentName(agentId) }}</span>
          <X class="h-3 w-3" />
        </div>

        <!-- Badge Times -->
        <div
          v-for="teamId in selectedTeamIds"
          :key="`team-${teamId}`"
          class="h-6 px-2.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/20"
          @click="removeTeamFilter(teamId)"
        >
          <span>{{ getTeamName(teamId) }}</span>
          <X class="h-3 w-3" />
        </div>

        <!-- Badge Etiquetas -->
        <div
          v-for="labelId in selectedLabelIds"
          :key="`label-${labelId}`"
          class="h-6 px-2.5 text-xs font-medium rounded-full border flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80"
          :style="{
            backgroundColor: `${getLabelColor(labelId)}20`,
            color: getLabelColor(labelId),
            borderColor: `${getLabelColor(labelId)}40`,
          }"
          @click="removeLabelFilter(labelId)"
        >
          <span>{{ getLabelName(labelId) }}</span>
          <X class="h-3 w-3" />
        </div>
      </div>
    </div>

    <!-- Lista de Conversas -->
    <ScrollArea class="flex-1">
      <div class="flex flex-col">
        <ChatCard
          v-for="(chat, index) in filteredConversations"
          :key="chat.id"
          :chat="chat"
          :is-selected="selectedChatId === chat.id"
          :is-last="index === filteredConversations.length - 1"
          :is-in-history="chat.status === 'closed'"
          :search-query="searchQuery"
          @select-chat="handleSelectChat"
        />
        <div
          v-if="filteredConversations.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-12 px-4"
        >
          <MessageCircle class="h-12 w-12 text-muted-foreground mb-4" />
          <p class="text-sm text-muted-foreground text-center">
            Nenhuma conversa encontrada
          </p>
        </div>
      </div>
    </ScrollArea>

    <!-- Footer -->
    <div
      v-if="filteredConversations.length > 0"
      class="p-3 bg-background border-t border-border text-center"
    >
      <p class="text-xs text-muted-foreground flex items-center justify-center gap-1">
        <span>Todas as conversas carregadas</span>
        <span>🎉</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Search, Filter, MessageSquarePlus, MessageCircle, X } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatCard from './ChatCard.vue';
import api from '@/services/api';
import type { ChatSession, Inbox, Label } from '@/types/conversations';
import { MOCK_AGENTES, type Agente } from '@/mocks/data/agentes';
import { MOCK_TIMES, type Time } from '@/mocks/data/times';
import { MOCK_LABELS } from '@/mocks/data/labels';

interface Props {
  selectedChatId?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'select-chat': [chat: ChatSession];
  'inbox-change': [inboxId: string | null];
}>();

interface QuickFilter {
  id: string;
  label: string;
  filterFn: (chat: ChatSession) => boolean;
}

const conversations = ref<ChatSession[]>([]);
const inboxes = ref<Inbox[]>([]);
const selectedInboxId = ref<string | null>(null);
const searchQuery = ref('');
const loading = ref(false);
const activeFilters = ref<Set<string>>(new Set());
const additionalFilters = ref<QuickFilter[]>([]);

// Filtros por Agentes, Times e Etiquetas
const selectedAgentIds = ref<string[]>([]);
const selectedTeamIds = ref<string[]>([]);
const selectedLabelIds = ref<string[]>([]);
const isFilterOpen = ref(false);

// Dados para filtros
const agents = ref<Agente[]>(MOCK_AGENTES);
const teams = ref<Time[]>(MOCK_TIMES);
const labels = ref<Label[]>(MOCK_LABELS);

const selectedInbox = computed(() => {
  if (!selectedInboxId.value) return null;
  return inboxes.value.find((inbox) => inbox.id === selectedInboxId.value) || null;
});

const filteredConversations = computed(() => {
  let filtered = [...conversations.value];

  // Filtrar por busca
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (chat) =>
        chat.sender.name.toLowerCase().includes(query) ||
        chat.sender.phoneNumber.includes(query)
    );
  }

  // Filtro rápido: Não lidas
  if (activeFilters.value.has('unread')) {
    filtered = filtered.filter((chat) => chat.unreadCount > 0);
  }

  // Filtro rápido: Eu (conversas atribuídas ao usuário atual)
  if (activeFilters.value.has('me')) {
    // Mock: assumindo que o usuário atual tem ID '1' ou podemos verificar pelo assignedUser
    filtered = filtered.filter((chat) => chat.assignedUser?.user?.id === '1');
  }

  // Filtro por Agentes
  if (selectedAgentIds.value.length > 0) {
    filtered = filtered.filter((chat) => {
      if (!chat.assignedUser?.user) return false;
      return selectedAgentIds.value.includes(chat.assignedUser.user.id);
    });
  }

  // Filtro por Times
  if (selectedTeamIds.value.length > 0) {
    filtered = filtered.filter((chat) => {
      if (!chat.assignedUser?.team) return false;
      return selectedTeamIds.value.includes(chat.assignedUser.team.id);
    });
  }

  // Filtro por Etiquetas
  if (selectedLabelIds.value.length > 0) {
    filtered = filtered.filter((chat) => {
      if (!chat.labels || chat.labels.length === 0) return false;
      return selectedLabelIds.value.some((labelId) =>
        chat.labels.some((label) => label.id === labelId)
      );
    });
  }

  // Outros filtros adicionais
  additionalFilters.value.forEach((filter) => {
    if (activeFilters.value.has(filter.id)) {
      filtered = filtered.filter(filter.filterFn);
    }
  });

  // Ordenar por última atividade (mais recente primeiro)
  filtered.sort((a, b) => {
    const dateA = new Date(a.lastActivityAt).getTime();
    const dateB = new Date(b.lastActivityAt).getTime();
    return dateB - dateA;
  });

  return filtered;
});

async function fetchInboxes() {
  try {
    const response = await api.get<{ data: Inbox[] }>('/inboxes');
    inboxes.value = response.data.data;
    if (inboxes.value.length > 0 && !selectedInboxId.value) {
      selectedInboxId.value = inboxes.value[0].id;
    }
  } catch (error) {
    console.error('Error fetching inboxes:', error);
  }
}

async function fetchConversations() {
  loading.value = true;
  try {
    const params: Record<string, string> = {};
    if (selectedInboxId.value) {
      params.inboxId = selectedInboxId.value;
    }
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    const response = await api.get<{ data: ChatSession[]; total: number }>(
      '/chat/conversations',
      { params }
    );
    conversations.value = response.data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
  } finally {
    loading.value = false;
  }
}

function handleInboxChange(inboxId: string) {
  selectedInboxId.value = inboxId;
  emit('inbox-change', inboxId);
  fetchConversations();
}

function handleSearch() {
  // Debounce pode ser adicionado aqui se necessário
  fetchConversations();
}

function handleSelectChat(chat: ChatSession) {
  emit('select-chat', chat);
}

function toggleFilter(filter: string) {
  if (activeFilters.value.has(filter)) {
    activeFilters.value.delete(filter);
  } else {
    activeFilters.value.add(filter);
  }
}

// Função para adicionar novos filtros dinamicamente
function addQuickFilter(filter: QuickFilter) {
  additionalFilters.value.push(filter);
}

// Verificar se há filtros ativos
const hasActiveFilters = computed(() => {
  return (
    selectedAgentIds.value.length > 0 ||
    selectedTeamIds.value.length > 0 ||
    selectedLabelIds.value.length > 0 ||
    activeFilters.value.size > 0
  );
});

// Funções auxiliares para obter nomes
function getAgentName(agentId: string): string {
  const agent = agents.value.find((a) => a.id === agentId);
  return agent?.nome || agentId;
}

function getTeamName(teamId: string): string {
  const team = teams.value.find((t) => t.id === teamId);
  return team?.nome || teamId;
}

function getLabelName(labelId: string): string {
  const label = labels.value.find((l) => l.id === labelId);
  return label?.name || labelId;
}

function getLabelColor(labelId: string): string {
  const label = labels.value.find((l) => l.id === labelId);
  return label?.color || '#8B5CF6';
}

// Funções para remover filtros
function removeAgentFilter(agentId: string) {
  selectedAgentIds.value = selectedAgentIds.value.filter((id) => id !== agentId);
}

function removeTeamFilter(teamId: string) {
  selectedTeamIds.value = selectedTeamIds.value.filter((id) => id !== teamId);
}

function removeLabelFilter(labelId: string) {
  selectedLabelIds.value = selectedLabelIds.value.filter((id) => id !== labelId);
}

function toggleLabel(labelId: string) {
  if (selectedLabelIds.value.includes(labelId)) {
    selectedLabelIds.value = selectedLabelIds.value.filter((id) => id !== labelId);
  } else {
    selectedLabelIds.value.push(labelId);
  }
}

function toggleAgent(agentId: string, checked: boolean) {
  if (checked) {
    if (!selectedAgentIds.value.includes(agentId)) {
      selectedAgentIds.value.push(agentId);
    }
  } else {
    selectedAgentIds.value = selectedAgentIds.value.filter((id) => id !== agentId);
  }
}

function toggleTeam(teamId: string, checked: boolean) {
  if (checked) {
    if (!selectedTeamIds.value.includes(teamId)) {
      selectedTeamIds.value.push(teamId);
    }
  } else {
    selectedTeamIds.value = selectedTeamIds.value.filter((id) => id !== teamId);
  }
}

function clearAllFilters() {
  selectedAgentIds.value = [];
  selectedTeamIds.value = [];
  selectedLabelIds.value = [];
  activeFilters.value.clear();
}

// Expor função para componentes pais adicionarem filtros
defineExpose({
  addQuickFilter,
});

watch(selectedInboxId, () => {
  fetchConversations();
});

onMounted(() => {
  fetchInboxes();
  fetchConversations();
});
</script>

