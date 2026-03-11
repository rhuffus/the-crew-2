import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanvasToolbar } from '@/components/visual-shell/canvas-toolbar'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('CanvasToolbar — Node Palette (CAV-006)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      currentView: 'org',
      zoomLevel: 'L1',
      activeLayers: ['organization'],
      nodeTypeFilter: null,
      statusFilter: null,
      showValidationOverlay: false,
      collapsedNodeIds: [],
      canvasMode: 'select',
      isDiffMode: false,
      preselectedEdgeType: null,
    })
  })

  it('should show node palette button at L1', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.getByTestId('node-palette-button')).toBeInTheDocument()
  })

  it('should open node palette with categorized items', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('node-palette-button'))
    expect(screen.getByTestId('node-palette')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-department')).toBeInTheDocument()
  })

  it('should call onAddEntity with nodeType when item is selected', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('node-palette-button'))
    fireEvent.click(screen.getByTestId('node-palette-item-department'))
    expect(onAddEntity).toHaveBeenCalledWith('department')
  })

  it('should close palette after selection', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('node-palette-button'))
    fireEvent.click(screen.getByTestId('node-palette-item-department'))
    expect(screen.queryByTestId('node-palette')).not.toBeInTheDocument()
  })

  it('should show L2 entity types at department view', () => {
    useVisualWorkspaceStore.setState({ currentView: 'department', zoomLevel: 'L2' })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('node-palette-button'))

    expect(screen.getByTestId('node-palette-item-role')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-capability')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-workflow')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-contract')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-policy')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-skill')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-agent-archetype')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-agent-assignment')).toBeInTheDocument()
  })

  it('should not show node palette button at L3 (workflow)', () => {
    useVisualWorkspaceStore.setState({ currentView: 'workflow', zoomLevel: 'L3' })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.queryByTestId('node-palette-button')).not.toBeInTheDocument()
  })

  it('should not show palette buttons without onAddEntity callback', () => {
    render(<CanvasToolbar />)
    expect(screen.queryByTestId('node-palette-button')).not.toBeInTheDocument()
  })

  it('should not show palette buttons in diff mode', () => {
    useVisualWorkspaceStore.setState({ isDiffMode: true })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.queryByTestId('node-palette-button')).not.toBeInTheDocument()
  })
})

describe('CanvasToolbar — Relationship Palette (CAV-006)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      currentView: 'org',
      zoomLevel: 'L1',
      activeLayers: ['organization'],
      nodeTypeFilter: null,
      statusFilter: null,
      showValidationOverlay: false,
      collapsedNodeIds: [],
      canvasMode: 'select',
      isDiffMode: false,
      preselectedEdgeType: null,
    })
  })

  it('should show relationship palette button', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.getByTestId('rel-palette-button')).toBeInTheDocument()
  })

  it('should open relationship palette with categories', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('rel-palette-button'))
    expect(screen.getByTestId('relationship-palette')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-group-hierarchical')).toBeInTheDocument()
  })

  it('should hide relationship palette button in diff mode', () => {
    useVisualWorkspaceStore.setState({ isDiffMode: true })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.queryByTestId('rel-palette-button')).not.toBeInTheDocument()
  })

  it('should show preselected edge type in mode label', () => {
    useVisualWorkspaceStore.setState({
      canvasMode: 'add-edge',
      preselectedEdgeType: 'reports_to',
    })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.getByTestId('mode-label')).toHaveTextContent('Add Edge: Reports To')
  })

  it('should show normal mode label when no preselected type', () => {
    useVisualWorkspaceStore.setState({ canvasMode: 'add-edge', preselectedEdgeType: null })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.getByTestId('mode-label')).toHaveTextContent('Add Edge')
  })
})
