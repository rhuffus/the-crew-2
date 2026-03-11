import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CanvasToolbar } from '@/components/visual-shell/canvas-toolbar'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

beforeEach(() => {
  useVisualWorkspaceStore.setState({
    currentView: 'org',
    activeLayers: ['organization'],
    zoomLevel: 'L1',
    nodeTypeFilter: null,
    statusFilter: null,
    showValidationOverlay: false,
    showOperationsOverlay: false,
    operationsStatus: null,
    collapsedNodeIds: [],
    canvasMode: 'select',
    isDiffMode: false,
    preselectedEdgeType: null,
    activePreset: null,
    currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
  })
})

describe('CanvasToolbar a11y', () => {
  it('should have aria-pressed="false" on toggle buttons when inactive', () => {
    render(<CanvasToolbar />)
    const validationToggle = screen.getByTestId('toolbar-toggle-validation-overlay')
    expect(validationToggle.getAttribute('aria-pressed')).toBe('false')
    const opsToggle = screen.getByTestId('toolbar-toggle-operations-overlay')
    expect(opsToggle.getAttribute('aria-pressed')).toBe('false')
  })

  it('should have aria-pressed="true" on validation toggle when active', () => {
    useVisualWorkspaceStore.setState({ showValidationOverlay: true })
    render(<CanvasToolbar />)
    const validationToggle = screen.getByTestId('toolbar-toggle-validation-overlay')
    expect(validationToggle.getAttribute('aria-pressed')).toBe('true')
  })

  it('should have aria-pressed="true" on operations toggle when active', () => {
    useVisualWorkspaceStore.setState({ showOperationsOverlay: true })
    render(<CanvasToolbar />)
    const opsToggle = screen.getByTestId('toolbar-toggle-operations-overlay')
    expect(opsToggle.getAttribute('aria-pressed')).toBe('true')
  })

  it('should have aria-live="polite" on saving indicator', () => {
    render(<CanvasToolbar isPending />)
    const indicator = screen.getByTestId('saving-indicator')
    expect(indicator.getAttribute('aria-live')).toBe('polite')
  })

  it('should not render saving indicator without aria-live when not pending', () => {
    render(<CanvasToolbar isPending={false} />)
    expect(screen.queryByTestId('saving-indicator')).toBeNull()
  })
})
