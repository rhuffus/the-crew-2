import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EdgeDeleteConfirm } from '@/components/visual-shell/edge-delete-confirm'
import { allMockNodes } from './fixtures/visual-graph'

describe('EdgeDeleteConfirm', () => {
  const defaultProps = {
    edgeType: 'owns' as const,
    sourceNodeId: 'dept:abc',
    targetNodeId: 'cap:c1',
    allNodes: allMockNodes,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should render the confirm dialog', () => {
    render(<EdgeDeleteConfirm {...defaultProps} />)
    expect(screen.getByTestId('edge-delete-confirm')).toBeInTheDocument()
    expect(screen.getByText('Delete relationship?')).toBeInTheDocument()
  })

  it('should show source and target labels', () => {
    render(<EdgeDeleteConfirm {...defaultProps} />)
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Brand Management')).toBeInTheDocument()
  })

  it('should show edge type label', () => {
    render(<EdgeDeleteConfirm {...defaultProps} />)
    expect(screen.getByText('Owns')).toBeInTheDocument()
  })

  it('should fall back to visual ID when nodes not found', () => {
    render(<EdgeDeleteConfirm {...defaultProps} allNodes={[]} />)
    expect(screen.getByText('dept:abc')).toBeInTheDocument()
    expect(screen.getByText('cap:c1')).toBeInTheDocument()
  })

  it('should call onConfirm when Delete button clicked', () => {
    const onConfirm = vi.fn()
    render(<EdgeDeleteConfirm {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('delete-confirm-btn'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('should call onCancel when Cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<EdgeDeleteConfirm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('delete-cancel-btn'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should call onCancel when backdrop clicked', () => {
    const onCancel = vi.fn()
    render(<EdgeDeleteConfirm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('edge-delete-confirm-backdrop'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should call onCancel when Escape key pressed', () => {
    const onCancel = vi.fn()
    render(<EdgeDeleteConfirm {...defaultProps} onCancel={onCancel} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should not propagate click from dialog card to backdrop', () => {
    const onCancel = vi.fn()
    render(<EdgeDeleteConfirm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('edge-delete-confirm'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('should show "Deleting..." when isPending', () => {
    render(<EdgeDeleteConfirm {...defaultProps} isPending />)
    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })

  it('should disable buttons when isPending', () => {
    render(<EdgeDeleteConfirm {...defaultProps} isPending />)
    expect(screen.getByTestId('delete-confirm-btn')).toBeDisabled()
    expect(screen.getByTestId('delete-cancel-btn')).toBeDisabled()
  })
})
