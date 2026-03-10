import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiffLegend } from '../components/visual-shell/diff-legend'

describe('DiffLegend', () => {
  it('should render the legend container', () => {
    render(<DiffLegend />)
    expect(screen.getByTestId('diff-legend')).toBeInTheDocument()
  })

  it('should display all four diff status labels', () => {
    render(<DiffLegend />)

    expect(screen.getByText('Added')).toBeInTheDocument()
    expect(screen.getByText('Removed')).toBeInTheDocument()
    expect(screen.getByText('Modified')).toBeInTheDocument()
    expect(screen.getByText('Unchanged')).toBeInTheDocument()
  })
})
