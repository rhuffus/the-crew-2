import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaAuditRepository } from './prisma-audit.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { AuditEntry } from '../domain/audit-entry'

interface MockDelegate {
  create: Mock
  findMany: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'auditEntry', {
    value: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { auditEntry: MockDelegate }
}

const sampleRow = {
  id: 'audit-1',
  projectId: 'proj-1',
  entityType: 'department',
  entityId: 'dept-1',
  entityName: 'Engineering',
  action: 'created',
  changes: { name: 'Engineering' },
  timestamp: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaAuditRepository', () => {
  let repo: PrismaAuditRepository
  let prisma: CompanyDesignPrismaService & { auditEntry: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaAuditRepository(prisma)
  })

  describe('save', () => {
    it('should create an audit entry', async () => {
      prisma.auditEntry.create.mockResolvedValue(sampleRow)
      const entry = AuditEntry.create({
        id: 'audit-1',
        projectId: 'proj-1',
        entityType: 'department',
        entityId: 'dept-1',
        entityName: 'Engineering',
        action: 'created' as any,
        changes: { name: 'Engineering' },
        timestamp: new Date('2026-01-01T00:00:00Z'),
      })
      await repo.save(entry)
      expect(prisma.auditEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'audit-1',
          entityType: 'department',
          action: 'created',
        }),
      })
    })
  })

  describe('findByProjectId', () => {
    it('should return all entries for project', async () => {
      prisma.auditEntry.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.entityType).toBe('department')
    })

    it('should return empty array when none', async () => {
      prisma.auditEntry.findMany.mockResolvedValue([])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('findByEntity', () => {
    it('should find entries by entity', async () => {
      prisma.auditEntry.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByEntity('proj-1', 'department', 'dept-1')
      expect(result).toHaveLength(1)
      expect(prisma.auditEntry.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', entityType: 'department', entityId: 'dept-1' },
      })
    })
  })

  describe('domain mapping', () => {
    it('should handle null changes', async () => {
      prisma.auditEntry.findMany.mockResolvedValue([{ ...sampleRow, changes: null }])
      const result = await repo.findByProjectId('proj-1')
      expect(result[0]!.changes).toBeNull()
    })
  })
})
