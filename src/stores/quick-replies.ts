import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MensagemRapida } from '@/types/mensagens-rapidas';
import { MOCK_MENSAGENS_RAPIDAS } from '@/mocks/data/mensagens-rapidas';

export const useQuickRepliesStore = defineStore(
    'quick-replies',
    () => {
        // State
        const messages = ref<MensagemRapida[]>([]);

        // Actions
        function initialize() {
            if (messages.value.length === 0) {
                // Load initial mock data if empty (first run)
                messages.value = [...MOCK_MENSAGENS_RAPIDAS];
            }
        }

        function addMessage(data: Omit<MensagemRapida, 'id' | 'createdAt' | 'updatedAt'>) {
            const newMessage: MensagemRapida = {
                ...data,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            messages.value.push(newMessage);
            return newMessage;
        }

        function updateMessage(id: string, data: Partial<Omit<MensagemRapida, 'id' | 'createdAt'>>) {
            const index = messages.value.findIndex((m) => m.id === id);
            if (index !== -1) {
                messages.value[index] = {
                    ...messages.value[index],
                    ...data,
                    updatedAt: new Date().toISOString(),
                };
                return messages.value[index];
            }
            return null;
        }

        function removeMessage(id: string) {
            const index = messages.value.findIndex((m) => m.id === id);
            if (index !== -1) {
                messages.value.splice(index, 1);
                return true;
            }
            return false;
        }

        return {
            messages,
            initialize,
            addMessage,
            updateMessage,
            removeMessage,
        };
    },
    {
        persist: true,
    }
);
