<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="end">
      <!-- Barra de Busca -->
      <div class="p-3 border-b border-border">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Pesquisar..."
            class="pl-9"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Lista de Contatos -->
      <ScrollArea class="max-h-[400px]">
        <div class="p-3">
          <h3 class="text-sm font-semibold text-primary mb-3">Últimos adicionados</h3>
          <div v-if="loading" class="py-8 text-center">
            <p class="text-sm text-muted-foreground">Carregando contatos...</p>
          </div>
          <div v-else-if="filteredContacts.length > 0" class="space-y-2">
            <button
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
              @click="handleSelectContact(contact)"
            >
              <Avatar class="h-10 w-10">
                <AvatarFallback class="bg-primary text-primary-foreground">
                  {{ getInitials(contact.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ contact.name }}</p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ getPrimaryPhone(contact) }}
                </p>
              </div>
            </button>
          </div>
          <div v-else class="py-8 text-center">
            <p class="text-sm text-muted-foreground">
              {{ searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato adicionado' }}
            </p>
          </div>
        </div>
      </ScrollArea>

      <!-- Separador -->
      <div class="border-t border-border"></div>

      <!-- Botão Criar Novo Contato -->
      <div class="p-3">
        <Button
          variant="ghost"
          class="w-full justify-start text-primary hover:bg-primary/10"
          @click="handleCreateContact"
        >
          <span>Criar novo contato</span>
          <ChevronRight class="ml-auto h-4 w-4" />
        </Button>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Dialog Criar Contato -->
  <ContactDialog
    :open="isCreateContactDialogOpen"
    @update:open="isCreateContactDialogOpen = $event"
    @save="handleContactCreated"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, ChevronRight } from 'lucide-vue-next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ContactDialog from '@/components/contacts/ContactDialog.vue';
import api from '@/services/api';
import type { Contact } from '@/types/contacts';
import type { ChatSession } from '@/types/conversations';

interface Props {
  inboxes: Array<{ id: string; name: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'conversation-created': [conversation: ChatSession];
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const contacts = ref<Contact[]>([]);
const loading = ref(false);
const isCreateContactDialogOpen = ref(false);

const filteredContacts = computed(() => {
  if (!searchQuery.value.trim()) {
    // Mostrar últimos 5 contatos adicionados (ordenados por data de criação, mais recente primeiro)
    const sorted = [...contacts.value].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Mais recente primeiro
    });
    return sorted.slice(0, 5);
  }

  const query = searchQuery.value.toLowerCase();
  return contacts.value.filter(
    (contact) =>
      contact.name.toLowerCase().includes(query) ||
      contact.phoneNumbers.some((phone) => phone.phoneNumber.includes(query))
  );
});

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getPrimaryPhone(contact: Contact): string {
  const whatsappPhone = contact.phoneNumbers.find((p) => p.label === 'whatsapp');
  if (whatsappPhone) return whatsappPhone.phoneNumber;
  return contact.phoneNumbers[0]?.phoneNumber || 'Sem telefone';
}

async function fetchContacts() {
  loading.value = true;
  try {
    const response = await api.get<{ data: Contact[] }>('/api/contacts');
    const allContacts = response.data.data || [];
    
    // Garantir que todos os contatos tenham createdAt
    contacts.value = allContacts.map(contact => ({
      ...contact,
      createdAt: contact.createdAt || new Date().toISOString(),
    }));
    
    console.log('Contacts loaded:', contacts.value.length);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    contacts.value = [];
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  // Busca já é reativa via computed
}

async function handleSelectContact(contact: Contact) {
  const primaryPhone = getPrimaryPhone(contact);
  if (!primaryPhone || primaryPhone === 'Sem telefone') {
    return;
  }

  // Usar a primeira caixa disponível
  const inboxId = props.inboxes.length > 0 ? props.inboxes[0].id : null;
  if (!inboxId) {
    return;
  }

  try {
    // Formatar telefone removendo caracteres não numéricos, mas mantendo o + se existir
    let phoneNumber = primaryPhone.replace(/\D/g, '');
    if (!phoneNumber.startsWith('55') && phoneNumber.length === 11) {
      phoneNumber = '55' + phoneNumber;
    }
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    const response = await api.post<{ data: ChatSession }>('/api/chat/conversations', {
      inboxId,
      sender: {
        name: contact.name,
        phoneNumber,
      },
    });

    emit('conversation-created', response.data.data);
    isOpen.value = false;
    searchQuery.value = '';
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
}

function handleCreateContact() {
  isCreateContactDialogOpen.value = true;
  isOpen.value = false;
}

async function handleContactCreated(contactData: Omit<Contact, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>) {
  // Recarregar contatos após criar
  await fetchContacts();
  
  // Criar conversa automaticamente com o novo contato
  const primaryPhone = contactData.phoneNumbers[0]?.phoneNumber;
  if (primaryPhone) {
    const inboxId = props.inboxes.length > 0 ? props.inboxes[0].id : null;
    if (inboxId) {
      try {
        // Formatar telefone
        let phoneNumber = primaryPhone.replace(/\D/g, '');
        if (!phoneNumber.startsWith('55') && phoneNumber.length === 11) {
          phoneNumber = '55' + phoneNumber;
        }
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber;
        }

        const response = await api.post<{ data: ChatSession }>('/api/chat/conversations', {
          inboxId,
          sender: {
            name: contactData.name,
            phoneNumber,
          },
        });

        emit('conversation-created', response.data.data);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    }
  }
}

watch(isOpen, (open) => {
  if (open) {
    fetchContacts();
  } else {
    searchQuery.value = '';
  }
});
</script>

