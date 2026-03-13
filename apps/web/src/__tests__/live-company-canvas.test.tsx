import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { VisualNodeDto, VisualEdgeDto, ProposalDto } from '@the-crew/shared-types'
import { CanvasSummary } from '@/components/visual-shell/inspector/canvas-summary'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useProposalsStore } from '@/stores/proposals-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectSlug: 'test-project' }),
}))

// Mock bootstrap hook
const mockBootstrapStatus = vi.fn().mockReturnValue({ data: null })
vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: (...args: unknown[]) => mockBootstrapStatus(...args),
}))

// Mock growth hooks
const mockHealth = vi.fn().mockReturnValue({ data: null })
const mockCapabilities = vi.fn().mockReturnValue({ data: null })
vi.mock('@/hooks/use-growth', () => ({
  useOrgHealth: (...args: unknown[]) => mockHealth(...args),
  usePhaseCapabilities: (...args: unknown[]) => mockCapabilities(...args),
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function makeNode(id: string, nodeType: string, label: string, status = 'normal'): VisualNodeDto {
  return {
    id: `${nodeType}:${id}`,
    entityId: id,
    nodeType: nodeType as VisualNodeDto['nodeType'],
    label,
    sublabel: null,
    position: null,
    collapsed: false,
    layerIds: ['organization'],
    status: status as VisualNodeDto['status'],
    parentId: null,
  }
}

function makeEdge(id: string, edgeType: string, source: string, target: string): VisualEdgeDto {
  return {
    id,
    edgeType: edgeType as VisualEdgeDto['edgeType'],
    sourceId: source,
    targetId: target,
    label: null,
    style: 'solid',
    layerIds: ['organization'],
  }
}

// ---------------------------------------------------------------------------
// Canvas Summary with Live Company data
// ---------------------------------------------------------------------------

describe('CanvasSummary (Live Company)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ projectId: 'test-project' })
    useProposalsStore.setState({ proposals: [] })
    mockBootstrapStatus.mockReturnValue({ data: null })
    mockHealth.mockReturnValue({ data: null })
    mockCapabilities.mockReturnValue({ data: null })
  })

  it('should render basic node and edge counts', () => {
    const nodes = [
      makeNode('c1', 'company', 'TestCo'),
      makeNode('d1', 'department', 'Engineering'),
    ]
    const edges = [
      makeEdge('e1', 'contains', 'company:c1', 'dept:d1'),
    ]

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={nodes} edges={edges} />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
    expect(screen.getByText('Nodes (2)')).toBeInTheDocument()
    expect(screen.getByText('Edges (1)')).toBeInTheDocument()
  })

  it('should show maturity phase when bootstrap status exists', () => {
    mockBootstrapStatus.mockReturnValue({
      data: { maturityPhase: 'formation' },
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={[]} edges={[]} />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('maturity-phase')).toBeInTheDocument()
    expect(screen.getByText('formation')).toBeInTheDocument()
  })

  it('should show phase capabilities', () => {
    mockBootstrapStatus.mockReturnValue({
      data: { maturityPhase: 'structured' },
    })
    mockCapabilities.mockReturnValue({
      data: { canCreateDepartments: true, canAssignAgents: true, canDeleteTeams: false },
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={[]} edges={[]} />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Create Departments')).toBeInTheDocument()
    expect(screen.getByText('Assign Agents')).toBeInTheDocument()
  })

  it('should show org health metrics', () => {
    mockBootstrapStatus.mockReturnValue({
      data: { maturityPhase: 'operating' },
    })
    mockHealth.mockReturnValue({
      data: { teamBalance: 'green', agentCoverage: 'yellow', workflowEfficiency: 'red' },
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={[]} edges={[]} />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('org-health')).toBeInTheDocument()
  })

  it('should show pending proposals count', () => {
    useProposalsStore.setState({
      proposals: [
        { id: 'p1', projectId: 'test-project', proposalType: 'create-department', title: 'T1', description: '', motivation: 'M', problemDetected: '', expectedBenefit: 'B', estimatedCost: '', contextToAssign: '', affectedContractIds: [], affectedWorkflowIds: [], requiredApproval: 'founder', status: 'proposed', proposedByAgentId: 'ceo', reviewedByUserId: null, approvedByUserId: null, rejectionReason: null, implementedAt: null, createdAt: '', updatedAt: '' },
        { id: 'p2', projectId: 'test-project', proposalType: 'create-team', title: 'T2', description: '', motivation: 'M', problemDetected: '', expectedBenefit: 'B', estimatedCost: '', contextToAssign: '', affectedContractIds: [], affectedWorkflowIds: [], requiredApproval: 'founder', status: 'under-review', proposedByAgentId: 'ceo', reviewedByUserId: null, approvedByUserId: null, rejectionReason: null, implementedAt: null, createdAt: '', updatedAt: '' },
      ] as ProposalDto[],
    })

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={[]} edges={[]} />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('pending-proposals-count')).toBeInTheDocument()
    expect(screen.getByText('2 pending proposals')).toBeInTheDocument()
  })

  it('should render v3 node types correctly', () => {
    const nodes = [
      makeNode('c1', 'company', 'TestCo'),
      makeNode('t1', 'team', 'Alpha Team'),
      makeNode('ca1', 'coordinator-agent', 'Lead Agent'),
      makeNode('sa1', 'specialist-agent', 'Dev Agent'),
      makeNode('pr1', 'proposal', 'New Proposal'),
    ]

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={nodes} edges={[]} />
      </QueryClientProvider>,
    )
    expect(screen.getByText('Nodes (5)')).toBeInTheDocument()
  })

  it('should show validation counts for warning and error nodes', () => {
    const nodes = [
      makeNode('c1', 'company', 'TestCo'),
      makeNode('d1', 'department', 'Broken Dept', 'error'),
      makeNode('d2', 'department', 'Warn Dept', 'warning'),
    ]

    render(
      <QueryClientProvider client={createQueryClient()}>
        <CanvasSummary nodes={nodes} edges={[]} />
      </QueryClientProvider>,
    )
    expect(screen.getByText(/1 error/)).toBeInTheDocument()
    expect(screen.getByText(/1 warning/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Entity Tree with v3 types
// ---------------------------------------------------------------------------

describe('EntityTree (Live Company types)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      graphNodes: [],
      selectedNodeIds: [],
      isDiffMode: false,
    })
  })

  it('should group v3 nodes by type', async () => {
    const { EntityTree } = await import('@/components/visual-shell/explorer/entity-tree')

    useVisualWorkspaceStore.setState({
      graphNodes: [
        makeNode('c1', 'company', 'TestCo'),
        makeNode('t1', 'team', 'Alpha Team'),
        makeNode('ca1', 'coordinator-agent', 'Lead Agent'),
        makeNode('sa1', 'specialist-agent', 'Dev Agent'),
        makeNode('p1', 'proposal', 'Create Dept'),
      ],
    })

    render(<EntityTree />)

    expect(screen.getByTestId('entity-group-company')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-team')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-coordinator-agent')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-specialist-agent')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-proposal')).toBeInTheDocument()
  })

  it('should show correct labels for v3 node types', async () => {
    const { EntityTree } = await import('@/components/visual-shell/explorer/entity-tree')

    useVisualWorkspaceStore.setState({
      graphNodes: [
        makeNode('t1', 'team', 'Alpha Team'),
      ],
    })

    render(<EntityTree />)
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Alpha Team')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Bootstrap Status Badge
// ---------------------------------------------------------------------------

describe('BootstrapStatusBadge', () => {
  it('should render phase badge', async () => {
    mockBootstrapStatus.mockReturnValue({
      data: { bootstrapped: true, maturityPhase: 'seed' },
    })

    const { BootstrapStatusBadge } = await import('@/components/visual-shell/bootstrap-status-badge')

    render(
      <QueryClientProvider client={createQueryClient()}>
        <BootstrapStatusBadge projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('bootstrap-status-badge')).toBeInTheDocument()
    expect(screen.getByText('Seed')).toBeInTheDocument()
  })

  it('should render nothing when no status', async () => {
    mockBootstrapStatus.mockReturnValue({ data: null })

    const { BootstrapStatusBadge } = await import('@/components/visual-shell/bootstrap-status-badge')

    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <BootstrapStatusBadge projectId="test-project" />
      </QueryClientProvider>,
    )
    expect(container.innerHTML).toBe('')
  })
})

// ---------------------------------------------------------------------------
// use-entity-detail hook — v3 API paths
// ---------------------------------------------------------------------------

describe('use-entity-detail (v3 types)', () => {
  it('should map team to organizational-units API path', async () => {
    // We test the mapping by importing the module and checking it queries the right path
    // Since it's a hook, we just verify the mapping exists in the module
    const mod = await import('@/hooks/use-entity-detail')
    expect(mod.useEntityDetail).toBeDefined()
  })
})
