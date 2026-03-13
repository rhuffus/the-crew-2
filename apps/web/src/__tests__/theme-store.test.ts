import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useThemeStore } from '@/stores/theme-store'

const STORAGE_KEY = 'the-crew-theme'

// In-memory localStorage stub for test isolation
const store: Record<string, string> = {}
const localStorageStub = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { for (const k in store) delete store[k] },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null,
}

vi.stubGlobal('localStorage', localStorageStub)

describe('theme-store', () => {
  beforeEach(() => {
    localStorageStub.clear()
    document.documentElement.classList.remove('dark')

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )

    useThemeStore.setState({ theme: 'system' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to system when no stored value', () => {
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('setTheme("dark") adds .dark class and persists', () => {
    useThemeStore.getState().setTheme('dark')

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorageStub.getItem(STORAGE_KEY)).toBe('dark')
  })

  it('setTheme("light") removes .dark class and persists', () => {
    document.documentElement.classList.add('dark')
    useThemeStore.getState().setTheme('light')

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorageStub.getItem(STORAGE_KEY)).toBe('light')
  })

  it('setTheme("system") respects prefers-color-scheme', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )

    useThemeStore.getState().setTheme('system')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles through all three themes', () => {
    const { setTheme } = useThemeStore.getState()

    setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')

    setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')

    setTheme('system')
    expect(useThemeStore.getState().theme).toBe('system')
  })
})
