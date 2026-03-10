import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { VisualNodeDto, VisualNodeDiffDto } from '@the-crew/shared-types'
import { EntityTree } from '@/components/visual-shell/explorer/entity-tree'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

function makeDiffNode(overrides: Partial<VisualNodeDiffDto> & { id: string; nodeType: VisualNodeDto['nodeType']; label: string; diffStatus: VisualNodeDiffDto['diffStatus'] }): VisualNodeDiffDto {
  return {
    entityId: overrides.id,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

const DIFF_NODES: VisualNodeDiffDto[] = [
  makeDiffNode({ id: 'company:p1', nodeType: 'company', label: 'Acme', diffStatus: 'unchanged' }),
  makeDiffNode({ id: 'dept:d1', nodeType: 'department', label: 'Engineering', diffStatus: 'unchanged' }),
  makeDiffNode({ id: 'dept:d2', nodeType: 'department', label: 'Sales', diffStatus: 'added' }),
  makeDiffNode({ id: 'dept:d3', nodeType: 'department', label: 'HR', diffStatus: 'removed' }),
  makeDiffNode({ id: 'dept:d4', nodeType: 'department', label: 'Marketing', diffStatus: 'modified' }),
  makeDiffNode({ id: 'role:r1', nodeType: 'role', label: 'CTO', diffStatus: 'added' }),
]

describe('EntityTree in diff mode', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      graphNodes: [],
      selectedNodeIds: [],
      selectedEdgeIds: [],
      focusNodeId: null,
      isDiffMode: false,
    })
  })

  it('should show diff badges when isDiffMode is true', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: DIFF_NODES as unknown as VisualNodeDto[],
      isDiffMode: true,
    })
    render(<EntityTree />)
    expect(screen.getByTestId('diff-badge-dept:d2')).toHaveTextContent('+')
    expect(screen.getByTestId('diff-badge-dept:d3')).toHaveTextContent('−')
    expect(screen.getByTestId('diff-badge-dept:d4')).toHaveTextContent('~')
  })

  it('should not show diff badge for unchanged nodes', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: DIFF_NODES as unknown as VisualNodeDto[],
      isDiffMode: true,
    })
    render(<EntityTree />)
    expect(screen.queryByTestId('diff-badge-dept:d1')).not.toBeInTheDocument()
  })

  it('should not show diff badges when not in diff mode', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: DIFF_NODES as unknown as VisualNodeDto[],
      isDiffMode: false,
    })
    render(<EntityTree />)
    expect(screen.queryByTestId('diff-badge-dept:d2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('diff-badge-dept:d3')).not.toBeInTheDocument()
  })

  it('should show group diff summary in diff mode', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: DIFF_NODES as unknown as VisualNodeDto[],
      isDiffMode: true,
    })
    render(<EntityTree />)
    const deptSummary = screen.getByTestId('diff-group-summary-department')
    expect(deptSummary).toHaveTextContent('1 added')
    expect(deptSummary).toHaveTextContent('1 removed')
    expect(deptSummary).toHaveTextContent('1 modified')
  })

  it('should not show group diff summary when not in diff mode', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: DIFF_NODES as unknown as VisualNodeDto[],
      isDiffMode: false,
    })
    render(<EntityTree />)
    expect(screen.queryByTestId('diff-group-summary-department')).not.toBeInTheDocument()
  })

  it('should apply correct color classes to diff badges', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: DIFF_NODES as unknown as VisualNodeDto[],
      isDiffMode: true,
    })
    render(<EntityTree />)
    expect(screen.getByTestId('diff-badge-dept:d2')).toHaveClass('text-green-600')
    expect(screen.getByTestId('diff-badge-dept:d3')).toHaveClass('text-red-600')
    expect(screen.getByTestId('diff-badge-dept:d4')).toHaveClass('text-amber-600')
  })

  it('should hide validation status indicators in diff mode', () => {
    const nodesWithStatus = [
      makeDiffNode({ id: 'err-node', nodeType: 'policy', label: 'Bad', status: 'error', diffStatus: 'modified', layerIds: ['governance'] }),
    ] as unknown as VisualNodeDto[]
    useVisualWorkspaceStore.setState({
      graphNodes: nodesWithStatus,
      isDiffMode: true,
    })
    render(<EntityTree />)
    expect(screen.queryByTestId('node-status-error-err-node')).not.toBeInTheDocument()
  })
})
