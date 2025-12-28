<template>
  <div class="flex flex-col h-full bg-muted border-r border-border">
    <!-- Header Clean -->
    <div class="px-4 pt-4 pb-2 bg-background">
      <div class="flex items-center justify-between mb-3">
        <!-- Inbox Title Selector -->
        <Select v-model="selectedInboxId" @update:model-value="handleInboxChange">
          <SelectTrigger class="w-auto h-auto p-0 border-0 shadow-none hover:bg-transparent focus:ring-0 gap-2 group">
            <SelectValue class="text-lg font-semibold text-foreground group-hover:text-primary dark:group-hover:text-primary-lighten transition-colors" :placeholder="selectedInbox?.nome || 'Selecione'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="inbox in inboxes"
              :key="inbox.id"
              :value="inbox.id"
            >
              {{ inbox.nome }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Actions -->
        <div class="flex items-center gap-1">
           <!-- Filter Trigger -->
           <Popover v-model:open="isFilterOpen">
            <PopoverTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 hover:bg-muted"
                :class="[hasActiveFilters ? 'text-primary' : 'text-muted-foreground']"
              >
                <Filter class="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80 p-0 flex flex-col h-[650px] max-h-[650px]" align="end">
            <div class="p-4 border-b border-border flex-shrink-0">
              <h3 class="text-sm font-semibold text-foreground">Filtros</h3>
            </div>
            <div class="flex-1 min-h-0 overflow-hidden">
              <ScrollArea class="h-full">
                <div class="p-4 space-y-4">
                  <!-- Filtro por Agentes -->
                  <div class="space-y-2">
                    <label class="text-xs font-medium text-muted-foreground">Agentes</label>
                    <div class="h-40 overflow-hidden">
                      <ScrollArea class="h-full">
                        <div class="space-y-2 pr-4">
                          <label
                            v-for="agent in agents"
                            :key="agent.id"
                            class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              :model-value="selectedAgentIds.includes(agent.id)"
                              @update:model-value="(checked) => toggleAgent(agent.id, !!checked)"
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
                    <div class="h-40 overflow-hidden">
                      <ScrollArea class="h-full">
                        <div class="space-y-2 pr-4">
                          <label
                            v-for="team in teams"
                            :key="team.id"
                            class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              :model-value="selectedTeamIds.includes(team.id)"
                              @update:model-value="(checked) => toggleTeam(team.id, !!checked)"
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
                </div>
              </ScrollArea>
            </div>
            <!-- Botão Limpar Filtros -->
            <div class="p-4 border-t border-border flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                class="w-full"
                @click="clearAllFilters"
                :disabled="!hasActiveFilters"
              >
                Limpar filtros
              </Button>
            </div>
          </PopoverContent>
          </Popover>

          <!-- New Chat -->
          <StartConversationPopover :inboxes="inboxes.map(i => ({ id: i.id, name: i.nome }))" @conversation-created="handleNewConversationCreated">
             <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-muted">
               <MessageSquarePlus class="h-4 w-4 text-muted-foreground" />
             </Button>
          </StartConversationPopover>
        </div>
      </div>

      <!-- Modern Search Bar -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-foreground/60" />
        <Input
          v-model="searchQuery"
          placeholder="Buscar conversa..."
          class="pl-9 bg-muted/50 border-transparent focus:bg-background transition-all hover:bg-muted/80 h-9 rounded-lg dark:bg-border dark:text-foreground dark:placeholder:text-foreground/50"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Filtros Rápidos e Badges de Filtros Aplicados -->
    <div class="px-3 py-2 bg-background border-b border-border">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Filtro: Não lidas -->
        <Toggle
          :pressed="activeFilters.has('unread')"
          variant="pill"
          size="xs"
          @update:pressed="toggleFilter('unread')"
        >
          Não lidas
        </Toggle>
        <!-- Filtro: Eu -->
        <Toggle
          :pressed="activeFilters.has('me')"
          variant="pill"
          size="xs"
          @update:pressed="toggleFilter('me')"
        >
          Eu
        </Toggle>
        <!-- Outros filtros adicionais -->
        <Toggle
          v-for="filter in additionalFilters"
          :key="filter.id"
          :pressed="activeFilters.has(filter.id)"
          variant="pill"
          size="xs"
          @update:pressed="toggleFilter(filter.id)"
        >
          {{ filter.label }}
        </Toggle>

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
    <ScrollArea class="flex-1 bg-background">
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
        <!-- Indicador de todas as conversas carregadas -->
        <div
          v-if="filteredConversations.length > 0 && !loading"
          class="p-3 bg-background border-t border-border text-center"
        >
          <p class="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <span>Todas as conversas carregadas</span>
            <span>🎉</span>
          </p>
        </div>
      </div>
    </ScrollArea>
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
import { Toggle } from '@/components/ui/toggle';
import ChatCard from './ChatCard.vue';
import StartConversationPopover from './StartConversationPopover.vue';
import type { ChatSession } from '@/types/conversations';
import { SidebarStatusType } from '@/types/conversations';

// Stores
import { useConversationsStore } from '@/stores/conversations';
import { useInboxesStore } from '@/stores/inboxes';
import { useAgentsStore } from '@/stores/agents';
import { useTeamsStore } from '@/stores/teams';
import { useLabelsStore } from '@/stores/labels';

interface Props {
  selectedChatId?: string;
  statusFilter?: SidebarStatusType;
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

// Store Initialization
const conversationsStore = useConversationsStore();
const inboxesStore = useInboxesStore();
const agentsStore = useAgentsStore();
const teamsStore = useTeamsStore();
const labelsStore = useLabelsStore();

// UI State
const selectedInboxId = ref<string | null>(null);
const searchQuery = ref('');
const activeFilters = ref<Set<string>>(new Set());
const additionalFilters = ref<QuickFilter[]>([]);
const isFilterOpen = ref(false);

// Filter Selections
const selectedAgentIds = ref<string[]>([]);
const selectedTeamIds = ref<string[]>([]);
const selectedLabelIds = ref<string[]>([]);

// Data from Stores (Reactive)
const inboxes = computed(() => inboxesStore.allInboxes);
const agents = computed(() => agentsStore.allAgents);
const teams = computed(() => teamsStore.allTeams);
const labels = computed(() => labelsStore.allLabels);
const loading = computed(() => inboxesStore.loading || conversationsStore.isInitialized === false);

const selectedInbox = computed(() => {
  if (!selectedInboxId.value) return null;
  return inboxesStore.getInboxById(selectedInboxId.value) || null;
});

// Main Filtering Logic
const filteredConversations = computed(() => {
  // Start with all conversations from store
  let filtered = [...conversationsStore.allConversations];

  // 1. Filter by Inbox (Mandatory)
  if (selectedInboxId.value) {
    filtered = filtered.filter(chat => chat.inbox.id === selectedInboxId.value);
  }

  // 2. Filter by Status (Sidebar Tabs)
  if (props.statusFilter && props.statusFilter !== SidebarStatusType.ALL_CHATS) {
    switch (props.statusFilter) {
      case SidebarStatusType.WITHOUT_TEAM:
        filtered = filtered.filter((chat) => !chat.assignedUser?.team);
        break;
      case SidebarStatusType.IN_SERVICE:
        filtered = filtered.filter(
          (chat) => chat.status === 'open' && chat.assignedUser?.user
        );
        break;
      case SidebarStatusType.MENTION:
        filtered = filtered.filter((chat) => chat.mentioned === true);
        break;
      case SidebarStatusType.FINISHED:
        filtered = filtered.filter((chat) => chat.status === 'closed');
        break;
    }
  }

  // 3. Search Query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (chat) =>
        chat.sender.name.toLowerCase().includes(query) ||
        chat.sender.phoneNumber.includes(query)
    );
  }

  // 4. Quick Filters
  if (activeFilters.value.has('unread')) {
    filtered = filtered.filter((chat) => chat.unreadCount > 0);
  }

  if (activeFilters.value.has('me')) {
    // Assuming '1' is the current user ID for prototype. 
    // In real app, verify against auth store.
    const currentUserId = '1'; 
    filtered = filtered.filter((chat) => chat.assignedUser?.user?.id === currentUserId);
  }

  // 5. Advanced Filters (Multi-select)
  if (selectedAgentIds.value.length > 0) {
    filtered = filtered.filter((chat) => {
      if (!chat.assignedUser?.user) return false;
      return selectedAgentIds.value.includes(chat.assignedUser.user.id);
    });
  }

  if (selectedTeamIds.value.length > 0) {
    filtered = filtered.filter((chat) => {
      if (!chat.assignedUser?.team) return false;
      return selectedTeamIds.value.includes(chat.assignedUser.team.id);
    });
  }

  if (selectedLabelIds.value.length > 0) {
    filtered = filtered.filter((chat) => {
      if (!chat.labels || chat.labels.length === 0) return false;
      return selectedLabelIds.value.some((labelId) =>
        chat.labels.some((label) => label.id === labelId)
      );
    });
  }

  // 6. Custom/Additional Filters
  additionalFilters.value.forEach((filter) => {
    if (activeFilters.value.has(filter.id)) {
      filtered = filtered.filter(filter.filterFn);
    }
  });

  // Sort by recent activity
  filtered.sort((a, b) => {
    const dateA = new Date(a.lastActivityAt).getTime();
    const dateB = new Date(b.lastActivityAt).getTime();
    return dateB - dateA;
  });

  return filtered;
});

