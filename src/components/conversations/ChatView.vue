<template>
  <div v-if="chat" class="flex flex-col h-full max-h-full bg-background overflow-hidden">
    <!-- Header do Chat -->
    <div class="flex items-center justify-between p-4 bg-background border-b border-border">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Avatar -->
        <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-bold text-primary-foreground">
            {{ getInitials(chat.sender.name) }}
          </span>
        </div>

        <!-- Nome e Info -->
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-sm font-semibold text-foreground truncate">
            {{ chat.sender.name }}
          </span>
          <span class="text-xs text-muted-foreground truncate">
            {{ chat.inbox.phoneNumber }}
          </span>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Adicionar Etiqueta -->
        <Button variant="ghost" size="icon" title="Adicionar etiqueta">
          <Tag class="h-4 w-4" />
        </Button>

        <!-- Buscar -->
        <Button variant="ghost" size="icon" title="Buscar">
          <Search class="h-4 w-4" />
        </Button>

        <!-- Atribuir -->
        <div class="relative">
          <Button variant="ghost" size="icon" title="Atribuir">
            <Users class="h-4 w-4" />
          </Button>
          <div
            v-if="chat.assignedUser"
            class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background"
          />
        </div>

        <!-- Finalizar -->
        <Button variant="default" class="bg-primary text-primary-foreground" title="Finalizar">
          <Check class="h-4 w-4 mr-1" />
          Finalizar
        </Button>

        <!-- Menu -->
        <Button variant="ghost" size="icon" title="Mais opções">
          <MoreVertical class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Banner de Atribuição -->
    <div
      v-if="chat.assignedUser"
      class="px-4 py-2 bg-muted/50 border-b border-border text-center"
    >
      <p class="text-xs text-muted-foreground">
        Conversa atribuída a
        <span class="font-semibold">{{ chat.assignedUser.user.name }}</span>
        <span v-if="chat.assignedUser.team">
          do time <span class="font-semibold">{{ chat.assignedUser.team.name }}</span>
        </span>
      </p>
    </div>

    <!-- Área de Mensagens -->
    <MessageList
      :messages="chat.messages"
      :conversation-id="chat.id"
      class="flex-1"
    />

    <!-- Input de Mensagem -->
    <ChatInput
      :inbox="chat.inbox"
      @send-message="handleSendMessage"
    />
  </div>

  <!-- Estado Vazio -->
  <div
    v-else
    class="flex flex-col items-center justify-center h-full bg-background"
  >
    <MessageCircle class="h-16 w-16 text-muted-foreground mb-4" />
    <p class="text-lg font-semibold text-foreground mb-2">
      Selecione uma conversa
    </p>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Escolha uma conversa da lista ao lado para começar a trocar mensagens
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Tag, Search, Users, Check, MoreVertical, MessageCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import MessageList from './MessageList.vue';
import ChatInput from './ChatInput.vue';
import type { ChatSession, Message } from '@/types/conversations';

interface Props {
  chat: ChatSession | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'send-message': [message: string];
}>();

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function handleSendMessage(message: string) {
  emit('send-message', message);
}
</script>

