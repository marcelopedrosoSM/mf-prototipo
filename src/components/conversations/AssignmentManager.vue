<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child :disabled="disabled">
      <button
        v-if="!chat.assignedUser?.user && !chat.assignedUser?.team"
        class="h-9 w-9 rounded-full border border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary flex items-center justify-center transition-colors text-muted-foreground bg-transparent"
        :title="getButtonTitle()"
        :disabled="disabled"
      >
        <UserPlus class="h-4 w-4" />
      </button>

      <button
        v-else
        class="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/20 transition-all p-0.5"
        :title="getButtonTitle()"
        :disabled="disabled"
      >
         <!-- Assignment Avatar (Clean) -->
        <AssignmentAvatar
          :user="chat.assignedUser?.user"
          :team="chat.assignedUser?.team"
          size="sm"
        />
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="end">
      <div class="flex flex-col">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-border">
          <h3 class="text-sm font-semibold">Gerenciar Atribuição</h3>
          <p class="text-xs text-muted-foreground mt-1">
            Atribua esta conversa a um agente e time
          </p>
        </div>

        <!-- Current Assignment -->
        <div
          v-if="chat.assignedUser?.user || chat.assignedUser?.team"
          class="px-4 py-3 border-b border-border"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-muted-foreground">Atribuição atual</div>
            <Button
              variant="ghost"
              size="sm"
              class="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              @click="showUnassignDialog = true"
            >
              <UserMinus class="h-3 w-3 mr-1" />
              Remover atribuição
            </Button>
          </div>
          <div class="flex items-center gap-3">
            <!-- Avatar do Time -->
            <div
              v-if="chat.assignedUser.team"
              class="h-10 w-10 rounded-full border border-white/75 bg-muted flex items-center justify-center flex-shrink-0"
              :title="chat.assignedUser.team.name"
            >
              <span class="text-xs font-bold text-foreground">
                {{ getInitials(chat.assignedUser.team.name) }}
              </span>
            </div>
            <!-- Avatar do Usuário -->
            <div
              v-if="chat.assignedUser.user"
              class="h-10 w-10 rounded-full border border-muted bg-primary/10 flex items-center justify-center flex-shrink-0"
              :title="chat.assignedUser.user.name"
            >
              <span class="text-xs font-bold text-primary">
                {{ getInitials(chat.assignedUser.user.name) }}
              </span>
            </div>
            <!-- Info -->
            <div class="flex flex-col min-w-0 flex-1">
              <span v-if="chat.assignedUser.user" class="text-sm font-medium truncate">
                {{ chat.assignedUser.user.name }}
              </span>
              <span v-if="chat.assignedUser.team" class="text-xs text-muted-foreground truncate">
                Time: {{ chat.assignedUser.team.name }}
              </span>
            </div>
          </div>
        </div>


        <!-- Team Selection -->
        <div class="p-4 border-b border-border">
          <div v-if="!selectedTeam">
            <h3 class="text-sm font-semibold mb-3">Selecione o Time</h3>
            <div class="space-y-1">
              <Button
                v-for="team in teamsStore.allTeams"
                :key="team.id"
                variant="ghost"
                size="sm"
                class="w-full justify-start"
                @click="selectTeam(team)"
              >
                <UsersIcon class="h-4 w-4 mr-2" />
                {{ team.nome }}
              </Button>
            </div>
          </div>
          
          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <UsersIcon class="h-4 w-4 text-primary" />
                <span class="text-sm font-semibold">{{ selectedTeam.nome }}</span>
              </div>
              <Button variant="ghost" size="sm" class="h-7 text-xs" @click="clearTeamSelection">
                <UserMinus class="h-4 w-4 mr-1" />
                Remover time
              </Button>
            </div>
            
            <!-- Filtered Agents -->
            <div class="border-t border-border pt-3">
              <h4 class="text-xs font-medium text-muted-foreground mb-2">Ou selecione um agente:</h4>
              <Command>
                <CommandInput placeholder="Buscar agente..." />
                <CommandList class="max-h-[200px]">
                  <CommandEmpty>Nenhum agente neste time.</CommandEmpty>
                  <CommandGroup>
                    <!-- Atribuir para mim (se usuário atual está no time) -->
                    <CommandItem
                      v-if="currentUserInSelectedTeam"
                      value="me"
                      @select="selectCurrentUser"
                      :class="[
                        'cursor-pointer border-b border-border',
                        selectedAgent?.id === '1' ? 'bg-primary/10' : 'bg-primary/5'
                      ]"
                    >
                      <div class="flex items-center gap-2 w-full">
                        <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          UP
                        </div>
                        <div class="flex flex-col flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold">Atribuir para mim</span>
                            <span class="text-xs text-primary">• Você</span>
                          </div>
                          <span class="text-xs text-muted-foreground">Usuário Protótipo</span>
                        </div>
                        <Check v-if="selectedAgent?.id === '1'" class="h-5 w-5 text-primary flex-shrink-0" />
                      </div>
                    </CommandItem>
                    
                    <!-- Lista de agentes -->
                    <CommandItem
                      v-for="agent in filteredAgents"
                      :key="agent.id"
                      :value="agent.nome"
                      @select="selectAgent(agent)"
                      :class="[
                        'cursor-pointer',
                        selectedAgent?.id === agent.id ? 'bg-primary/10' : ''
                      ]"
                    >
                      <div class="flex items-center gap-2 w-full">
                        <div class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {{ getInitials(agent.nome) }}
                        </div>
                        <div class="flex flex-col flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-medium truncate">{{ agent.nome }}</span>
                            <span class="h-2 w-2 rounded-full bg-success flex-shrink-0" title="Online"></span>
                          </div>
                          <span class="text-xs text-muted-foreground truncate">{{ agent.email }}</span>
                        </div>
                        <Check v-if="selectedAgent?.id === agent.id" class="h-5 w-5 text-primary flex-shrink-0" />
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </div>
        </div>

        <!-- Apply Button -->
        <div v-if="selectedTeam" class="p-4 border-t border-border space-y-3">
          <!-- Preview da Atribuição -->
          <div class="bg-muted/50 rounded-lg p-3 border border-border">
            <div class="text-xs font-medium text-muted-foreground mb-2">Será atribuído para:</div>
            <div class="flex items-center gap-2">
              <div 
                v-if="selectedAgent"
                class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary"
              >
                {{ getInitials(selectedAgent.nome) }}
              </div>
              <UsersIcon v-else class="h-8 w-8 text-muted-foreground" />
              
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-sm font-semibold truncate">
                  {{ selectedAgent ? selectedAgent.nome : selectedTeam.nome }}
                </span>
                <span class="text-xs text-muted-foreground truncate">
                  {{ selectedAgent ? `Time: ${selectedTeam.nome}` : 'Apenas o time' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Botão Aplicar -->
          <Button
            variant="default"
            size="sm"
            class="w-full"
            @click="handleApply"
          >
            Aplicar Atribuição
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Confirmation Dialog -->
  <Dialog v-model:open="showUnassignDialog">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Remover Atribuição?</DialogTitle>
      </DialogHeader>
      <div class="py-4">
        <p class="text-sm text-muted-foreground">
          Tem certeza que deseja remover a atribuição desta conversa?
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          A conversa ficará sem responsável.
        </p>
      </div>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="showUnassignDialog = false">Cancelar</Button>
        <Button variant="destructive" @click="confirmUnassign">
          <UserMinus class="h-4 w-4 mr-2" />
          Remover
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Users as UsersIcon, UserMinus, Check, UserPlus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AssignmentAvatar from '@/components/ui/AssignmentAvatar.vue';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import type { ChatSession } from '@/types/conversations';
import { useAgentsStore } from '@/stores/agents';
import { useTeamsStore } from '@/stores/teams';
import { useConversationsStore } from '@/stores/conversations';
import { useToast } from '@/components/ui/toast/use-toast';
import type { Agente } from '@/mocks/data/agentes';
import type { Time } from '@/types/times';

interface Props {
  chat: ChatSession;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'assigned': [];
  'unassigned': [];
}>();

const isOpen = ref(false);
const showUnassignDialog = ref(false);
const selectedTeam = ref<Time | null>(null);
const selectedAgent = ref<Agente | null>(null);
const agentsStore = useAgentsStore();
const teamsStore = useTeamsStore();
const conversationsStore = useConversationsStore();
const { toast } = useToast();

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getButtonTitle = (): string => {
  if (props.chat.assignedUser?.user) {
    return `Atribuída a ${props.chat.assignedUser.user.name}`;
  }
  if (props.chat.assignedUser?.team) {
    return `Atribuída ao time ${props.chat.assignedUser.team.name}`;
  }
  return 'Atribuir conversa';
};

const handleUnassign = () => {
  conversationsStore.unassign(props.chat.id);
  toast({
    title: 'Atribuição removida',
    description: 'A conversa não possui mais atribuição.'
  });
  isOpen.value = false;
  emit('unassigned');
};

const confirmUnassign = () => {
  handleUnassign();
  showUnassignDialog.value = false;
};

// NOVO FLUXO: Selecionar time
const selectTeam = (team: Time) => {
  selectedTeam.value = team;
  selectedAgent.value = null; // Reset agent
};

const clearTeamSelection = () => {
  selectedTeam.value = null;
  selectedAgent.value = null;
};

// Selecionar agente (toggle)
const selectAgent = (agent: Agente) => {
  // Se clicar no mesmo agente, desseleciona
  if (selectedAgent.value?.id === agent.id) {
    selectedAgent.value = null;
  } else {
    selectedAgent.value = agent;
  }
};

// Selecionar usuário atual (toggle)
const selectCurrentUser = () => {
  const currentUser = agentsStore.allAgents.find(a => a.id === '1');
  if (currentUser) {
    // Se já está selecionado, desseleciona
    if (selectedAgent.value?.id === currentUser.id) {
      selectedAgent.value = null;
    } else {
      selectedAgent.value = currentUser;
    }
  }
};

// Aplicar atribuição
const handleApply = () => {
  if (!selectedTeam.value) return;
  
  if (selectedAgent.value) {
    // Atribuir agente + time
    conversationsStore.assignAgent(props.chat.id, selectedAgent.value.id);
    conversationsStore.assignTeam(props.chat.id, selectedTeam.value.id);
    toast({
      title: 'Atribuição realizada',
      description: `Conversa atribuída a ${selectedAgent.value.nome} (${selectedTeam.value.nome}).`
    });
  } else {
    // Atribuir apenas time
    conversationsStore.assignTeam(props.chat.id, selectedTeam.value.id);
    toast({
      title: 'Atribuição realizada',
      description: `Conversa atribuída ao time ${selectedTeam.value.nome}.`
    });
  }
  
  selectedTeam.value = null;
  selectedAgent.value = null;
  isOpen.value = false;
  emit('assigned');
};

// Agentes filtrados pelo time selecionado
const filteredAgents = computed(() => {
  if (!selectedTeam.value) return [];
  return agentsStore.allAgents.filter(agent => 
    agent.timesIds?.includes(selectedTeam.value!.id) && agent.id !== '1' // Exclui usuário atual da lista
  );
});

// Verifica se usuário atual está no time selecionado
const currentUserInSelectedTeam = computed(() => {
  if (!selectedTeam.value) return false;
  const currentUser = agentsStore.allAgents.find(a => a.id === '1');
  return currentUser?.timesIds?.includes(selectedTeam.value.id) ?? false;
});
</script>

