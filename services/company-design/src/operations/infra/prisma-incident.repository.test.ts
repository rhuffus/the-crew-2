import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaIncidentRepository } from './prisma-incident.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Incident } from '../domain/incident'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'incident', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { incident: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'inc-1',
  projectId: 'proj-1',
  entityType: 'department',
  entityId: 'dept-1',
  severity: 'critical',
  status: 'open',
  title: 'Server down',
  description: 'Service unavailable',
  reportedAt: now,
  resolvedAt: null,
  createdAt: now,
  updatedAt: now,
}

describe('PrismaIncidentRepository', () => {
  let repo: PrismaIncidentRepository
  let prisma: CompanyDesignPrismaService & { incident: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaIncidentRepository(prisma)
  })

  it('findById returns domain entity when found', async () => {
    prisma.incident.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('inc-1')
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Server down')
  })

  it('findById returns null when not found', async () => {
    prisma.incident.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('listByProject returns array', async () => {
    prisma.incident.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByProject('proj-1')
    expect(results).toHaveLength(1)
  })

  it('listByEntity filters by projectId and entityId', async () => {
    prisma.incident.findMany.mockResolvedValue([])
    await repo.listByEntity('proj-1', 'dept-1')
    expect(prisma.incident.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', entityId: 'dept-1' },
    })
  })

  it('save upserts the incident', async () => {
    prisma.incident.upsert.mockResolvedValue(sampleRow)
    const incident = Incident.reconstitute({
      ...sampleRow,
      entityType: 'department' as const,
      severity: 'critical' as const,
      status: 'open' as const,
    })
    await repo.save(incident)
    expect(prisma.incident.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inc-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.incident.delete.mockResolvedValue(sampleRow)
    await repo.delete('inc-1')
    expect(prisma.incident.delete).toHaveBeenCalledWith({ where: { id: 'inc-1' } })
  })
})
