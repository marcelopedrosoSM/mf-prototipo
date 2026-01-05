import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface NotificationSettings {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    emailEnabled: boolean;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: string;
    link?: string;
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

        const notifications = ref<Notification[]>([]);

        // Getters
        const isSoundEnabled = computed(() => settings.value.soundEnabled);
        const isDesktopEnabled = computed(() => settings.value.desktopEnabled);
        const isEmailEnabled = computed(() => settings.value.emailEnabled);

        const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);
        const allNotifications = computed(() => [...notifications.value].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));

        // Actions
        function addNotification(data: Omit<Notification, 'id' | 'read' | 'timestamp'>) {
            const newNotification: Notification = {
                ...data,
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                read: false,
                timestamp: new Date().toISOString(),
            };

            notifications.value.unshift(newNotification);

            // Limit to 50 notifications to prevent storage bloat
            if (notifications.value.length > 50) {
                notifications.value = notifications.value.slice(0, 50);
            }

            // Play sound if enabled
            if (settings.value.soundEnabled) {
                // Play simple sound logic here if feasible, or UI component handles it
            }

            return newNotification;
        }

        function markAsRead(id: string) {
            const notification = notifications.value.find(n => n.id === id);
            if (notification) {
                notification.read = true;
            }
        }

        function markAllAsRead() {
            notifications.value.forEach(n => n.read = true);
        }

        function removeNotification(id: string) {
            notifications.value = notifications.value.filter(n => n.id !== id);
        }

        function clearAll() {
            notifications.value = [];
        }

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
            notifications,
            // Getters
            isSoundEnabled,
            isDesktopEnabled,
            isEmailEnabled,
            unreadCount,
            allNotifications,
            // Actions
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAll,
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
