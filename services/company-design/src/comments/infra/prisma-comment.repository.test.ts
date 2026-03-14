import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaCommentRepository } from './prisma-comment.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'comment', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { comment: MockDelegate }
}

const sampleRow = {
  id: 'comment-1',
  projectId: 'proj-1',
  targetType: 'department',
  targetId: 'dept-1',
  scopeType: 'project',
  authorId: 'user-1',
  authorName: 'John',
  content: 'Looks good',
  resolved: false,
  parentId: null,
  replyCount: 0,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaCommentRepository', () => {
  let repo: PrismaCommentRepository
  let prisma: CompanyDesignPrismaService & { comment: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaCommentRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Comment when found', async () => {
      prisma.comment.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('comment-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('comment-1')
      expect(result!.content).toBe('Looks good')
    })

    it('should return null when not found', async () => {
      prisma.comment.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('listByProject', () => {
    it('should return all comments for project', async () => {
      prisma.comment.findMany.mockResolvedValue([sampleRow])
      const result = await repo.listByProject('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('listByTarget', () => {
    it('should filter by target with targetId', async () => {
      prisma.comment.findMany.mockResolvedValue([sampleRow])
      const result = await repo.listByTarget('proj-1', 'department', 'dept-1')
      expect(result).toHaveLength(1)
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', targetType: 'department', targetId: 'dept-1' },
      })
    })

    it('should handle null targetId', async () => {
      prisma.comment.findMany.mockResolvedValue([])
      await repo.listByTarget('proj-1', 'project', null)
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', targetType: 'project', targetId: null },
      })
    })
  })

  describe('listByEntity', () => {
    it('should find comments by entity', async () => {
      prisma.comment.findMany.mockResolvedValue([sampleRow])
      const result = await repo.listByEntity('proj-1', 'dept-1')
      expect(result).toHaveLength(1)
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', targetId: 'dept-1' },
      })
    })
  })

  describe('save', () => {
    it('should upsert the comment', async () => {
      prisma.comment.upsert.mockResolvedValue(sampleRow)
      const comment = (await import('../domain/comment')).Comment.create(
        'proj-1',
        'department' as any,
        'dept-1',
        'project' as any,
        'user-1',
        'John',
        'Looks good',
      )
      await repo.save(comment)
      expect(prisma.comment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: comment.id },
          create: expect.objectContaining({ content: 'Looks good' }),
          update: expect.objectContaining({ content: 'Looks good' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.comment.delete.mockResolvedValue(sampleRow)
      await repo.delete('comment-1')
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should handle resolved comment with parent', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        ...sampleRow,
        resolved: true,
        parentId: 'parent-1',
        replyCount: 3,
      })
      const result = await repo.findById('comment-1')
      expect(result!.resolved).toBe(true)
      expect(result!.parentId).toBe('parent-1')
      expect(result!.replyCount).toBe(3)
    })
  })
})
