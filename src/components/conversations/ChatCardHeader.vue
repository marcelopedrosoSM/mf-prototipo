<template>
  <div class="flex justify-between items-center">
    <div class="flex items-center min-w-0 flex-1">
      <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span class="text-xs font-bold text-primary-foreground">{{ getInitials(chat.sender.name) }}</span>
      </div>
      <span
        class="text-sm font-semibold text-foreground truncate ml-2 max-w-[250px]"
        v-html="highlightContactName"
      ></span>
      <CheckCircle2
        v-if="chat.status === 'closed'"
        class="h-4 w-4 text-success ml-1.5 flex-shrink-0"
      />
    </div>
      <span class="text-xs text-muted-foreground flex-shrink-0 ml-2">
        {{ recentMessage.date || formatDate(recentMessage.timestamp) }}
      </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2 } from 'lucide-vue-next';
import type { ChatSession, Message } from '@/types/conversations';

interface Props {
  chat: ChatSession;
  recentMessage: Message;
  isInHistory?: boolean;
  searchQuery?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isInHistory: false,
  searchQuery: '',
});

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Ontem';
  } else if (days < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const highlightContactName = computed(() => {
  const contactName = props.chat.sender.name;

  if (!props.searchQuery) {
    return contactName;
  }

  const searchTerm = props.searchQuery.toLowerCase();
  const nameLower = contactName.toLowerCase();

  if (nameLower.includes(searchTerm)) {
    const startIndex = nameLower.indexOf(searchTerm);
    const endIndex = startIndex + searchTerm.length;

    const beforeMatch = contactName.substring(0, startIndex);
    const matchPart = contactName.substring(startIndex, endIndex);
    const afterMatch = contactName.substring(endIndex);

    return `${beforeMatch}<span class="text-primary text-sm font-bold">${matchPart}</span>${afterMatch}`;
  }

  return contactName;
});
</script>

