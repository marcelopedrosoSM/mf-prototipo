import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Contact } from '@/types/contacts';
import { getContacts, addContact as addContactMock, updateContact as updateContactMock, deleteContact as deleteContactMock } from '@/mocks/data/contacts';

export const useContactsStore = defineStore(
    'contacts',
    () => {
        // State
        const contacts = ref<Contact[]>([]);
        const isInitialized = ref(false);

        // Getters
        const allContacts = computed(() => contacts.value);

        const getContactById = computed(() => (id: number) =>
            contacts.value.find(c => c.id === id)
        );

        // Actions
        function initialize() {
            if (!isInitialized.value) {
                contacts.value = getContacts();
                isInitialized.value = true;
            }
        }

        function createContact(data: Omit<Contact, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>) {
            const newContact = addContactMock(data);
            contacts.value.push(newContact);
            return newContact;
        }

        function updateContact(id: number, data: Partial<Contact>) {
            const updated = updateContactMock(id, data);
            if (updated) {
                const index = contacts.value.findIndex(c => c.id === id);
                if (index !== -1) {
                    contacts.value[index] = updated;
                }
            }
            return updated;
        }

        function removeContact(id: number) {
            const success = deleteContactMock(id);
            if (success) {
                contacts.value = contacts.value.filter(c => c.id !== id);
            }
            return success;
        }

        // Initialize immediately
        initialize();

        return {
            contacts,
            isInitialized,
            allContacts,
            getContactById,
            initialize,
            createContact,
            updateContact,
            removeContact
        };
    },
    {
        persist: true,
    }
);
