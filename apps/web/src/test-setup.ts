import '@testing-library/jest-dom/vitest'

// React Flow requires ResizeObserver in tests
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// React Flow reads from getBoundingClientRect
if (typeof Element.prototype.getBoundingClientRect === 'undefined') {
  Element.prototype.getBoundingClientRect = () => ({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => '',
  })
}
