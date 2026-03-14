/**
 * AIR-020 — Smoke test: CEO bootstrap UI flow
 *
 * Validates the frontend integration for:
 *   create project → CEO conversation → status progression → growth proposals → approval
 *
 * Uses mocked hooks and API calls (no backend required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProjectForm } from '@/components/projects/create-project-dialog'
import { CeoConversationDock } from '@/components/visual-shell/chat-dock/ceo-conversation-dock'
import { ProposalCard } from '@/components/visual-shell/chat-dock/proposal-card'
import type { ProposalDto, ProposalStatus, ProposalType } from '@the-crew/shared-types'

// -------------------------------------------------------------------------
// Global stubs
// -------------------------------------------------------------------------
vi.stubGlobal('fetch', vi.fn())

const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ projectSlug: 'smoke-test-inc' }),
}))

vi.mock('@/lib/bootstrap-api', () => ({
  bootstrapApi: {
    bootstrap: vi.fn().mockResolvedValue({
      projectSeedId: 'smoke-1',
      constitutionId: 'smoke-1',
      companyUoId: 'uo-1',
      ceoAgentId: 'ceo-1',
      maturityPhase: 'seed',
      nextStep: 'bootstrap-conversation',
    }),
  },
}))

vi.mock('@/stores/visual-workspace-store', () => ({
  useVisualWorkspaceStore: Object.assign(
    () => ({}),
    { getState: () => ({ openChatView: vi.fn() }) },
  ),
}))

// -------------------------------------------------------------------------
// Bootstrap conversation hooks
// -------------------------------------------------------------------------
const mockBootstrapConversation = vi.fn().mockReturnValue({ data: null, isError: true })
const mockStartConversation = vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false })
const mockSendBootstrapMessage = vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false })
const mockProposeGrowth = vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
const mockApproveGrowthProposal = vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
const mockRejectGrowthProposal = vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false })

vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: (...args: unknown[]) => mockBootstrapConversation(...args),
  useStartBootstrapConversation: (...args: unknown[]) => mockStartConversation(...args),
  useSendBootstrapMessage: (...args: unknown[]) => mockSendBootstrapMessage(...args),
  useProposeGrowth: (...args: unknown[]) => mockProposeGrowth(...args),
  useApproveGrowthProposal: (...args: unknown[]) => mockApproveGrowthProposal(...args),
  useRejectGrowthProposal: (...args: unknown[]) => mockRejectGrowthProposal(...args),
}))

// -------------------------------------------------------------------------
// Chat hooks
// -------------------------------------------------------------------------
const mockChatThread = vi.fn().mockReturnValue({ data: { id: 'thread-1' } })
const mockChatMessages = vi.fn().mockReturnValue({ data: [], isLoading: false })

vi.mock('@/hooks/use-chat', () => ({
  useChatThread: (...args: unknown[]) => mockChatThread(...args),
  useChatMessages: (...args: unknown[]) => mockChatMessages(...args),
  useSendMessage: () => ({ mutate: vi.fn(), isPending: false }),
  useChatThreads: () => ({ data: [] }),
}))

// -------------------------------------------------------------------------
// Other hooks
// -------------------------------------------------------------------------
vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: () => ({ data: null }),
  useBootstrapProject: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/use-proposals', () => ({
  useProposals: () => ({ data: [], refetch: vi.fn() }),
  useProposal: () => ({ data: null }),
  useApproveProposal: () => ({ mutate: vi.fn() }),
  useRejectProposal: () => ({ mutate: vi.fn() }),
  useSubmitProposal: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/hooks/use-growth', () => ({
  useOrgHealth: () => ({ data: null }),
  usePhaseCapabilities: () => ({ data: null }),
}))

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------
function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function createProposal(overrides: Partial<ProposalDto> = {}): ProposalDto {
  return {
    id: 'prop-smoke-1',
    projectId: 'smoke-test-inc',
    proposalType: 'create-department' as ProposalType,
    title: 'Create Department: Engineering',
    description: 'Core engineering department',
    motivation: 'Need engineering capacity',
    problemDetected: 'No engineering team',
    expectedBenefit: 'Product development velocity',
    estimatedCost: 'Low',
    contextToAssign: '',
    affectedContractIds: [],
    affectedWorkflowIds: [],
    requiredApproval: 'founder' as never,
    status: 'proposed' as ProposalStatus,
    proposedByAgentId: 'ceo-1',
    reviewedByUserId: null,
    approvedByUserId: null,
    rejectionReason: null,
    implementedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// -------------------------------------------------------------------------
// Test: Create Project Flow
// -------------------------------------------------------------------------
describe('Smoke: Create Project Flow', () => {
  beforeEach(() => {
    navigateMock.mockReset()
  })

  it('should submit form, bootstrap, and navigate to org canvas', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'smoke-1',
        name: 'SmokeTest Inc',
        description: 'Validating the flow',
        status: 'active',
        createdAt: '2026-03-13T00:00:00Z',
        updatedAt: '2026-03-13T00:00:00Z',
      }),
    } as Response)

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CreateProjectForm />
      </QueryClientProvider>,
    )

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'SmokeTest Inc' },
    })
    fireEvent.change(screen.getByLabelText(/short description/i), {
      target: { value: 'Validating the flow' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create company/i }))

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/projects/$projectSlug/org',
        params: { projectSlug: 'smoketest-inc' },
      })
    })
  })

  it('should disable submit button when fields are empty', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CreateProjectForm />
      </QueryClientProvider>,
    )

    const submitBtn = screen.getByRole('button', { name: /create company/i })
    expect(submitBtn).toHaveProperty('disabled', true)
  })
})

// -------------------------------------------------------------------------
// Test: CEO Conversation Dock
// -------------------------------------------------------------------------
describe('Smoke: CEO Conversation Dock', () => {
  beforeEach(() => {
    mockBootstrapConversation.mockReturnValue({
      data: {
        id: 'conv-smoke-1',
        projectId: 'smoke-test-inc',
        threadId: 'thread-1',
        status: 'collecting-context',
      },
      isError: false,
    })
    mockChatThread.mockReturnValue({ data: { id: 'thread-1' } })
    mockChatMessages.mockReturnValue({ data: [], isLoading: false })
  })

  it('should render CEO dock with collecting-context status', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="smoke-test-inc" />
      </QueryClientProvider>,
    )

    expect(screen.getByTestId('ceo-conversation-dock')).toBeInTheDocument()
    expect(screen.getByText('CEO Agent')).toBeInTheDocument()
    expect(screen.getByText('Collecting context')).toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('should display CEO kickoff message', () => {
    mockChatMessages.mockReturnValue({
      data: [
        {
          id: 'msg-kickoff',
          threadId: 'thread-1',
          role: 'assistant',
          content: 'Hello! I\'m the CEO agent for SmokeTest Inc. Let me ask a few questions.',
          entityRefs: [],
          actions: [],
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="smoke-test-inc" />
      </QueryClientProvider>,
    )

    expect(screen.getByText(/CEO agent for SmokeTest Inc/)).toBeInTheDocument()
  })

  it('should display conversation with user and assistant messages', () => {
    mockChatMessages.mockReturnValue({
      data: [
        {
          id: 'msg-1',
          threadId: 'thread-1',
          role: 'assistant',
          content: 'Welcome to SmokeTest Inc!',
          entityRefs: [],
          actions: [],
          createdAt: '2026-03-13T10:00:00Z',
        },
        {
          id: 'msg-2',
          threadId: 'thread-1',
          role: 'user',
          content: 'We build payment solutions for SMBs',
          entityRefs: [],
          actions: [],
          createdAt: '2026-03-13T10:01:00Z',
        },
        {
          id: 'msg-3',
          threadId: 'thread-1',
          role: 'assistant',
          content: 'Great context! Tell me more about your team.',
          entityRefs: [],
          actions: [],
          createdAt: '2026-03-13T10:01:30Z',
        },
      ],
      isLoading: false,
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="smoke-test-inc" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Welcome to SmokeTest Inc!')).toBeInTheDocument()
    expect(screen.getByText('We build payment solutions for SMBs')).toBeInTheDocument()
    expect(screen.getByText(/Tell me more about your team/)).toBeInTheDocument()
  })

  it('should show ready-to-grow status with propose button', () => {
    mockBootstrapConversation.mockReturnValue({
      data: {
        id: 'conv-smoke-1',
        projectId: 'smoke-test-inc',
        threadId: 'thread-1',
        status: 'ready-to-grow',
      },
      isError: false,
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="smoke-test-inc" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Ready to grow')).toBeInTheDocument()
    expect(screen.getByText('Propose Structure')).toBeInTheDocument()
  })

  it('should show growth-started status', () => {
    mockBootstrapConversation.mockReturnValue({
      data: {
        id: 'conv-smoke-1',
        projectId: 'smoke-test-inc',
        threadId: 'thread-1',
        status: 'growth-started',
      },
      isError: false,
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CeoConversationDock projectId="smoke-test-inc" />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Growth started')).toBeInTheDocument()
  })

  it('should show all bootstrap statuses correctly', () => {
    const statuses = [
      { status: 'collecting-context', label: 'Collecting context' },
      { status: 'drafting-foundation-docs', label: 'Drafting documents' },
      { status: 'reviewing-foundation-docs', label: 'Reviewing documents' },
      { status: 'ready-to-grow', label: 'Ready to grow' },
      { status: 'growth-started', label: 'Growth started' },
    ]

    for (const { status, label } of statuses) {
      mockBootstrapConversation.mockReturnValue({
        data: {
          id: 'conv-smoke-1',
          projectId: 'smoke-test-inc',
          threadId: 'thread-1',
          status,
        },
        isError: false,
      })

      const { unmount } = render(
        <QueryClientProvider client={createQueryClient()}>
          <CeoConversationDock projectId="smoke-test-inc" />
        </QueryClientProvider>,
      )

      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })
})

// -------------------------------------------------------------------------
// Test: Proposal Card (growth proposals from CEO)
// -------------------------------------------------------------------------
describe('Smoke: Growth Proposal Cards', () => {
  it('should render proposal with approve/reject actions', () => {
    const proposal = createProposal()
    render(
      <ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />,
    )

    expect(screen.getByTestId('ceo-proposal-card')).toBeInTheDocument()
    expect(screen.getByText('Create Department: Engineering')).toBeInTheDocument()
    expect(screen.getByText('create-department')).toBeInTheDocument()
    expect(screen.getByTestId('ceo-approve-btn')).toBeInTheDocument()
    expect(screen.getByTestId('ceo-reject-btn')).toBeInTheDocument()
  })

  it('should call onApprove with proposal id', async () => {
    const proposal = createProposal()
    const onApprove = vi.fn()

    render(
      <ProposalCard proposal={proposal} onApprove={onApprove} onReject={vi.fn()} />,
    )
    await userEvent.click(screen.getByTestId('ceo-approve-btn'))

    expect(onApprove).toHaveBeenCalledWith('prop-smoke-1')
  })

  it('should handle rejection with reason', async () => {
    const proposal = createProposal()
    const onReject = vi.fn()

    render(
      <ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={onReject} />,
    )

    await userEvent.click(screen.getByTestId('ceo-reject-btn'))
    const textarea = screen.getByPlaceholderText('Reason for rejection...')
    await userEvent.type(textarea, 'Too early for this department')
    await userEvent.click(screen.getByText('Confirm Rejection'))

    expect(onReject).toHaveBeenCalledWith('prop-smoke-1', 'Too early for this department')
  })

  it('should hide actions for approved proposals', () => {
    const proposal = createProposal({ status: 'approved' })

    render(
      <ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />,
    )

    expect(screen.queryByTestId('ceo-approve-btn')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ceo-reject-btn')).not.toBeInTheDocument()
    expect(screen.getByText('approved')).toBeInTheDocument()
  })

  it('should hide actions for implemented proposals', () => {
    const proposal = createProposal({ status: 'implemented' as ProposalStatus })

    render(
      <ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />,
    )

    expect(screen.queryByTestId('ceo-approve-btn')).not.toBeInTheDocument()
    expect(screen.getByText('implemented')).toBeInTheDocument()
  })

  it('should show all proposal types correctly', () => {
    const types: ProposalType[] = ['create-department', 'create-team', 'create-specialist'] as ProposalType[]

    for (const proposalType of types) {
      const proposal = createProposal({
        id: `prop-${proposalType}`,
        proposalType,
        title: `Create ${proposalType.replace('create-', '')}`,
      })

      const { unmount } = render(
        <ProposalCard proposal={proposal} onApprove={vi.fn()} onReject={vi.fn()} />,
      )
      expect(screen.getByText(proposalType)).toBeInTheDocument()
      unmount()
    }
  })
})
