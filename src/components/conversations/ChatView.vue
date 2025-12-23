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
        <!-- Gerenciar Etiquetas -->
        <LabelsManager :chat="chat" @labels-changed="handleLabelsChanged" />

        <!-- Buscar -->
        <Button variant="ghost" size="icon" title="Buscar">
          <Search class="h-4 w-4" />
        </Button>

        <!-- Gerenciar Atribuição -->
        <AssignmentManager :chat="chat" @assigned="handleAssigned" @unassigned="handleUnassigned" />

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
    class="flex flex-col items-center justify-center h-full bg-background p-8"
  >
    <div class="h-24 w-24 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center mb-6">
      <MessageCircle class="h-10 w-10 text-violet-600 dark:text-violet-400 animate-float" />
    </div>
    <h2 class="text-2xl font-bold text-foreground mb-2">
      Selecione uma conversa
    </h2>
    <p class="text-muted-foreground text-center max-w-md">
      Escolha uma conversa da lista ao lado para começar a trocar mensagens
    </p>
  </div>
</template>

<script setup lang="ts">
import { Search, Check, MoreVertical, MessageCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import MessageList from './MessageList.vue';
import ChatInput from './ChatInput.vue';
import LabelsManager from './LabelsManager.vue';
import AssignmentManager from './AssignmentManager.vue';
import type { ChatSession, Label } from '@/types/conversations';

interface Props {
  chat: ChatSession | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'send-message': [message: string];
  'labels-changed': [labels: Label[]];
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

function handleLabelsChanged(labels: Label[]) {
  emit('labels-changed', labels);
}

function handleAssigned() {
  // Conversa foi atribuída
}

function handleUnassigned() {
  // Atribuição foi removida
}
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>

