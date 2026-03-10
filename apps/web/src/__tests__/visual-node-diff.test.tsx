import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { VisualNode } from '../components/visual-shell/nodes/visual-node'

function renderNode(data: Record<string, unknown>) {
  return render(
    <ReactFlowProvider>
      <VisualNode
        id="test-node"
        data={data}
        type="department"
        dragging={false}
        draggable={true}
        selected={false}
        selectable={true}
        deletable={false}
        zIndex={0}
        isConnectable={true}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
      />
    </ReactFlowProvider>,
  )
}

describe('VisualNode diff rendering', () => {
  const baseData = {
    label: 'Engineering',
    sublabel: 'Build software',
    nodeType: 'department',
    entityId: 'd1',
    status: 'normal',
    collapsed: false,
    layerIds: ['organization'],
    parentId: null,
  }

  it('should render diff badge for added node', () => {
    renderNode({
      ...baseData,
      diffStatus: 'added',
      diffBadge: '+',
      diffBorderClass: 'border-green-500',
      diffBgClass: 'bg-green-50',
      diffOpacityClass: '',
    })

    expect(screen.getByTestId('diff-badge-added')).toBeInTheDocument()
    expect(screen.getByTestId('diff-badge-added').textContent).toBe('+')
  })

  it('should render diff badge for removed node', () => {
    renderNode({
      ...baseData,
      diffStatus: 'removed',
      diffBadge: '−',
      diffBorderClass: 'border-red-500 border-dashed',
      diffBgClass: 'bg-red-50',
      diffOpacityClass: 'opacity-70',
    })

    expect(screen.getByTestId('diff-badge-removed')).toBeInTheDocument()
    expect(screen.getByTestId('diff-badge-removed').textContent).toBe('−')
  })

  it('should render diff badge for modified node', () => {
    renderNode({
      ...baseData,
      diffStatus: 'modified',
      diffBadge: '~',
      diffBorderClass: 'border-amber-500',
      diffBgClass: 'bg-amber-50',
      diffOpacityClass: '',
    })

    expect(screen.getByTestId('diff-badge-modified')).toBeInTheDocument()
    expect(screen.getByTestId('diff-badge-modified').textContent).toBe('~')
  })

  it('should not render diff badge for unchanged node', () => {
    renderNode({
      ...baseData,
      diffStatus: 'unchanged',
      diffBadge: null,
      diffBorderClass: 'border-gray-200',
      diffBgClass: 'bg-white',
      diffOpacityClass: 'opacity-50',
    })

    expect(screen.queryByTestId('diff-badge-unchanged')).not.toBeInTheDocument()
    expect(screen.queryByTestId('diff-badge-added')).not.toBeInTheDocument()
  })

  it('should not render drilldown indicator in diff mode', () => {
    renderNode({
      ...baseData,
      diffStatus: 'unchanged',
      diffBadge: null,
      diffBorderClass: 'border-gray-200',
      diffBgClass: 'bg-white',
      diffOpacityClass: '',
    })

    // Department is normally drillable, but not in diff mode
    expect(screen.queryByTestId('drilldown-indicator')).not.toBeInTheDocument()
  })

  it('should not render diff badge when not in diff mode', () => {
    renderNode(baseData)

    expect(screen.queryByTestId('diff-badge-added')).not.toBeInTheDocument()
    expect(screen.queryByTestId('diff-badge-removed')).not.toBeInTheDocument()
    expect(screen.queryByTestId('diff-badge-modified')).not.toBeInTheDocument()
  })
})
