import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Explorer } from '@/components/visual-shell/explorer/explorer'
import { CeoConversationDock } from '@/components/visual-shell/chat-dock/ceo-conversation-dock'
import { ProposalCard } from '@/components/visual-shell/chat-dock/proposal-card'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useProposalsStore } from '@/stores/proposals-store'
import type { ProposalDto, ProposalStatus, ProposalType } from '@the-crew/shared-types'

// Mock fetch
vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectSlug: 'test-project' }),
}))

// Mock bootstrap status hook
const mockBootstrapStatus = vi.fn().mockReturnValue({ data: { ceoAgentId: 'ceo-agent-1' } })
vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: (...args: unknown[]) => mockBootstrapStatus(...args),
  useBootstrapProject: () => ({ mutate: vi.fn(), isPending: false }),
}))

// Mock proposals hooks
const mockProposals = vi.fn().mockReturnValue({ data: [], refetch: vi.fn() })
const mockApprove = vi.fn().mockReturnValue({ mutate: vi.fn() })
const mockReject = vi.fn().mockReturnValue({ mutate: vi.fn() })
vi.mock('@/hooks/use-proposals', () => ({
  useProposals: (...args: unknown[]) => mockProposals(...args),
  useProposal: () => ({ data: null }),
  useApproveProposal: (...args: unknown[]) => mockApprove(...args),
  useRejectProposal: (...args: unknown[]) => mockReject(...args),
  useSubmitProposal: () => ({ mutate: vi.fn() }),
}))

// Mock bootstrap conversation hooks (AIR-009)
const mockBootstrapConversation = vi.fn().mockReturnValue({ data: null, isError: true })
const mockStartConversation = vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false })
const mockSendBootstrapMessage = vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false })
vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: (...args: unknown[]) => mockBootstrapConversation(...args),
  useStartBootstrapConversation: (...args: unknown[]) => mockStartConversation(...args),
  useSendBootstrapMessage: (...args: unknown[]) => mockSendBootstrapMessage(...args),
  useProposeGrowth: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApproveGrowthProposal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectGrowthProposal: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

// Mock chat hooks
const mockChatThread = vi.fn().mockReturnValue({ data: { id: 'thread-1' } })
const mockChatMessages = vi.fn().mockReturnValue({ data: [], isLoading: false })
vi.mock('@/hooks/use-chat', () => ({
  useChatThread: (...args: unknown[]) => mockChatThread(...args),
  useChatMessages: (...args: unknown[]) => mockChatMessages(...args),
  useSendMessage: () => ({ mutate: vi.fn(), isPending: false }),
  useChatThreads: () => ({ data: [] }),
}))

// Mock growth hooks
vi.mock('@/hooks/use-growth', () => ({
  useOrgHealth: () => ({ data: null }),
  usePhaseCapabilities: () => ({ data: null }),
}))

// Mock agent chat hook (used by ChatConversationContent in agent mode)
vi.mock('@/hooks/use-agent-chat', () => ({
  useAgentChat: vi.fn(({ agentId }: { agentId?: string }) => {
    const conv = mockBootstrapConversation()
    return {
      agent: undefined,
      isAgentChat: !!agentId,
      isCeoAgent: !!agentId,
      threadId: conv.data?.threadId ?? 'thread-1',
      messages: mockChatMessages().data ?? [],
      send: vi.fn(),
      isSending: false,
      isLoading: false,
      bootstrapStatus: (conv.data?.status ?? 'not-started') as any,
      aiValidation: undefined,
      hasNoProvider: false,
      inputDisabled: false,
      thinkingStartTime: undefined,
      lastThinkingDurationMs: undefined,
    }
  }),
}))

