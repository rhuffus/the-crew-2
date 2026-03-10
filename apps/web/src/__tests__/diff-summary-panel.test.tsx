import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiffSummaryPanel } from '@/components/visual-shell/inspector/diff-summary-panel'
import type { VisualDiffSummary } from '@the-crew/shared-types'

const mockSummary: VisualDiffSummary = {
  nodesAdded: 3,
  nodesRemoved: 1,
  nodesModified: 5,
  nodesUnchanged: 12,
  edgesAdded: 2,
  edgesRemoved: 1,
  edgesModified: 3,
  edgesUnchanged: 18,
}

describe('DiffSummaryPanel', () => {
  it('should render the diff summary panel', () => {
    render(<DiffSummaryPanel summary={mockSummary} />)
    expect(screen.getByTestId('diff-summary-panel')).toBeInTheDocument()
  })

  it('should display node counts', () => {
    render(<DiffSummaryPanel summary={mockSummary} />)
    expect(screen.getByText('+3 added')).toBeInTheDocument()
    // Both nodes and edges have "−1 removed"
    const removedElements = screen.getAllByText(/−1 removed/)
    expect(removedElements).toHaveLength(2)
    expect(screen.getByText('~5 modified')).toBeInTheDocument()
    expect(screen.getByText('12 unchanged')).toBeInTheDocument()
  })

  it('should display edge counts', () => {
    render(<DiffSummaryPanel summary={mockSummary} />)
    expect(screen.getByText('+2 added')).toBeInTheDocument()
    expect(screen.getByText('~3 modified')).toBeInTheDocument()
    expect(screen.getByText('18 unchanged')).toBeInTheDocument()
  })

  it('should show zero counts correctly', () => {
    const empty: VisualDiffSummary = {
      nodesAdded: 0, nodesRemoved: 0, nodesModified: 0, nodesUnchanged: 5,
      edgesAdded: 0, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 3,
    }
    render(<DiffSummaryPanel summary={empty} />)
    const addedElements = screen.getAllByText('+0 added')
    expect(addedElements).toHaveLength(2) // nodes + edges
    expect(screen.getByText('5 unchanged')).toBeInTheDocument()
    expect(screen.getByText('3 unchanged')).toBeInTheDocument()
  })
})
