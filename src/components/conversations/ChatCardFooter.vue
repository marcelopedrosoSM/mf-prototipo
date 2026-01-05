<template>
  <div class="flex items-center justify-between gap-2">
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

    <!-- Lado Direito: Avatares (Bot + Agente/Time) -->
    <div class="flex items-center justify-end gap-1 flex-shrink-0 ml-2">
      <!-- Bot Avatar (quando em fluxo de atendimento ativo) -->
      <div
        v-if="chat.linkedServiceFlow?.status === 'active'"
        class="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center border-2 border-background"
        :title="`Bot: ${chat.linkedServiceFlow.flowName}`"
      >
        <BotMessageSquare class="h-3 w-3 text-violet-600 dark:text-violet-400" />
      </div>
      
      <!-- Avatar do Agente/Time -->
      <AssignmentAvatar
        :user="chat.assignedUser?.user"
        :team="chat.assignedUser?.team"
        size="md"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MessageCircle } from 'lucide-vue-next';
import BotMessageSquare from '@/components/icons/BotMessageSquare.vue';
import AssignmentAvatar from '@/components/ui/AssignmentAvatar.vue';
import type { ChatSession } from '@/types/conversations';

interface Props {
  chat: ChatSession;
  isInHistory?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isInHistory: false,
});

// Limitar labels visíveis (mostrar até 2 labels)
const visibleLabels = computed(() => {
  if (!props.chat.labels || props.chat.labels.length === 0) return [];
  return props.chat.labels.filter(Boolean).slice(0, 2);
});

const remainingLabelsCount = computed(() => {
  if (!props.chat.labels) return 0;
  return Math.max(0, props.chat.labels.length - 2);
});
</script>

