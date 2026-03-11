import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps focus within a container element while active.
 * Tab cycles forward, Shift+Tab cycles backward.
 * Optionally auto-focuses the first focusable element on mount.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { autoFocus = true, returnFocusOnDeactivate = true } = {},
) {
  useEffect(() => {
    if (!active) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const container = containerRef.current
    if (!container) return

    if (autoFocus) {
      // Defer so the DOM has rendered
      const timer = setTimeout(() => {
        const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        first?.focus()
      }, 0)
      return () => {
        clearTimeout(timer)
        if (returnFocusOnDeactivate) previouslyFocused?.focus()
      }
    }

    return () => {
      if (returnFocusOnDeactivate) previouslyFocused?.focus()
    }
  }, [active, containerRef, autoFocus, returnFocusOnDeactivate])

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      if (focusable.length === 0) return

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
  }, [active, containerRef])
}
