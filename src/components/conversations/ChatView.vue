<template>
  <div v-if="chat" class="flex h-full max-h-full bg-background overflow-hidden relative">
    <!-- Main Conversation Area -->
    <div
      :class="[
        'flex flex-col h-full bg-background overflow-hidden transition-all duration-300',
        detailsDrawerOpen ? 'w-2/3' : 'w-full'
      ]"
    >
    <!-- Header do Chat -->
    <div class="flex items-center justify-between p-4 bg-background border-b border-border h-[73px]">
      <div 
        class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        @click="detailsDrawerOpen = true"
        title="Ver detalhes do contato"
      >
        <!-- Avatar -->
        <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-bold text-primary-foreground">
            {{ getInitials(chat.sender.name) }}
          </span>
        </div>

        <!-- Nome e Info -->
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-sm font-semibold text-foreground truncate">
            {{ chat.sender.name }}
          </span>
          <span class="text-xs text-muted-foreground truncate">
            {{ chat.inbox.phoneNumber }}
          </span>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Buscar -->
        <div class="flex items-center gap-2">
            <!-- Botão de Limpar (Visível apenas se houver busca ativa) -->
            <Button
              v-if="localSearchQuery"
              variant="outline"
              size="sm"
              class="h-9 px-2 text-xs border-dashed"
              @click="clearSearch"
            >
              Limpar busca
              <X class="ml-1 h-3 w-3" />
            </Button>

            <!-- Popover de Busca -->
            <Popover v-model:open="isSearchOpen">
              <PopoverTrigger as-child>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Buscar na conversa"
                  :class="localSearchQuery ? 'bg-primary/10 text-primary' : ''"
                >
                  <Search class="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-96 p-0" align="end">
                <div class="flex flex-col">
                  <!-- Header -->
                  <div class="px-4 py-3 border-b border-border">
                    <h3 class="text-sm font-semibold">Buscar na conversa</h3>
                  </div>
                  
                  <!-- Input -->
                  <div class="p-3 border-b border-border">
                    <div class="relative">
                      <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        v-model="localSearchQuery"
                        placeholder="Digite para buscar..."
                        class="pl-9"
                        auto-focus
                      />
                    </div>
                  </div>
                  
                  <!-- Resultados -->
                  <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resultados ({{ filteredMessages.length }})
                  </div>
                  
                  <ScrollArea class="h-[300px] w-full">
                    <div v-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                      <Search class="h-8 w-8 mb-2 opacity-20" />
                      <p class="text-sm">Nenhuma mensagem encontrada</p>
                    </div>
                    <div v-else class="px-2 pb-2 space-y-1">
                      <div
                        v-for="msg in filteredMessages" 
                        :key="msg.id"
                        class="p-3 rounded-md hover:bg-muted cursor-pointer transition-colors group"
                        @click="handleSearchResultClick(msg)"
                      >
                        <div class="flex justify-between items-start mb-1">
                          <span class="font-bold text-xs text-primary">{{ msg.senderName }}</span>
                          <span class="text-[10px] text-muted-foreground">{{ new Date(msg.timestamp).toLocaleTimeString() }}</span>
                        </div>
                        <p class="text-sm line-clamp-2 text-foreground/80 group-hover:text-foreground">{{ msg.content }}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
        </div>



        <!-- Gerenciar Etiquetas -->
        <LabelsManager :chat="chat" @labels-changed="handleLabelsChanged" />

        <!-- Gerenciar Atribuição -->
        <AssignmentManager :chat="chat" @assigned="handleAssigned" @unassigned="handleUnassigned" />



        <!-- Finalizar/Reabrir -->
        <Button 
          variant="default" 
          :class="chat.status === 'closed' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-primary text-primary-foreground'" 
          :title="chat.status === 'closed' ? 'Reabrir conversa' : 'Finalizar conversa'" 
          @click="chat.status === 'closed' ? reopenDialogOpen = true : closeDialogOpen = true"
        >
          <Check v-if="chat.status !== 'closed'" class="h-4 w-4 mr-1" />
          <RotateCcw v-else class="h-4 w-4 mr-1" />
          {{ chat.status === 'closed' ? 'Reabrir' : 'Finalizar' }}
        </Button>

        <!-- Menu de Opções -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" title="Opções de visualização">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>Visualização</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select.prevent class="flex items-center justify-between p-2 cursor-pointer">
              <span class="text-sm">Exibir Notas</span>
              <Switch
                :checked="showNotes"
                @update:checked="showNotes = $event"
              />
            </DropdownMenuItem>
            <DropdownMenuItem @select.prevent class="flex items-center justify-between p-2 cursor-pointer">
              <span class="text-sm">Exibir Ações Internas</span>
              <Switch
                :checked="showSystemMessages"
                @update:checked="showSystemMessages = $event"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Flow Bar (Dedicated Area) -->
    <div v-if="chat.linkedServiceFlow || chat.linkedActivityFlow" class="px-4 py-1.5 bg-muted/30 border-b border-border flex items-center justify-center gap-3 overflow-x-auto">
        <!-- Service Flow Chip -->
        <div
          v-if="chat.linkedServiceFlow"
          class="flex items-center gap-2 text-xs"
          :title="`Fluxo de Atendimento: ${chat.linkedServiceFlow.flowName}`"
        >
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium whitespace-nowrap">
            <BotMessageSquare class="h-3.5 w-3.5" />
            <span>{{ chat.linkedServiceFlow.flowName }}</span>
          </div>
          <span
            :class="[
              'w-2 h-2 rounded-full',
              chat.linkedServiceFlow.status === 'active'
                ? 'bg-green-500'
                : chat.linkedServiceFlow.status === 'paused'
                ? 'bg-amber-500'
                : 'bg-slate-400'
            ]"
            :title="chat.linkedServiceFlow.status === 'active' ? 'Ativo' : chat.linkedServiceFlow.status === 'paused' ? 'Pausado' : 'Finalizado'"
          ></span>
        </div>

        <!-- Vert Divider if both exist -->
        <div v-if="chat.linkedServiceFlow && chat.linkedActivityFlow" class="h-4 w-[1px] bg-border mx-1"></div>

        <!-- Activity Flow Chip -->
        <div
          v-if="chat.linkedActivityFlow"
          class="flex items-center gap-2 text-xs"
          :title="`Fluxo de Atividades: ${chat.linkedActivityFlow.flowName}`"
        >
           <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium whitespace-nowrap">
            <BotIcon class="h-3.5 w-3.5" />
            <span>{{ chat.linkedActivityFlow.flowName }}</span>
          </div>
          <span class="font-medium text-muted-foreground whitespace-nowrap">
            Etapa {{ chat.linkedActivityFlow.currentStep }} de {{ chat.linkedActivityFlow.totalSteps }}
          </span>
        </div>
    </div>

    <!-- Área de Mensagens -->
    <MessageList
      :messages="filteredMessages"
      :conversation-id="chat.id"
      :search-query="localSearchQuery"
      class="flex-1"
      @reply="handleReply"
      @view-media="handleViewMedia"
      @add-reaction="handleAddReaction"
      @remove-reaction="handleRemoveReaction"
      @pin="handlePinMessage"
      @edit-note="handleEditNote"
      @delete-note="handleDeleteNote"
    />

    <!-- Typing Indicator -->
    <div v-if="isTyping" class="px-4 py-2 border-t border-border bg-muted/30">
      <TypingIndicator />
    </div>

    <!-- Input de Mensagem -->
    <ChatInput
      :inbox="chat.inbox"
      :replying-to="replyingTo"
      :conversation-status="chat.status"
      @send-message="handleSendMessage"
      @cancel-reply="handleCancelReply"
    />

    <!-- Media Viewer -->
    <MediaViewer
      :is-open="mediaViewerOpen"
      :src="mediaViewerSrc"
      :type="mediaViewerType"
      @close="closeMediaViewer"
    />

    <!-- Add/Edit Note Dialog -->
    <NoteDialog
      v-model:open="noteDialogOpen"
      :conversation-id="chat.id"
      :editing-note="editingNote"
      @save="handleSaveNote"
    />

    <!-- Close Conversation Dialog -->
    <CloseConversationDialog
      v-model:open="closeDialogOpen"
      @confirm="handleCloseConversation"
    />

    <!-- Reopen Conversation Dialog -->
    <Dialog v-model:open="reopenDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reabrir Conversa</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <p class="text-sm text-muted-foreground">
            Tem certeza que deseja reabrir esta conversa?
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="reopenDialogOpen = false">Cancelar</Button>
          <Button variant="secondary" @click="handleReopenConversation">
            <RotateCcw class="h-4 w-4 mr-2" />
            Reabrir
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    </div>
    <!-- End of Main Conversation Area -->

    <!-- Contact Details Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="detailsDrawerOpen"
        class="w-1/3 h-full border-l border-border bg-background overflow-hidden flex flex-col"
      >


        <!-- Sidebar Content -->
        <div class="flex-1 overflow-y-auto">
          <ContactDetailsDrawer
            :open="true"
            :contact="currentContact"
            :labels="chat.labels"
            @update:open="detailsDrawerOpen = $event"
            @edit="handleEditContact"
            @start-chat="detailsDrawerOpen = false"
            :is-sidebar="true"
          />
        </div>
      </div>
    </Transition>

  </div>
  <!-- Estado Vazio -->
  <div
    v-else
    class="flex flex-col items-center justify-center h-full bg-background p-8"
  >
    <div class="h-24 w-24 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center mb-6">
      <MessageCircle class="h-10 w-10 text-violet-600 dark:text-violet-400 animate-float" />
    </div>
    <h2 class="text-2xl font-bold text-foreground mb-2">
      Selecione uma conversa
    </h2>
    <p class="text-muted-foreground text-center max-w-md">
      Escolha uma conversa da lista ao lado para começar a trocar mensagens
    </p>
  </div>

  <!-- Edit Contact Dialog -->
  <ContactDialog
    :open="editContactDialogOpen"
    :contact="contactToEdit"
    @update:open="editContactDialogOpen = $event"
    @save="handleSaveContact"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Check, MoreVertical, MessageCircle, X, RotateCcw } from 'lucide-vue-next';
