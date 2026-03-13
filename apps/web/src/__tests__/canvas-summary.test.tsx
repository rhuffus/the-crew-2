import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { CanvasSummary } from '@/components/visual-shell/inspector/canvas-summary'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useProposalsStore } from '@/stores/proposals-store'
import {
  allMockNodes,
  allMockEdges,
} from './fixtures/visual-graph'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: () => ({ data: null }),
}))
vi.mock('@/hooks/use-growth', () => ({
  useOrgHealth: () => ({ data: null }),
  usePhaseCapabilities: () => ({ data: null }),
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderSummary(nodes: VisualNodeDto[], edges = allMockEdges) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CanvasSummary nodes={nodes} edges={edges} />
    </QueryClientProvider>,
  )
}

describe('CanvasSummary', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ projectId: null })
    useProposalsStore.setState({ proposals: [] })
  })

  it('should render canvas summary', () => {
    renderSummary(allMockNodes)
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
  })

  it('should show node count', () => {
    renderSummary(allMockNodes)
    expect(screen.getByText(`Nodes (${allMockNodes.length})`)).toBeInTheDocument()
  })

  it('should show edge count', () => {
    renderSummary(allMockNodes)
    expect(screen.getByText(`Edges (${allMockEdges.length})`)).toBeInTheDocument()
  })

  it('should show counts by node type', () => {
    renderSummary(allMockNodes)
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('should show counts by edge type', () => {
    renderSummary(allMockNodes)
    expect(screen.getByText('Reports To')).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
    expect(screen.getByText('Contributes To')).toBeInTheDocument()
  })

  it('should show validation summary when errors/warnings exist', () => {
    // mockCapabilityNode has status 'warning', mockContractNode has status 'error'
    renderSummary(allMockNodes)
    expect(screen.getByText('Validation')).toBeInTheDocument()
    expect(screen.getByText('1 error')).toBeInTheDocument()
    expect(screen.getByText('1 warning')).toBeInTheDocument()
  })

  it('should not show validation section when all normal', () => {
    const normalNodes = allMockNodes.map((n) => ({ ...n, status: 'normal' as const }))
    renderSummary(normalNodes)
    expect(screen.queryByText('Validation')).not.toBeInTheDocument()
  })

  it('should show empty state for no nodes', () => {
    renderSummary([], [])
    expect(screen.getByText('No nodes in view.')).toBeInTheDocument()
    expect(screen.getByText('No edges in view.')).toBeInTheDocument()
  })

  it('should show plural form for multiple errors', () => {
    const errorNodes: VisualNodeDto[] = [
      { ...allMockNodes[0]!, status: 'error' },
      { ...allMockNodes[1]!, status: 'error' },
    ]
    renderSummary(errorNodes, [])
    expect(screen.getByText('2 errors')).toBeInTheDocument()
  })
})
