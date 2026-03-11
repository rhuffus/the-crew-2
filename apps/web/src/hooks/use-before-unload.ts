import { useEffect } from 'react'

/**
 * Registers a `beforeunload` event listener that warns the user
 * when they try to close/reload the page while `shouldWarn` is true.
 */
export function useBeforeUnload(shouldWarn: boolean): void {
  useEffect(() => {
    if (!shouldWarn) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [shouldWarn])
}