// Handlers
function handleInboxChange(inboxId: string) {
  selectedInboxId.value = inboxId;
  emit('inbox-change', inboxId);
  // Store handles data automatically, no fetch call needed here if reactive
}

function handleSearch() {
  // Reactive computed handles this
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

function addQuickFilter(filter: QuickFilter) {
  additionalFilters.value.push(filter);
}

const hasActiveFilters = computed(() => {
  return (
    selectedAgentIds.value.length > 0 ||
    selectedTeamIds.value.length > 0 ||
    selectedLabelIds.value.length > 0 ||
    activeFilters.value.size > 0
  );
});

// Helpers for Names/Colors using Stores
function getAgentName(agentId: string): string {
  const agent = agentsStore.getAgentById(agentId);
  return agent?.nome || agentId;
}

function getTeamName(teamId: string): string {
  const team = teamsStore.getTeamById(teamId);
  return team?.nome || teamId;
}

function getLabelName(labelId: string): string {
  const label = labelsStore.getLabelById(labelId);
  return label?.name || labelId;
}

function getLabelColor(labelId: string): string {
  const label = labelsStore.getLabelById(labelId);
  return label?.color || '#8B5CF6';
}

// Filter Removal Helpers
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

function handleNewConversationCreated(conversation: ChatSession) {
  // Store update is enough, but we might want to ensure selection
  if (conversation.inbox.id !== selectedInboxId.value) {
    selectedInboxId.value = conversation.inbox.id;
  }
  emit('select-chat', conversation);
}

// Lifecycle
onMounted(() => {
  // Ensure stores are initialized
  conversationsStore.initialize();
  inboxesStore.initialize();
  agentsStore.initialize();
  teamsStore.initialize();
  labelsStore.initialize();
  
  // Select first inbox if none selected
  if (!selectedInboxId.value && inboxes.value.length > 0) {
    selectedInboxId.value = inboxes.value[0].id;
  } else {
    // Watch for load
    const unwatch = watch(inboxes, (newVal) => {
      if (newVal.length > 0 && !selectedInboxId.value) {
        selectedInboxId.value = newVal[0].id;
        unwatch();
      }
    });
  }
});

// Expose
defineExpose({
  addQuickFilter,
});

// Watch
watch(selectedInboxId, (newVal) => {
  if(newVal) emit('inbox-change', newVal);
});
</script>

