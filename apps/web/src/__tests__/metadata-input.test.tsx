import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MetadataInput } from '@/components/visual-shell/metadata-input'

describe('MetadataInput', () => {
  it('should render responsibility form for participates_in', () => {
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByTestId('metadata-input')).toBeInTheDocument()
    expect(screen.getByText('Add participation details')).toBeInTheDocument()
    expect(screen.getByLabelText('Responsibility')).toBeInTheDocument()
    expect(screen.getByTestId('metadata-submit')).toBeInTheDocument()
    expect(screen.getByTestId('metadata-cancel')).toBeInTheDocument()
  })

  it('should have disabled submit when responsibility is empty', () => {
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const submitButton = screen.getByTestId('metadata-submit')
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit when responsibility is filled', () => {
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByTestId('metadata-responsibility'), { target: { value: 'Review code' } })
    expect(screen.getByTestId('metadata-submit')).not.toBeDisabled()
  })

  it('should call onSubmit with trimmed responsibility', () => {
    const onSubmit = vi.fn()
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByTestId('metadata-responsibility'), { target: { value: '  Approve deliverable  ' } })
    fireEvent.submit(screen.getByTestId('metadata-input'))
    expect(onSubmit).toHaveBeenCalledWith({ responsibility: 'Approve deliverable' })
  })

  it('should not submit when responsibility is whitespace only', () => {
    const onSubmit = vi.fn()
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByTestId('metadata-responsibility'), { target: { value: '   ' } })
    fireEvent.submit(screen.getByTestId('metadata-input'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByTestId('metadata-cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should call onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn()
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.click(screen.getByTestId('metadata-input-backdrop'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should call onCancel on Escape key', () => {
    const onCancel = vi.fn()
    render(
      <MetadataInput
        edgeType="participates_in"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('should render nothing for non-participates_in edge types', () => {
    const { container } = render(
      <MetadataInput
        edgeType="owns"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(container.innerHTML).toBe('')
  })
})