import BotMessageSquare from '@/components/icons/BotMessageSquare.vue';
import BotIcon from '@/components/icons/BotIcon.vue';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import MessageList from './MessageList.vue';
import ChatInput from './ChatInput.vue';
import LabelsManager from './LabelsManager.vue';
import AssignmentManager from './AssignmentManager.vue';
import TypingIndicator from '@/components/ui/typing-indicator/TypingIndicator.vue';
import ContactDetailsDrawer from '@/components/contacts/ContactDetailsDrawer.vue';
import ContactDialog from '@/components/contacts/ContactDialog.vue';
import MediaViewer from '@/components/common/MediaViewer.vue';
import NoteDialog from './NoteDialog.vue';
import CloseConversationDialog from './CloseConversationDialog.vue';
import type { ChatSession, Label, Message } from '@/types/conversations';
import type { Contact } from '@/types/contacts';
import { useConversationsStore } from '@/stores/conversations';
import { useContactsStore } from '@/stores/contacts';
import { useToast } from '@/components/ui/toast/use-toast';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

interface Props {
  chat: ChatSession | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'send-message': [message: string, replyingTo?: Message | null];
  'labels-changed': [labels: Label[]];
  'update:details-open': [isOpen: boolean];
}>();

// Filter States
const showNotes = ref(true);
const showSystemMessages = ref(true);
const isSearchOpen = ref(false);
const localSearchQuery = ref('');
const noteDialogOpen = ref(false);
const editingNote = ref<{ id: string; content: string } | null>(null);
const closeDialogOpen = ref(false);
const reopenDialogOpen = ref(false);

