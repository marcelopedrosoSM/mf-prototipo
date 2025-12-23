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
        initialize
    };
});
