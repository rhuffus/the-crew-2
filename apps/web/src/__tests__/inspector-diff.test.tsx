import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Inspector } from '@/components/visual-shell/inspector/inspector'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import type { VisualNodeDiffDto, VisualEdgeDiffDto, VisualDiffSummary } from '@the-crew/shared-types'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

const mockDiffNodes: VisualNodeDiffDto[] = [
  {
    id: 'dept:d1',
    nodeType: 'department',
    entityId: 'd1',
    label: 'Marketing',
    sublabel: 'Drive growth',
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: 'company:p1',
    diffStatus: 'modified',
    changes: {
      sublabel: { before: 'Grow market share', after: 'Drive growth' },
    },
  },
  {
    id: 'dept:d2',
    nodeType: 'department',
    entityId: 'd2',
    label: 'Sales',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: 'company:p1',
    diffStatus: 'added',
  },
  {
    id: 'dept:d3',
    nodeType: 'department',
    entityId: 'd3',
    label: 'HR',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: 'company:p1',
    diffStatus: 'removed',
  },
]

const mockDiffEdges: VisualEdgeDiffDto[] = []

const mockSummary: VisualDiffSummary = {
  nodesAdded: 1,
  nodesRemoved: 1,
  nodesModified: 1,
  nodesUnchanged: 0,
  edgesAdded: 0,
  edgesRemoved: 0,
  edgesModified: 0,
  edgesUnchanged: 0,
}

describe('Inspector in diff mode', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      inspectorCollapsed: false,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      isDiffMode: false,
      graphNodes: [],
      graphEdges: [],
    })
  })

  it('should show diff summary panel when no selection and in diff mode', () => {
    useVisualWorkspaceStore.setState({ isDiffMode: true })
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
        diffSummary={mockSummary}
      />,
    )
    expect(screen.getByTestId('diff-summary-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('canvas-summary')).not.toBeInTheDocument()
  })

  it('should show canvas summary when no selection and not in diff mode', () => {
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
      />,
    )
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
    expect(screen.queryByTestId('diff-summary-panel')).not.toBeInTheDocument()
  })

  it('should show Changes tab instead of Relations tab in diff mode', () => {
    useVisualWorkspaceStore.setState({
      isDiffMode: true,
      selectedNodeIds: ['dept:d1'],
    })
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
      />,
    )
    expect(screen.getByTestId('tab-changes')).toBeInTheDocument()
    expect(screen.queryByTestId('tab-relations')).not.toBeInTheDocument()
  })

  it('should not show Changes tab when not in diff mode', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:d1'],
    })
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
      />,
    )
    expect(screen.queryByTestId('tab-changes')).not.toBeInTheDocument()
    expect(screen.getByTestId('tab-relations')).toBeInTheDocument()
  })

  it('should render Changes tab content for modified node', async () => {
    useVisualWorkspaceStore.setState({
      isDiffMode: true,
      selectedNodeIds: ['dept:d1'],
    })
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
      />,
    )
    await userEvent.click(screen.getByTestId('tab-changes'))
    expect(screen.getByTestId('changes-tab')).toBeInTheDocument()
    expect(screen.getByText('Modified entity')).toBeInTheDocument()
    expect(screen.getByTestId('change-field-sublabel')).toBeInTheDocument()
  })

  it('should render Changes tab content for added node', async () => {
    useVisualWorkspaceStore.setState({
      isDiffMode: true,
      selectedNodeIds: ['dept:d2'],
    })
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
      />,
    )
    await userEvent.click(screen.getByTestId('tab-changes'))
    expect(screen.getByText('New entity')).toBeInTheDocument()
  })

  it('should render Changes tab content for removed node', async () => {
    useVisualWorkspaceStore.setState({
      isDiffMode: true,
      selectedNodeIds: ['dept:d3'],
    })
    render(
      <Inspector
        graphNodes={mockDiffNodes}
        graphEdges={mockDiffEdges}
      />,
    )
    await userEvent.click(screen.getByTestId('tab-changes'))
    expect(screen.getByText('Deleted entity')).toBeInTheDocument()
  })
})
