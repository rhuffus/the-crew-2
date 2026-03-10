import { describe, it, expect } from 'vitest'
import { AuditEntry } from './audit-entry'

const baseProps = {
  id: 'a1',
  projectId: 'p1',
  entityType: 'department',
  entityId: 'd1',
  entityName: 'Engineering',
  action: 'created' as const,
  changes: null,
  timestamp: new Date('2025-01-01'),
}

describe('AuditEntry', () => {
  it('should create an audit entry', () => {
    const entry = AuditEntry.create(baseProps)
    expect(entry.id).toBe('a1')
    expect(entry.projectId).toBe('p1')
    expect(entry.entityType).toBe('department')
    expect(entry.entityId).toBe('d1')
    expect(entry.entityName).toBe('Engineering')
    expect(entry.action).toBe('created')
    expect(entry.changes).toBeNull()
    expect(entry.timestamp).toEqual(new Date('2025-01-01'))
  })

  it('should create with changes', () => {
    const entry = AuditEntry.create({
      ...baseProps,
      action: 'updated',
      changes: { name: { before: 'Eng', after: 'Engineering' } },
    })
    expect(entry.action).toBe('updated')
    expect(entry.changes).toEqual({ name: { before: 'Eng', after: 'Engineering' } })
  })

  it('should return defensive copy of changes', () => {
    const changes = { name: { before: 'A', after: 'B' } }
    const entry = AuditEntry.create({ ...baseProps, changes })
    const copy = entry.changes!
    copy['extra'] = 'x'
    expect(entry.changes).not.toHaveProperty('extra')
  })

  it('should throw if entity type is empty', () => {
    expect(() => AuditEntry.create({ ...baseProps, entityType: '  ' })).toThrow('Entity type cannot be empty')
  })

  it('should throw if entity id is empty', () => {
    expect(() => AuditEntry.create({ ...baseProps, entityId: '  ' })).toThrow('Entity id cannot be empty')
  })

  it('should throw if entity name is empty', () => {
    expect(() => AuditEntry.create({ ...baseProps, entityName: '  ' })).toThrow('Entity name cannot be empty')
  })

  it('should trim entity type, id and name', () => {
    const entry = AuditEntry.create({
      ...baseProps,
      entityType: '  department  ',
      entityId: '  d1  ',
      entityName: '  Engineering  ',
    })
    expect(entry.entityType).toBe('department')
    expect(entry.entityId).toBe('d1')
    expect(entry.entityName).toBe('Engineering')
  })

  it('should reconstitute from persistence', () => {
    const entry = AuditEntry.reconstitute('a1', {
      projectId: 'p1',
      entityType: 'capability',
      entityId: 'c1',
      entityName: 'API Design',
      action: 'deleted',
      changes: null,
      timestamp: new Date('2025-06-01'),
    })
    expect(entry.id).toBe('a1')
    expect(entry.entityType).toBe('capability')
    expect(entry.action).toBe('deleted')
  })

  it('should support equality by id', () => {
    const a = AuditEntry.create(baseProps)
    const b = AuditEntry.create(baseProps)
    expect(a.equals(b)).toBe(true)
  })

  it('should support all audit actions', () => {
    for (const action of ['created', 'updated', 'deleted', 'published'] as const) {
      const entry = AuditEntry.create({ ...baseProps, action })
      expect(entry.action).toBe(action)
    }
  })
})
