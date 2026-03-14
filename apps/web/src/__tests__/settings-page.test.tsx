import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock tanstack router
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (_path: string) => (opts: Record<string, unknown>) => opts,
  Link: ({ children, to, ...rest }: { children: ReactNode; to: string; [k: string]: unknown }) => (
    <a href={to} data-testid={rest['data-testid'] as string | undefined}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  lazyRouteComponent: (fn: () => Promise<unknown>) => fn,
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: (_ns?: string) => ({
    t: (key: string) => {
      const resolved: Record<string, string> = {
        title: 'Settings',
        'aiProviders.title': 'AI Providers',
        'aiProviders.description': 'Configure your Claude Max subscription token.',
        'provider.apiKey': 'Token',
        'provider.placeholder': 'OAuth token...',
        'provider.save': 'Save',
        'provider.clear': 'Clear',
        'provider.configured': 'Configured',
        'provider.notConfigured': 'Not configured',
        'provider.comingSoon': 'Coming soon',
        'provider.show': 'Show',
        'provider.hide': 'Hide',
        'provider.oauthHint': 'Run `claude setup-token` in your terminal, paste the generated token here.',
        'preferences.title': 'Preferences',
        'preferences.language': 'Language',
        'preferences.theme': 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeSystem: 'System',
      }
      return resolved[key] ?? key
    },
    i18n: { language: 'en' },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

// Mock i18n config — prevent actual initialization
vi.mock('@/i18n/config', () => ({
  default: {},
  defaultNS: 'common',
  supportedLanguages: ['en', 'es'],
}))

// Mock stores
const mockSetLanguage = vi.fn()
vi.mock('@/stores/language-store', () => ({
  useLanguageStore: vi.fn(() => ({ language: 'en', setLanguage: mockSetLanguage })),
}))

const mockSetTheme = vi.fn()
vi.mock('@/stores/theme-store', () => ({
  useThemeStore: vi.fn(() => ({ theme: 'system', setTheme: mockSetTheme })),
}))

// Mock shell layout
vi.mock('@/components/shell/shell-layout', () => ({
  ShellLayout: ({ children }: { children: ReactNode }) => <div data-testid="shell-layout">{children}</div>,
}))

// Mock AI provider config hooks
let mockConfigs: { providerId: string; apiKeyMasked: string; enabled: boolean }[] | undefined = undefined
const mockUpsertMutate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock('@/hooks/use-ai-provider-config', () => ({
  useAiProviderConfigs: vi.fn(() => ({ data: mockConfigs })),
  useAiProviderValidation: vi.fn(() => ({ data: undefined })),
  useUpsertAiProviderConfig: vi.fn(() => ({ mutate: mockUpsertMutate, isPending: false })),
  useDeleteAiProviderConfig: vi.fn(() => ({ mutate: mockDeleteMutate, isPending: false })),
}))

// Import after mocks
import { SettingsPage } from '@/routes/settings'

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigs = undefined
  })

  it('renders the settings page with Claude Max provider', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(screen.getByTestId('settings-page')).toBeDefined()
    expect(screen.getByText('Settings')).toBeDefined()
    expect(screen.getByText('AI Providers')).toBeDefined()
    expect(screen.getByTestId('provider-card-claude-max')).toBeDefined()
  })

  it('shows configured badge when claude-max token is set', () => {
    mockConfigs = [{ providerId: 'claude-max', apiKeyMasked: 'oauth-***xyz', enabled: true }]
    render(<SettingsPage />, { wrapper: Wrapper })
    const badge = screen.getByTestId('provider-status-claude-max')
    expect(badge.textContent).toBe('Configured')
  })

  it('shows not-configured badge when no token', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    const badge = screen.getByTestId('provider-status-claude-max')
    expect(badge.textContent).toBe('Not configured')
  })

  it('shows masked token when configured', () => {
    mockConfigs = [{ providerId: 'claude-max', apiKeyMasked: 'oauth-***xyz', enabled: true }]
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(screen.getByText('Current: oauth-***xyz')).toBeDefined()
  })

  it('handles claude-max token save with authType oauth-token', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    const input = screen.getByTestId('api-key-input-claude-max') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'my-oauth-token' } })
    fireEvent.click(screen.getByTestId('save-key-claude-max'))
    expect(mockUpsertMutate).toHaveBeenCalledWith(
      { providerId: 'claude-max', dto: { name: 'Claude Max', apiKey: 'my-oauth-token', authType: 'oauth-token', enabled: true } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('save button is disabled when empty', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    const btn = screen.getByTestId('save-key-claude-max') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('save button is enabled after typing', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    fireEvent.change(screen.getByTestId('api-key-input-claude-max'), { target: { value: 'some-token' } })
    const btn = screen.getByTestId('save-key-claude-max') as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('handles token clear', () => {
    mockConfigs = [{ providerId: 'claude-max', apiKeyMasked: 'oauth-***xyz', enabled: true }]
    render(<SettingsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByTestId('clear-key-claude-max'))
    expect(mockDeleteMutate).toHaveBeenCalledWith('claude-max')
  })

  it('clear button only shows when configured', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(screen.queryByTestId('clear-key-claude-max')).toBeNull()
  })

  it('shows language and theme preferences', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(screen.getByTestId('settings-language-en')).toBeDefined()
    expect(screen.getByTestId('settings-language-es')).toBeDefined()
    expect(screen.getByTestId('settings-theme-light')).toBeDefined()
    expect(screen.getByTestId('settings-theme-dark')).toBeDefined()
    expect(screen.getByTestId('settings-theme-system')).toBeDefined()
  })

  it('calls setLanguage on click', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByTestId('settings-language-es'))
    expect(mockSetLanguage).toHaveBeenCalledWith('es')
  })

  it('calls setTheme on click', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByTestId('settings-theme-dark'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('toggles token visibility', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    const input = screen.getByTestId('api-key-input-claude-max') as HTMLInputElement
    expect(input.type).toBe('password')
    fireEvent.click(screen.getByTestId('toggle-key-visibility-claude-max'))
    expect(input.type).toBe('text')
    fireEvent.click(screen.getByTestId('toggle-key-visibility-claude-max'))
    expect(input.type).toBe('password')
  })

  it('renders claude-max provider card with oauth hint', () => {
    mockConfigs = []
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(screen.getByTestId('provider-card-claude-max')).toBeDefined()
    expect(screen.getByTestId('provider-hint-claude-max')).toBeDefined()
  })
})
