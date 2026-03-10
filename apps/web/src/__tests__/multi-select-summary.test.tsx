import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultiSelectSummary } from '@/components/visual-shell/inspector/multi-select-summary'
import type { SelectionSummary } from '@/components/visual-shell/inspector/inspector-utils'

describe('MultiSelectSummary', () => {
  it('should render multi-select summary', () => {
    const summary: SelectionSummary = {
      type: 'multi',
      count: 3,
      countByType: { department: 2, role: 1 },
    }
    render(<MultiSelectSummary summary={summary} />)
    expect(screen.getByTestId('multi-select-summary')).toBeInTheDocument()
  })

  it('should show total count', () => {
    const summary: SelectionSummary = {
      type: 'multi',
      count: 5,
      countByType: { department: 3, role: 2 },
    }
    render(<MultiSelectSummary summary={summary} />)
    expect(screen.getByText('5 items selected')).toBeInTheDocument()
  })

  it('should show count per type with labels', () => {
    const summary: SelectionSummary = {
      type: 'multi',
      count: 4,
      countByType: { department: 2, role: 1, capability: 1 },
    }
    render(<MultiSelectSummary summary={summary} />)
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Capability')).toBeInTheDocument()
  })

  it('should show Edges label for edge type', () => {
    const summary: SelectionSummary = {
      type: 'multi',
      count: 3,
      countByType: { department: 1, edge: 2 },
    }
    render(<MultiSelectSummary summary={summary} />)
    expect(screen.getByText('Edges')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
