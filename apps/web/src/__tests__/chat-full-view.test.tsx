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

vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: vi.fn(() => ({
    data: { ceoAgentId: 'ceo-agent-1' },
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

vi.mock('@/hooks/use-agent-chat', () => ({
  useAgentChat: vi.fn(() => ({
    agent: null,
    isAgentChat: true,
    isCeoAgent: true,
    threadId: 't1',
    messages: mockMessages,
    send: vi.fn(),
    isSending: false,
    isLoading: false,
    bootstrapStatus: 'collecting-context' as const,
    aiValidation: undefined,
    hasNoProvider: false,
    inputDisabled: false,
    thinkingStartTime: undefined,
    lastThinkingDurationMs: undefined,
  })),
}))

vi.mock('@/hooks/use-lcp-agents', () => ({
  useLcpAgent: vi.fn(() => ({ data: null, isLoading: false })),
}))

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ChatFullView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVisualWorkspaceStore.setState({
      projectId: 'p1',
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
      centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
    })
  })

  it('renders full view wrapper', () => {
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-full-view')).toBeDefined()
  })

  it('renders agent mode when centerView specifies agentId', () => {
    render(<ChatFullView />, { wrapper: Wrapper })
    expect(screen.getByTestId('agent-chat-content')).toBeDefined()
    expect(screen.getByText('Agent')).toBeDefined()
  })

  it('renders generic mode when centerView has no agentId', () => {
    useVisualWorkspaceStore.setState({
      centerView: { type: 'chat', threadId: null },
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
