import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaWorkflowRunRepository } from './prisma-workflow-run.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { WorkflowRun } from '../domain/workflow-run'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'workflowRun', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { workflowRun: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'run-1',
  projectId: 'proj-1',
  workflowId: 'wf-1',
  status: 'running',
  currentStageIndex: 0,
  startedAt: now,
  completedAt: null,
  failureReason: null,
  createdAt: now,
  updatedAt: now,
}

describe('PrismaWorkflowRunRepository', () => {
  let repo: PrismaWorkflowRunRepository
  let prisma: CompanyDesignPrismaService & { workflowRun: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaWorkflowRunRepository(prisma)
  })

  it('findById returns domain entity when found', async () => {
    prisma.workflowRun.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('run-1')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('run-1')
    expect(result!.status).toBe('running')
  })

  it('findById returns null when not found', async () => {
    prisma.workflowRun.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('listByProject returns array', async () => {
    prisma.workflowRun.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByProject('proj-1')
    expect(results).toHaveLength(1)
    expect(prisma.workflowRun.findMany).toHaveBeenCalledWith({ where: { projectId: 'proj-1' } })
  })

  it('listByWorkflow filters by both projectId and workflowId', async () => {
    prisma.workflowRun.findMany.mockResolvedValue([])
    await repo.listByWorkflow('proj-1', 'wf-1')
    expect(prisma.workflowRun.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', workflowId: 'wf-1' },
    })
  })

  it('save upserts the workflow run', async () => {
    prisma.workflowRun.upsert.mockResolvedValue(sampleRow)
    const run = WorkflowRun.reconstitute({ ...sampleRow, status: 'running' as const })
    await repo.save(run)
    expect(prisma.workflowRun.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'run-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.workflowRun.delete.mockResolvedValue(sampleRow)
    await repo.delete('run-1')
    expect(prisma.workflowRun.delete).toHaveBeenCalledWith({ where: { id: 'run-1' } })
  })
})
