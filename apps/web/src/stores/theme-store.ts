import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'the-crew-theme'

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage may not be available
  }
  return 'system'
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark())
  root.classList.toggle('dark', isDark)
}

export interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme: Theme) => {
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* private browsing */ }
    applyTheme(theme)
    set({ theme })
  },
}))

// Listen for OS preference changes when in system mode
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') {
      applyTheme('system')
    }
  })
}

// Apply stored theme at module load (before first render)
applyTheme(getStoredTheme())
