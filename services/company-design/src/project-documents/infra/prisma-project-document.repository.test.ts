import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaProjectDocumentRepository } from './prisma-project-document.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { ProjectDocument } from '../domain/project-document'

interface MockDelegate {
  findUnique: Mock
  findFirst: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'projectDocument', {
    value: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { projectDocument: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'doc-1',
  projectId: 'proj-1',
  slug: 'mission-statement',
  title: 'Mission Statement',
  bodyMarkdown: '# Mission\nWe build things.',
  status: 'draft',
  linkedEntityIds: [],
  lastUpdatedBy: 'system',
  sourceType: 'system',
  createdAt: now,
  updatedAt: now,
}

describe('PrismaProjectDocumentRepository', () => {
  let repo: PrismaProjectDocumentRepository
  let prisma: CompanyDesignPrismaService & { projectDocument: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaProjectDocumentRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.projectDocument.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('doc-1')
    expect(result).not.toBeNull()
    expect(result!.slug).toBe('mission-statement')
  })

  it('findById returns null when not found', async () => {
    prisma.projectDocument.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('findByProjectId returns array', async () => {
    prisma.projectDocument.findMany.mockResolvedValue([sampleRow])
    const results = await repo.findByProjectId('proj-1')
    expect(results).toHaveLength(1)
  })

  it('findBySlug uses findFirst with projectId+slug', async () => {
    prisma.projectDocument.findFirst.mockResolvedValue(sampleRow)
    const result = await repo.findBySlug('proj-1', 'mission-statement')
    expect(result).not.toBeNull()
    expect(prisma.projectDocument.findFirst).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', slug: 'mission-statement' },
    })
  })

  it('save upserts the document', async () => {
    prisma.projectDocument.upsert.mockResolvedValue(sampleRow)
    const doc = ProjectDocument.reconstitute('doc-1', {
      ...sampleRow,
      status: 'draft' as const,
      sourceType: 'system' as const,
    })
    await repo.save(doc)
    expect(prisma.projectDocument.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'doc-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.projectDocument.delete.mockResolvedValue(sampleRow)
    await repo.delete('doc-1')
    expect(prisma.projectDocument.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } })
  })
})
