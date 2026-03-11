import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveNodePositions,
  loadNodePositions,
  clearNodePositions,
  applyPersistedPositions,
  updatePosition,
  type LayoutPositions,
} from '@/lib/layout-persistence'
import type { Node } from '@xyflow/react'

// In-memory localStorage stub for test isolation
const storageMap = new Map<string, string>()
const localStorageStub = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => { storageMap.set(key, value) },
  removeItem: (key: string) => { storageMap.delete(key) },
  clear: () => { storageMap.clear() },
  get length() { return storageMap.size },
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
}
vi.stubGlobal('localStorage', localStorageStub)

describe('layout-persistence', () => {
  beforeEach(() => {
    storageMap.clear()
  })

  describe('saveNodePositions / loadNodePositions', () => {
    it('saves and loads positions for a scope', () => {
      const positions: LayoutPositions = {
        'node-1': { x: 100, y: 200 },
        'node-2': { x: 300, y: 400 },
      }
      saveNodePositions('proj-1', 'org', positions)
      const loaded = loadNodePositions('proj-1', 'org')
      expect(loaded).toEqual(positions)
    })

    it('returns null when no positions saved', () => {
      expect(loadNodePositions('proj-1', 'org')).toBeNull()
    })

    it('scopes positions by project and scope', () => {
      saveNodePositions('proj-1', 'org', { a: { x: 1, y: 2 } })
      saveNodePositions('proj-2', 'org', { b: { x: 3, y: 4 } })
      saveNodePositions('proj-1', 'department:d1', { c: { x: 5, y: 6 } })

      expect(loadNodePositions('proj-1', 'org')).toEqual({ a: { x: 1, y: 2 } })
      expect(loadNodePositions('proj-2', 'org')).toEqual({ b: { x: 3, y: 4 } })
      expect(loadNodePositions('proj-1', 'department:d1')).toEqual({ c: { x: 5, y: 6 } })
    })

    it('silently ignores errors on save', () => {
      const original = localStorageStub.setItem
      localStorageStub.setItem = () => { throw new Error('quota exceeded') }
      expect(() => saveNodePositions('proj-1', 'org', { a: { x: 1, y: 2 } })).not.toThrow()
      localStorageStub.setItem = original
    })

    it('returns null on corrupted data', () => {
      localStorage.setItem('the-crew:layout:proj-1:org', 'not valid json{')
      expect(loadNodePositions('proj-1', 'org')).toBeNull()
    })
  })

  describe('clearNodePositions', () => {
    it('removes saved positions for a scope', () => {
      saveNodePositions('proj-1', 'org', { a: { x: 1, y: 2 } })
      clearNodePositions('proj-1', 'org')
      expect(loadNodePositions('proj-1', 'org')).toBeNull()
    })

    it('does not affect other scopes', () => {
      saveNodePositions('proj-1', 'org', { a: { x: 1, y: 2 } })
      saveNodePositions('proj-1', 'department:d1', { b: { x: 3, y: 4 } })
      clearNodePositions('proj-1', 'org')
      expect(loadNodePositions('proj-1', 'org')).toBeNull()
      expect(loadNodePositions('proj-1', 'department:d1')).toEqual({ b: { x: 3, y: 4 } })
    })
  })

  describe('applyPersistedPositions', () => {
    const makeNode = (id: string, x: number, y: number): Node => ({
      id,
      position: { x, y },
      data: { label: id },
    })

    it('overrides positions for nodes with saved positions', () => {
      const nodes = [
        makeNode('a', 0, 0),
        makeNode('b', 100, 100),
      ]
      const positions: LayoutPositions = {
        a: { x: 500, y: 600 },
      }
      const result = applyPersistedPositions(nodes, positions)
      expect(result[0]!.position).toEqual({ x: 500, y: 600 })
      expect(result[1]!.position).toEqual({ x: 100, y: 100 })
    })

    it('returns original nodes when positions map is empty', () => {
      const nodes = [makeNode('a', 0, 0)]
      const result = applyPersistedPositions(nodes, {})
      expect(result).toBe(nodes)
    })

    it('does not mutate original nodes', () => {
      const original = makeNode('a', 0, 0)
      const nodes = [original]
      const result = applyPersistedPositions(nodes, { a: { x: 10, y: 20 } })
      expect(original.position).toEqual({ x: 0, y: 0 })
      expect(result[0]!.position).toEqual({ x: 10, y: 20 })
    })

    it('handles nodes not in positions map', () => {
      const nodes = [makeNode('a', 0, 0), makeNode('b', 1, 1)]
      const result = applyPersistedPositions(nodes, { c: { x: 99, y: 99 } })
      expect(result[0]!.position).toEqual({ x: 0, y: 0 })
      expect(result[1]!.position).toEqual({ x: 1, y: 1 })
    })
  })

  describe('updatePosition', () => {
    it('adds a new position', () => {
      const result = updatePosition({}, 'a', { x: 10, y: 20 })
      expect(result).toEqual({ a: { x: 10, y: 20 } })
    })

    it('updates an existing position', () => {
      const existing: LayoutPositions = { a: { x: 1, y: 2 } }
      const result = updatePosition(existing, 'a', { x: 10, y: 20 })
      expect(result).toEqual({ a: { x: 10, y: 20 } })
    })

    it('does not mutate the original map', () => {
      const original: LayoutPositions = { a: { x: 1, y: 2 } }
      const result = updatePosition(original, 'a', { x: 10, y: 20 })
      expect(original.a).toEqual({ x: 1, y: 2 })
      expect(result.a).toEqual({ x: 10, y: 20 })
    })

    it('preserves other entries', () => {
      const existing: LayoutPositions = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } }
      const result = updatePosition(existing, 'a', { x: 10, y: 20 })
      expect(result.b).toEqual({ x: 3, y: 4 })
    })
  })
})
