import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFocusTrap } from '@/hooks/use-focus-trap'

function createContainer() {
  const container = document.createElement('div')
  container.innerHTML = `
    <button id="btn1">First</button>
    <input id="input1" type="text" />
    <button id="btn2">Second</button>
    <button id="btn3" disabled>Disabled</button>
    <a id="link1" href="#">Link</a>
  `
  document.body.appendChild(container)
  return container
}

describe('useFocusTrap', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = createContainer() as HTMLDivElement
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should auto-focus the first focusable element when active', async () => {
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, true))
    // useFocusTrap uses setTimeout(0), so we need to flush
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(container.querySelector('#btn1'))
    })
  })

  it('should not auto-focus when autoFocus is false', async () => {
    const ref = { current: container }
    const previouslyFocused = document.body
    document.body.focus()
    renderHook(() => useFocusTrap(ref, true, { autoFocus: false }))
    // Give the timeout a chance to fire (it shouldn't change focus)
    await new Promise((r) => setTimeout(r, 20))
    expect(document.activeElement).toBe(previouslyFocused)
  })

  it('should not focus anything when not active', async () => {
    const ref = { current: container }
    document.body.focus()
    renderHook(() => useFocusTrap(ref, false))
    await new Promise((r) => setTimeout(r, 20))
    expect(document.activeElement).toBe(document.body)
  })

  it('should trap Tab forward: wrap from last to first', async () => {
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, true))

    const link = container.querySelector<HTMLElement>('#link1')!
    link.focus()
    expect(document.activeElement).toBe(link)

    // Simulate Tab on last focusable
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const prevented = vi.spyOn(event, 'preventDefault')
    link.dispatchEvent(event)

    expect(prevented).toHaveBeenCalled()
    expect(document.activeElement).toBe(container.querySelector('#btn1'))
  })

  it('should trap Shift+Tab backward: wrap from first to last', async () => {
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, true))

    const btn1 = container.querySelector<HTMLElement>('#btn1')!
    btn1.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    const prevented = vi.spyOn(event, 'preventDefault')
    btn1.dispatchEvent(event)

    expect(prevented).toHaveBeenCalled()
    expect(document.activeElement).toBe(container.querySelector('#link1'))
  })

  it('should not prevent Tab when focus is in the middle', () => {
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, true))

    const input = container.querySelector<HTMLElement>('#input1')!
    input.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const prevented = vi.spyOn(event, 'preventDefault')
    input.dispatchEvent(event)

    expect(prevented).not.toHaveBeenCalled()
  })

  it('should skip disabled buttons', async () => {
    const ref = { current: container }
    renderHook(() => useFocusTrap(ref, true))

    // btn3 is disabled, so the focusable list excludes it
    // Last focusable is link1, second-to-last is btn2
    const btn2 = container.querySelector<HTMLElement>('#btn2')!
    btn2.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const prevented = vi.spyOn(event, 'preventDefault')
    btn2.dispatchEvent(event)

    // btn2 is not the last focusable (link1 is), so Tab should not be prevented
    expect(prevented).not.toHaveBeenCalled()
  })

  it('should return focus on deactivate', () => {
    const outsideButton = document.createElement('button')
    outsideButton.id = 'outside'
    document.body.appendChild(outsideButton)
    outsideButton.focus()
    expect(document.activeElement).toBe(outsideButton)

    const ref = { current: container }
    const { unmount } = renderHook(() => useFocusTrap(ref, true))
    unmount()

    expect(document.activeElement).toBe(outsideButton)
    document.body.removeChild(outsideButton)
  })
})
