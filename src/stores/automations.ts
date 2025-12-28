/**
 * Store de Automações
 * Gerencia o CRUD de automações por caixa de entrada
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Automation, AutomationTrigger } from '@/types/automation';

export const useAutomationsStore = defineStore(
    'automations',
    () => {
        // State
        const automations = ref<Automation[]>([]);
        const loading = ref(false);

        // Getters
        const getAutomationsByInbox = computed(() => {
            return (caixaId: string) => automations.value.filter(a => a.caixaId === caixaId);
        });

        const getAutomationsByTrigger = computed(() => {
            return (caixaId: string, gatilho: AutomationTrigger) =>
                automations.value.filter(a => a.caixaId === caixaId && a.gatilho === gatilho);
        });

        const getAutomationById = computed(() => {
            return (id: string) => automations.value.find(a => a.id === id);
        });

        // Actions
        function setAutomations(data: Automation[]) {
            automations.value = data;
        }

        function addAutomation(automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>): Automation {
            const newAutomation: Automation = {
                ...automation,
                id: `auto-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // If new automation is active, deactivate others in the same inbox
            if (newAutomation.ativo) {
                automations.value.forEach(a => {
                    // Rule: Only 1 active automation per INBOX (ignoring trigger type)
                    if (a.caixaId === newAutomation.caixaId) {
                        a.ativo = false;
                    }
                });
            }

            automations.value.push(newAutomation);
            return newAutomation;
        }

        function updateAutomation(id: string, updates: Partial<Automation>): Automation | null {
            const index = automations.value.findIndex(a => a.id === id);
            if (index === -1) return null;

            const current = automations.value[index];
            const targetCaixaId = updates.caixaId || current.caixaId;
            const targetAtivo = updates.ativo !== undefined ? updates.ativo : current.ativo;

            // Check for exclusivity if valid/active
            if (targetAtivo) {
                automations.value.forEach(a => {
                    // Rule: Only 1 active automation per INBOX
                    if (a.caixaId === targetCaixaId && a.id !== id) {
                        a.ativo = false;
                    }
                });
            }

            automations.value[index] = {
                ...current,
                ...updates,
                updatedAt: new Date(),
            };
            return automations.value[index];
        }

        function deleteAutomation(id: string): boolean {
            const index = automations.value.findIndex(a => a.id === id);
            if (index === -1) return false;

            automations.value.splice(index, 1);
            return true;
        }

        function toggleAutomation(id: string): boolean {
            console.log('🔄 [Store] toggleAutomation called', id);
            const automation = automations.value.find(a => a.id === id);
            if (!automation) return false;

            const newState = !automation.ativo;

            // Se está ATIVANDO, desativa todas as outras da mesma caixa
            if (newState) {
                automations.value.forEach(a => {
                    if (a.caixaId === automation.caixaId && a.id !== id) {
                        a.ativo = false;
                    }
                });
            }

            automation.ativo = newState;
            automation.updatedAt = new Date();
            console.log('✅ [Store] Automation toggled. New state:', newState);
            return true;
        }

        function saveNodes(id: string, nodes: any[], edges: any[]): boolean {
            const automation = automations.value.find(a => a.id === id);
            if (!automation) return false;

            automation.nodes = nodes;
            automation.edges = edges;
            automation.updatedAt = new Date();
            return true;
        }

        return {
            // State
            automations,
            loading,
            // Getters
            getAutomationsByInbox,
            getAutomationsByTrigger,
            getAutomationById,
            // Actions
            setAutomations,
            addAutomation,
            updateAutomation,
            deleteAutomation,
            toggleAutomation,
            saveNodes,
        };
    },
    {
        persist: {
            key: 'myflows-automations',
        },
    }
);

