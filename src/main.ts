import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import './assets/index.css';

// Initialize theme synchronously before first render to prevent flash
function initializeTheme() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const THEME_STORAGE_KEY = 'myflows-theme';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const root = document.documentElement;
  
  if (stored === 'dark') {
    root.classList.add('dark');
  } else if (stored === 'light') {
    root.classList.remove('dark');
  } else {
    // system or no preference
    const systemTheme = getSystemTheme();
    if (systemTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

// Apply theme immediately
initializeTheme();

// Initialize MSW in development
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

async function bootstrap() {
  await initMocks();

  const app = createApp(App);
  app.use(pinia);
  app.use(router);
  app.mount('#app');
}

bootstrap();

