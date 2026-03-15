import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThinkingBubble, ThinkingDurationBadge } from '@/components/visual-shell/chat-dock/thinking-bubble'

describe('ThinkingBubble', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders thinking indicator', () => {
    render(<ThinkingBubble startTime={Date.now()} />)
    expect(screen.getByTestId('thinking-bubble')).toBeDefined()
    expect(screen.getByText(/Thinking/)).toBeDefined()
  })

  it('shows elapsed time after 1 second', () => {
    render(<ThinkingBubble startTime={Date.now()} />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText(/Thinking.*2s/)).toBeDefined()
  })

  it('formats minutes correctly', () => {
    render(<ThinkingBubble startTime={Date.now()} />)
    act(() => {
      vi.advanceTimersByTime(65000)
    })
    expect(screen.getByText(/1m 5s/)).toBeDefined()
  })

  it('has spinner animation class', () => {
    render(<ThinkingBubble startTime={Date.now()} />)
    const spinner = screen.getByTestId('thinking-bubble').querySelector('.animate-spin')
    expect(spinner).toBeDefined()
  })
})

describe('ThinkingDurationBadge', () => {
  it('renders duration in seconds', () => {
    render(<ThinkingDurationBadge durationMs={5000} />)
    expect(screen.getByTestId('thinking-duration')).toBeDefined()
    expect(screen.getByText(/Thought for 5s/)).toBeDefined()
  })

  it('renders duration in minutes and seconds', () => {
    render(<ThinkingDurationBadge durationMs={125000} />)
    expect(screen.getByText(/Thought for 2m 5s/)).toBeDefined()
  })

  it('renders checkmark', () => {
    render(<ThinkingDurationBadge durationMs={3000} />)
    expect(screen.getByText('✓')).toBeDefined()
  })
})
