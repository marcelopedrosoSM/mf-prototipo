import { defineStore } from 'pinia';
import { ref } from 'vue';

export type DefaultRoute = 'dashboard' | 'conversations' | 'execucao';

export const useUserPreferencesStore = defineStore(
    'userPreferences',
    () => {
        // State
        const defaultRoute = ref<DefaultRoute>('dashboard');

        // Actions
        function setDefaultRoute(route: DefaultRoute) {
            defaultRoute.value = route;
        }

        return {
            // State
            defaultRoute,
            // Actions
            setDefaultRoute,
        };
    },
    {
        persist: {
            key: 'myflows-user-preferences',
        },
    }
);


