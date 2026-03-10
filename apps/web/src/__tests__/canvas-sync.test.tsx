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
  { id: 'node-3', position: { x: 400, y: 0 }, data: { label: 'Node 3' } },
]

function renderCanvas(nodes: Node[] = TEST_NODES) {
  return render(
    <ReactFlowProvider>
      <CanvasViewport nodes={nodes} />
    </ReactFlowProvider>,
  )
}

describe('Canvas ↔ Explorer sync', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: [],
      selectedEdgeIds: [],
      focusNodeId: null,
      graphNodes: [],
    })
  })

  it('should render canvas viewport', () => {
    renderCanvas()
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
  })

  it('should render canvas toolbar', () => {
    renderCanvas()
    expect(screen.getByTestId('canvas-toolbar')).toBeInTheDocument()
  })

  it('should render with provided nodes', () => {
    renderCanvas()
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
  })

  it('should clear focusNodeId after focus attempt', () => {
    useVisualWorkspaceStore.setState({ focusNodeId: 'node-1' })
    renderCanvas()
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBeNull()
  })

  it('should clear focusNodeId even for non-existent node', () => {
    useVisualWorkspaceStore.setState({ focusNodeId: 'does-not-exist' })
    renderCanvas()
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBeNull()
  })

  it('should not crash when no focusNodeId is set', () => {
    useVisualWorkspaceStore.setState({ focusNodeId: null })
    renderCanvas()
    expect(screen.getByTestId('canvas-viewport')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    render(
      <ReactFlowProvider>
        <CanvasViewport isLoading />
      </ReactFlowProvider>,
    )
    expect(screen.getByTestId('canvas-loading')).toBeInTheDocument()
    expect(screen.getByText('Loading graph...')).toBeInTheDocument()
  })

  it('should render error state', () => {
    render(
      <ReactFlowProvider>
        <CanvasViewport error="Failed to load graph" />
      </ReactFlowProvider>,
    )
    expect(screen.getByTestId('canvas-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load graph')).toBeInTheDocument()
  })
})