vi.mock('@/hooks/use-lcp-agents', () => ({
  useLcpAgent: vi.fn(() => ({ data: null, isLoading: false })),
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function createProposal(overrides: Partial<ProposalDto> = {}): ProposalDto {
  return {
    id: 'prop-1',
    projectId: 'test-project',
    proposalType: 'create-department' as ProposalType,
    title: 'Create Engineering Department',
    description: 'A dedicated engineering department',
    motivation: 'We need a dedicated engineering team',
    problemDetected: 'No engineering team exists',
    expectedBenefit: 'Better product velocity',
    estimatedCost: 'Medium',
    contextToAssign: '',
    affectedContractIds: [],
    affectedWorkflowIds: [],
    requiredApproval: 'founder' as never,
    status: 'proposed' as ProposalStatus,
    proposedByAgentId: 'ceo-agent',
    reviewedByUserId: null,
    approvedByUserId: null,
    rejectionReason: null,
    implementedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// CEO Conversation Dock
// ---------------------------------------------------------------------------

describe('CeoConversationDock', () => {
  beforeEach(() => {
    mockBootstrapConversation.mockReturnValue({
      data: { id: 'conv-1', projectId: 'test-project', threadId: 'thread-1', status: 'collecting-context' },
      isError: false,
    })
    mockStartConversation.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockSendBootstrapMessage.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockChatThread.mockReturnValue({ data: { id: 'thread-1' } })
    mockChatMessages.mockReturnValue({ data: [], isLoading: false })
  })

  it('should render CEO conversation dock', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('ceo-conversation-dock')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })

  it('should show status indicator', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Collecting context')).toBeInTheDocument()
  })

  it('should show chat input for active conversation', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('should show messages when available', () => {
    mockChatMessages.mockReturnValue({
      data: [
        { id: 'msg-1', threadId: 'thread-1', role: 'assistant', content: 'Hello, I am the CEO', entityRefs: [], actions: [], createdAt: new Date().toISOString() },
      ],
      isLoading: false,
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Hello, I am the CEO')).toBeInTheDocument()
  })

  it('should show ready-to-grow status', () => {
    mockBootstrapConversation.mockReturnValue({
      data: { id: 'conv-1', projectId: 'test-project', threadId: 'thread-1', status: 'ready-to-grow' },
      isError: false,
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Ready to grow')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Proposal Card (chat dock variant)
// ---------------------------------------------------------------------------

describe('ProposalCard (chat dock)', () => {
  it('should render proposal with type and title', () => {
    const proposal = createProposal()
    render(<ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />)
    expect(screen.getByTestId('ceo-proposal-card')).toBeInTheDocument()
    expect(screen.getByText('create-department')).toBeInTheDocument()
    expect(screen.getByText('Create Engineering Department')).toBeInTheDocument()
  })

  it('should show approve and reject buttons for pending proposals', () => {
    const proposal = createProposal()
    render(<ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />)
    expect(screen.getByTestId('ceo-approve-btn')).toBeInTheDocument()
    expect(screen.getByTestId('ceo-reject-btn')).toBeInTheDocument()
  })

  it('should call onApprove when approve is clicked', async () => {
    const proposal = createProposal()
    const onApprove = vi.fn()
    render(<ProposalCard proposal={proposal} onApprove={onApprove} onReject={vi.fn()} />)
    await userEvent.click(screen.getByTestId('ceo-approve-btn'))
    expect(onApprove).toHaveBeenCalledWith('prop-1')
  })

  it('should show reject reason input when reject is clicked', async () => {
    const proposal = createProposal()
    render(<ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />)
    await userEvent.click(screen.getByTestId('ceo-reject-btn'))
    expect(screen.getByPlaceholderText('Reason for rejection...')).toBeInTheDocument()
  })

  it('should call onReject with reason when confirmed', async () => {
    const proposal = createProposal()
    const onReject = vi.fn()
    render(<ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={onReject} />)
    await userEvent.click(screen.getByTestId('ceo-reject-btn'))
    const textarea = screen.getByPlaceholderText('Reason for rejection...')
    await userEvent.type(textarea, 'Too expensive')
    await userEvent.click(screen.getByText('Confirm Rejection'))
    expect(onReject).toHaveBeenCalledWith('prop-1', 'Too expensive')
  })

  it('should show expand/collapse details', async () => {
    const proposal = createProposal({ motivation: 'Important reason', expectedBenefit: 'Big value' })
    render(<ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />)
    // Initially collapsed — motivation text not visible
    expect(screen.queryByText('Important reason')).not.toBeInTheDocument()
    // Click expand — find the chevron button (no data-testid)
    const buttons = screen.getAllByRole('button')
    const chevronBtn = buttons.find(b => !b.getAttribute('data-testid'))!
    await userEvent.click(chevronBtn)
    expect(screen.getByText('Important reason')).toBeInTheDocument()
    expect(screen.getByText('Big value')).toBeInTheDocument()
  })

  it('should show status text for non-actionable proposals', () => {
    const proposal = createProposal({ status: 'approved' })
    render(<ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />)
    expect(screen.queryByTestId('ceo-approve-btn')).not.toBeInTheDocument()
    expect(screen.getByText('approved')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Proposals Panel (Explorer)
// ---------------------------------------------------------------------------

describe('ProposalsPanel (Explorer tab)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      explorerCollapsed: false,
      validationIssues: [],
      projectId: 'test-project',
      graphNodes: [],
      nodeTypeFilter: null,
      statusFilter: null,
    })
    useProposalsStore.setState({
      proposals: [],
      loading: false,
      error: null,
      statusFilter: null,
      typeFilter: null,
    })
  })

  it('should render proposals tab in explorer', async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <Explorer />
      </QueryClientProvider>,
    )
    const proposalsBtn = screen.getByRole('tab', { name: 'Proposals' })
    await userEvent.click(proposalsBtn)
    expect(screen.getByTestId('proposals-panel')).toBeInTheDocument()
  })

  it('should show empty state when no proposals', async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <Explorer />
      </QueryClientProvider>,
    )
    const proposalsBtn = screen.getByRole('tab', { name: 'Proposals' })
    await userEvent.click(proposalsBtn)
    expect(screen.getByText(/No proposals yet/)).toBeInTheDocument()
  })

  it('should show proposals grouped by status', async () => {
    useProposalsStore.setState({
      proposals: [
        createProposal({ id: 'p1', status: 'proposed' }),
        createProposal({ id: 'p2', status: 'approved', title: 'Approved prop' }),
      ],
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <Explorer />
      </QueryClientProvider>,
    )
    const proposalsBtn = screen.getByRole('tab', { name: 'Proposals' })
    await userEvent.click(proposalsBtn)
    expect(screen.getByText('Pending (1)')).toBeInTheDocument()
    expect(screen.getByText('Approved (1)')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Proposals Store
// ---------------------------------------------------------------------------

describe('ProposalsStore', () => {
  beforeEach(() => {
    useProposalsStore.setState({
      proposals: [],
      loading: false,
      error: null,
      statusFilter: null,
      typeFilter: null,
    })
  })

  it('should initialize with empty state', () => {
    const state = useProposalsStore.getState()
    expect(state.proposals).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should set status filter', () => {
    useProposalsStore.getState().setStatusFilter('proposed')
    expect(useProposalsStore.getState().statusFilter).toBe('proposed')
  })

  it('should set type filter', () => {
    useProposalsStore.getState().setTypeFilter('create-department' as ProposalType)
    expect(useProposalsStore.getState().typeFilter).toBe('create-department')
  })

  it('should filter proposals by status', () => {
    useProposalsStore.setState({
      proposals: [
        createProposal({ id: 'p1', status: 'proposed' }),
        createProposal({ id: 'p2', status: 'approved' }),
      ],
      statusFilter: 'proposed',
    })
    const filtered = useProposalsStore.getState().getFilteredProposals()
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('p1')
  })

  it('should filter proposals by type', () => {
    useProposalsStore.setState({
      proposals: [
        createProposal({ id: 'p1', proposalType: 'create-department' as ProposalType }),
        createProposal({ id: 'p2', proposalType: 'create-specialist' as ProposalType }),
      ],
      typeFilter: 'create-department' as ProposalType,
    })
    const filtered = useProposalsStore.getState().getFilteredProposals()
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('p1')
  })

  it('should get proposals by status', () => {
    useProposalsStore.setState({
      proposals: [
        createProposal({ id: 'p1', status: 'proposed' }),
        createProposal({ id: 'p2', status: 'approved' }),
        createProposal({ id: 'p3', status: 'proposed' }),
      ],
    })
    const proposed = useProposalsStore.getState().getProposalsByStatus('proposed')
    expect(proposed).toHaveLength(2)
  })
})
