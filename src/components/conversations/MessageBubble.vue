<template>
  <!-- Mensagem do Sistema -->
  <div
    v-if="isSystem"
    class="flex w-full justify-center my-2"
  >
    <div class="px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground italic">
      {{ message.content }}
    </div>
  </div>

  <!-- Mensagem Normal -->
  <div
    v-else
    :class="[
      'flex w-full group relative',
      isSent ? 'justify-end' : 'justify-start',
    ]"
  >
    <!-- Contact Avatar (for received messages) -->
    <div
      v-if="!isSent"
      class="flex-shrink-0 mr-2"
      :title="message.senderName"
    >
      <!-- Channel Icon (WhatsApp/etc) -->
      <div class="h-7 w-7 rounded-full bg-success/20 border border-success/50 flex items-center justify-center">
        <MessageCircle class="h-4 w-4 text-success" />
      </div>
    </div>

    <div
      :class="[
        'relative max-w-[70%] rounded-lg px-3 py-2 shadow-sm',
        isSent
          ? 'bg-muted text-foreground rounded-tr-none'
          : message.senderType === 'bot'
          ? 'bg-card text-card-foreground border-l-4 rounded-tl-none ' + (message.flowContext?.flowType === 'service' ? 'border-l-violet-500' : 'border-l-green-500')
          : 'bg-card text-card-foreground border border-border rounded-tl-none',
      ]"
    >
      <!-- Message Options (WhatsApp-style dropdown) -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            :class="[
              'absolute -top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-background hover:bg-muted border border-border shadow-md flex items-center justify-center',
              isSent ? 'right-2' : 'left-2'
            ]"
            title="Opções da mensagem"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem @click="handleAction('react')">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <span>Reagir</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleAction('reply')">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="9 14 4 9 9 4"/>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
            <span>Responder</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleAction('forward')">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="17 8 21 12 17 16"/>
              <path d="M3 12h18"/>
            </svg>
            <span>Encaminhar</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="handleAction('star')">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>Destacar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleAction('delete')" class="text-destructive focus:text-destructive">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Bot Message Header -->
      <div
        v-if="message.senderType === 'bot' && message.flowContext"
        class="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-border/50"
      >
        <component
          :is="botIcon"
          :class="[
            'h-3.5 w-3.5',
            message.flowContext.flowType === 'service'
              ? 'text-violet-500'
              : 'text-green-500'
          ]"
        />
        <span class="text-xs font-medium text-muted-foreground" :title="botTooltip">
          {{ message.flowContext.flowName }}
          <span v-if="message.flowContext.stepName" class="opacity-70">
            · {{ message.flowContext.stepName }}
          </span>
        </span>
      </div>

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
            >
              <!-- Imagem -->
              <div v-if="attachment.type === 'image'" class="relative group">
                <img
                  :src="attachment.url"
                  :alt="attachment.name"
                  class="max-w-[280px] w-full h-auto rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                  loading="lazy"
                />
                <!-- Legenda da imagem -->
                <p
                  v-if="message.content"
                  class="mt-2 text-sm whitespace-pre-wrap break-words"
                >
                  {{ message.content }}
                </p>
              </div>

              <!-- Áudio -->
              <div
                v-else-if="attachment.type === 'audio'"
                class="flex items-center gap-3 p-2 min-w-[240px] max-w-[280px]"
              >
                <!-- Play Button -->
                <button
                  class="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center flex-shrink-0 transition-colors"
                  title="Reproduzir áudio"
                >
                  <svg class="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <!-- Waveform visual (simplified) -->
                <div class="flex-1 flex items-center gap-0.5 h-8">
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 20%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 40%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 60%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 80%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 50%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 30%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 70%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 45%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 25%"></div>
                  <div class="w-1 bg-primary/40 rounded-full" style="height: 55%"></div>
                </div>
                <!-- Duração -->
                <span class="text-xs text-muted-foreground flex-shrink-0">0:21</span>
              </div>

              <!-- Vídeo -->
              <div v-else-if="attachment.type === 'video'" class="relative group max-w-[280px]">
                <video
                  :src="attachment.url"
                  class="w-full h-auto rounded-lg"
                  :poster="`${attachment.url}#t=0.1`"
                />
                <!-- Play overlay -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg group-hover:bg-black/30 transition-colors cursor-pointer">
                  <div class="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                    <svg class="h-8 w-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <!-- Legenda do vídeo -->
                <p
                  v-if="message.content"
                  class="mt-2 text-sm whitespace-pre-wrap break-words"
                >
                  {{ message.content }}
                </p>
              </div>

              <!-- Documento/Arquivo (PDF, etc) -->
              <div
                v-else
                class="flex items-center gap-3 p-3 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer min-w-[240px] max-w-[280px]"
              >
                <!-- Ícone do arquivo -->
                <div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText class="h-6 w-6 text-primary" />
                </div>
                <!-- Info do arquivo -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ attachment.name }}</p>
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
          v-if="isSent && message.senderType === 'user'"
          :is="statusIcon"
          :class="[
            'h-3 w-3 text-muted-foreground',
            message.status === 'read' ? 'text-foreground' : '',
          ]"
        />
      </div>
    </div>

    <!-- Sender Avatar (for sent messages) -->
    <div
      v-if="isSent"
      class="flex-shrink-0 ml-2"
      :title="senderTooltip"
    >
      <!-- Bot Avatar -->
      <div
        v-if="message.senderType === 'bot'"
        :class="[
          'h-7 w-7 rounded-full flex items-center justify-center',
          message.flowContext?.flowType === 'service'
            ? 'bg-violet-100 dark:bg-violet-900/30'
            : 'bg-green-100 dark:bg-green-900/30'
        ]"
      >
        <component
          :is="botIcon"
          :class="[
            'h-3.5 w-3.5',
            message.flowContext?.flowType === 'service'
              ? 'text-violet-600 dark:text-violet-400'
              : 'text-green-600 dark:text-green-400'
          ]"
        />
      </div>
      <!-- User Avatar (iniciais) -->
      <div
        v-else
        class="h-7 w-7 rounded-full bg-primary flex items-center justify-center"
      >
        <span class="text-[10px] font-bold text-primary-foreground">
          {{ getInitials(message.senderName) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check, CheckCheck, AlertCircle, FileText, MessageCircle } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BotMessageSquare from '@/components/icons/BotMessageSquare.vue';
import BotIcon from '@/components/icons/BotIcon.vue';
import type { Message } from '@/types/conversations';

interface Props {
  message: Message;
}

const props = defineProps<Props>();

const isSystem = computed(() => {
  return props.message.senderType === 'system';
});

const isSent = computed(() => {
  // User (agent) and Bot messages go on the right side
  return props.message.senderType === 'user' || props.message.senderType === 'bot';
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

// Bot icon based on flow type
const botIcon = computed(() => {
  if (props.message.flowContext?.flowType === 'service') {
    return BotMessageSquare; // Fluxo de Atendimento
  }
  return BotIcon; // Fluxo de Atividades
});

// Tooltip for bot messages showing flow context
const botTooltip = computed(() => {
  if (props.message.senderType !== 'bot' || !props.message.flowContext) {
    return '';
  }
  const fc = props.message.flowContext;
  const flowTypeLabel = fc.flowType === 'service' ? 'Atendimento' : 'Atividades';
  let tooltip = `Fluxo de ${flowTypeLabel}: ${fc.flowName}`;
  if (fc.stepName) {
    tooltip += ` > ${fc.stepName}`;
  } else if (fc.stepNumber && fc.totalSteps) {
    tooltip += ` > Etapa ${fc.stepNumber}/${fc.totalSteps}`;
  }
  return tooltip;
});

// Tooltip for sender avatar
const senderTooltip = computed(() => {
  if (props.message.senderType === 'bot') {
    return botTooltip.value;
  }
  return props.message.senderName || 'Agente';
});

// Get initials from name
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function handleAction(action: string) {
  console.log(`Action executed: ${action} for message ${props.message.id}`);
  // In a real application, we would emit an event or call a store method here.
}

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

