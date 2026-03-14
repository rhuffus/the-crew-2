import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChatConversationContent } from '@/components/visual-shell/chat-dock/chat-conversation-content'
import type { ScopeDescriptor } from '@the-crew/shared-types'

// --- Router mock ---
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({
    children,
    to,
    ...rest
  }: { children: ReactNode; to: string; [k: string]: unknown }) => (
    <a
      href={to}
      data-testid={rest['data-testid'] as string | undefined}
    >
      {children}
    </a>
  ),
}))

// --- react-i18next mock — return translation keys as labels ---
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => {
        const resolved: Record<string, string> = {
          'noProviderError':
            'Claude Max not configured. Set up your Claude Max token in Settings to use AI features.',
          'goToSettings': 'Go to Settings',
          'dock.readOnly': 'Read only',
        }
        return resolved[key] ?? key
      },
      i18n: { language: 'en' },
    }),
  }
})

// --- AI provider validation hook — mutable per test ---
let mockValidationData: { providerId: string; configured: boolean } | undefined = undefined

vi.mock('@/hooks/use-ai-provider-config', () => ({
  useAiProviderConfigs: vi.fn(() => ({ data: [] })),
  useAiProviderValidation: vi.fn(() => ({ data: mockValidationData })),
  useUpsertAiProviderConfig: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteAiProviderConfig: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

// --- Bootstrap conversation hooks ---
vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: vi.fn(() => ({
    data: { status: 'collecting-context', threadId: 't1' },
    isError: false,
  })),
  useStartBootstrapConversation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useSendBootstrapMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useProposeGrowth: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useApproveGrowthProposal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRejectGrowthProposal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

// --- Chat hooks ---
vi.mock('@/hooks/use-chat', () => ({
  useChatThread: vi.fn(() => ({ data: { id: 't1' } })),
  useChatMessages: vi.fn(() => ({ data: [], isLoading: false })),
  useSendMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useChatThreads: vi.fn(() => ({ data: [], isLoading: false })),
}))

// --- Project documents hook (used by DocumentMentionPopover inside ChatInput) ---
vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocuments: vi.fn(() => ({ data: [], isLoading: false })),
  useProjectDocument: vi.fn(() => ({ data: undefined, isLoading: false })),
  useUpdateProjectDocument: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

// --- Permissions hook ---
vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(() => true),
}))

// --- Scope used for all CEO-mode renders ---
const companyScope: ScopeDescriptor = {
  scopeType: 'company',
  entityId: null,
  zoomLevel: 'L1',
}

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

// ---------------------------------------------------------------------------
// No-provider warning banner
// ---------------------------------------------------------------------------

describe('CEO chat — no-provider-warning banner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidationData = undefined
  })

  it('shows the warning banner when provider is not configured', () => {
    mockValidationData = { providerId: 'claude-max', configured: false }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    expect(screen.getByTestId('no-provider-warning')).toBeDefined()
  })

  it('shows the warning message text when provider is not configured', () => {
    mockValidationData = { providerId: 'claude-max', configured: false }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    expect(
      screen.getByText(
        'Claude Max not configured. Set up your Claude Max token in Settings to use AI features.',
      ),
    ).toBeDefined()
  })

  it('shows the "Go to Settings" link with correct data-testid when provider is not configured', () => {
    mockValidationData = { providerId: 'claude-max', configured: false }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    const link = screen.getByTestId('go-to-settings-link')
    expect(link).toBeDefined()
    expect(link.textContent).toBe('Go to Settings')
    expect((link as HTMLAnchorElement).href).toContain('/settings')
  })

  it('disables the chat input when provider is not configured', () => {
    mockValidationData = { providerId: 'claude-max', configured: false }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    const textarea = screen.getByTestId('chat-input').querySelector('textarea')
    expect(textarea).toBeDefined()
    expect(textarea?.disabled).toBe(true)
  })

  // --- Positive case: provider IS configured ---

  it('does NOT show the warning banner when provider is configured', () => {
    mockValidationData = { providerId: 'claude-max', configured: true }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    expect(screen.queryByTestId('no-provider-warning')).toBeNull()
  })

  it('does NOT show the "Go to Settings" link when provider is configured', () => {
    mockValidationData = { providerId: 'claude-max', configured: true }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    expect(screen.queryByTestId('go-to-settings-link')).toBeNull()
  })

  it('does NOT disable input when provider is configured and conversation is active', () => {
    mockValidationData = { providerId: 'claude-max', configured: true }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    const textarea = screen.getByTestId('chat-input').querySelector('textarea')
    expect(textarea).toBeDefined()
    expect(textarea?.disabled).toBe(false)
  })

  // --- Edge case: validation data not yet loaded ---

  it('does NOT show the warning banner when validation data is undefined (not yet loaded)', () => {
    mockValidationData = undefined

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    expect(screen.queryByTestId('no-provider-warning')).toBeNull()
  })

  // --- CEO mode status bar is always rendered ---

  it('renders the CEO Agent status bar regardless of provider state', () => {
    mockValidationData = { providerId: 'claude-max', configured: false }

    render(
      <ChatConversationContent
        projectId="p1"
        chatMode="ceo"
        currentScope={companyScope}
      />,
      { wrapper: Wrapper },
    )

    expect(screen.getByText('CEO Agent')).toBeDefined()
    expect(screen.getByTestId('ceo-chat-content')).toBeDefined()
  })
})
