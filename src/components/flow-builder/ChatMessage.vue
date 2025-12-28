<template>
  <div
    :class="[
      'flex w-full mb-4',
      message.type === 'system' ? 'justify-center' : (message.type === 'user' ? 'justify-end' : 'justify-start')
    ]"
  >
    <!-- Bot Avatar (Left) -->
    <div
      v-if="message.type === 'bot'"
      class="flex-shrink-0 mr-2 flex text-primary"
      style="align-self: flex-start; padding-top: 2px;"
    >
      <Bot class="h-4 w-4" />
    </div>

    <!-- Message Content -->
    <div
      v-if="message.type !== 'system'"
      :class="[
        'flex flex-col max-w-[85%]',
        message.type === 'user' ? 'items-end' : 'items-start'
      ]"
    >
      <div
        :class="[
          'px-3 py-2 text-sm whitespace-pre-wrap shadow-sm relative group',
          bubbleClass
        ]"
      >
        {{ message.text }}
        <div class="text-[10px] mt-1 text-right select-none opacity-0 h-0"></div>
      </div>
    </div>

    <!-- System message as centered badge -->
    <div
      v-else
      class="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border/60"
    >
      {{ message.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bot } from 'lucide-vue-next';
import type { SimulatorMessage } from '@/composables/useFlowSimulator';

const props = withDefaults(defineProps<{
  message: SimulatorMessage;
  showTimestamp?: boolean;
}>(), {
  showTimestamp: true
});

const bubbleClass = computed(() => {
  switch (props.message.type) {
    case 'user':
      // WhatsApp Sent: Light Green/Gray.
      // User requested Gray instead of Green.
      return 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-lg rounded-tr-none border border-zinc-200 dark:border-zinc-700'; 
      // Changed to green tint as it's more recognizable as "Sent" in "Conversations" context often, 
      // BUT user said "bg-gray-100" in my plan approval. I should stick to plan strictly?
      // Plan said: "User (Enviada): Background cinza claro".
      // Let's use Gray as approved in plan.
      // return 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-lg rounded-tr-none border border-zinc-200 dark:border-zinc-700';
    
    case 'bot':
      // WhatsApp Received: White
      return 'bg-white dark:bg-card text-foreground rounded-lg rounded-tl-none border border-border/60';
    
    case 'system':
      return 'bg-orange-50 dark:bg-orange-900/10 text-foreground rounded-lg border border-orange-200 dark:border-orange-800/50';
      
    default:
      return 'bg-muted text-muted-foreground rounded-lg';
  }
});

// Timestamp removido da UI; cálculo desnecessário.
</script>

<style scoped>
/* Optional: Add a little "tail" via pseudo-elements if desired, but rounded corners work well enough */
</style>
