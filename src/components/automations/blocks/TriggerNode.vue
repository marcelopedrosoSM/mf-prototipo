<template>
  <BaseNodeCard
    :selected="selected"
    :title="data.title"
    :accent-color="config.color"
    :is-entry-exit="false"
  >
    <template #icon>
      <component :is="iconComponent" class="h-4 w-4" :style="{ color: config.color }" />
    </template>

    <template #body="{ colors }">
      <div class="px-3 py-2">
        <p :style="{ color: colors.textSecondary }" class="text-xs leading-relaxed">
          {{ config.description }}
        </p>
      </div>
    </template>

    <template #handles>
      <Handle
        type="source"
        :position="Position.Right"
        class="!w-4 !h-4 !border-4 !border-background !-right-2 z-50 transition-all hover:!w-5 hover:!h-5"
        :style="{ backgroundColor: '#b1b1b7' }"
      />
    </template>
  </BaseNodeCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { MessageSquare, MessageSquarePlus, CheckCircle2, Play } from 'lucide-vue-next';
import BaseNodeCard from '@/components/flow-builder/BaseNodeCard.vue';

interface Props {
  id: string;
  data: {
    type: string;
    title: string;
  };
  selected?: boolean;
}

const props = defineProps<Props>();

const CONFIG = {
  trigger_message_received: {
    icon: MessageSquare,
    color: '#3B82F6',
    description: 'Quando o contato envia uma mensagem'
  },
  trigger_conversation_created: {
    icon: MessageSquarePlus,
    color: '#10B981',
    description: 'Quando uma nova conversa é iniciada'
  },
  trigger_conversation_closed: {
    icon: CheckCircle2,
    color: '#EF4444',
    description: 'Quando a conversa é finalizada'
  },
  trigger_manual: {
    icon: Play,
    color: '#6366f1',
    description: 'Disparo manual para testes'
  }
};

const config = computed(() => {
  return CONFIG[props.data.type as keyof typeof CONFIG] || CONFIG.trigger_message_received;
});

const iconComponent = computed(() => config.value.icon);
</script>
