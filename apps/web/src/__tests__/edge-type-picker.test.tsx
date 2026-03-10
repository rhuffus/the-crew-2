import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EdgeTypePicker } from '@/components/visual-shell/edge-type-picker'

describe('EdgeTypePicker', () => {
  it('should render all options', () => {
    render(
      <EdgeTypePicker
        options={['owns', 'participates_in']}
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('edge-type-picker')).toBeInTheDocument()
    expect(screen.getByText('Select relationship type')).toBeInTheDocument()
    expect(screen.getByTestId('edge-option-owns')).toBeInTheDocument()
    expect(screen.getByTestId('edge-option-participates_in')).toBeInTheDocument()
  })

  it('should display edge type labels', () => {
    render(
      <EdgeTypePicker
        options={['provides', 'consumes']}
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('Provides')).toBeInTheDocument()
    expect(screen.getByText('Consumes')).toBeInTheDocument()
  })

  it('should display category badges', () => {
    render(
      <EdgeTypePicker
        options={['reports_to', 'owns']}
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('hierarchical')).toBeInTheDocument()
    expect(screen.getByText('ownership')).toBeInTheDocument()
  })

  it('should call onSelect when option is clicked', () => {
    const onSelect = vi.fn()
    render(
      <EdgeTypePicker
        options={['owns', 'participates_in']}
        onSelect={onSelect}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('edge-option-owns'))
    expect(onSelect).toHaveBeenCalledWith('owns')
  })

  it('should call onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn()
    render(
      <EdgeTypePicker
        options={['owns']}
        onSelect={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByTestId('edge-type-picker-backdrop'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should not call onCancel when card is clicked', () => {
    const onCancel = vi.fn()
    render(
      <EdgeTypePicker
        options={['owns']}
        onSelect={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByTestId('edge-type-picker'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('should call onCancel on Escape key', () => {
    const onCancel = vi.fn()
    render(
      <EdgeTypePicker
        options={['owns']}
        onSelect={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })
})
