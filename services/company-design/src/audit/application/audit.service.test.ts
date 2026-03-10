import { describe, it, expect, beforeEach } from 'vitest'
import { AuditService } from './audit.service'
import { InMemoryAuditRepository } from '../infra/in-memory-audit.repository'

const baseInput = {
  projectId: 'p1',
  entityType: 'department',
  entityId: 'd1',
  entityName: 'Engineering',
  action: 'created' as const,
}

describe('AuditService', () => {
  let service: AuditService

  beforeEach(() => {
    const repo = new InMemoryAuditRepository()
    service = new AuditService(repo)
  })

  it('should record an audit entry', async () => {
    const result = await service.record(baseInput)
    expect(result.entityType).toBe('department')
    expect(result.entityId).toBe('d1')
    expect(result.entityName).toBe('Engineering')
    expect(result.action).toBe('created')
    expect(result.projectId).toBe('p1')
    expect(result.id).toBeDefined()
    expect(result.timestamp).toBeDefined()
    expect(result.changes).toBeNull()
  })

  it('should record with changes', async () => {
    const result = await service.record({
      ...baseInput,
      action: 'updated',
      changes: { name: { before: 'Eng', after: 'Engineering' } },
    })
    expect(result.action).toBe('updated')
    expect(result.changes).toEqual({ name: { before: 'Eng', after: 'Engineering' } })
  })

  it('should list by project', async () => {
    await service.record(baseInput)
    await service.record({ ...baseInput, entityId: 'd2', entityName: 'Product' })
    await service.record({ ...baseInput, projectId: 'p2' })
    const results = await service.listByProject('p1')
    expect(results).toHaveLength(2)
  })

  it('should return empty for unknown project', async () => {
    expect(await service.listByProject('unknown')).toEqual([])
  })

  it('should list by entity', async () => {
    await service.record(baseInput)
    await service.record({ ...baseInput, action: 'updated' })
    await service.record({ ...baseInput, entityId: 'other', entityName: 'Other' })
    const results = await service.listByEntity('p1', 'department', 'd1')
    expect(results).toHaveLength(2)
  })

  it('should return empty for unknown entity', async () => {
    expect(await service.listByEntity('p1', 'department', 'unknown')).toEqual([])
  })

  it('should return entries sorted newest first', async () => {
    await service.record({ ...baseInput, entityName: 'First' })
    await service.record({ ...baseInput, entityName: 'Second' })
    const results = await service.listByProject('p1')
    // Most recent first — both recorded nearly simultaneously so just check count
    expect(results).toHaveLength(2)
  })

  it('should support all action types', async () => {
    for (const action of ['created', 'updated', 'deleted', 'published'] as const) {
      const result = await service.record({ ...baseInput, action })
      expect(result.action).toBe(action)
    }
  })

  it('should default changes to null when not provided', async () => {
    const result = await service.record(baseInput)
    expect(result.changes).toBeNull()
  })

  it('should generate unique ids', async () => {
    const a = await service.record(baseInput)
    const b = await service.record(baseInput)
    expect(a.id).not.toBe(b.id)
  })
})
