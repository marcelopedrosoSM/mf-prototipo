<template>
  <div
    v-if="isInHistory"
    class="flex justify-center items-start border-[1.5px] border-success/75 px-2 mt-1 rounded-lg mb-1"
  >
    <span class="text-xs text-success font-medium">Finalizada</span>
  </div>
  <div class="flex justify-between items-center">
    <div class="flex items-center min-w-0 flex-1">
      <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span class="text-xs font-bold text-primary-foreground">{{ getInitials(chat.sender.name) }}</span>
      </div>
      <span
        class="text-sm font-bold text-muted-foreground truncate ml-2 max-w-[250px]"
        v-html="highlightContactName"
      ></span>
    </div>
      <span class="text-xs text-muted-foreground flex-shrink-0 ml-2">
        {{ recentMessage.date || formatDate(recentMessage.timestamp) }}
      </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChatSession, Message } from '@/types/conversations';

interface Props {
  chat: ChatSession;
  recentMessage: Message;
  isInHistory?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isInHistory: false,
});

const sidebarSearch = defineModel<string>({
  required: false,
  default: '',
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

  if (!sidebarSearch.value) {
    return contactName;
  }

  const searchTerm = sidebarSearch.value.toLowerCase();
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

