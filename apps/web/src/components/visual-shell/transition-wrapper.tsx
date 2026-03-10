import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface TransitionWrapperProps {
  children: ReactNode
  direction: 'drill-in' | 'drill-out' | null
  onTransitionEnd: () => void
}

const DURATION_MS = 400

/**
 * Initial CSS transforms per direction.
 * drill-in: content starts scaled up (zoomed past target) and settles to normal.
 * drill-out: content starts scaled down (zoomed out too far) and settles to normal.
 */
function getInitialTransform(direction: 'drill-in' | 'drill-out'): string {
  return direction === 'drill-in'
    ? 'scale(1.15)'
    : 'scale(0.85)'
}

export function TransitionWrapper({
  children,
  direction,
  onTransitionEnd,
}: TransitionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = useState(direction !== null)
  const onTransitionEndRef = useRef(onTransitionEnd)
  onTransitionEndRef.current = onTransitionEnd

  // On mount: if direction is set, start in transformed state and animate to normal
  useEffect(() => {
    if (!direction) return

    const el = containerRef.current
    if (!el) return

    // Set initial transform (no transition yet)
    el.style.transform = getInitialTransform(direction)
    el.style.opacity = '0'
    el.style.transition = 'none'

    // Force reflow to apply initial state before transitioning
    void el.offsetHeight

    // Trigger transition to final state
    el.style.transition = `transform ${DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1), opacity ${DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1)`
    el.style.transform = 'none'
    el.style.opacity = '1'

    const timer = setTimeout(() => {
      setAnimating(false)
      onTransitionEndRef.current()
    }, DURATION_MS)

    return () => clearTimeout(timer)
  }, [direction])

  return (
    <div
      ref={containerRef}
      data-testid="transition-wrapper"
      data-animating={animating || undefined}
      data-direction={direction ?? undefined}
      className="h-full w-full"
      style={
        direction
          ? { transform: getInitialTransform(direction), opacity: 0 }
          : undefined
      }
    >
      {children}
    </div>
  )
}
