import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NodePalette, NodePaletteButton } from '@/components/visual-shell/node-palette'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('NodePalette', () => {
  const onSelect = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    onSelect.mockReset()
    onClose.mockReset()
  })

  it('should render palette with search input', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('node-palette')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-search')).toBeInTheDocument()
  })

  it('should render grouped items for L2', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('node-palette-group-organization')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-group-capabilities')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-group-workflows')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-group-contracts')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-group-governance')).toBeInTheDocument()
  })

  it('should render all 8 items for L2', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('node-palette-item-role')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-capability')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-workflow')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-contract')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-policy')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-skill')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-agent-archetype')).toBeInTheDocument()
    expect(screen.getByTestId('node-palette-item-agent-assignment')).toBeInTheDocument()
  })

  it('should render only department for L1', () => {
    render(<NodePalette zoomLevel="L1" onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('node-palette-item-department')).toBeInTheDocument()
    expect(screen.queryByTestId('node-palette-item-role')).not.toBeInTheDocument()
  })

  it('should show empty message for L3', () => {
    render(<NodePalette zoomLevel="L3" onSelect={onSelect} onClose={onClose} />)
    expect(screen.getByTestId('node-palette-empty')).toBeInTheDocument()
  })

  it('should call onSelect and onClose when item is clicked', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('node-palette-item-role'))
    expect(onSelect).toHaveBeenCalledWith('role')
    expect(onClose).toHaveBeenCalled()
  })

  it('should filter items when searching', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('node-palette-search'), { target: { value: 'policy' } })
    expect(screen.getByTestId('node-palette-item-policy')).toBeInTheDocument()
    expect(screen.queryByTestId('node-palette-item-role')).not.toBeInTheDocument()
    // When searching, groups are hidden (flat results)
    expect(screen.queryByTestId('node-palette-group-organization')).not.toBeInTheDocument()
  })

  it('should show no results message when search has no match', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('node-palette-search'), { target: { value: 'zzzzz' } })
    expect(screen.getByTestId('node-palette-no-results')).toBeInTheDocument()
  })

  it('should show descriptions for items', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    // Role has description "Named accountability with authority and capabilities"
    expect(screen.getByText('Named accountability with authority and capabilities')).toBeInTheDocument()
  })

  it('should close on Escape key', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('should close on click outside', () => {
    render(
      <div>
        <div data-testid="outside">outside</div>
        <NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />
      </div>,
    )
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should search by description text', () => {
    render(<NodePalette zoomLevel="L2" onSelect={onSelect} onClose={onClose} />)
    fireEvent.change(screen.getByTestId('node-palette-search'), { target: { value: 'agreement' } })
    expect(screen.getByTestId('node-palette-item-contract')).toBeInTheDocument()
    expect(screen.queryByTestId('node-palette-item-role')).not.toBeInTheDocument()
  })
})

describe('NodePaletteButton', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ nodePaletteOpen: false })
  })

  it('should render button when there are addable items', () => {
    render(<NodePaletteButton zoomLevel="L2" onAddEntity={vi.fn()} />)
    expect(screen.getByTestId('node-palette-button')).toBeInTheDocument()
  })

  it('should not render button when no items available (L3)', () => {
    const { container } = render(<NodePaletteButton zoomLevel="L3" onAddEntity={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('should toggle palette on click', () => {
    render(<NodePaletteButton zoomLevel="L2" onAddEntity={vi.fn()} />)
    fireEvent.click(screen.getByTestId('node-palette-button'))
    expect(screen.getByTestId('node-palette')).toBeInTheDocument()
  })

  it('should close palette on second click', () => {
    render(<NodePaletteButton zoomLevel="L2" onAddEntity={vi.fn()} />)
    fireEvent.click(screen.getByTestId('node-palette-button'))
    expect(screen.getByTestId('node-palette')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('node-palette-button'))
    expect(screen.queryByTestId('node-palette')).not.toBeInTheDocument()
  })
})
