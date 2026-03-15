import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChatConversationContent } from '@/components/visual-shell/chat-dock/chat-conversation-content'
import type { ScopeDescriptor } from '@the-crew/shared-types'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const mockThread = {
  id: 't1',
  projectId: 'p1',
  scopeType: 'company',
  entityId: null,
  title: 'Chat: company',
  messageCount: 2,
  lastMessageAt: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
}
const mockMessages = [
  { id: 'm1', threadId: 't1', role: 'user', content: 'Hello', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'm2', threadId: 't1', role: 'assistant', content: 'Hi there', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:01Z' },
]

const mockSend = vi.fn()
const mockSendBootstrap = vi.fn()
const mockStartBootstrap = vi.fn()
const mockProposeGrowth = vi.fn()
const mockApproveGrowth = vi.fn()
const mockRejectGrowth = vi.fn()

vi.mock('@/hooks/use-chat', () => ({
  useChatThread: vi.fn(() => ({ data: mockThread })),
  useChatMessages: vi.fn(() => ({ data: mockMessages, isLoading: false })),
  useSendMessage: vi.fn(() => ({ mutate: mockSend, isPending: false })),
  useChatThreads: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(() => true),
}))

let mockConversationData: { status: string; threadId: string | null } | undefined = {
  status: 'collecting-context',
  threadId: 't1',
}
let mockConversationError = false

vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: vi.fn(() => ({
    data: mockConversationData,
    isError: mockConversationError,
  })),
  useStartBootstrapConversation: vi.fn(() => ({
    mutate: mockStartBootstrap,
    isPending: false,
  })),
  useSendBootstrapMessage: vi.fn(() => ({
    mutate: mockSendBootstrap,
    isPending: false,
  })),
  useProposeGrowth: vi.fn(() => ({
    mutate: mockProposeGrowth,
    isPending: false,
  })),
  useApproveGrowthProposal: vi.fn(() => ({
    mutate: mockApproveGrowth,
    isPending: false,
  })),
  useRejectGrowthProposal: vi.fn(() => ({
    mutate: mockRejectGrowth,
    isPending: false,
  })),
}))

