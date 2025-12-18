<template>
  <ScrollArea class="flex-1 min-h-0">
    <div class="flex flex-col p-4 gap-4">
      <template v-for="(group, groupIndex) in messageGroups" :key="groupIndex">
        <!-- Separador de Data -->
        <div class="flex items-center justify-center my-2">
          <div class="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            {{ formatDateHeader(group.date) }}
          </div>
        </div>

        <!-- Mensagens do Grupo -->
        <MessageBubble
          v-for="message in group.messages"
          :key="message.id"
          :message="message"
        />
      </template>

      <!-- Estado Vazio -->
      <div
        v-if="messages.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <MessageCircle class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm text-muted-foreground">
          Nenhuma mensagem ainda
        </p>
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, watch } from 'vue';
import { MessageCircle } from 'lucide-vue-next';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble.vue';
import type { Message } from '@/types/conversations';

interface Props {
  messages: Message[];
  conversationId: string;
}

const props = defineProps<Props>();

function formatDateHeader(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Resetar horas para comparar apenas datas
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Hoje';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}

const messageGroups = computed(() => {
  if (props.messages.length === 0) return [];

  // Ordenar mensagens por timestamp (mais antigas primeiro)
  const sortedMessages = [...props.messages].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB; // Ordem crescente: mais antigas primeiro
  });

  const groups: Array<{ date: string; messages: Message[] }> = [];
  let currentGroup: { date: string; messages: Message[] } | null = null;

  sortedMessages.forEach((message) => {
    const messageDate = new Date(message.timestamp);
    const dateKey = messageDate.toDateString();

    if (!currentGroup || currentGroup.date !== dateKey) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        date: dateKey,
        messages: [message],
      };
    } else {
      currentGroup.messages.push(message);
    }
  });

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
});

// Função para fazer scroll até o final
function scrollToBottom() {
  nextTick(() => {
    const scrollArea = document.querySelector('[data-reka-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  });
}

// Auto-scroll para última mensagem ao montar
onMounted(() => {
  scrollToBottom();
});

// Auto-scroll quando mensagens mudarem
watch(() => props.messages.length, () => {
  scrollToBottom();
});
</script>

