<template>
  <AppLayout v-model:collapsed="isAppSidebarCollapsed" v-slot="{ selectedStatus }">
    <div class="flex h-full overflow-hidden max-h-full">
      <!-- Sidebar de Conversas -->
      <div class="w-[400px] flex-shrink-0 border-r border-border">
        <ConversationSidebar
          :selected-chat-id="selectedChat?.id"
          :status-filter="selectedStatus"
          @select-chat="handleSelectChat"
          @inbox-change="handleInboxChange"
        />
      </div>

      <!-- Área de Chat -->
      <div class="flex-1 min-w-0">
        <ChatView
          :chat="selectedChat"
          @send-message="handleSendMessage"
          @labels-changed="handleLabelsChanged"
          @update:details-open="handleDetailsOpen"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import AppLayout from '@/components/layout/AppLayout.vue';
import ConversationSidebar from '@/components/conversations/ConversationSidebar.vue';
import ChatView from '@/components/conversations/ChatView.vue';
import type { ChatSession, Label, Message } from '@/types/conversations';

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

function handleSendMessage(message: string, replyingTo?: Message | null) {
  if (!selectedChat.value) return;

  // Criar nova mensagem mock
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId: selectedChat.value.id,
    content: message,
    type: 'text',
    status: 'sent',
    senderId: 'current-user',
    senderName: 'Você',
    senderType: 'user',
    timestamp: new Date().toISOString(),
    quotedMessageId: replyingTo?.id,
    quotedMessage: replyingTo || undefined,
  };

  // Adicionar mensagem à conversa selecionada
  selectedChat.value.messages.push(newMessage);
  selectedChat.value.lastActivityAt = new Date().toISOString();
  selectedChat.value.lastActivityUserAt = new Date().toISOString();

  // Simular resposta do bot com typing indicator
  if (Math.random() > 0.5) { // 50% chance de resposta automática
    // Ativar typing indicator
    selectedChat.value.isTyping = true;

    setTimeout(() => {
      if (!selectedChat.value) return;
      
      // Desativar typing
      selectedChat.value.isTyping = false;

      // Adicionar resposta do bot
      const botReply: Message = {
        id: `msg-bot-${Date.now()}`,
        conversationId: selectedChat.value.id,
        content: 'Obrigado pela mensagem! Em breve um de nossos atendentes irá responder.',
        type: 'text',
        status: 'read',
        senderId: 'bot-1',
        senderName: 'Bot',
        senderType: 'contact',
        timestamp: new Date().toISOString(),
      };
      selectedChat.value.messages.push(botReply);
    }, 1500); // 1.5s delay
  }
}

function handleLabelsChanged(labels: Label[]) {
  if (!selectedChat.value) return;

  // Atualizar labels da conversa
  selectedChat.value.labels = labels;
}
// Responsive & Layout Logic
const isHDScreen = useMediaQuery('(max-width: 1366px)');
const isAppSidebarCollapsed = ref(false);

function handleDetailsOpen(isOpen: boolean) {
  if (isOpen && isHDScreen.value) {
    isAppSidebarCollapsed.value = true;
  }
}
</script>


