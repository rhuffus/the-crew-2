import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EdgeInspector } from '@/components/visual-shell/inspector/edge-inspector'
import {
  allMockNodes,
  mockOwnsEdge,
  mockReportsToEdge,
  mockParticipatesInEdge,
  mockHandsOffToEdge,
} from './fixtures/visual-graph'
import type { VisualEdgeDto } from '@the-crew/shared-types'

describe('EdgeInspector', () => {
  it('should render edge inspector', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.getByTestId('edge-inspector')).toBeInTheDocument()
  })

  it('should show edge type', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.getByText('Edge Type')).toBeInTheDocument()
    expect(screen.getByText('Owns')).toBeInTheDocument()
  })

  it('should show edge style', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.getByText('Style')).toBeInTheDocument()
    expect(screen.getByText('solid')).toBeInTheDocument()
  })

  it('should show source node with label and type', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('(Department)')).toBeInTheDocument()
  })

  it('should show target node with label and type', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.getByText('Target')).toBeInTheDocument()
    expect(screen.getByText('Brand Management')).toBeInTheDocument()
    expect(screen.getByText('(Capability)')).toBeInTheDocument()
  })

  it('should show layers', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.getByText('Layers')).toBeInTheDocument()
    expect(screen.getByText('capabilities')).toBeInTheDocument()
  })

  it('should fall back to visual ID when node not found', () => {
    render(<EdgeInspector edge={mockReportsToEdge} allNodes={[]} />)
    expect(screen.getByText('dept:abc')).toBeInTheDocument()
    expect(screen.getByText('dept:xyz')).toBeInTheDocument()
  })

  it('should show label when non-participates_in edge has one', () => {
    const edgeWithLabel: VisualEdgeDto = {
      ...mockOwnsEdge,
      label: 'Primary ownership',
    }
    render(<EdgeInspector edge={edgeWithLabel} allNodes={allMockNodes} />)
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Primary ownership')).toBeInTheDocument()
  })

  it('should not show label field when edge has no label', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.queryByText('Label')).not.toBeInTheDocument()
  })

  // Delete button tests
  it('should show delete button for deletable edges when onDelete provided', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} onDelete={vi.fn()} />)
    expect(screen.getByTestId('edge-delete-btn')).toBeInTheDocument()
  })

  it('should not show delete button when onDelete not provided', () => {
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} />)
    expect(screen.queryByTestId('edge-delete-btn')).not.toBeInTheDocument()
  })

  it('should not show delete button for hands_off_to edge', () => {
    render(<EdgeInspector edge={mockHandsOffToEdge} allNodes={allMockNodes} onDelete={vi.fn()} />)
    expect(screen.queryByTestId('edge-delete-btn')).not.toBeInTheDocument()
  })

  it('should call onDelete with edge details when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<EdgeInspector edge={mockOwnsEdge} allNodes={allMockNodes} onDelete={onDelete} />)
    fireEvent.click(screen.getByTestId('edge-delete-btn'))
    expect(onDelete).toHaveBeenCalledWith('owns', 'dept:abc', 'cap:c1')
  })

  // Metadata editing tests (participates_in)
  it('should show responsibility field for participates_in edge', () => {
    render(<EdgeInspector edge={mockParticipatesInEdge} allNodes={allMockNodes} />)
    expect(screen.getByText('Responsibility')).toBeInTheDocument()
    expect(screen.getByText('Facilitates onboarding sessions')).toBeInTheDocument()
  })

  it('should not show Label field for participates_in edge', () => {
    render(<EdgeInspector edge={mockParticipatesInEdge} allNodes={allMockNodes} />)
    expect(screen.queryByText('Label')).not.toBeInTheDocument()
  })

  it('should enter edit mode when responsibility clicked', () => {
    render(
      <EdgeInspector
        edge={mockParticipatesInEdge}
        allNodes={allMockNodes}
        onUpdateMetadata={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('responsibility-edit-btn'))
    expect(screen.getByTestId('responsibility-input')).toBeInTheDocument()
  })

  it('should call onUpdateMetadata on blur with changed value', () => {
    const onUpdateMetadata = vi.fn()
    render(
      <EdgeInspector
        edge={mockParticipatesInEdge}
        allNodes={allMockNodes}
        onUpdateMetadata={onUpdateMetadata}
      />,
    )
    fireEvent.click(screen.getByTestId('responsibility-edit-btn'))
    const input = screen.getByTestId('responsibility-input')
    fireEvent.change(input, { target: { value: 'New responsibility' } })
    fireEvent.blur(input)
    expect(onUpdateMetadata).toHaveBeenCalledWith(
      'participates_in',
      'role:r1',
      'wf:w1',
      { responsibility: 'New responsibility' },
    )
  })

  it('should call onUpdateMetadata on Enter key with changed value', () => {
    const onUpdateMetadata = vi.fn()
    render(
      <EdgeInspector
        edge={mockParticipatesInEdge}
        allNodes={allMockNodes}
        onUpdateMetadata={onUpdateMetadata}
      />,
    )
    fireEvent.click(screen.getByTestId('responsibility-edit-btn'))
    const input = screen.getByTestId('responsibility-input')
    fireEvent.change(input, { target: { value: 'Updated' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdateMetadata).toHaveBeenCalledWith(
      'participates_in',
      'role:r1',
      'wf:w1',
      { responsibility: 'Updated' },
    )
  })

  it('should cancel edit on Escape key without calling onUpdateMetadata', () => {
    const onUpdateMetadata = vi.fn()
    render(
      <EdgeInspector
        edge={mockParticipatesInEdge}
        allNodes={allMockNodes}
        onUpdateMetadata={onUpdateMetadata}
      />,
    )
    fireEvent.click(screen.getByTestId('responsibility-edit-btn'))
    const input = screen.getByTestId('responsibility-input')
    fireEvent.change(input, { target: { value: 'Changed' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onUpdateMetadata).not.toHaveBeenCalled()
    // Should show original value again
    expect(screen.getByText('Facilitates onboarding sessions')).toBeInTheDocument()
  })

  it('should not call onUpdateMetadata when value unchanged', () => {
    const onUpdateMetadata = vi.fn()
    render(
      <EdgeInspector
        edge={mockParticipatesInEdge}
        allNodes={allMockNodes}
        onUpdateMetadata={onUpdateMetadata}
      />,
    )
    fireEvent.click(screen.getByTestId('responsibility-edit-btn'))
    const input = screen.getByTestId('responsibility-input')
    fireEvent.blur(input) // blur without changing value
    expect(onUpdateMetadata).not.toHaveBeenCalled()
  })

  it('should show placeholder for participates_in with no responsibility', () => {
    const edgeNoLabel: VisualEdgeDto = { ...mockParticipatesInEdge, label: null }
    render(<EdgeInspector edge={edgeNoLabel} allNodes={allMockNodes} />)
    expect(screen.getByText('No responsibility set')).toBeInTheDocument()
  })
})
