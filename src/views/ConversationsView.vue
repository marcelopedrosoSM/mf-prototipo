<template>
  <AppLayout>
    <div class="flex h-full overflow-hidden max-h-full">
      <!-- Sidebar de Conversas -->
      <div class="w-[400px] flex-shrink-0 border-r border-border">
        <ConversationSidebar
          :selected-chat-id="selectedChat?.id"
          @select-chat="handleSelectChat"
          @inbox-change="handleInboxChange"
        />
      </div>

      <!-- Área de Chat -->
      <div class="flex-1 min-w-0">
        <ChatView
          :chat="selectedChat"
          @send-message="handleSendMessage"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import ConversationSidebar from '@/components/conversations/ConversationSidebar.vue';
import ChatView from '@/components/conversations/ChatView.vue';
import type { ChatSession } from '@/types/conversations';

const selectedChat = ref<ChatSession | null>(null);

function handleSelectChat(chat: ChatSession) {
  selectedChat.value = chat;
}

function handleInboxChange(inboxId: string | null) {
  // Pode ser usado para filtrar ou recarregar conversas
  if (!inboxId) {
    selectedChat.value = null;
  }
}

function handleSendMessage(message: string) {
  if (!selectedChat.value) return;

  // Criar nova mensagem mock
  const newMessage = {
    id: `msg-${Date.now()}`,
    conversationId: selectedChat.value.id,
    content: message,
    type: 'text' as const,
    status: 'sent' as const,
    senderId: 'current-user',
    senderName: 'Você',
    senderType: 'user' as const,
    timestamp: new Date().toISOString(),
  };

  // Adicionar mensagem à conversa selecionada
  selectedChat.value.messages.push(newMessage);
  selectedChat.value.lastActivityAt = new Date().toISOString();
  selectedChat.value.lastActivityUserAt = new Date().toISOString();
}
</script>


