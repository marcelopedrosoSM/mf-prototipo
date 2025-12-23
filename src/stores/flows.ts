import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Node, Edge } from '@vue-flow/core';


export interface SavedFlow {
    id: string;
    nome: string;
    descricao?: string;
    nodes: Node[];
    edges: Edge[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const useFlowsStore = defineStore(
    'flows',
    () => {
        // State
        const savedFlows = ref<SavedFlow[]>([]);
        const currentFlowId = ref<string | null>(null);

        // 🔄 Migração automática do localStorage antigo
        function migrateOldFlows() {
            const OLD_KEY = 'myflows_builder_flows';
            const oldData = localStorage.getItem(OLD_KEY);

            // Se não há dados antigos ou já temos dados na store, não fazer nada
            if (!oldData || savedFlows.value.length > 0) {
                return;
            }

            try {
                const oldFlows = JSON.parse(oldData);
                if (Array.isArray(oldFlows) && oldFlows.length > 0) {
                    console.log(`🔄 Migrando ${oldFlows.length} fluxos do sistema antigo...`);
                    savedFlows.value = oldFlows;
                    console.log('✅ Migração concluída!');
                }
            } catch (error) {
                console.error('❌ Erro ao migrar fluxos antigos:', error);
            }
        }

        // Executar migração ao criar a store
        migrateOldFlows();

        // Getters
        const currentFlow = computed(() => {
            if (!currentFlowId.value) return null;
            return savedFlows.value.find(f => f.id === currentFlowId.value) || null;
        });

        const activeFlows = computed(() => {
            return savedFlows.value.filter(f => f.isActive);
        });

        const flowCount = computed(() => savedFlows.value.length);

        // Actions
        function saveFlow(flowData: SavedFlow) {
            const existingIndex = savedFlows.value.findIndex(f => f.id === flowData.id);

            if (existingIndex !== -1) {
                // Update existing flow
                savedFlows.value[existingIndex] = {
                    ...flowData,
                    updatedAt: new Date().toISOString(),
                };
            } else {
                // Add new flow
                savedFlows.value.push({
                    ...flowData,
                    createdAt: flowData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        function loadFlow(flowId: string): SavedFlow | null {
            const flow = savedFlows.value.find(f => f.id === flowId);
            if (flow) {
                currentFlowId.value = flowId;
                return flow;
            }
            return null;
        }

        function deleteFlow(flowId: string) {
            savedFlows.value = savedFlows.value.filter(f => f.id !== flowId);
            if (currentFlowId.value === flowId) {
                currentFlowId.value = null;
            }
        }

        function clearAllFlows() {
            savedFlows.value = [];
            currentFlowId.value = null;
        }

        function setCurrentFlow(flowId: string | null) {
            currentFlowId.value = flowId;
        }

        function getAllFlows(): SavedFlow[] {
            return savedFlows.value;
        }

        function updateFlowStatus(flowId: string, isActive: boolean) {
            const flow = savedFlows.value.find(f => f.id === flowId);
            if (flow) {
                flow.isActive = isActive;
                flow.updatedAt = new Date().toISOString();
            }
        }

        return {
            // State
            savedFlows,
            currentFlowId,
            // Getters
            currentFlow,
            activeFlows,
            flowCount,
            // Actions
            saveFlow,
            loadFlow,
            deleteFlow,
            clearAllFlows,
            setCurrentFlow,
            getAllFlows,
            updateFlowStatus,
            // Exposed for compatibility
            allFlows: computed(() => savedFlows.value),
            getFlowById: computed(() => (id: string) => savedFlows.value.find(f => f.id === id)),
        };
    },
    {
        persist: {
            key: 'myflows-saved-flows',
        },
    }
);
