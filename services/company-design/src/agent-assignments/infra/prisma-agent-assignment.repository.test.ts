import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaAgentAssignmentRepository } from './prisma-agent-assignment.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { AgentAssignment } from '../domain/agent-assignment'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'agentAssignment', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { agentAssignment: MockDelegate }
}

const sampleRow = {
  id: 'assign-1',
  projectId: 'proj-1',
  archetypeId: 'arch-1',
  name: 'Agent Alpha',
  status: 'active',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaAgentAssignmentRepository', () => {
  let repo: PrismaAgentAssignmentRepository
  let prisma: CompanyDesignPrismaService & { agentAssignment: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaAgentAssignmentRepository(prisma)
  })

  describe('findById', () => {
    it('should return an AgentAssignment when found', async () => {
      prisma.agentAssignment.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('assign-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('assign-1')
      expect(result!.name).toBe('Agent Alpha')
      expect(result!.status).toBe('active')
    })

    it('should return null when not found', async () => {
      prisma.agentAssignment.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all assignments for project', async () => {
      prisma.agentAssignment.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.archetypeId).toBe('arch-1')
    })

    it('should return empty array when none', async () => {
      prisma.agentAssignment.findMany.mockResolvedValue([])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the assignment', async () => {
      prisma.agentAssignment.upsert.mockResolvedValue(sampleRow)
      const assignment = AgentAssignment.create({
        id: 'assign-1',
        projectId: 'proj-1',
        archetypeId: 'arch-1',
        name: 'Agent Alpha',
      })
      await repo.save(assignment)
      expect(prisma.agentAssignment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'assign-1' },
          create: expect.objectContaining({ id: 'assign-1', name: 'Agent Alpha' }),
          update: expect.objectContaining({ name: 'Agent Alpha' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.agentAssignment.delete.mockResolvedValue(sampleRow)
      await repo.delete('assign-1')
      expect(prisma.agentAssignment.delete).toHaveBeenCalledWith({ where: { id: 'assign-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should reconstitute with inactive status', async () => {
      prisma.agentAssignment.findUnique.mockResolvedValue({ ...sampleRow, status: 'inactive' })
      const result = await repo.findById('assign-1')
      expect(result!.status).toBe('inactive')
    })
  })
})
