import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanvasToolbar } from '@/components/visual-shell/canvas-toolbar'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('CanvasToolbar AddEntityDropdown', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      currentView: 'org',
      zoomLevel: 'L1',
      activeLayers: ['organization'],
      nodeTypeFilter: null,
      statusFilter: null,
      showValidationOverlay: false,
      collapsedNodeIds: [],
    })
  })

  it('should show add button at L1', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.getByTestId('add-entity-button')).toBeInTheDocument()
  })

  it('should open dropdown with entity type options', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('add-entity-button'))
    expect(screen.getByTestId('add-entity-dropdown')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-department')).toBeInTheDocument()
  })

  it('should call onAddEntity with nodeType when option is selected', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('add-entity-button'))
    fireEvent.click(screen.getByTestId('add-entity-option-department'))
    expect(onAddEntity).toHaveBeenCalledWith('department')
  })

  it('should close dropdown after selection', () => {
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('add-entity-button'))
    fireEvent.click(screen.getByTestId('add-entity-option-department'))
    expect(screen.queryByTestId('add-entity-dropdown')).not.toBeInTheDocument()
  })

  it('should show L2 entity types at department view', () => {
    useVisualWorkspaceStore.setState({ currentView: 'department', zoomLevel: 'L2' })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    fireEvent.click(screen.getByTestId('add-entity-button'))

    expect(screen.getByTestId('add-entity-option-role')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-capability')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-workflow')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-contract')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-policy')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-skill')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-agent-archetype')).toBeInTheDocument()
    expect(screen.getByTestId('add-entity-option-agent-assignment')).toBeInTheDocument()
  })

  it('should not show add button at L3 (workflow)', () => {
    useVisualWorkspaceStore.setState({ currentView: 'workflow', zoomLevel: 'L3' })
    const onAddEntity = vi.fn()
    render(<CanvasToolbar onAddEntity={onAddEntity} />)
    expect(screen.queryByTestId('add-entity-button')).not.toBeInTheDocument()
  })

  it('should not show add button without onAddEntity callback', () => {
    render(<CanvasToolbar />)
    expect(screen.queryByTestId('add-entity-button')).not.toBeInTheDocument()
  })
})
