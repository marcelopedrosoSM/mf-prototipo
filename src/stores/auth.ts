import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
    id: string;
    nome: string;
    email: string;
    avatar?: string;
    role?: string;
}

export const useAuthStore = defineStore(
    'auth',
    () => {
        // State
        const token = ref<string | null>(null);
        const user = ref<User | null>(null);
        const isLoading = ref(false);

        // Getters
        const isAuthenticated = computed(() => !!token.value && !!user.value);
        const userName = computed(() => user.value?.nome || '');
        const userEmail = computed(() => user.value?.email || '');

        // Actions
        function setAuth(newToken: string, newUser: User) {
            token.value = newToken;
            user.value = newUser;
        }

        function clearAuth() {
            token.value = null;
            user.value = null;
        }

        function updateUser(updates: Partial<User>) {
            if (user.value) {
                user.value = { ...user.value, ...updates };
            }
        }

        return {
            // State
            token,
            user,
            isLoading,
            // Getters
            isAuthenticated,
            userName,
            userEmail,
            // Actions
            setAuth,
            clearAuth,
            updateUser,
        };
    },
    {
        persist: true,
    }
);
