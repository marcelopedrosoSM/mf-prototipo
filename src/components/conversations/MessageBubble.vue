<template>
  <div
    :class="[
      'flex w-full',
      isSent ? 'justify-end' : 'justify-start',
    ]"
  >
    <div
      :class="[
        'max-w-[70%] rounded-lg px-3 py-2 shadow-sm',
        isSent
          ? 'bg-muted text-foreground rounded-tr-none'
          : 'bg-card text-card-foreground border border-border rounded-tl-none',
      ]"
    >
      <!-- Mensagem Citada (Reply) -->
      <div
        v-if="message.quotedMessage"
        :class="[
          'mb-2 pl-3 border-l-2 rounded-sm py-1 text-xs',
          isSent
            ? 'border-border bg-muted/70'
            : 'border-border bg-muted/50',
        ]"
      >
        <p class="font-semibold truncate">
          {{ message.quotedMessage.senderName }}
        </p>
        <p class="truncate">
          {{ message.quotedMessage.content }}
        </p>
      </div>

      <!-- Conteúdo da Mensagem -->
      <div class="flex items-start gap-2">
        <div class="flex-1 min-w-0">
          <!-- Texto -->
          <p
            v-if="message.type === 'text'"
            class="text-sm whitespace-pre-wrap break-words"
          >
            {{ message.content }}
          </p>

          <!-- Anexos -->
          <div v-if="message.attachments && message.attachments.length > 0" class="space-y-2">
            <div
              v-for="attachment in message.attachments"
              :key="attachment.id"
              class="rounded-md overflow-hidden"
            >
              <!-- Imagem -->
              <div v-if="attachment.type === 'image'" class="relative">
                <img
                  :src="attachment.url"
                  :alt="attachment.name"
                  class="max-w-full h-auto rounded-md"
                />
                <p
                  v-if="message.content"
                  class="mt-2 text-sm"
                >
                  {{ message.content }}
                </p>
              </div>

              <!-- Áudio -->
              <div
                v-else-if="attachment.type === 'audio'"
                class="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
              >
                <Headphones class="h-5 w-5" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold truncate">{{ attachment.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatFileSize(attachment.size) }}
                  </p>
                </div>
              </div>

              <!-- Vídeo -->
              <div v-else-if="attachment.type === 'video'" class="relative">
                <video
                  :src="attachment.url"
                  class="max-w-full h-auto rounded-md"
                  controls
                />
                <p
                  v-if="message.content"
                  class="mt-2 text-sm"
                >
                  {{ message.content }}
                </p>
              </div>

              <!-- Documento/Arquivo -->
              <div
                v-else
                class="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
              >
                <FileText class="h-5 w-5" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold truncate">{{ attachment.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatFileSize(attachment.size) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tipo não suportado -->
          <div
            v-if="message.type === 'unsupported'"
            class="flex items-center gap-2 text-xs italic"
          >
            <AlertCircle class="h-4 w-4" />
            <span>Mensagem não suportada</span>
          </div>
        </div>
      </div>

      <!-- Timestamp e Status -->
      <div
        :class="[
          'flex items-center gap-1 mt-1',
          isSent ? 'justify-end' : 'justify-start',
          'text-muted-foreground',
        ]"
      >
        <span class="text-xs">
          {{ formatTime(message.timestamp) }}
        </span>
        <component
          v-if="isSent"
          :is="statusIcon"
          :class="[
            'h-3 w-3 text-muted-foreground',
            message.status === 'read' ? 'text-foreground' : '',
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check, CheckCheck, AlertCircle, Headphones, FileText } from 'lucide-vue-next';
import type { Message } from '@/types/conversations';

interface Props {
  message: Message;
}

const props = defineProps<Props>();

const isSent = computed(() => {
  return props.message.senderType === 'user';
});

const statusIcon = computed(() => {
  switch (props.message.status) {
    case 'read':
      return CheckCheck;
    case 'delivered':
      return CheckCheck;
    case 'sent':
      return Check;
    default:
      return Check;
  }
});

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
</script>

