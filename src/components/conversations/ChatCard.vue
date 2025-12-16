<template>
  <div
    :class="[
      'py-3 px-4 cursor-pointer transition-colors border-b border-border',
      isSelected 
        ? 'bg-muted/50' 
        : 'bg-background hover:bg-muted/30',
      isInHistory && 'bg-muted/20',
    ]"
    @click="handleClick"
  >
    <div class="flex flex-col w-full">
      <ChatCardHeader
        :chat="chat"
        :recent-message="recentMessage"
        :is-in-history="isInHistory"
        :search-query="props.searchQuery"
      />
      <div
        v-if="recentMessage.id"
        class="flex justify-between items-center mt-1.5 mb-1.5"
      >
        <ChatCardMessage :last-message="recentMessage" />
        <span
          v-if="chat.unreadCount > 0"
          class="h-5 min-w-5 px-1.5 text-xs font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 ml-auto"
        >
          {{ formatBadgeQuantity(chat.unreadCount) }}
        </span>
      </div>
      <ChatCardFooter :chat="chat" :is-in-history="isInHistory" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChatSession, Message } from '@/types/conversations';
import ChatCardHeader from './ChatCardHeader.vue';
import ChatCardMessage from './ChatCardMessage.vue';
import ChatCardFooter from './ChatCardFooter.vue';

interface Props {
  chat: ChatSession;
  isSelected?: boolean;
  isOnWaitingQueue?: boolean;
  isLast?: boolean;
  isInHistory?: boolean;
  searchQuery?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isOnWaitingQueue: false,
  isLast: false,
  isInHistory: false,
  searchQuery: '',
});

const emit = defineEmits<{
  'select-chat': [chat: ChatSession];
}>();

const recentMessage = computed<Message>(() => {
  const lastMsg = props.chat.messages[props.chat.messages.length - 1];
  if (lastMsg && lastMsg.type === 'unsupported') {
    return { ...lastMsg, content: 'Mensagem não suportada' };
  }
  return (
    lastMsg || {
      id: '',
      conversationId: props.chat.id,
      content: '',
      type: 'text',
      status: 'sent',
      senderId: '',
      senderName: '',
      senderType: 'contact',
      timestamp: new Date().toISOString(),
    }
  );
});

const formatBadgeQuantity = (count: number): string => {
  if (count > 99) return '+99';
  return String(count);
};

const handleClick = () => {
  emit('select-chat', props.chat);
};
</script>

