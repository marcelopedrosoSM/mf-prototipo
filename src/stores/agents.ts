import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MOCK_AGENTES, type Agente } from '@/mocks/data/agentes';

export const useAgentsStore = defineStore('agents', () => {
    // State
    const agents = ref<Agente[]>([]);
    const loading = ref(false);
    const isInitialized = ref(false);

    // Getters
    const allAgents = computed(() => agents.value);

    const getAgentById = computed(() => (id: string) =>
        agents.value.find(a => a.id === id)
    );

    const getAgentsByTeam = computed(() => (teamId: string) =>
        agents.value.filter(a => a.timesIds?.includes(teamId))
    );

    // Actions
    function initialize() {
        if (!isInitialized.value) {
            loading.value = true;
            // Simulate API fetch delay if needed, or just load mocks
            agents.value = [...MOCK_AGENTES];
            isInitialized.value = true;
            loading.value = false;
        }
    }

    function createAgent(data: Omit<Agente, 'id' | 'createdAt' | 'updatedAt'>) {
        const now = new Date().toISOString();
        const newAgent: Agente = {
            ...data,
            id: String(Date.now()),
            createdAt: now,
            updatedAt: now
        };
        agents.value.push(newAgent);
        return newAgent;
    }

    function updateAgent(id: string, data: Partial<Agente>) {
        const index = agents.value.findIndex(a => a.id === id);
        if (index !== -1) {
            agents.value[index] = {
                ...agents.value[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            return agents.value[index];
        }
        return null;
    }

    function removeAgent(id: string) {
        const index = agents.value.findIndex(a => a.id === id);
        if (index !== -1) {
            agents.value.splice(index, 1);
            return true;
        }
        return false;
    }

    // Initialize immediately for now
    initialize();

    return {
        // State
        agents,
        loading,
        isInitialized,

        // Getters
        allAgents,
        getAgentById,
        getAgentsByTeam,

        // Actions
        initialize,
        createAgent,
        updateAgent,
        removeAgent
    };
});
