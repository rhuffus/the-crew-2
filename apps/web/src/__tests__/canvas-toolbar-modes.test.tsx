import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanvasToolbar, CANVAS_MODES } from '@/components/visual-shell/canvas-toolbar'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('CanvasToolbar — interaction modes', () => {
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
      addEdgeSource: null,
      isDiffMode: false,
      diffFilter: null,
      baseReleaseId: null,
      compareReleaseId: null,
    })
  })

  it('should render mode group container', () => {
    render(<CanvasToolbar />)
    expect(screen.getByTestId('mode-group')).toBeInTheDocument()
  })

  it('should render all five mode buttons', () => {
    render(<CanvasToolbar />)
    for (const { mode } of CANVAS_MODES) {
      expect(screen.getByTestId(`mode-${mode}`)).toBeInTheDocument()
    }
  })

  it('should highlight select mode by default', () => {
    render(<CanvasToolbar />)
    const selectBtn = screen.getByTestId('mode-select')
    expect(selectBtn.className).toContain('bg-primary/10')
    expect(selectBtn.className).toContain('text-primary')
  })

  it('should switch active mode when clicking a mode button', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('mode-pan'))
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('pan')
  })

  it('should show mode label on the right side', () => {
    render(<CanvasToolbar />)
    expect(screen.getByTestId('mode-label')).toHaveTextContent('Select')
  })

  it('should update mode label when mode changes', () => {
    render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('mode-connect'))
    expect(screen.getByTestId('mode-label')).toHaveTextContent('Connect')
  })

  it('should include shortcut in button title/aria-label', () => {
    render(<CanvasToolbar />)
    const selectBtn = screen.getByTestId('mode-select')
    expect(selectBtn.title).toBe('Select (V)')
    expect(selectBtn.getAttribute('aria-label')).toBe('Select (V)')
  })

  it('should display all mode shortcut hints', () => {
    render(<CanvasToolbar />)
    const shortcuts = CANVAS_MODES.map(m => `${m.label} (${m.shortcut})`)
    for (const hint of shortcuts) {
      const btn = screen.getByTitle(hint)
      expect(btn).toBeInTheDocument()
    }
  })

  it('should highlight the newly active mode after switching', () => {
    const { rerender } = render(<CanvasToolbar />)
    fireEvent.click(screen.getByTestId('mode-connect'))
    rerender(<CanvasToolbar />)
    const connectBtn = screen.getByTestId('mode-connect')
    expect(connectBtn.className).toContain('bg-primary/10')
    const selectBtn = screen.getByTestId('mode-select')
    expect(selectBtn.className).not.toContain('bg-primary/10')
  })

  describe('diff mode', () => {
    beforeEach(() => {
      useVisualWorkspaceStore.setState({ isDiffMode: true })
    })

    it('should lock mode to select in diff mode', () => {
      useVisualWorkspaceStore.setState({ canvasMode: 'connect' })
      render(<CanvasToolbar />)
      // Effective mode should be select, so select button should be active
      const selectBtn = screen.getByTestId('mode-select')
      expect(selectBtn.className).toContain('bg-primary/10')
    })

    it('should disable non-select mode buttons in diff mode', () => {
      render(<CanvasToolbar />)
      expect(screen.getByTestId('mode-pan')).toBeDisabled()
      expect(screen.getByTestId('mode-connect')).toBeDisabled()
      expect(screen.getByTestId('mode-add-node')).toBeDisabled()
      expect(screen.getByTestId('mode-add-edge')).toBeDisabled()
    })

    it('should not disable select button in diff mode', () => {
      render(<CanvasToolbar />)
      expect(screen.getByTestId('mode-select')).not.toBeDisabled()
    })

    it('should show Select as mode label in diff mode regardless of store state', () => {
      useVisualWorkspaceStore.setState({ canvasMode: 'pan' })
      render(<CanvasToolbar />)
      expect(screen.getByTestId('mode-label')).toHaveTextContent('Select')
    })
  })
})
