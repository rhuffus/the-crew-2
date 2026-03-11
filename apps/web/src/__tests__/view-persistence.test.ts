import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveViewState,
  loadViewState,
  clearViewState,
  type ViewState,
} from '@/lib/view-persistence'

// Simple in-memory localStorage stub for test isolation
const storageMap = new Map<string, string>()
const localStorageStub = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() { return storageMap.size },
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
}
vi.stubGlobal('localStorage', localStorageStub)

describe('view-persistence', () => {
  beforeEach(() => {
    storageMap.clear()
  })

  const defaultState: ViewState = {
    activeLayers: ['organization'],
    nodeTypeFilter: null,
    statusFilter: null,
  }

  describe('saveViewState / loadViewState', () => {
    it('should save and load view state', () => {
      saveViewState('proj1', 'org', defaultState)
      const loaded = loadViewState('proj1', 'org')
      expect(loaded).toEqual(defaultState)
    })

    it('should return null when no state saved', () => {
      expect(loadViewState('proj1', 'org')).toBeNull()
    })

    it('should overwrite existing state', () => {
      saveViewState('proj1', 'org', defaultState)
      const updated: ViewState = {
        activeLayers: ['organization', 'capabilities'],
        nodeTypeFilter: ['department'],
        statusFilter: ['error'],
      }
      saveViewState('proj1', 'org', updated)
      expect(loadViewState('proj1', 'org')).toEqual(updated)
    })

    it('should separate states by project and scope', () => {
      saveViewState('proj1', 'org', defaultState)
      saveViewState('proj2', 'org', {
        ...defaultState,
        activeLayers: ['workflows'],
      })
      const p1 = loadViewState('proj1', 'org')
      const p2 = loadViewState('proj2', 'org')
      expect(p1).not.toBeNull()
      expect(p1!.activeLayers).toEqual(['organization'])
      expect(p2).not.toBeNull()
      expect(p2!.activeLayers).toEqual(['workflows'])
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('the-crew:view:proj1:org', 'not json')
      expect(loadViewState('proj1', 'org')).toBeNull()
    })
  })

  describe('clearViewState', () => {
    it('should remove saved state', () => {
      saveViewState('proj1', 'org', defaultState)
      clearViewState('proj1', 'org')
      expect(loadViewState('proj1', 'org')).toBeNull()
    })
  })

  describe('localStorage errors', () => {
    it('should handle setItem failure gracefully', () => {
      const originalSetItem = localStorageStub.setItem
      localStorageStub.setItem = () => { throw new Error('QuotaExceededError') }
      // Should not throw
      expect(() => saveViewState('p1', 's1', defaultState)).not.toThrow()
      localStorageStub.setItem = originalSetItem
    })
  })
})
