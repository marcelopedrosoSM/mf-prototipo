import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';


export type Theme = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore(
    'theme',
    () => {
        // State
        const theme = ref<Theme>('system');

        // Getters
        const isDark = computed(() => {
            if (theme.value === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            return theme.value === 'dark';
        });

        const effectiveTheme = computed<'light' | 'dark'>(() => {
            if (theme.value === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return theme.value;
        });

        // Actions
        function setTheme(newTheme: Theme) {
            theme.value = newTheme;
            // applyTheme() será chamado automaticamente pelo watch
        }

        function toggleTheme() {
            // Alterna apenas entre light e dark (sem system)
            // Isso garante que sempre há uma mudança visual
            const newTheme = effectiveTheme.value === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        }

        function applyTheme() {
            const root = document.documentElement;
            if (effectiveTheme.value === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        // Initialize theme on store creation
        function initTheme() {
            applyTheme();

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (theme.value === 'system') {
                    applyTheme();
                }
            });
        }

        // ✅ Watch para aplicar tema automaticamente quando mudar
        // Isso garante que qualquer mudança no tema seja aplicada imediatamente
        watch(
            () => effectiveTheme.value,
            () => {
                applyTheme();
            },
            { immediate: true } // Aplica imediatamente quando a store é criada
        );

        return {
            // State
            theme,
            // Getters
            isDark,
            effectiveTheme,
            // Actions
            setTheme,
            toggleTheme,
            initTheme,
        };
    },
    {
        persist: {
            key: 'myflows-theme',
        },
    }
);
