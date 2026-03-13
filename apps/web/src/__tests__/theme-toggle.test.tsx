import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/shell/header'
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

vi.mock('@tanstack/react-router', () => ({
  useMatches: () => [{ pathname: '/' }],
  Link: ({ children, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={props.to}>{children}</a>
  ),
}))

vi.mock('@/providers/project-provider', () => ({
  useCurrentProject: () => {
    throw new Error('no project')
  },
}))

describe('Theme toggle in Header', () => {
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

  it('renders user menu trigger', () => {
    render(<Header />)
    expect(screen.getByTestId('user-menu-trigger')).toBeTruthy()
  })

  it('opens dropdown and shows theme options', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByTestId('user-menu-trigger'))

    expect(screen.getByTestId('theme-light')).toBeTruthy()
    expect(screen.getByTestId('theme-dark')).toBeTruthy()
    expect(screen.getByTestId('theme-system')).toBeTruthy()
  })

  it('switches to dark mode when clicking Dark option', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByTestId('user-menu-trigger'))
    await user.click(screen.getByTestId('theme-dark'))

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('switches to light mode when clicking Light option', async () => {
    document.documentElement.classList.add('dark')
    useThemeStore.setState({ theme: 'dark' })

    const user = userEvent.setup()
    render(<Header />)

    await user.click(screen.getByTestId('user-menu-trigger'))
    await user.click(screen.getByTestId('theme-light'))

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
