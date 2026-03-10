import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuditController } from './audit.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listAudits: vi.fn(),
}

describe('AuditController (gateway)', () => {
  let controller: AuditController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new AuditController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list audit entries for a project', async () => {
    const entries = [
      {
        id: 'a1',
        projectId: 'p1',
        entityType: 'department',
        entityId: 'd1',
        entityName: 'Engineering',
        action: 'created',
        changes: null,
        timestamp: '2026-03-08T10:00:00.000Z',
      },
    ]
    mockClient.listAudits.mockResolvedValue(entries)

    const response = await controller.list('p1')

    expect(response).toEqual(entries)
    expect(mockClient.listAudits).toHaveBeenCalledWith('p1', undefined, undefined)
  })

  it('should pass entityType filter', async () => {
    mockClient.listAudits.mockResolvedValue([])

    await controller.list('p1', 'department')

    expect(mockClient.listAudits).toHaveBeenCalledWith('p1', 'department', undefined)
  })

  it('should pass entityType and entityId filters', async () => {
    const entries = [
      {
        id: 'a2',
        projectId: 'p1',
        entityType: 'capability',
        entityId: 'c1',
        entityName: 'API Design',
        action: 'updated',
        changes: { name: 'API Design v2' },
        timestamp: '2026-03-08T11:00:00.000Z',
      },
    ]
    mockClient.listAudits.mockResolvedValue(entries)

    const response = await controller.list('p1', 'capability', 'c1')

    expect(response).toEqual(entries)
    expect(mockClient.listAudits).toHaveBeenCalledWith('p1', 'capability', 'c1')
  })

  it('should return empty array when no audit entries', async () => {
    mockClient.listAudits.mockResolvedValue([])

    const response = await controller.list('p1')

    expect(response).toEqual([])
  })

  it('should return entries with all action types', async () => {
    const entries = [
      { id: 'a1', projectId: 'p1', entityType: 'release', entityId: 'r1', entityName: 'v1.0', action: 'published', changes: null, timestamp: '2026-03-08T12:00:00.000Z' },
      { id: 'a2', projectId: 'p1', entityType: 'department', entityId: 'd1', entityName: 'Eng', action: 'deleted', changes: null, timestamp: '2026-03-08T11:00:00.000Z' },
      { id: 'a3', projectId: 'p1', entityType: 'capability', entityId: 'c1', entityName: 'API', action: 'created', changes: null, timestamp: '2026-03-08T10:00:00.000Z' },
    ]
    mockClient.listAudits.mockResolvedValue(entries)

    const response = await controller.list('p1')

    expect(response).toHaveLength(3)
    expect(response.map((e: { action: string }) => e.action)).toEqual(['published', 'deleted', 'created'])
  })
})
