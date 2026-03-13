import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Explorer } from '@/components/visual-shell/explorer/explorer'
import { CeoConversationDock } from '@/components/visual-shell/chat-dock/ceo-conversation-dock'
import { ProposalCard } from '@/components/visual-shell/chat-dock/proposal-card'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useProposalsStore } from '@/stores/proposals-store'
import type { ProposalDto, ProposalStatus, ProposalType, MaturityPhase } from '@the-crew/shared-types'

// Mock fetch
vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectSlug: 'test-project' }),
}))

// Mock bootstrap status hook
const mockBootstrapStatus = vi.fn().mockReturnValue({ data: null })
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

// Mock growth hooks
vi.mock('@/hooks/use-growth', () => ({
  useOrgHealth: () => ({ data: null }),
  usePhaseCapabilities: () => ({ data: null }),
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
    mockBootstrapStatus.mockReturnValue({
      data: { maturityPhase: 'seed' as MaturityPhase },
    })
    mockProposals.mockReturnValue({ data: [], refetch: vi.fn() })
    mockApprove.mockReturnValue({ mutate: vi.fn() })
    mockReject.mockReturnValue({ mutate: vi.fn() })
  })

  it('should render CEO welcome message', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('ceo-conversation-dock')).toBeInTheDocument()
    expect(screen.getByText('CEO Agent')).toBeInTheDocument()
  })

  it('should show phase indicator', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText(/Phase: seed/i)).toBeInTheDocument()
  })

  it('should show empty state when no proposals', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText(/No pending proposals/)).toBeInTheDocument()
  })

  it('should show pending proposals when they exist', () => {
    const proposal = createProposal()
    mockProposals.mockReturnValue({ data: [proposal], refetch: vi.fn() })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Pending Proposals (1)')).toBeInTheDocument()
  })

  it('should show recently approved proposals', () => {
    const approved = createProposal({ id: 'prop-2', status: 'approved', title: 'Approved One' })
    mockProposals.mockReturnValue({ data: [approved], refetch: vi.fn() })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Recently Approved')).toBeInTheDocument()
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