vi.mock('@/hooks/use-agent-chat', () => ({
  useAgentChat: vi.fn(() => ({
    agent: undefined,
    isAgentChat: true,
    isCeoAgent: true,
    threadId: 't1',
    messages: mockMessages as any,
    send: mockSendBootstrap,
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

const companyScope: ScopeDescriptor = { scopeType: 'company', entityId: null, zoomLevel: 'L1' }
const deptScope: ScopeDescriptor = { scopeType: 'department', entityId: 'd1', zoomLevel: 'L2' }

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ChatConversationContent — generic mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConversationData = { status: 'collecting-context', threadId: 't1' }
    mockConversationError = false
  })

  it('renders generic chat content with messages', () => {
    render(
      <ChatConversationContent projectId="p1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByTestId('generic-chat-content')).toBeDefined()
    expect(screen.getByText('Hello')).toBeDefined()
    expect(screen.getByText('Hi there')).toBeDefined()
  })

  it('renders chat input in generic mode', () => {
    render(
      <ChatConversationContent projectId="p1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByTestId('chat-input')).toBeDefined()
  })

  it('sends message on Enter in generic mode', () => {
    render(
      <ChatConversationContent projectId="p1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(mockSend).toHaveBeenCalledWith({ content: 'Test message' })
  })

  it('shows read-only indicator when no write permission', async () => {
    const { usePermission } = await import('@/hooks/use-permissions')
    const mockPerm = vi.mocked(usePermission)
    // chat:read = true, chat:write:company = false
    mockPerm.mockImplementation((perm: string) => perm === 'chat:read')

    render(
      <ChatConversationContent projectId="p1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByTestId('chat-read-only')).toBeDefined()

    // Restore default
    mockPerm.mockReturnValue(true)
  })

  it('returns null when chat:read is false', async () => {
    const { usePermission } = await import('@/hooks/use-permissions')
    const mockPerm = vi.mocked(usePermission)
    mockPerm.mockReturnValue(false)

    const { container } = render(
      <ChatConversationContent projectId="p1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(container.querySelector('[data-testid="generic-chat-content"]')).toBeNull()

    mockPerm.mockReturnValue(true)
  })

  it('works with department scope', () => {
    render(
      <ChatConversationContent projectId="p1" currentScope={deptScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByTestId('generic-chat-content')).toBeDefined()
  })
})

describe('ChatConversationContent — CEO mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConversationData = { status: 'collecting-context', threadId: 't1' }
    mockConversationError = false
  })

  it('renders CEO chat content with status bar', () => {
    render(
      <ChatConversationContent projectId="p1" agentId="ceo-agent-1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByTestId('agent-chat-content')).toBeDefined()
    expect(screen.getByText('Agent')).toBeDefined()
    expect(screen.getByText('Collecting context')).toBeDefined()
  })

  it('renders messages in CEO mode', () => {
    render(
      <ChatConversationContent projectId="p1" agentId="ceo-agent-1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByText('Hello')).toBeDefined()
    expect(screen.getByText('Hi there')).toBeDefined()
  })

  it('sends message via agent chat hook in agent mode', async () => {
    const mockSendFn = vi.fn()
    const { useAgentChat } = await import('@/hooks/use-agent-chat')
    vi.mocked(useAgentChat).mockReturnValue({
      agent: undefined,
      isAgentChat: true,
      isCeoAgent: true,
      threadId: 't1',
      messages: mockMessages as any,
      send: mockSendFn,
      isSending: false,
      isLoading: false,
      bootstrapStatus: 'collecting-context' as any,
      aiValidation: undefined,
      hasNoProvider: false,
      inputDisabled: false,
      thinkingStartTime: undefined,
      lastThinkingDurationMs: undefined,
    })
    render(
      <ChatConversationContent projectId="p1" agentId="ceo-agent-1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'CEO message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(mockSendFn).toHaveBeenCalledWith('CEO message')
    // Restore default
    vi.mocked(useAgentChat).mockReturnValue({
      agent: undefined,
      isAgentChat: true,
      isCeoAgent: true,
      threadId: 't1',
      messages: mockMessages as any,
      send: mockSendBootstrap,
      isSending: false,
      isLoading: false,
      bootstrapStatus: 'collecting-context' as any,
      aiValidation: undefined,
      hasNoProvider: false,
      inputDisabled: false,
      thinkingStartTime: undefined,
      lastThinkingDurationMs: undefined,
    })
  })

  it('shows not-started status when no conversation', async () => {
    const { useAgentChat } = await import('@/hooks/use-agent-chat')
    vi.mocked(useAgentChat).mockReturnValue({
      agent: undefined,
      isAgentChat: true,
      isCeoAgent: true,
      threadId: undefined,
      messages: [],
      send: vi.fn(),
      isSending: false,
      isLoading: false,
      bootstrapStatus: 'not-started' as any,
      aiValidation: undefined,
      hasNoProvider: false,
      inputDisabled: true,
      thinkingStartTime: undefined,
      lastThinkingDurationMs: undefined,
    })
    render(
      <ChatConversationContent projectId="p1" agentId="ceo-agent-1" currentScope={companyScope} />,
      { wrapper: Wrapper },
    )
    expect(screen.getByText('Not started')).toBeDefined()
    // Restore default
    vi.mocked(useAgentChat).mockReturnValue({
      agent: undefined,
      isAgentChat: true,
      isCeoAgent: true,
      threadId: 't1',
      messages: mockMessages as any,
      send: mockSendBootstrap,
      isSending: false,
      isLoading: false,
      bootstrapStatus: 'collecting-context' as any,
      aiValidation: undefined,
      hasNoProvider: false,
      inputDisabled: false,
      thinkingStartTime: undefined,
      lastThinkingDurationMs: undefined,
    })
  })
})
