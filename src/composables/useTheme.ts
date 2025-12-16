import { ref, computed, watch } from 'vue';

const THEME_STORAGE_KEY = 'myflows-theme';
type Theme = 'light' | 'dark' | 'system';

// Validação do tema lido do storage
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
}

// Estado global (Singleton)
const theme = ref<Theme>(getStoredTheme());
const systemTheme = ref<'light' | 'dark'>('light');

// Inicializar detecção do tema do sistema
function initializeSystemTheme() {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const updateSystemTheme = (matches: boolean) => {
    systemTheme.value = matches ? 'dark' : 'light';
  };

  // Definir valor inicial
  updateSystemTheme(mediaQuery.matches);

  // Escutar mudanças
  mediaQuery.addEventListener('change', (e) => updateSystemTheme(e.matches));
}

// Inicializar listener do sistema
initializeSystemTheme();

// Tema resolvido (computado)
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (theme.value === 'system') {
    return systemTheme.value;
  }
  return theme.value;
});

// Aplicar tema ao DOM
// Aplicar tema ao DOM
function applyTheme(newTheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  if (newTheme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
  }
}

// Watch global para aplicar alterações automaticamente
// Isso garante que qualquer mudança em theme ou systemTheme reflita no DOM
watch(resolvedTheme, (newTheme) => {
  applyTheme(newTheme);
}, { immediate: true });


function setTheme(newTheme: Theme) {
  theme.value = newTheme;
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
}

function toggleTheme() {
  setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
