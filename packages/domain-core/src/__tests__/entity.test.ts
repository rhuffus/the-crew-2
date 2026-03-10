import { describe, it, expect } from 'vitest'
import { Entity } from '../entity.js'

class TestEntity extends Entity<string> {
  constructor(
    id: string,
    public readonly name: string,
  ) {
    super(id)
  }
}

describe('Entity', () => {
  it('should create an entity with an id', () => {
    const entity = new TestEntity('1', 'Test')
    expect(entity.id).toBe('1')
    expect(entity.name).toBe('Test')
  })

  it('should be equal to another entity with the same id', () => {
    const entity1 = new TestEntity('1', 'Test')
    const entity2 = new TestEntity('1', 'Different')
    expect(entity1.equals(entity2)).toBe(true)
  })

  it('should not be equal to an entity with a different id', () => {
    const entity1 = new TestEntity('1', 'Test')
    const entity2 = new TestEntity('2', 'Test')
    expect(entity1.equals(entity2)).toBe(false)
  })

  it('should not be equal to null or undefined', () => {
    const entity = new TestEntity('1', 'Test')
    expect(entity.equals(null as unknown as TestEntity)).toBe(false)
    expect(entity.equals(undefined as unknown as TestEntity)).toBe(false)
  })

  it('should be equal to itself', () => {
    const entity = new TestEntity('1', 'Test')
    expect(entity.equals(entity)).toBe(true)
  })
})
