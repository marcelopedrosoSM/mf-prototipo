<template>
  <ScrollArea ref="scrollAreaRef" class="flex-1 min-h-0">
    <div class="flex flex-col p-4 gap-4">
      <!-- Pinned Messages Section -->
      <div v-if="pinnedMessages.length > 0" class="mb-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <Pin class="h-4 w-4 text-primary" />
          <h3 class="text-xs font-semibold text-primary uppercase tracking-wider">Mensagens Fixadas</h3>
        </div>
        <div class="space-y-2">
          <MessageBubble
            v-for="message in pinnedMessages"
            :key="message.id"
            :message="message"
            :search-query="searchQuery"
            @reply="(msg) => $emit('reply', msg)"
            @delete="(id) => $emit('delete', id)"
            @view-media="(media) => $emit('view-media', media)"
            @add-reaction="(msgId, emoji) => $emit('add-reaction', msgId, emoji)"
            @remove-reaction="(msgId, emoji) => $emit('remove-reaction', msgId, emoji)"
            @pin="(msgId) => $emit('pin', msgId)"
          />
        </div>
      </div>

      <template v-for="(group, groupIndex) in messageGroups" :key="groupIndex">
        <!-- Separador de Data -->
        <div class="relative flex items-center justify-center my-6">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs uppercase text-muted-foreground">
            <span class="bg-background px-2 text-xs font-semibold tracking-wider text-muted-foreground border border-border rounded-full py-0.5">
              {{ formatDateHeader(group.date) }}
            </span>
          </div>
        </div>

        <!-- Mensagens do Grupo -->
        <template v-for="message in group.messages" :key="message.id">
          <!-- Note Message -->
          <NoteMessage
            v-if="message.type === 'note'"
            :note="message"
            @edit="(note) => $emit('edit-note', note)"
            @delete="(note) => $emit('delete-note', note)"
          />
          
          <!-- Regular Message -->
          <MessageBubble
            v-else
            :message="message"
            :search-query="searchQuery"
            @reply="(msg) => $emit('reply', msg)"
            @delete="(id) => $emit('delete', id)"
            @view-media="(media) => $emit('view-media', media)"
            @add-reaction="(msgId, emoji) => $emit('add-reaction', msgId, emoji)"
            @remove-reaction="(msgId, emoji) => $emit('remove-reaction', msgId, emoji)"
            @pin="(msgId) => $emit('pin', msgId)"
          />
        </template>
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
import { computed, onMounted, nextTick, watch, ref } from 'vue';
import { MessageCircle, Pin } from 'lucide-vue-next';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble.vue';
import NoteMessage from './NoteMessage.vue';
import type { Message } from '@/types/conversations';

interface Props {
  messages: Message[];
  conversationId: string;
  searchQuery?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'reply': [message: Message];
  'delete': [id: string];
  'view-media': [media: { type: 'image' | 'video'; src: string }];
  'add-reaction': [messageId: string, emoji: string];
  'remove-reaction': [messageId: string, emoji: string];
  'pin': [messageId: string];
  'edit-note': [note: any];
  'delete-note': [note: any];
}>();

// Template ref for scroll area
const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null);

function formatDateHeader(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Resetar horas para comparar apenas datas
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  let label = '';
  if (dateOnly.getTime() === todayOnly.getTime()) {
    label = 'Hoje';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    label = 'Ontem';
  } else {
    label = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
  
  // Capitalize first letter
  return label.charAt(0).toUpperCase() + label.slice(1);
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

// Pinned messages
const pinnedMessages = computed(() => {
  return props.messages.filter(msg => msg.isPinned);
});

// Função para fazer scroll até o final - usando ref local
function scrollToBottom() {
  nextTick(() => {
    if (scrollAreaRef.value) {
      // Access the internal viewport element via the component's $el
      const viewport = scrollAreaRef.value.$el?.querySelector('[data-reka-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
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

