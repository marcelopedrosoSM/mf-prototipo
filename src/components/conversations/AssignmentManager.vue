<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <div class="relative">
        <Button variant="ghost" size="icon" :title="getButtonTitle()">
          <Users class="h-4 w-4" />
        </Button>
        <div
          v-if="chat.assignedUser?.user || chat.assignedUser?.team"
          class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background"
        />
      </div>
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
          <div class="text-xs font-medium text-muted-foreground mb-2">Atribuição atual</div>
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

        <!-- Actions -->
        <div class="px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            class="w-full"
            @click="handleAssign"
          >
            <UserPlus class="h-4 w-4 mr-2" />
            {{ chat.assignedUser ? 'Alterar Atribuição' : 'Atribuir Conversa' }}
          </Button>
          <Button
            v-if="chat.assignedUser"
            variant="ghost"
            size="sm"
            class="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            @click="handleUnassign"
          >
            <X class="h-4 w-4 mr-2" />
            Remover Atribuição
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Users, UserPlus, X } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ChatSession } from '@/types/conversations';

interface Props {
  chat: ChatSession;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'assigned': [];
  'unassigned': [];
}>();

const isOpen = ref(false);

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

// Mock handlers (não implementados ainda)
const handleAssign = () => {
  console.log('Atribuir conversa - não implementado');
  // TODO: Abrir modal/seletor de agente e time
};

const handleUnassign = () => {
  console.log('Remover atribuição - não implementado');
  // TODO: Remover atribuição da conversa
  emit('unassigned');
};
</script>

