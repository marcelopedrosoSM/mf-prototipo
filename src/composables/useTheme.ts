import { ref, watch, onMounted, onUnmounted } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'myflows-theme'

const theme = ref<Theme>('system')
const resolvedTheme = ref<'light' | 'dark'>('light')

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (newTheme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  
  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  
  resolvedTheme.value = newTheme
}

const updateTheme = (newTheme: Theme) => {
  theme.value = newTheme
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }
  
  if (newTheme === 'system') {
    const systemTheme = getSystemTheme()
    applyTheme(systemTheme)
    setupSystemThemeListener()
  } else {
    if (mediaQueryListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.removeEventListener('change', mediaQueryListener)
      mediaQueryListener = null
    }
    applyTheme(newTheme)
  }
}

const setupSystemThemeListener = () => {
  if (typeof window === 'undefined') return
  
  if (mediaQueryListener) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.removeEventListener('change', mediaQueryListener)
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQueryListener = (e: MediaQueryListEvent) => {
    if (theme.value === 'system') {
      applyTheme(e.matches ? 'dark' : 'light')
    }
  }
  
  mediaQuery.addEventListener('change', mediaQueryListener)
}

const initializeTheme = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    applyTheme('light')
    return
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  
  if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
    theme.value = stored
  } else {
    theme.value = 'system'
  }
  
  if (theme.value === 'system') {
    const systemTheme = getSystemTheme()
    applyTheme(systemTheme)
    setupSystemThemeListener()
  } else {
    applyTheme(theme.value)
  }
}

export function useTheme() {
  onMounted(() => {
    initializeTheme()
  })

  onUnmounted(() => {
    if (mediaQueryListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.removeEventListener('change', mediaQueryListener)
      mediaQueryListener = null
    }
  })

  watch(
    () => theme.value,
    (newTheme) => {
      if (newTheme === 'system') {
        const systemTheme = getSystemTheme()
        applyTheme(systemTheme)
        setupSystemThemeListener()
      }
    }
  )

  const toggleTheme = () => {
    if (resolvedTheme.value === 'light') {
      updateTheme('dark')
    } else {
      updateTheme('light')
    }
  }

  const setTheme = (newTheme: Theme) => {
    updateTheme(newTheme)
  }

  return {
    theme: theme,
    resolvedTheme: resolvedTheme,
    toggleTheme,
    setTheme
  }
}

