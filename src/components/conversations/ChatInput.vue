<template>
  <div class="flex flex-col bg-background border-t border-border">
    <!-- Info da Caixa -->
    <div class="px-4 py-2 bg-muted/30 border-b border-border">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageCircle class="h-4 w-4 text-success" />
        <span>
          {{ inbox.name }}: {{ inbox.phoneNumber }}
        </span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex items-end gap-2 p-4">
      <!-- Botões de Anexo -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9"
          title="Anexar documento"
        >
          <Paperclip class="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9"
          title="Anexar imagem"
        >
          <Image class="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <!-- Input de Texto -->
      <div class="flex-1 relative">
        <Textarea
          v-model="messageText"
          :placeholder="placeholder"
          class="min-h-[44px] max-h-[120px] resize-none pr-10"
          @keydown="handleKeyDown"
          @input="handleInput"
        />
        <!-- Ícones dentro do input -->
        <div class="absolute right-2 bottom-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            title="Mais opções"
          >
            <Plus class="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            title="Ações rápidas"
          >
            <Zap class="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <Button
          v-if="messageText.trim()"
          variant="default"
          size="icon"
          class="h-9 w-9 bg-primary text-primary-foreground"
          @click="handleSend"
          title="Enviar mensagem"
        >
          <Send class="h-5 w-5" />
        </Button>
        <Button
          v-else
          variant="ghost"
          size="icon"
          class="h-9 w-9"
          title="Gravar áudio"
        >
          <Mic class="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  MessageCircle,
  Paperclip,
  Image,
  Plus,
  Zap,
  Send,
  Mic,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Inbox } from '@/types/conversations';

interface Props {
  inbox: Inbox;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Escreva sua mensagem',
});

const emit = defineEmits<{
  'send-message': [message: string];
}>();

const messageText = ref('');

function handleKeyDown(event: KeyboardEvent) {
  // Enviar com Enter (sem Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (messageText.value.trim()) {
      handleSend();
    }
  }
}

function handleInput() {
  // Auto-resize do textarea pode ser adicionado aqui
}

function handleSend() {
  if (messageText.value.trim()) {
    emit('send-message', messageText.value.trim());
    messageText.value = '';
  }
}
</script>

