import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import type { Node } from '@xyflow/react'
import { CanvasViewport } from '@/components/visual-shell/canvas-viewport'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

const TEST_NODES: Node[] = [
  { id: 'node-1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'node-2', position: { x: 200, y: 0 }, data: { label: 'Node 2' } },
]

function renderCanvas(nodes: Node[] = TEST_NODES) {
  return render(
    <ReactFlowProvider>
      <CanvasViewport nodes={nodes} />
    </ReactFlowProvider>,
  )
}

describe('Transition integration with store and CanvasViewport', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: [],
      selectedEdgeIds: [],
      focusNodeId: null,
      graphNodes: [],
      graphEdges: [],
      transitionDirection: null,
      transitionTargetId: null,
      pendingConnection: null,
      edgeTypePicker: null,
      metadataInput: null,
      deleteConfirm: null,
    })
  })

  it('renders TransitionWrapper inside CanvasViewport', () => {
    renderCanvas()
    expect(screen.getByTestId('transition-wrapper')).toBeInTheDocument()
  })

  it('TransitionWrapper has no animation when store has no transition', () => {
    renderCanvas()
    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper).not.toHaveAttribute('data-animating')
    expect(wrapper).not.toHaveAttribute('data-direction')
  })

  it('TransitionWrapper shows drill-in animation when store has drill-in transition', () => {
    useVisualWorkspaceStore.getState().startTransition('drill-in', 'node-1')
    renderCanvas()
    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper).toHaveAttribute('data-direction', 'drill-in')
    expect(wrapper).toHaveAttribute('data-animating', 'true')
  })

  it('TransitionWrapper shows drill-out animation when store has drill-out transition', () => {
    useVisualWorkspaceStore.getState().startTransition('drill-out', 'node-1')
    renderCanvas()
    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper).toHaveAttribute('data-direction', 'drill-out')
    expect(wrapper).toHaveAttribute('data-animating', 'true')
  })

  it('store startTransition sets direction and targetId', () => {
    const store = useVisualWorkspaceStore.getState()
    store.startTransition('drill-in', 'target-123')

    const state = useVisualWorkspaceStore.getState()
    expect(state.transitionDirection).toBe('drill-in')
    expect(state.transitionTargetId).toBe('target-123')
  })

  it('store clearTransition resets direction and targetId', () => {
    const store = useVisualWorkspaceStore.getState()
    store.startTransition('drill-out', 'target-456')
    store.clearTransition()

    const state = useVisualWorkspaceStore.getState()
    expect(state.transitionDirection).toBeNull()
    expect(state.transitionTargetId).toBeNull()
  })
})