const conversationsStore = useConversationsStore();
const { toast } = useToast();

// Keyboard Shortcuts
useKeyboardShortcuts([
  {
    key: 'k',
    ctrl: true,
    handler: () => {
      isSearchOpen.value = true;
    },
    description: 'Abrir busca'
  },
  {
    key: 'n',
    ctrl: true,
    shift: true,
    handler: () => {
      if (props.chat) {
        noteDialogOpen.value = true;
      }
    },
    description: 'Nova nota interna'
  },
  {
    key: 'Escape',
    handler: () => {
      isSearchOpen.value = false;
      noteDialogOpen.value = false;
      closeDialogOpen.value = false;
    },
    description: 'Fechar dialogs'
  }
]);

function handleSearchResultClick(_message: Message) {
  // Poderíamos implementar scroll to message aqui
  isSearchOpen.value = false;
}

function clearSearch() {
  localSearchQuery.value = '';
  isSearchOpen.value = false;
}

const filteredMessages = computed(() => {
  if (!props.chat) return [];
  
  return props.chat.messages.filter(msg => {
    // Filter Notes
    if (!showNotes.value && msg.type === 'note') return false;
    
    // Filter System Messages
    if (!showSystemMessages.value && msg.senderType === 'system') return false;

    // Filter Search
    if (localSearchQuery.value.trim()) {
      const query = localSearchQuery.value.toLowerCase();
      // Simple content check - can be improved to search in sender name too
      return msg.content.toLowerCase().includes(query) || 
             (msg.senderName && msg.senderName.toLowerCase().includes(query));
    }
    
    return true;
  });
});

// Media Viewer State
const mediaViewerOpen = ref(false);
const mediaViewerSrc = ref('');
const mediaViewerType = ref<'image' | 'video'>('image');

function handleViewMedia(media: { type: 'image' | 'video'; src: string }) {
  mediaViewerSrc.value = media.src;
  mediaViewerType.value = media.type;
  mediaViewerOpen.value = true;
}

