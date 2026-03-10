import { describe, it, expect, beforeEach } from 'vitest'
import { AuditController } from './audit.controller'
import { AuditService } from './application/audit.service'
import { InMemoryAuditRepository } from './infra/in-memory-audit.repository'

describe('AuditController', () => {
  let controller: AuditController
  let service: AuditService

  beforeEach(() => {
    const repo = new InMemoryAuditRepository()
    service = new AuditService(repo)
    controller = new AuditController(service)
  })

  it('should list empty audit log', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should list audit entries for a project', async () => {
    await service.record({ projectId: 'p1', entityType: 'department', entityId: 'd1', entityName: 'Eng', action: 'created' })
    await service.record({ projectId: 'p1', entityType: 'capability', entityId: 'c1', entityName: 'API', action: 'created' })
    const result = await controller.list('p1')
    expect(result).toHaveLength(2)
  })

  it('should filter by entity type and id', async () => {
    await service.record({ projectId: 'p1', entityType: 'department', entityId: 'd1', entityName: 'Eng', action: 'created' })
    await service.record({ projectId: 'p1', entityType: 'department', entityId: 'd1', entityName: 'Eng', action: 'updated' })
    await service.record({ projectId: 'p1', entityType: 'capability', entityId: 'c1', entityName: 'API', action: 'created' })
    const result = await controller.list('p1', 'department', 'd1')
    expect(result).toHaveLength(2)
    expect(result.every((e: { entityType: string }) => e.entityType === 'department')).toBe(true)
  })

  it('should return all entries when no filter provided', async () => {
    await service.record({ projectId: 'p1', entityType: 'department', entityId: 'd1', entityName: 'Eng', action: 'created' })
    const result = await controller.list('p1', undefined, undefined)
    expect(result).toHaveLength(1)
  })

  it('should not filter when only entityType is provided', async () => {
    await service.record({ projectId: 'p1', entityType: 'department', entityId: 'd1', entityName: 'Eng', action: 'created' })
    await service.record({ projectId: 'p1', entityType: 'capability', entityId: 'c1', entityName: 'API', action: 'created' })
    const result = await controller.list('p1', 'department', undefined)
    expect(result).toHaveLength(2)
  })
})
