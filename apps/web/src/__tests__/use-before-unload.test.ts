import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBeforeUnload } from '@/hooks/use-before-unload'

describe('useBeforeUnload', () => {
  const addSpy = vi.spyOn(window, 'addEventListener')
  const removeSpy = vi.spyOn(window, 'removeEventListener')

  afterEach(() => {
    addSpy.mockClear()
    removeSpy.mockClear()
  })

  it('does not register listener when shouldWarn is false', () => {
    renderHook(() => useBeforeUnload(false))
    const beforeunloadCalls = addSpy.mock.calls.filter(([type]) => type === 'beforeunload')
    expect(beforeunloadCalls.length).toBe(0)
  })

  it('registers beforeunload listener when shouldWarn is true', () => {
    renderHook(() => useBeforeUnload(true))
    const beforeunloadCalls = addSpy.mock.calls.filter(([type]) => type === 'beforeunload')
    expect(beforeunloadCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('removes listener on unmount', () => {
    const { unmount } = renderHook(() => useBeforeUnload(true))
    unmount()
    const removeCalls = removeSpy.mock.calls.filter(([type]) => type === 'beforeunload')
    expect(removeCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('calls preventDefault on beforeunload event', () => {
    renderHook(() => useBeforeUnload(true))
    const handler = addSpy.mock.calls.find(([type]) => type === 'beforeunload')?.[1] as EventListener
    const event = new Event('beforeunload', { cancelable: true })
    const preventSpy = vi.spyOn(event, 'preventDefault')
    handler(event)
    expect(preventSpy).toHaveBeenCalled()
  })

  it('cleans up when shouldWarn toggles to false', () => {
    const { rerender } = renderHook(({ warn }) => useBeforeUnload(warn), {
      initialProps: { warn: true },
    })

    const addCount = addSpy.mock.calls.filter(([type]) => type === 'beforeunload').length
    expect(addCount).toBeGreaterThanOrEqual(1)

    rerender({ warn: false })
    const removeCount = removeSpy.mock.calls.filter(([type]) => type === 'beforeunload').length
    expect(removeCount).toBeGreaterThanOrEqual(1)
  })
})
