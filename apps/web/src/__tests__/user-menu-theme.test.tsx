import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '@/components/visual-shell/user-menu'
import { useThemeStore } from '@/stores/theme-store'

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

describe('UserMenu theme section', () => {
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

  it('shows all three theme options when dropdown is open', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByTestId('user-menu-trigger'))

    expect(screen.getByTestId('theme-option-light')).toBeTruthy()
    expect(screen.getByTestId('theme-option-dark')).toBeTruthy()
    expect(screen.getByTestId('theme-option-system')).toBeTruthy()
  })

  it('clicking Dark applies .dark class and updates the store', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByTestId('user-menu-trigger'))
    await user.click(screen.getByTestId('theme-option-dark'))

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('clicking Light removes .dark class', async () => {
    document.documentElement.classList.add('dark')
    useThemeStore.setState({ theme: 'dark' })

    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByTestId('user-menu-trigger'))
    await user.click(screen.getByTestId('theme-option-light'))

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('active option shows a checkmark', async () => {
    useThemeStore.setState({ theme: 'dark' })

    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByTestId('user-menu-trigger'))

    const darkBtn = screen.getByTestId('theme-option-dark')
    expect(darkBtn.classList.contains('bg-primary/10')).toBe(true)

    // The active button should contain a Check icon (svg)
    const svgs = darkBtn.querySelectorAll('svg')
    // Two svgs: the Moon icon + Check icon
    expect(svgs.length).toBe(2)
  })

  it('dropdown closes after selecting a theme', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByTestId('user-menu-trigger'))
    expect(screen.getByTestId('user-menu-dropdown')).toBeTruthy()

    await user.click(screen.getByTestId('theme-option-dark'))
    expect(screen.queryByTestId('user-menu-dropdown')).toBeNull()
  })

  it('language options still work alongside theme options', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByTestId('user-menu-trigger'))

    expect(screen.getByTestId('language-option-en')).toBeTruthy()
    expect(screen.getByTestId('language-option-es')).toBeTruthy()
  })
})
