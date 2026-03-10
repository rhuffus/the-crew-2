import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveDiffViewState, loadDiffViewState } from '@/lib/view-persistence'
import type { DiffViewState } from '@/lib/view-persistence'

// Mock localStorage for test env
const store: Record<string, string> = {}
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { for (const key in store) delete store[key] }),
  key: vi.fn(() => null),
  length: 0,
}

vi.stubGlobal('localStorage', mockLocalStorage)

describe('View persistence - diff mode', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  const state: DiffViewState = {
    activeLayers: ['organization', 'capabilities'],
    nodeTypeFilter: ['department'],
    statusFilter: null,
    diffFilter: ['added', 'modified'],
  }

  it('should save and load diff view state', () => {
    saveDiffViewState('p1', 'rel-1', 'rel-2', 'L1', state)
    const loaded = loadDiffViewState('p1', 'rel-1', 'rel-2', 'L1')
    expect(loaded).toEqual(state)
  })

  it('should return null for missing diff view state', () => {
    const loaded = loadDiffViewState('p1', 'rel-x', 'rel-y', 'L1')
    expect(loaded).toBeNull()
  })

  it('should isolate diff view state per release pair', () => {
    saveDiffViewState('p1', 'rel-1', 'rel-2', 'L1', state)
    const loaded = loadDiffViewState('p1', 'rel-2', 'rel-3', 'L1')
    expect(loaded).toBeNull()
  })

  it('should isolate diff view state per scope', () => {
    saveDiffViewState('p1', 'rel-1', 'rel-2', 'L1', state)
    const loaded = loadDiffViewState('p1', 'rel-1', 'rel-2', 'L2')
    expect(loaded).toBeNull()
  })

  it('should store diffFilter as part of state', () => {
    const stateWithFilter: DiffViewState = {
      ...state,
      diffFilter: ['removed'],
    }
    saveDiffViewState('p1', 'rel-1', 'rel-2', 'L1', stateWithFilter)
    const loaded = loadDiffViewState('p1', 'rel-1', 'rel-2', 'L1')
    expect(loaded?.diffFilter).toEqual(['removed'])
  })

  it('should store null diffFilter', () => {
    const stateNoFilter: DiffViewState = {
      ...state,
      diffFilter: null,
    }
    saveDiffViewState('p1', 'rel-1', 'rel-2', 'L1', stateNoFilter)
    const loaded = loadDiffViewState('p1', 'rel-1', 'rel-2', 'L1')
    expect(loaded?.diffFilter).toBeNull()
  })
})
