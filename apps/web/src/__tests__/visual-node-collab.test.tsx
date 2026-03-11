import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { VisualNode, type VisualNodeData } from '@/components/visual-shell/nodes/visual-node'

function renderNode(dataOverrides: Record<string, unknown> = {}) {
  const defaultData = {
    label: 'Test Node',
    sublabel: null,
    nodeType: 'department',
    entityId: 'e1',
    status: 'normal',
    collapsed: false,
    layerIds: ['organization'],
    parentId: null,
    ...dataOverrides,
  }
  return render(
    <ReactFlowProvider>
      <VisualNode
        id="n1"
        data={defaultData as unknown as VisualNodeData}
        type="visual-node"
        dragging={false}
        draggable={true}
        selected={false}
        selectable={true}
        deletable={true}
        zIndex={0}
        isConnectable={true}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
      />
    </ReactFlowProvider>,
  )
}

describe('VisualNode collaboration badges', () => {
  it('renders comment badge when commentCount > 0', () => {
    renderNode({ commentCount: 3 })
    const badge = screen.getByTestId('comment-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('3')
    expect(badge).toHaveAttribute('title', '3 comment(s)')
  })

  it('does NOT render comment badge when commentCount is 0', () => {
    renderNode({ commentCount: 0 })
    expect(screen.queryByTestId('comment-badge')).not.toBeInTheDocument()
  })

  it('does NOT render comment badge when commentCount is undefined', () => {
    renderNode({})
    expect(screen.queryByTestId('comment-badge')).not.toBeInTheDocument()
  })

  it('renders approved review badge', () => {
    renderNode({ reviewStatus: 'approved' })
    const badge = screen.getByTestId('review-badge-approved')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Approved')
  })

  it('renders needs-changes review badge', () => {
    renderNode({ reviewStatus: 'needs-changes' })
    const badge = screen.getByTestId('review-badge-needs-changes')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Needs changes')
  })

  it('does NOT render review badge when status is null', () => {
    renderNode({ reviewStatus: null })
    expect(screen.queryByTestId('review-badge-approved')).not.toBeInTheDocument()
    expect(screen.queryByTestId('review-badge-needs-changes')).not.toBeInTheDocument()
  })

  it('does NOT render review badge when status is undefined', () => {
    renderNode({})
    expect(screen.queryByTestId('review-badge-approved')).not.toBeInTheDocument()
    expect(screen.queryByTestId('review-badge-needs-changes')).not.toBeInTheDocument()
  })

  it('does NOT render review badge when status is pending', () => {
    renderNode({ reviewStatus: 'pending' })
    expect(screen.queryByTestId('review-badge-approved')).not.toBeInTheDocument()
    expect(screen.queryByTestId('review-badge-needs-changes')).not.toBeInTheDocument()
  })

  it('renders lock badge when isLocked=true', () => {
    renderNode({ isLocked: true })
    const badge = screen.getByTestId('lock-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Locked')
  })

  it('renders lock badge with lockedByName', () => {
    renderNode({ isLocked: true, lockedByName: 'Alice' })
    const badge = screen.getByTestId('lock-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Locked by Alice')
  })

  it('does NOT render lock badge when isLocked=false', () => {
    renderNode({ isLocked: false })
    expect(screen.queryByTestId('lock-badge')).not.toBeInTheDocument()
  })

  it('does NOT render lock badge when isLocked is undefined', () => {
    renderNode({})
    expect(screen.queryByTestId('lock-badge')).not.toBeInTheDocument()
  })

  it('hides collaboration badges in diff mode', () => {
    renderNode({
      commentCount: 5,
      reviewStatus: 'approved',
      isLocked: true,
      diffStatus: 'added',
      diffBadge: '+',
      diffBorderClass: 'border-green-400',
      diffBgClass: 'bg-green-50',
    })
    expect(screen.queryByTestId('comment-badge')).not.toBeInTheDocument()
    expect(screen.queryByTestId('review-badge-approved')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lock-badge')).not.toBeInTheDocument()
  })
})
