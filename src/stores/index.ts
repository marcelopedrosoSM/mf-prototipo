import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(
  createPersistedState({
    storage: localStorage,
  })
);

export default pinia;

// Export all stores for easy access
export { useAuthStore } from './auth';
export { useThemeStore } from './theme';
export { useFlowsStore } from './flows';
export { useNotificationsStore } from './notifications';
export { useExampleStore } from './example';
export { useActivityStore } from './activities';
export { useExecutionsStore } from './executions';
export { useAutomationsStore } from './automations';
export { useContactsStore } from './contacts';
export { useTeamsStore } from './teams';
export { useInboxesStore } from './inboxes';
export { useConversationsStore } from './conversations';
export { useUserPreferencesStore } from './userPreferences';

