import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryAuditRepository } from './in-memory-audit.repository'
import { AuditEntry } from '../domain/audit-entry'

function createEntry(overrides: Partial<{ id: string; projectId: string; entityType: string; entityId: string; entityName: string; action: 'created' | 'updated' | 'deleted' | 'published'; timestamp: Date }> = {}): AuditEntry {
  return AuditEntry.create({
    id: overrides.id ?? 'a1',
    projectId: overrides.projectId ?? 'p1',
    entityType: overrides.entityType ?? 'department',
    entityId: overrides.entityId ?? 'd1',
    entityName: overrides.entityName ?? 'Engineering',
    action: overrides.action ?? 'created',
    changes: null,
    timestamp: overrides.timestamp ?? new Date('2025-01-01'),
  })
}

describe('InMemoryAuditRepository', () => {
  let repo: InMemoryAuditRepository

  beforeEach(() => {
    repo = new InMemoryAuditRepository()
  })

  it('should save and find by project', async () => {
    await repo.save(createEntry())
    const results = await repo.findByProjectId('p1')
    expect(results).toHaveLength(1)
    expect(results[0]!.id).toBe('a1')
  })

  it('should return empty for unknown project', async () => {
    expect(await repo.findByProjectId('unknown')).toEqual([])
  })

  it('should filter by project id', async () => {
    await repo.save(createEntry({ id: 'a1', projectId: 'p1' }))
    await repo.save(createEntry({ id: 'a2', projectId: 'p2' }))
    expect(await repo.findByProjectId('p1')).toHaveLength(1)
  })

  it('should find by entity', async () => {
    await repo.save(createEntry({ id: 'a1', entityType: 'department', entityId: 'd1' }))
    await repo.save(createEntry({ id: 'a2', entityType: 'capability', entityId: 'c1' }))
    const results = await repo.findByEntity('p1', 'department', 'd1')
    expect(results).toHaveLength(1)
    expect(results[0]!.entityType).toBe('department')
  })

  it('should return sorted by timestamp descending', async () => {
    await repo.save(createEntry({ id: 'a1', timestamp: new Date('2025-01-01') }))
    await repo.save(createEntry({ id: 'a2', timestamp: new Date('2025-06-01') }))
    await repo.save(createEntry({ id: 'a3', timestamp: new Date('2025-03-01') }))
    const results = await repo.findByProjectId('p1')
    expect(results.map((r) => r.id)).toEqual(['a2', 'a3', 'a1'])
  })

  it('should return empty for entity not found', async () => {
    expect(await repo.findByEntity('p1', 'department', 'unknown')).toEqual([])
  })

  it('should scope findByEntity to project', async () => {
    await repo.save(createEntry({ id: 'a1', projectId: 'p1', entityType: 'department', entityId: 'd1' }))
    await repo.save(createEntry({ id: 'a2', projectId: 'p2', entityType: 'department', entityId: 'd1' }))
    expect(await repo.findByEntity('p1', 'department', 'd1')).toHaveLength(1)
  })
})
