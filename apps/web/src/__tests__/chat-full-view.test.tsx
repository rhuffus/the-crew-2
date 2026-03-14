import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChatFullView } from '@/components/visual-shell/chat-dock/chat-full-view'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const mockMessages = [
  { id: 'm1', threadId: 't1', role: 'user', content: 'Hello', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:00Z' },
]

vi.mock('@/hooks/use-chat', () => ({
  useChatThread: vi.fn(() => ({ data: { id: 't1', messageCount: 1 } })),
  useChatMessages: vi.fn(() => ({ data: mockMessages, isLoading: false })),
  useSendMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useChatThreads: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(() => true),
}))

let mockBootstrapPhase: string | undefined = 'seed'

vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: vi.fn(() => ({
    data: mockBootstrapPhase ? { maturityPhase: mockBootstrapPhase } : undefined,
  })),
  useBootstrapProject: vi.fn(() => ({ mutate: vi.fn() })),
}))

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

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ChatFullView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBootstrapPhase = 'seed'
    useVisualWorkspaceStore.setState({
      projectId: 'p1',
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
      centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
    })
  })

  it('renders full view wrapper', () => {
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-full-view')).toBeDefined()
  })

  it('renders CEO mode when centerView specifies ceo', () => {
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('ceo-chat-content')).toBeDefined()
    expect(screen.getByText('CEO Agent')).toBeDefined()
  })

  it('renders generic mode when phase is mature and centerView is generic', () => {
    mockBootstrapPhase = 'growth'
    useVisualWorkspaceStore.setState({
      centerView: { type: 'chat', threadId: null, chatMode: 'generic' },
    })
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('generic-chat-content')).toBeDefined()
  })

  it('falls back to ceo mode for seed phase when centerView has no chatMode', () => {
    mockBootstrapPhase = 'seed'
    useVisualWorkspaceStore.setState({
      centerView: { type: 'canvas' },
    })
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('ceo-chat-content')).toBeDefined()
  })

  it('falls back to generic mode for non-seed phase', () => {
    mockBootstrapPhase = 'growth'
    useVisualWorkspaceStore.setState({
      centerView: { type: 'canvas' },
    })
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('generic-chat-content')).toBeDefined()
  })

  it('renders nothing when projectId is null', () => {
    useVisualWorkspaceStore.setState({ projectId: null })
    const { container } = render(<ChatFullView />, { wrapper: Wrapper })
    expect(container.querySelector('[data-testid="chat-full-view"]')).toBeNull()
  })

  it('has full-height layout', () => {
    render(<ChatFullView />, { wrapper: Wrapper })
    const el = screen.getByTestId('chat-full-view')
    expect(el.className).toContain('h-full')
    expect(el.className).toContain('flex-col')
  })
})
