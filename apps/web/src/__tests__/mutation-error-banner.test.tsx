import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MutationErrorBanner, type MutationError } from '@/components/visual-shell/mutation-error-banner'

describe('MutationErrorBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when errors array is empty', () => {
    const { container } = render(
      <MutationErrorBanner errors={[]} onDismiss={() => {}} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders error toasts for each error', () => {
    const errors: MutationError[] = [
      { id: '1', message: 'Update failed', timestamp: Date.now() },
      { id: '2', message: 'Delete failed', timestamp: Date.now() },
    ]
    render(<MutationErrorBanner errors={errors} onDismiss={() => {}} />)
    expect(screen.getByTestId('mutation-error-banner')).toBeInTheDocument()
    const toasts = screen.getAllByTestId('mutation-error-toast')
    expect(toasts).toHaveLength(2)
    expect(screen.getByText('Update failed')).toBeInTheDocument()
    expect(screen.getByText('Delete failed')).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    const errors: MutationError[] = [
      { id: 'err-1', message: 'Something broke', timestamp: Date.now() },
    ]
    render(<MutationErrorBanner errors={errors} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTestId('mutation-error-dismiss'))
    expect(onDismiss).toHaveBeenCalledWith('err-1')
  })

  it('auto-dismisses after 5 seconds', () => {
    const onDismiss = vi.fn()
    const errors: MutationError[] = [
      { id: 'auto-1', message: 'Temporary error', timestamp: Date.now() },
    ]
    render(<MutationErrorBanner errors={errors} onDismiss={onDismiss} />)
    expect(screen.getByTestId('mutation-error-toast')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onDismiss).toHaveBeenCalledWith('auto-1')
  })
})
