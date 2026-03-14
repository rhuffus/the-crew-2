import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaWorkflowRepository } from './prisma-workflow.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Workflow } from '../domain/workflow'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'workflow', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { workflow: MockDelegate }
}

const sampleRow = {
  id: 'wf-1',
  projectId: 'proj-1',
  name: 'Deploy Pipeline',
  description: 'CI/CD pipeline',
  ownerDepartmentId: 'dept-1',
  status: 'draft',
  triggerDescription: 'On PR merge',
  stages: [{ name: 'Build', order: 1, description: 'Compile' }],
  participants: [
    {
      participantId: 'role-1',
      participantType: 'role',
      responsibility: 'Review',
    },
  ],
  contractIds: ['con-1'],
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaWorkflowRepository', () => {
  let repo: PrismaWorkflowRepository
  let prisma: CompanyDesignPrismaService & { workflow: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaWorkflowRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Workflow when found', async () => {
      prisma.workflow.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('wf-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('wf-1')
      expect(result!.name).toBe('Deploy Pipeline')
      expect(result!.stages).toHaveLength(1)
      expect(result!.stages[0]!.name).toBe('Build')
      expect(result!.participants).toHaveLength(1)
      expect(result!.contractIds).toEqual(['con-1'])
    })

    it('should return null when not found', async () => {
      prisma.workflow.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all workflows for project', async () => {
      prisma.workflow.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the workflow with serialized stages and participants', async () => {
      prisma.workflow.upsert.mockResolvedValue(sampleRow)

      const workflow = Workflow.create({
        id: 'wf-1',
        projectId: 'proj-1',
        name: 'Deploy Pipeline',
        description: 'CI/CD pipeline',
        ownerDepartmentId: 'dept-1',
        triggerDescription: 'On PR merge',
        stages: [{ name: 'Build', order: 1, description: 'Compile' }],
        participants: [
          {
            participantId: 'role-1',
            participantType: 'role',
            responsibility: 'Review',
          },
        ],
        contractIds: ['con-1'],
      })
      await repo.save(workflow)

      expect(prisma.workflow.upsert).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
        create: expect.objectContaining({
          id: 'wf-1',
          stages: [{ name: 'Build', order: 1, description: 'Compile' }],
          participants: [
            {
              participantId: 'role-1',
              participantType: 'role',
              responsibility: 'Review',
            },
          ],
        }),
        update: expect.objectContaining({
          stages: [{ name: 'Build', order: 1, description: 'Compile' }],
        }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.workflow.delete.mockResolvedValue(sampleRow)
      await repo.delete('wf-1')
      expect(prisma.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
      })
    })
  })

  describe('domain mapping', () => {
    it('should handle null ownerDepartmentId', async () => {
      prisma.workflow.findUnique.mockResolvedValue({
        ...sampleRow,
        ownerDepartmentId: null,
      })
      const result = await repo.findById('wf-1')
      expect(result!.ownerDepartmentId).toBeNull()
    })
  })
})
