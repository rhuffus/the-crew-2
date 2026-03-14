import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaAgentArchetypeRepository } from './prisma-agent-archetype.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { AgentArchetype } from '../domain/agent-archetype'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'agentArchetype', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { agentArchetype: MockDelegate }
}

const sampleRow = {
  id: 'arch-1',
  projectId: 'proj-1',
  name: 'Designer',
  description: 'A designer archetype',
  roleId: 'role-1',
  departmentId: 'dept-1',
  skillIds: ['skill-1', 'skill-2'],
  constraints: { maxConcurrency: 3, allowedDepartmentIds: ['dept-1'] },
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaAgentArchetypeRepository', () => {
  let repo: PrismaAgentArchetypeRepository
  let prisma: CompanyDesignPrismaService & { agentArchetype: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaAgentArchetypeRepository(prisma)
  })

  describe('findById', () => {
    it('should return an AgentArchetype when found', async () => {
      prisma.agentArchetype.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('arch-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('arch-1')
      expect(result!.name).toBe('Designer')
      expect(result!.skillIds).toEqual(['skill-1', 'skill-2'])
      expect(prisma.agentArchetype.findUnique).toHaveBeenCalledWith({ where: { id: 'arch-1' } })
    })

    it('should return null when not found', async () => {
      prisma.agentArchetype.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all archetypes for project', async () => {
      prisma.agentArchetype.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Designer')
    })

    it('should return empty array when none', async () => {
      prisma.agentArchetype.findMany.mockResolvedValue([])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the archetype', async () => {
      prisma.agentArchetype.upsert.mockResolvedValue(sampleRow)
      const archetype = AgentArchetype.create({
        id: 'arch-1',
        projectId: 'proj-1',
        name: 'Designer',
        description: 'A designer archetype',
        roleId: 'role-1',
        departmentId: 'dept-1',
        skillIds: ['skill-1'],
      })
      await repo.save(archetype)
      expect(prisma.agentArchetype.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'arch-1' },
          create: expect.objectContaining({ id: 'arch-1', name: 'Designer' }),
          update: expect.objectContaining({ name: 'Designer' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.agentArchetype.delete.mockResolvedValue(sampleRow)
      await repo.delete('arch-1')
      expect(prisma.agentArchetype.delete).toHaveBeenCalledWith({ where: { id: 'arch-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should reconstitute with correct constraints', async () => {
      prisma.agentArchetype.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('arch-1')
      expect(result!.constraints).toEqual({ maxConcurrency: 3, allowedDepartmentIds: ['dept-1'] })
      expect(result!.departmentId).toBe('dept-1')
      expect(result!.roleId).toBe('role-1')
    })
  })
})
