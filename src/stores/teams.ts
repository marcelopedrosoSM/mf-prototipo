import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Time } from '@/types/times';
import { getTimes, addTime as addTimeMock, updateTime as updateTimeMock, deleteTime as deleteTimeMock } from '@/mocks/data/times';

export const useTeamsStore = defineStore(
    'teams',
    () => {
        // State
        const teams = ref<Time[]>([]);
        const isInitialized = ref(false);

        // Getters
        const allTeams = computed(() => teams.value);

        const getTeamById = computed(() => (id: string) =>
            teams.value.find(t => t.id === id)
        );

        // Actions
        function initialize() {
            if (!isInitialized.value) {
                teams.value = getTimes();
                isInitialized.value = true;
            }
        }

        function createTeam(data: Omit<Time, 'id' | 'createdAt' | 'updatedAt'>) {
            const newTeam = addTimeMock(data);
            teams.value.push(newTeam);
            return newTeam;
        }

        function updateTeam(id: string, data: Partial<Omit<Time, 'id' | 'createdAt'>>) {
            const updated = updateTimeMock(id, data);
            if (updated) {
                const index = teams.value.findIndex(t => t.id === id);
                if (index !== -1) {
                    teams.value[index] = updated;
                }
            }
            return updated;
        }

        function removeTeam(id: string) {
            const success = deleteTimeMock(id);
            if (success) {
                teams.value = teams.value.filter(t => t.id !== id);
            }
            return success;
        }

        // Initialize immediately for now (or call in App.vue)
        initialize();

        return {
            teams,
            isInitialized,
            allTeams,
            getTeamById,
            initialize,
            createTeam,
            updateTeam,
            removeTeam
        };
    },
    {
        persist: true,
    }
);
