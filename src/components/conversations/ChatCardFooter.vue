<template>
  <div class="flex items-center justify-between gap-1 mt-1 flex-nowrap">
    <!-- Lado Esquerdo: Badge WhatsApp, Labels -->
    <div class="flex items-center gap-1 flex-1 min-w-0">
      <!-- Badge WhatsApp (Canal) -->
      <div class="flex items-center justify-center h-5 w-5 rounded-full bg-success/20 border border-success/50 flex-shrink-0">
        <MessageCircle class="h-3 w-3 text-success" />
      </div>
      
      <!-- Labels -->
      <div
        v-for="label in visibleLabels"
        :key="label.id"
        class="flex items-center mr-1"
      >
        <div
          class="px-1.5 py-0.5 rounded text-xs font-bold"
          :style="{
            backgroundColor: `${label.color}20`,
            color: label.color,
            border: `1px solid ${label.color}40`
          }"
        >
          {{ label.name }}
        </div>
      </div>
      
      <!-- Badge de labels restantes -->
      <div
        v-if="remainingLabelsCount > 0"
        class="h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0"
      >
        +{{ remainingLabelsCount }}
      </div>
    </div>

    <!-- Lado Direito: Avatar do Time e Usuário -->
    <div class="flex items-center gap-1 flex-shrink-0 ml-2">
      <!-- Avatar do Time (se houver) -->
      <div
        v-if="chat.assignedUser?.team"
        class="h-[25px] w-[25px] rounded-full border border-white/75 bg-muted flex items-center justify-center flex-shrink-0 -mr-[12px] z-10"
        :title="chat.assignedUser.team.name"
      >
        <span class="text-[10px] font-bold text-foreground">
          {{ getInitials(chat.assignedUser.team.name) }}
        </span>
      </div>
      <!-- Avatar do Usuário -->
      <div
        v-if="chat.assignedUser?.user"
        class="h-[25px] w-[25px] rounded-full border border-muted bg-primary/10 flex items-center justify-center flex-shrink-0"
        :title="chat.assignedUser.user.name"
      >
        <span class="text-[10px] font-bold text-primary">
          {{ getInitials(chat.assignedUser.user.name) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MessageCircle } from 'lucide-vue-next';
import type { ChatSession } from '@/types/conversations';

interface Props {
  chat: ChatSession;
  isInHistory?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isInHistory: false,
});

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Limitar labels visíveis (mostrar até 2 labels)
const visibleLabels = computed(() => {
  if (!props.chat.labels || props.chat.labels.length === 0) return [];
  return props.chat.labels.slice(0, 2);
});

const remainingLabelsCount = computed(() => {
  if (!props.chat.labels) return 0;
  return Math.max(0, props.chat.labels.length - 2);
});
</script>

