<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <ScrollArea class="flex-1">
        <div class="mx-auto max-w-7xl p-6">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold">Contatos</h1>
              <p class="text-sm text-muted-foreground mt-1">
                Gerencie seus contatos e informações de comunicação
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" @click="importDialogOpen = true">
                <Upload class="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
              <Button @click="handleCreate">
                <Plus class="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </div>
          </div>

          <!-- Table -->
          <ContactsTable
            :contacts="contacts"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="handleCreate"
            @view="handleViewDetails"
          />

          <!-- Detalhes do Contato (CRM) -->
          <ContactDetailsDrawer
            :open="detailsDrawerOpen"
            :contact="selectedDetailContact"
            @update:open="detailsDrawerOpen = $event"
            @edit="handleEditFromDrawer"
            @start-chat="handleStartChat"
          />

          <!-- Create/Edit Dialog -->
          <ContactDialog
            :open="dialogOpen"
            :contact="selectedContact"
            @update:open="handleDialogOpenChange"
            @save="handleSave"
          />

          <!-- Delete Confirmation Dialog -->
          <ConfirmDialog
            :open="deleteDialogOpen"
            title="Excluir contato"
            :description="`Tem certeza que deseja excluir o contato ${contactToDelete?.name}? Todas as conversas com este contato serão apagadas permanentemente.`"
            confirm-text="Excluir"
            cancel-text="Cancelar"
            action-type="delete"
            @update:open="setDeleteDialogOpen"
            @confirm="confirmDelete"
          />

          <!-- Import Dialog -->
          <ImportContactsDialog
            :open="importDialogOpen"
            @update:open="importDialogOpen = $event"
            @import="handleImportContacts"
          />
        </div>
      </ScrollArea>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, Upload } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AppLayout from '@/components/layout/AppLayout.vue';
import { ScrollArea } from '@/components/ui/scroll-area';
import ContactsTable from '@/components/contacts/ContactsTable.vue';
import ContactDialog from '@/components/contacts/ContactDialog.vue';
import ContactDetailsDrawer from '@/components/contacts/ContactDetailsDrawer.vue';
import ImportContactsDialog from '@/components/contacts/ImportContactsDialog.vue';
import type { Contact } from '@/types/contacts';
import { useToast } from '@/composables/useToast';
import { useContactsStore } from '@/stores/contacts';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const contactsStore = useContactsStore();

const contacts = computed(() => contactsStore.allContacts);
const loading = ref(false);

const dialogOpen = ref(false);
const selectedContact = ref<Contact | null>(null);

// Drawer State
const detailsDrawerOpen = ref(false);
const selectedDetailContact = ref<Contact | null>(null);

const deleteDialogOpen = ref(false);
const contactToDelete = ref<Contact | null>(null);
const importDialogOpen = ref(false);

onMounted(() => {
  loading.value = true;
  contactsStore.initialize();
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

function handleCreate() {
  selectedContact.value = null;
  dialogOpen.value = true;
}

function handleEdit(contact: Contact) {
  selectedContact.value = { ...contact };
  dialogOpen.value = true;
}

function handleDelete(contact: Contact) {
  contactToDelete.value = contact;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (contactToDelete.value) {
    const success = contactsStore.removeContact(contactToDelete.value.id);
    if (success) {
      toast.success('Contato excluído', `${contactToDelete.value.name} foi removido com sucesso.`);
    } else {
      toast.error('Erro', 'Não foi possível excluir o contato.');
    }
    contactToDelete.value = null;
  }
  deleteDialogOpen.value = false;
}

function setDeleteDialogOpen(open: boolean) {
  deleteDialogOpen.value = open;
  if (!open) {
    contactToDelete.value = null;
  }
}

function handleSave(data: Omit<Contact, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>) {
  if (selectedContact.value?.id) {
    // Update
    contactsStore.updateContact(selectedContact.value.id, data);
    toast.success('Contato atualizado', `${data.name} foi atualizado com sucesso.`);
  } else {
    // Create
    contactsStore.createContact(data);
    toast.success('Contato criado', `${data.name} foi criado com sucesso.`);
  }
  dialogOpen.value = false;
  selectedContact.value = null;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
  if (!open) {
    selectedContact.value = null;
  }
}

function handleImportContacts(importedData: Record<string, string>[]) {
  let importedCount = 0;
  
  importedData.forEach((data) => {
    if (!data.name) return;
    
    contactsStore.createContact({
      name: data.name,
      emails: data.email ? [{ email: data.email }] : [],
      phoneNumbers: data.phone ? [{ phoneNumber: data.phone, label: 'whatsapp' }] : [],
    });
    
    importedCount++;
  });
  
  if (importedCount > 0) {
    toast.success('Importação concluída', `${importedCount} contatos foram importados com sucesso.`);
  }
}

// Drawer Handlers
function handleViewDetails(contact: Contact) {
  selectedDetailContact.value = contact;
  detailsDrawerOpen.value = true;
}

function handleEditFromDrawer(contact: Contact) {
  detailsDrawerOpen.value = false;
  handleEdit(contact);
}

function handleStartChat(contact: Contact) {
  // Logic to start chat would go here. For now, navigate to Conversations.
  // In a real app we would check if a conversation exists or create one.
  console.log('Starting chat with', contact.name);
  detailsDrawerOpen.value = false;
  router.push('/conversas');
}
</script>

