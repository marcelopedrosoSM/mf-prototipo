<template>
  <div class="flex flex-col bg-background border-t border-border">
    <!-- Info da Caixa -->
    <div class="px-4 py-2 bg-muted/30 border-b border-border flex justify-between items-center">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageCircle class="h-4 w-4 text-success" />
        <span>
          {{ inbox.name }}: {{ inbox.phoneNumber }}
        </span>
      </div>

      <!-- Mode Switcher -->
      <div class="flex p-0.5 bg-muted rounded-md self-end">
        <button
          class="px-3 py-1 text-xs font-medium rounded-sm transition-all"
          :class="inputMode === 'text' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="switchMode('text')"
        >
          Mensagem
        </button>
        <button
          class="px-3 py-1 text-xs font-medium rounded-sm transition-all flex items-center gap-1"
          :class="inputMode === 'note' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200 shadow' : 'text-muted-foreground hover:text-foreground'"
          @click="switchMode('note')"
        >
          <StickyNote class="h-3 w-3" />
          Nota Interna
        </button>
      </div>
    </div>

    <!-- Hidden Inputs -->
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      @change="(e) => handleFileSelected(e, 'file')"
    />
    <input
      type="file"
      ref="imageInput"
      accept="image/*"
      class="hidden"
      @change="(e) => handleFileSelected(e, 'image')"
    />

    <!-- Reply Context -->
    <div v-if="replyingTo" class="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
       <div class="flex items-center gap-2 overflow-hidden">
          <div class="h-8 w-1 bg-primary rounded-full"></div>
          <div class="flex flex-col text-xs min-w-0">
             <span class="font-bold text-primary truncate">Respondendo a {{ replyingTo.senderName }}</span>
             <span class="text-muted-foreground truncate max-w-[300px]">{{ replyingTo.content }}</span>
          </div>
       </div>
       <Button variant="ghost" size="icon" class="h-6 w-6" @click="$emit('cancel-reply')">
          <X class="h-4 w-4" />
       </Button>
    </div>

      <!-- Input Area -->
      <div v-if="conversationStatus === 'closed'" class="p-4 bg-muted/50 border-t border-border">
        <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertCircle class="h-4 w-4" />
          <span>Esta conversa está fechada. Reabra para enviar mensagens.</span>
        </div>
      </div>
      <div v-else class="flex items-end gap-2 p-4" :class="{ 'bg-amber-50/50 dark:bg-amber-950/10': inputMode === 'note' }">
      <!-- Botões de Anexo (Hidden in note mode) -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9"
          title="Anexar documento"
          @click="handleAttachmentClick('file')"
        >
          <Paperclip class="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9"
          title="Anexar imagem"
          @click="handleAttachmentClick('image')"
        >
          <ImageIcon class="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <!-- Input de Texto -->
      <div class="flex-1 relative">
        <Textarea
          v-model="messageText"
          :placeholder="inputMode === 'note' ? 'Escreva uma nota interna (visível apenas para a equipe)...' : placeholder"
          class="min-h-[44px] max-h-[300px] resize-none pr-14"
          :class="{ 'bg-amber-50 border-amber-200 focus-visible:ring-amber-200 dark:bg-amber-900/10 dark:border-amber-800': inputMode === 'note' }"
          @keydown="handleKeyDown"
          @input="handleInput"
        />
        <!-- Ícones dentro do input -->
        <div class="absolute right-2 bottom-2 flex items-center gap-1">
          <!-- Popover Mensagens Rápidas -->
          <Popover v-model:open="quickRepliesOpen">
            <PopoverTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6"
                title="Mensagens Rápidas (Templates)"
              >
                <Zap class="h-4 w-4 text-muted-foreground hover:text-yellow-500 transition-colors" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80 p-0" align="end">
              <div class="p-4 pb-2">
                 <div class="relative">
                    <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      v-model="quickReplySearch"
                      placeholder="Buscar template..."
                      class="pl-8 h-9"
                    />
                  </div>
              </div>
              <ScrollArea class="h-64">
                <div class="p-2 space-y-1">
                  <button
                    v-for="msg in filteredQuickReplies"
                    :key="msg.id"
                    class="w-full text-left p-2 rounded hover:bg-muted text-sm group transition-colors"
                    @click="insertQuickReply(msg.content)"
                  >
                    <div class="font-medium text-foreground group-hover:text-primary transition-colors">{{ msg.title }}</div>
                    <div class="text-xs text-muted-foreground truncate">{{ msg.content }}</div>
                  </button>
                  <div v-if="filteredQuickReplies.length === 0" class="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma mensagem encontrada.
                  </div>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            title="Mais opções"
          >
            <Plus class="h-4 w-4 text-muted-foreground" />
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
          <Send v-if="inputMode === 'text'" class="h-5 w-5" />
          <Save v-else class="h-5 w-5" />
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

    <!-- Mode Switch Confirmation Dialog -->
    <Dialog v-model:open="showModeConfirmDialog">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Mudar para Mensagem Pública?</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p class="text-sm text-center text-muted-foreground mb-4">
             <AlertCircle class="h-10 w-10 text-amber-500 mx-auto mb-2" />
             Você está saindo do modo <strong>Nota Interna</strong>.
          </p>
          <p class="text-sm text-center text-foreground">
             Ao mudar para <strong>Mensagem</strong>, o conteúdo digitado será visível para o contato se enviado.
          </p>
          <p class="text-sm text-center text-muted-foreground mt-2">
             Deseja continuar?
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showModeConfirmDialog = false">Cancelar</Button>
          <Button variant="default" @click="confirmSwitchMode">
            Sim, mudar para Mensagem
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  MessageCircle,
  Paperclip,
  Image as ImageIcon,
  Plus,
  Zap,
  Send,
  Mic,
  Search,
  X,
  AlertCircle,
  StickyNote,
  Save
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import type { Inbox, Message } from '@/types/conversations';
import { useQuickRepliesStore } from '@/stores/quick-replies';
import { useToast } from '@/composables/useToast';

