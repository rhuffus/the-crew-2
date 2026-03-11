import { describe, it, expect } from 'vitest'
import { getAddableEntities } from '@/lib/addable-entities'

describe('getAddableEntities', () => {
  it('should return department and artifact for L1', () => {
    const entities = getAddableEntities('L1')
    expect(entities).toHaveLength(2)
    expect(entities[0]!.nodeType).toBe('department')
    expect(entities[1]!.nodeType).toBe('artifact')
  })

  it('should return 9 entity types for L2', () => {
    const entities = getAddableEntities('L2')
    expect(entities).toHaveLength(9)
    const types = entities.map((e) => e.nodeType)
    expect(types).toContain('role')
    expect(types).toContain('capability')
    expect(types).toContain('workflow')
    expect(types).toContain('contract')
    expect(types).toContain('policy')
    expect(types).toContain('skill')
    expect(types).toContain('agent-archetype')
    expect(types).toContain('agent-assignment')
  })

  it('should return empty array for L3', () => {
    expect(getAddableEntities('L3')).toEqual([])
  })

  it('should return empty array for L4', () => {
    expect(getAddableEntities('L4')).toEqual([])
  })

  it('should include label for each entity', () => {
    const entities = getAddableEntities('L2')
    for (const entity of entities) {
      expect(entity.label).toBeTruthy()
      expect(typeof entity.label).toBe('string')
    }
  })
})
