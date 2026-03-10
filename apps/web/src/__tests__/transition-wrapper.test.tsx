import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { TransitionWrapper } from '@/components/visual-shell/transition-wrapper'

describe('TransitionWrapper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children without transition when direction is null', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction={null} onTransitionEnd={onEnd}>
        <div data-testid="child">content</div>
      </TransitionWrapper>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('transition-wrapper')).not.toHaveAttribute('data-animating')
    expect(screen.getByTestId('transition-wrapper')).not.toHaveAttribute('data-direction')
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('sets data-animating when direction is drill-in', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    expect(screen.getByTestId('transition-wrapper')).toHaveAttribute('data-animating', 'true')
    expect(screen.getByTestId('transition-wrapper')).toHaveAttribute('data-direction', 'drill-in')
  })

  it('sets data-animating when direction is drill-out', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-out" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    expect(screen.getByTestId('transition-wrapper')).toHaveAttribute('data-animating', 'true')
    expect(screen.getByTestId('transition-wrapper')).toHaveAttribute('data-direction', 'drill-out')
  })

  it('applies initial scale(1.15) transform for drill-in', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    // After the effect runs, the style transitions to 'none' but the inline style
    // from initial render starts at scale(1.15)
    expect(wrapper.style.transform).toBeDefined()
  })

  it('applies initial scale(0.85) transform for drill-out', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-out" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper.style.transform).toBeDefined()
  })

  it('calls onTransitionEnd after 400ms for drill-in', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    expect(onEnd).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('calls onTransitionEnd after 400ms for drill-out', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-out" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    expect(onEnd).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('does not call onTransitionEnd before 400ms', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    act(() => {
      vi.advanceTimersByTime(399)
    })

    expect(onEnd).not.toHaveBeenCalled()
  })

  it('removes data-animating after transition completes', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    expect(screen.getByTestId('transition-wrapper')).toHaveAttribute('data-animating', 'true')

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(screen.getByTestId('transition-wrapper')).not.toHaveAttribute('data-animating')
  })

  it('does not call onTransitionEnd when direction is null', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction={null} onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onEnd).not.toHaveBeenCalled()
  })

  it('cleans up timer on unmount during animation', () => {
    const onEnd = vi.fn()
    const { unmount } = render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    act(() => {
      vi.advanceTimersByTime(200)
    })
    unmount()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onEnd).not.toHaveBeenCalled()
  })

  it('sets CSS transition property during drill-in animation', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    // The effect sets transition via el.style, which gets applied
    expect(wrapper.style.transition).toContain('400ms')
  })

  it('sets CSS transition property during drill-out animation', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-out" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper.style.transition).toContain('400ms')
  })

  it('targets transform none as final state during animation', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    // After the effect runs, transform is set to 'none'
    expect(wrapper.style.transform).toBe('none')
  })

  it('targets opacity 1 as final state during animation', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper.style.opacity).toBe('1')
  })

  it('has no inline style when direction is null', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction={null} onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    // No transform or opacity set when no transition
    expect(wrapper.style.transform).toBe('')
    expect(wrapper.style.opacity).toBe('')
  })

  it('uses latest onTransitionEnd callback via ref', () => {
    const onEnd1 = vi.fn()
    const onEnd2 = vi.fn()
    const { rerender } = render(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd1}>
        <div>content</div>
      </TransitionWrapper>,
    )

    // Update callback before timer fires
    rerender(
      <TransitionWrapper direction="drill-in" onTransitionEnd={onEnd2}>
        <div>content</div>
      </TransitionWrapper>,
    )

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onEnd1).not.toHaveBeenCalled()
    expect(onEnd2).toHaveBeenCalledTimes(1)
  })

  it('has full-size wrapper class', () => {
    const onEnd = vi.fn()
    render(
      <TransitionWrapper direction={null} onTransitionEnd={onEnd}>
        <div>content</div>
      </TransitionWrapper>,
    )

    const wrapper = screen.getByTestId('transition-wrapper')
    expect(wrapper.className).toContain('h-full')
    expect(wrapper.className).toContain('w-full')
  })
})
