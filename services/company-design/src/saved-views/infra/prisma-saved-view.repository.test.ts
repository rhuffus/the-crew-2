import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaSavedViewRepository } from './prisma-saved-view.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { SavedView } from '../domain/saved-view'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'savedView', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { savedView: MockDelegate }
}

const sampleRow = {
  id: 'view-1',
  projectId: 'proj-1',
  name: 'Default View',
  state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaSavedViewRepository', () => {
  let repo: PrismaSavedViewRepository
  let prisma: CompanyDesignPrismaService & { savedView: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaSavedViewRepository(prisma)
  })

  describe('findById', () => {
    it('should return a SavedView when found', async () => {
      prisma.savedView.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('view-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('view-1')
      expect(result!.name).toBe('Default View')
    })

    it('should return null when not found', async () => {
      prisma.savedView.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all views for project', async () => {
      prisma.savedView.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Default View')
    })

    it('should return empty array when none', async () => {
      prisma.savedView.findMany.mockResolvedValue([])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the view', async () => {
      prisma.savedView.upsert.mockResolvedValue(sampleRow)
      const view = SavedView.create({
        id: 'view-1',
        projectId: 'proj-1',
        name: 'Default View',
        state: { activeLayers: ['organization'] as any[], nodeTypeFilter: null, statusFilter: null },
      })
      await repo.save(view)
      expect(prisma.savedView.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'view-1' },
          create: expect.objectContaining({ id: 'view-1', name: 'Default View' }),
          update: expect.objectContaining({ name: 'Default View' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.savedView.delete.mockResolvedValue(sampleRow)
      await repo.delete('view-1')
      expect(prisma.savedView.delete).toHaveBeenCalledWith({ where: { id: 'view-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should reconstitute state correctly', async () => {
      prisma.savedView.findUnique.mockResolvedValue({
        ...sampleRow,
        state: {
          activeLayers: ['organization', 'work'],
          nodeTypeFilter: ['department'],
          statusFilter: ['active'],
        },
      })
      const result = await repo.findById('view-1')
      expect(result!.state.activeLayers).toEqual(['organization', 'work'])
      expect(result!.state.nodeTypeFilter).toEqual(['department'])
    })
  })
})
