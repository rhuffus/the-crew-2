import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RelationshipPalette, RelationshipPaletteButton } from '@/components/visual-shell/relationship-palette'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('RelationshipPalette', () => {
  const onSelect = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    onSelect.mockReset()
    onClose.mockReset()
  })

  it('should render palette with search input', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('relationship-palette')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-search')).toBeInTheDocument()
  })

  it('should render grouped relationship types', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('rel-palette-group-hierarchical')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-group-ownership')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-group-contract')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-group-governance')).toBeInTheDocument()
  })

  it('should not include hands_off_to', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    expect(screen.queryByTestId('rel-palette-item-hands_off_to')).not.toBeInTheDocument()
  })

  it('should render creatable relationship items', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('rel-palette-item-reports_to')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-item-owns')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-item-provides')).toBeInTheDocument()
    expect(screen.getByTestId('rel-palette-item-governs')).toBeInTheDocument()
  })

  it('should show source→target type info for each item', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    // reports_to: department → department
    const reportsTo = screen.getByTestId('rel-palette-item-reports_to')
    expect(reportsTo.textContent).toContain('Department')
  })

  it('should show category badge for each item', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    const reportsTo = screen.getByTestId('rel-palette-item-reports_to')
    expect(reportsTo.textContent).toContain('hierarchical')
  })

  it('should call onSelect and onClose when item is clicked', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('rel-palette-item-reports_to'))
    expect(onSelect).toHaveBeenCalledWith('reports_to')
    expect(onClose).toHaveBeenCalled()
  })

  it('should filter items when searching', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('rel-palette-search'), { target: { value: 'governs' } })
    expect(screen.getByTestId('rel-palette-item-governs')).toBeInTheDocument()
    expect(screen.queryByTestId('rel-palette-item-reports_to')).not.toBeInTheDocument()
    // Groups hidden during search
    expect(screen.queryByTestId('rel-palette-group-hierarchical')).not.toBeInTheDocument()
  })

  it('should show no results message when no match', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('rel-palette-search'), { target: { value: 'zzzzz' } })
    expect(screen.getByTestId('rel-palette-no-results')).toBeInTheDocument()
  })

  it('should close on Escape key', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('should close on click outside', () => {
    render(
      <div>
        <div data-testid="outside">outside</div>
        <RelationshipPalette onSelect={onSelect} onClose={onClose} />
      </div>,
    )
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should filter by source type name', () => {
    render(<RelationshipPalette onSelect={onSelect} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('rel-palette-search'), { target: { value: 'policy' } })
    expect(screen.getByTestId('rel-palette-item-governs')).toBeInTheDocument()
  })
})

describe('RelationshipPaletteButton', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      canvasMode: 'select',
      isDiffMode: false,
      preselectedEdgeType: null,
      addEdgeSource: null,
    })
  })

  it('should render button', () => {
    render(<RelationshipPaletteButton />)
    expect(screen.getByTestId('rel-palette-button')).toBeInTheDocument()
  })

  it('should not render in diff mode', () => {
    useVisualWorkspaceStore.setState({ isDiffMode: true })
    const { container } = render(<RelationshipPaletteButton />)
    expect(container.querySelector('[data-testid="rel-palette-button"]')).not.toBeInTheDocument()
  })

  it('should toggle palette on click', () => {
    render(<RelationshipPaletteButton />)
    fireEvent.click(screen.getByTestId('rel-palette-button'))
    expect(screen.getByTestId('relationship-palette')).toBeInTheDocument()
  })

  it('should set preselected edge type on item selection', () => {
    render(<RelationshipPaletteButton />)
    fireEvent.click(screen.getByTestId('rel-palette-button'))
    fireEvent.click(screen.getByTestId('rel-palette-item-reports_to'))

    const state = useVisualWorkspaceStore.getState()
    expect(state.preselectedEdgeType).toBe('reports_to')
    expect(state.canvasMode).toBe('add-edge')
  })

  it('should switch to add-edge mode when relationship is selected', () => {
    render(<RelationshipPaletteButton />)
    fireEvent.click(screen.getByTestId('rel-palette-button'))
    fireEvent.click(screen.getByTestId('rel-palette-item-owns'))

    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('add-edge')
    expect(useVisualWorkspaceStore.getState().preselectedEdgeType).toBe('owns')
  })
})
