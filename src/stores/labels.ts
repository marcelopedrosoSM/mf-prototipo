import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MOCK_LABELS } from '@/mocks/data/labels';
import type { Label } from '@/types/conversations';

export const useLabelsStore = defineStore('labels', () => {
    // State
    const labels = ref<Label[]>([]);
    const loading = ref(false);
    const isInitialized = ref(false);

    // Getters
    const allLabels = computed(() => labels.value);

    const getLabelById = computed(() => (id: string) =>
        labels.value.find(l => l.id === id)
    );

    // Actions
    function initialize() {
        if (!isInitialized.value) {
            loading.value = true;
            // Simulate API fetch
            labels.value = [...MOCK_LABELS];
            isInitialized.value = true;
            loading.value = false;
        }
    }

    // Initialize immediately
    initialize();

    return {
        // State
        labels,
        loading,
        isInitialized,

        // Getters
        allLabels,
        getLabelById,

        // Actions
        initialize
    };
});
