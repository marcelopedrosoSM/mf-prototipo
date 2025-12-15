<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold">Contatos</h1>
              <p class="text-sm text-muted-foreground mt-1">
                Gerencie seus contatos e informações de comunicação
              </p>
            </div>
            <Button @click="handleCreate">
              <Plus class="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </div>

          <!-- Table -->
          <ContactsTable
            :contacts="contacts"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @create="handleCreate"
          />

          <!-- Create/Edit Dialog -->
          <ContactDialog
            :open="dialogOpen"
            :contact="selectedContact"
            @update:open="handleDialogOpenChange"
            @save="handleSave"
          />

          <!-- Delete Confirmation Dialog -->
          <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o contato <strong>{{ contactToDelete?.name }}</strong>?
                  <br /><br />
                  Todas as conversas com este contato serão apagadas permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel @click="setDeleteDialogOpen(false)">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  @click="confirmDelete"
                  class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/components/layout/AppLayout.vue';
import ContactsTable from '@/components/contacts/ContactsTable.vue';
import ContactDialog from '@/components/contacts/ContactDialog.vue';
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  type Contact,
} from '@/mocks/data/contacts';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const contacts = ref<Contact[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const selectedContact = ref<Contact | null>(null);
const deleteDialogOpen = ref(false);
const contactToDelete = ref<Contact | null>(null);

onMounted(() => {
  loadContacts();
});

function loadContacts() {
  loading.value = true;
  setTimeout(() => {
    contacts.value = [...getContacts()];
    loading.value = false;
  }, 500);
}

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
    deleteContact(contactToDelete.value.id);
    contacts.value = contacts.value.filter((c) => c.id !== contactToDelete.value!.id);
    toast.success('Contato excluído', `${contactToDelete.value.name} foi removido com sucesso.`);
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
    const updated = updateContact(selectedContact.value.id, data);
    if (updated) {
      const index = contacts.value.findIndex((c) => c.id === selectedContact.value!.id);
      if (index !== -1) {
        contacts.value[index] = updated;
        toast.success('Contato atualizado', `${data.name} foi atualizado com sucesso.`);
      }
    }
  } else {
    // Create
    const newContact = addContact(data);
    contacts.value.push(newContact);
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
</script>

