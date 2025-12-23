import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CaixaEntrada } from '@/types/caixas-entrada';
import { getCaixasEntrada, addCaixaEntrada as addCaixaMock, updateCaixaEntrada as updateCaixaMock, deleteCaixaEntrada as deleteCaixaMock } from '@/mocks/data/caixas-entrada';

export const useInboxesStore = defineStore(
    'inboxes',
    () => {
        // State
        const inboxes = ref<CaixaEntrada[]>([]);
        const loading = ref(false);
        const isInitialized = ref(false);

        // Getters
        const allInboxes = computed(() => inboxes.value);

        const getInboxById = computed(() => (id: string) =>
            inboxes.value.find(i => i.id === id)
        );

        const oficialInboxes = computed(() =>
            inboxes.value.filter(i => i.tipo === 'oficial')
        );

        // Actions
        function initialize() {
            if (!isInitialized.value) {
                loading.value = true;
                inboxes.value = getCaixasEntrada();
                isInitialized.value = true;
                loading.value = false;
            }
        }

        function createInbox(data: Omit<CaixaEntrada, 'id' | 'createdAt' | 'updatedAt'>) {
            const newInbox = addCaixaMock(data);
            inboxes.value.push(newInbox);
            return newInbox;
        }

        function updateInbox(id: string, data: Partial<Omit<CaixaEntrada, 'id' | 'createdAt'>>) {
            const updated = updateCaixaMock(id, data);
            if (updated) {
                const index = inboxes.value.findIndex(i => i.id === id);
                if (index !== -1) {
                    inboxes.value[index] = updated;
                }
            }
            return updated;
        }

        function removeInbox(id: string) {
            const success = deleteCaixaMock(id);
            if (success) {
                inboxes.value = inboxes.value.filter(i => i.id !== id);
            }
            return success;
        }

        // Initialize immediately
        initialize();

        return {
            inboxes,
            loading,
            isInitialized,
            allInboxes,
            getInboxById,
            oficialInboxes,
            initialize,
            createInbox,
            updateInbox,
            removeInbox
        };
    }
);