interface Props {
  inbox: Inbox;
  placeholder?: string;
  replyingTo?: Message | null;
  conversationStatus?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Escreva sua mensagem',
  replyingTo: null,
});

const emit = defineEmits<{
  'send-message': [message: string, type: 'text' | 'note'];
  'cancel-reply': [];
}>();

const toast = useToast();
const messageText = ref('');
const quickRepliesStore = useQuickRepliesStore();
const quickRepliesOpen = ref(false);
const quickReplySearch = ref('');

const inputMode = ref<'text' | 'note'>('text');
const showModeConfirmDialog = ref(false);
const pendingMode = ref<'text' | 'note' | null>(null);

function switchMode(newMode: 'text' | 'note') {
  if (inputMode.value === newMode) return;
  
  // If sending note -> message, ALWAYS confirm (user request)
  if (inputMode.value === 'note' && newMode === 'text') {
    pendingMode.value = newMode;
    showModeConfirmDialog.value = true;
  } else {
    inputMode.value = newMode;
  }
}

function confirmSwitchMode() {
  if (pendingMode.value) {
    inputMode.value = pendingMode.value;
  }
  showModeConfirmDialog.value = false;
  pendingMode.value = null;
}

// Initialize quick replies logic
quickRepliesStore.initialize();

const filteredQuickReplies = computed(() => {
  const term = quickReplySearch.value.toLowerCase();
  return quickRepliesStore.messages.filter(
    (msg) => 
      msg.title.toLowerCase().includes(term) || 
      msg.content.toLowerCase().includes(term)
  );
});

// File Inputs Refs
const fileInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

function handleKeyDown(event: KeyboardEvent) {
  // Enviar com Enter (sem Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (messageText.value.trim()) {
      handleSend();
    }
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
}

function handleSend() {
  if (messageText.value.trim()) {
    emit('send-message', messageText.value.trim(), inputMode.value);
    messageText.value = '';
    // Optional: reset mode after sending note? Maybe keep it if user is taking multiple notes.
    if (inputMode.value === 'note') {
       inputMode.value = 'text'; // Reset to text is safer
    }
  }
}

function insertQuickReply(content: string) {
  messageText.value = content;
  quickRepliesOpen.value = false;
  // Focus back to textarea could be added here
}

// Mock Attachment Handling
function handleAttachmentClick(type: 'file' | 'image') {
  if (type === 'file' && fileInput.value) {
    fileInput.value.click();
  } else if (type === 'image' && imageInput.value) {
    imageInput.value.click();
  }
}

function handleFileSelected(event: Event, type: 'file' | 'image') {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    
    // Simulate upload delay
    toast.info('Enviando...', `Fazendo upload de ${file.name}`);
    
    setTimeout(() => {
      // Send a system message or special mock string to indicate attachment
      // In a real app we would upload and get a URL first.
      const attachmentMsg = type === 'image' 
        ? `[IMAGEM Enviada: ${file.name}]` 
        : `[ARQUIVO Enviado: ${file.name}]`;
      
      emit('send-message', attachmentMsg, inputMode.value);
      toast.success('Sucesso', 'Arquivo enviado com sucesso!');
      
      // Reset input
      if (target) target.value = '';
    }, 1500);
  }
}
</script>

