import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChatInspectorPanel } from '@/components/visual-shell/inspector/chat-inspector-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

let mockBootstrapPhase: string | undefined = 'seed'

vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: vi.fn(() => ({
    data: mockBootstrapPhase ? { maturityPhase: mockBootstrapPhase } : undefined,
  })),
  useBootstrapProject: vi.fn(() => ({ mutate: vi.fn() })),
}))

let mockConversationStatus = 'collecting-context'

vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: vi.fn(() => ({
    data: { status: mockConversationStatus, threadId: 't1' },
    isError: false,
  })),
}))

const mockDocuments = [
  { id: 'd1', projectId: 'p1', slug: 'vision', title: 'Vision Document', bodyMarkdown: '', status: 'draft' as const, linkedEntityIds: [], lastUpdatedBy: 'user', sourceType: 'agent' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'd2', projectId: 'p1', slug: 'mission', title: 'Mission Statement', bodyMarkdown: '', status: 'approved' as const, linkedEntityIds: [], lastUpdatedBy: 'user', sourceType: 'user' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

let mockDocsData = mockDocuments

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocuments: vi.fn(() => ({
    data: mockDocsData,
  })),
}))

const mockProposals = [
  { id: 'prop1', title: 'Add Engineering Dept', proposalType: 'create-department', status: 'proposed', motivation: '', expectedBenefit: '', estimatedCost: null },
  { id: 'prop2', title: 'Add HR Dept', proposalType: 'create-department', status: 'under-review', motivation: '', expectedBenefit: '', estimatedCost: null },
  { id: 'prop3', title: 'Done Dept', proposalType: 'create-department', status: 'approved', motivation: '', expectedBenefit: '', estimatedCost: null },
]

vi.mock('@/stores/proposals-store', () => ({
  useProposalsStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({ proposals: mockProposals }),
  ),
}))

let mockRuntimeSummary: { activeExecutionCount: number; blockedExecutionCount: number; failedExecutionCount: number; pendingApprovalCount: number; totalCostCurrentPeriod: number } | null = null
let mockCostSummary: { totalCost: number; budgetUsedPercent: number | null } | null = null
let mockConnected = false

vi.mock('@/stores/runtime-status-store', () => ({
  useRuntimeStatusStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({
      summary: mockRuntimeSummary,
      costSummary: mockCostSummary,
      connected: mockConnected,
    }),
  ),
}))

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ChatInspectorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBootstrapPhase = 'seed'
    mockConversationStatus = 'collecting-context'
    mockDocsData = mockDocuments
    mockRuntimeSummary = null
    mockCostSummary = null
    mockConnected = false
    useVisualWorkspaceStore.setState({
      projectId: 'p1',
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
    })
  })

  it('renders the panel with testid', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-inspector-panel')).toBeDefined()
  })

  // --- Bootstrap section ---

  it('shows maturity phase badge', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-inspector-bootstrap')).toBeDefined()
    expect(screen.getByText('seed')).toBeDefined()
  })

  it('shows conversation status', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('Collecting context')).toBeDefined()
  })

  it('shows different bootstrap statuses', () => {
    mockConversationStatus = 'ready-to-grow'
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('Ready to grow')).toBeDefined()
  })

  it('shows formation phase', () => {
    mockBootstrapPhase = 'formation'
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('formation')).toBeDefined()
  })

  it('hides phase badge when no bootstrap data', () => {
    mockBootstrapPhase = undefined
    mockConversationStatus = 'not-started'
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.queryByText('seed')).toBeNull()
    expect(screen.getByText('Not started')).toBeDefined()
  })

  // --- Documents section ---

  it('shows project documents with count', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-inspector-documents')).toBeDefined()
    expect(screen.getByText('Vision Document')).toBeDefined()
    expect(screen.getByText('Mission Statement')).toBeDefined()
  })

  it('shows document status badges', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('draft')).toBeDefined()
    expect(screen.getByText('approved')).toBeDefined()
  })

  it('clicking document opens document view', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Vision Document'))
    const state = useVisualWorkspaceStore.getState()
    expect(state.centerView).toEqual({ type: 'document', documentId: 'd1' })
  })

  it('shows empty state when no documents', () => {
    mockDocsData = []
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('No documents yet')).toBeDefined()
  })

  // --- Proposals section ---

  it('shows pending proposals count', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-inspector-proposals')).toBeDefined()
    // 2 pending (proposed + under-review), approved is excluded
    expect(screen.getByText('Add Engineering Dept')).toBeDefined()
    expect(screen.getByText('Add HR Dept')).toBeDefined()
  })

  it('does not show approved proposals', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.queryByText('Done Dept')).toBeNull()
  })

  it('shows empty proposals message when none pending', async () => {
    const mod = await import('@/stores/proposals-store')
    const mockedStore = vi.mocked(mod.useProposalsStore)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedStore.mockImplementation((selector: any) =>
      selector({ proposals: [] }),
    )
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('No pending proposals')).toBeDefined()
    // restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedStore.mockImplementation((selector: any) =>
      selector({ proposals: mockProposals }),
    )
  })

  // --- Runtime section ---

  it('shows disconnected runtime state', () => {
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-inspector-runtime')).toBeDefined()
    expect(screen.getByText('Disconnected')).toBeDefined()
    expect(screen.getByText('No runtime data')).toBeDefined()
  })

  it('shows connected runtime with summary', () => {
    mockConnected = true
    mockRuntimeSummary = {
      activeExecutionCount: 2,
      blockedExecutionCount: 1,
      failedExecutionCount: 0,
      pendingApprovalCount: 0,
      totalCostCurrentPeriod: 0,
    }
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('Connected')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
  })

  it('shows idle state when all counts zero', () => {
    mockConnected = true
    mockRuntimeSummary = {
      activeExecutionCount: 0,
      blockedExecutionCount: 0,
      failedExecutionCount: 0,
      pendingApprovalCount: 0,
      totalCostCurrentPeriod: 0,
    }
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText('All systems idle')).toBeDefined()
  })

  it('shows cost summary when available', () => {
    mockCostSummary = { totalCost: 12.5, budgetUsedPercent: 25 }
    render(<ChatInspectorPanel />, { wrapper: Wrapper })
    expect(screen.getByText(/Total AI cost: \$12\.50/)).toBeDefined()
    expect(screen.getByText(/25% of budget/)).toBeDefined()
  })
})
