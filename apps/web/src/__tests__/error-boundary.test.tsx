import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error-boundary'

let shouldThrow = false

function ThrowingComponent() {
  if (shouldThrow) {
    throw new Error('Test explosion')
  }
  return <div data-testid="child-content">All good</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = false
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('renders fallback UI when a child throws', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test explosion')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    shouldThrow = true
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument()
  })

  it('renders reload button in default fallback', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('error-boundary-reload')).toBeInTheDocument()
    expect(screen.getByText('Reload')).toBeInTheDocument()
  })

  it('recovers when reload button is clicked', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()

    // Stop throwing, then click reload
    shouldThrow = false
    fireEvent.click(screen.getByTestId('error-boundary-reload'))

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument()
  })

  it('logs the error to console', () => {
    shouldThrow = true
    const consoleSpy = vi.spyOn(console, 'error')
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(consoleSpy).toHaveBeenCalled()
    const errorCalls = consoleSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('[ErrorBoundary]'),
    )
    expect(errorCalls.length).toBeGreaterThan(0)
  })
})
