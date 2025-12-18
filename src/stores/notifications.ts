import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface NotificationSettings {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    emailEnabled: boolean;
}

export const useNotificationsStore = defineStore(
    'notifications',
    () => {
        // State
        const settings = ref<NotificationSettings>({
            soundEnabled: true,
            desktopEnabled: true,
            emailEnabled: false,
        });

        // Getters
        const isSoundEnabled = computed(() => settings.value.soundEnabled);
        const isDesktopEnabled = computed(() => settings.value.desktopEnabled);
        const isEmailEnabled = computed(() => settings.value.emailEnabled);

        // Actions
        function setSoundEnabled(enabled: boolean) {
            settings.value.soundEnabled = enabled;
        }

        function setDesktopEnabled(enabled: boolean) {
            settings.value.desktopEnabled = enabled;
        }

        function setEmailEnabled(enabled: boolean) {
            settings.value.emailEnabled = enabled;
        }

        function updateSettings(newSettings: Partial<NotificationSettings>) {
            settings.value = { ...settings.value, ...newSettings };
        }

        function resetSettings() {
            settings.value = {
                soundEnabled: true,
                desktopEnabled: true,
                emailEnabled: false,
            };
        }

        return {
            // State
            settings,
            // Getters
            isSoundEnabled,
            isDesktopEnabled,
            isEmailEnabled,
            // Actions
            setSoundEnabled,
            setDesktopEnabled,
            setEmailEnabled,
            updateSettings,
            resetSettings,
        };
    },
    {
        persist: {
            key: 'myflows-notifications',
        },
    }
);
