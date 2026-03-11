import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelectSummary } from '@/components/visual-shell/inspector/multi-select-summary'
import type { SelectionSummary } from '@/components/visual-shell/inspector/inspector-utils'

const multiSummary: SelectionSummary = {
  type: 'multi',
  count: 3,
  countByType: { department: 2, role: 1 },
}

describe('MultiSelectSummary — bulk actions', () => {
  it('should not show bulk actions when no onDeleteSelected', () => {
    render(<MultiSelectSummary summary={multiSummary} />)
    expect(screen.queryByTestId('bulk-delete-btn')).not.toBeInTheDocument()
  })

  it('should not show bulk actions when selectedNodeCount is 0', () => {
    render(<MultiSelectSummary summary={multiSummary} onDeleteSelected={() => {}} selectedNodeCount={0} />)
    expect(screen.queryByTestId('bulk-delete-btn')).not.toBeInTheDocument()
  })

  it('should show bulk delete button when onDeleteSelected and nodes selected', () => {
    render(<MultiSelectSummary summary={multiSummary} onDeleteSelected={() => {}} selectedNodeCount={3} />)
    expect(screen.getByTestId('bulk-delete-btn')).toBeInTheDocument()
    expect(screen.getByText('Delete Selected')).toBeInTheDocument()
  })

  it('should show confirmation on first click', async () => {
    render(<MultiSelectSummary summary={multiSummary} onDeleteSelected={() => {}} selectedNodeCount={3} />)
    await userEvent.click(screen.getByTestId('bulk-delete-btn'))
    expect(screen.getByText('Delete 3 selected nodes?')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-bulk-delete')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-bulk-delete')).toBeInTheDocument()
  })

  it('should call onDeleteSelected on confirm', async () => {
    const onDelete = vi.fn()
    render(<MultiSelectSummary summary={multiSummary} onDeleteSelected={onDelete} selectedNodeCount={3} />)
    await userEvent.click(screen.getByTestId('bulk-delete-btn'))
    await userEvent.click(screen.getByTestId('confirm-bulk-delete'))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('should cancel confirmation', async () => {
    const onDelete = vi.fn()
    render(<MultiSelectSummary summary={multiSummary} onDeleteSelected={onDelete} selectedNodeCount={3} />)
    await userEvent.click(screen.getByTestId('bulk-delete-btn'))
    await userEvent.click(screen.getByTestId('cancel-bulk-delete'))
    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByTestId('bulk-delete-btn')).toBeInTheDocument()
  })

  it('should still show type counts', () => {
    render(<MultiSelectSummary summary={multiSummary} onDeleteSelected={() => {}} selectedNodeCount={3} />)
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('should show singular for 1 node', async () => {
    const summary: SelectionSummary = { type: 'multi', count: 1, countByType: { department: 1 } }
    render(<MultiSelectSummary summary={summary} onDeleteSelected={() => {}} selectedNodeCount={1} />)
    await userEvent.click(screen.getByTestId('bulk-delete-btn'))
    expect(screen.getByText('Delete 1 selected node?')).toBeInTheDocument()
  })
})
