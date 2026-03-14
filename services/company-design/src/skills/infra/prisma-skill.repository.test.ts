import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaSkillRepository } from './prisma-skill.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Skill } from '../domain/skill'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'skill', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { skill: MockDelegate }
}

const sampleRow = {
  id: 'skill-1',
  projectId: 'proj-1',
  name: 'TypeScript',
  description: 'TS programming',
  category: 'programming',
  tags: ['backend', 'frontend'],
  compatibleRoleIds: ['role-1'],
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaSkillRepository', () => {
  let repo: PrismaSkillRepository
  let prisma: CompanyDesignPrismaService & { skill: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaSkillRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Skill when found', async () => {
      prisma.skill.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('skill-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('skill-1')
      expect(result!.name).toBe('TypeScript')
      expect(result!.tags).toEqual(['backend', 'frontend'])
      expect(result!.compatibleRoleIds).toEqual(['role-1'])
    })

    it('should return null when not found', async () => {
      prisma.skill.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all skills for project', async () => {
      prisma.skill.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the skill', async () => {
      prisma.skill.upsert.mockResolvedValue(sampleRow)

      const skill = Skill.create({
        id: 'skill-1',
        projectId: 'proj-1',
        name: 'TypeScript',
        description: 'TS programming',
        category: 'programming',
        tags: ['backend', 'frontend'],
        compatibleRoleIds: ['role-1'],
      })
      await repo.save(skill)

      expect(prisma.skill.upsert).toHaveBeenCalledWith({
        where: { id: 'skill-1' },
        create: expect.objectContaining({ id: 'skill-1', name: 'TypeScript' }),
        update: expect.objectContaining({ name: 'TypeScript' }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.skill.delete.mockResolvedValue(sampleRow)
      await repo.delete('skill-1')
      expect(prisma.skill.delete).toHaveBeenCalledWith({
        where: { id: 'skill-1' },
      })
    })
  })
})
