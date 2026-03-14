import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient, Prisma: { JsonNull: 'DbNull' } }
})

import { PrismaReleaseRepository } from './prisma-release.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Release } from '../domain/release'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'release', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { release: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'rel-1',
  projectId: 'proj-1',
  version: '1.0.0',
  status: 'draft',
  notes: 'Initial release',
  snapshot: null,
  validationIssues: [],
  createdAt: now,
  updatedAt: now,
  publishedAt: null,
}

describe('PrismaReleaseRepository', () => {
  let repo: PrismaReleaseRepository
  let prisma: CompanyDesignPrismaService & { release: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaReleaseRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.release.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('rel-1')
    expect(result).not.toBeNull()
    expect(result!.version).toBe('1.0.0')
  })

  it('findById returns null when not found', async () => {
    prisma.release.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('findByProjectId returns array', async () => {
    prisma.release.findMany.mockResolvedValue([sampleRow])
    const results = await repo.findByProjectId('proj-1')
    expect(results).toHaveLength(1)
  })

  it('save upserts the release', async () => {
    prisma.release.upsert.mockResolvedValue(sampleRow)
    const release = Release.reconstitute('rel-1', {
      ...sampleRow,
      status: 'draft' as const,
      validationIssues: [],
    })
    await repo.save(release)
    expect(prisma.release.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rel-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.release.delete.mockResolvedValue(sampleRow)
    await repo.delete('rel-1')
    expect(prisma.release.delete).toHaveBeenCalledWith({ where: { id: 'rel-1' } })
  })
})