function closeMediaViewer() {
  mediaViewerOpen.value = false;
}

// Drawer State
const detailsDrawerOpen = ref(false);

watch(detailsDrawerOpen, (newValue) => {
  emit('update:details-open', newValue);
});

// Map ChatSession to Contact for display
const currentContact = computed<Contact | null>(() => {
  if (!props.chat) return null;
  
  const sender = props.chat.sender;
  return {
    id: Number(sender.id) || 0, // Fallback if ID is string
    accountId: 0,
    name: sender.name,
    emails: sender.emails?.map((e, index) => ({ id: index, email: e.email })) || [],
    phoneNumbers: [{ id: 0, phoneNumber: sender.phoneNumber, label: 'whatsapp' }],
    city: sender.city,
    state: sender.state,
    notes: sender.notes,
    createdAt: new Date().toISOString(), // Mock
  };
});
const contactsStore = useContactsStore();
const editContactDialogOpen = ref(false);
const contactToEdit = ref<Contact | null>(null);

function handleEditContact(contact: Contact) {
  contactToEdit.value = { ...contact };
  editContactDialogOpen.value = true;
}

function handleSaveContact(data: Omit<Contact, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>) {
  if (contactToEdit.value?.id) {
    contactsStore.updateContact(contactToEdit.value.id, data);
    toast({
      title: 'Contato atualizado',
      description: `${data.name} foi atualizado com sucesso.`
    });
    // Force refresh or update local state if needed via store reactivity
  }
}

// Simulated typing indicator (in real app, would come from websocket)
const isTyping = ref(false);

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const replyingTo = ref<Message | null>(null);

function handleReply(message: Message) {
  replyingTo.value = message;
}

function handleCancelReply() {
  replyingTo.value = null;
}

function handleSendMessage(message: string, type: 'text' | 'note' = 'text') {
  if (type === 'note') {
    handleSaveNote(message);
  } else {
    emit('send-message', message, replyingTo.value);
  }
  replyingTo.value = null;
}

function handleLabelsChanged(labels: Label[]) {
  emit('labels-changed', labels);
}

function handleAssigned() {
  // Conversa foi atribuída
}

function handleUnassigned() {
  // Atribuição foi removida
}

function handleAddReaction(messageId: string, emoji: string) {
  if (props.chat) {
    conversationsStore.addReaction(props.chat.id, messageId, emoji);
  }
}

function handleRemoveReaction(messageId: string, emoji: string) {
  if (props.chat) {
    conversationsStore.removeReaction(props.chat.id, messageId, emoji);
  }
}



function handleEditNote(note: any) {
  editingNote.value = {
    id: note.id,
    content: note.content
  };
  noteDialogOpen.value = true;
}

function handleDeleteNote(note: any) {
  if (confirm('Tem certeza que deseja excluir esta nota?')) {
    conversationsStore.deleteNote(props.chat.id, note.id);
    toast({
      title: 'Nota excluída',
      description: 'A nota interna foi removida com sucesso.'
    });
  }
}

function handleSaveNote(content: string, noteId?: string) {
  if (props.chat) {
    if (noteId) {
      // Edit existing note
      conversationsStore.editNote(props.chat.id, noteId, content);
      toast({
        title: 'Nota atualizada',
        description: 'A nota interna foi atualizada com sucesso.'
      });
    } else {
      // Add new note
      conversationsStore.addInternalNote(props.chat.id, content);
      toast({
        title: 'Nota adicionada',
        description: 'A nota interna foi salva com sucesso.'
      });
    }
    editingNote.value = null;
  }
}

function handleCloseConversation() {
  if (props.chat) {
    conversationsStore.closeConversation(props.chat.id);
    toast({
      title: 'Conversa finalizada',
      description: 'A conversa foi marcada como resolvida.'
    });
  }
}

function handlePinMessage(messageId: string) {
  if (props.chat) {
    const message = props.chat.messages.find(m => m.id === messageId);
    if (message?.isPinned) {
      conversationsStore.unpinMessage(props.chat.id, messageId);
      toast({
        title: 'Mensagem desafixada'
      });
    } else {
      conversationsStore.pinMessage(props.chat.id, messageId);
      toast({
        title: 'Mensagem fixada',
        description: 'A mensagem foi fixada no topo do chat.'
      });
    }
  }
}

function handleReopenConversation() {
  if (props.chat) {
    conversationsStore.reopenConversation(props.chat.id);
    reopenDialogOpen.value = false;
    toast({
      title: 'Conversa reaberta',
      description: 'A conversa está ativa novamente.'
    });
  }
}
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>

