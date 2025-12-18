import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import './assets/index.css';
import '@vue-flow/core/dist/style.css';


// NOTA: A inicialização do tema agora é feita via Pinia store no App.vue
// Esta função foi mantida comentada para referência, mas não é mais necessária
/*
// Initialize theme using the theme store
// This must happen before Vue app creation to prevent flash
function initializeTheme() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // The theme store will handle initialization from localStorage
  // We just need to apply the theme to the DOM before first render
  const THEME_STORAGE_KEY = 'myflows-theme';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const root = document.documentElement;

  if (stored) {
    try {
      const themeData = JSON.parse(stored);
      const theme = themeData.theme || 'system';

      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // system
        const systemTheme = getSystemTheme();
        if (systemTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    } catch {
      // Fallback to system theme if parsing fails
      const systemTheme = getSystemTheme();
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      }
    }
  } else {
    // No stored preference, use system
    const systemTheme = getSystemTheme();
    if (systemTheme === 'dark') {
      root.classList.add('dark');
    }
  }
}


// Apply theme immediately
initializeTheme();
*/

// Initialize MSW in development
/*
async function initMocks() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW !== 'false') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('✅ MSW initialized');
    } catch (error) {
      console.warn('⚠️ MSW initialization failed:', error);
    }
  }
}
*/

async function bootstrap() {
  // MSW disabled as we are using direct mock data imports
  // await initMocks();

  const app = createApp(App);
  app.use(pinia);
  app.use(router);
  app.mount('#app');
}

bootstrap();

