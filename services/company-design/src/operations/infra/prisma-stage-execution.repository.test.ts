import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaStageExecutionRepository } from './prisma-stage-execution.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { StageExecution } from '../domain/stage-execution'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'stageExecution', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  Object.defineProperty(service, 'workflowRun', {
    value: { findMany: vi.fn() },
    writable: true,
  })
  Object.defineProperty(service, '$transaction', {
    value: vi.fn((cb: (tx: unknown) => Promise<void>) =>
      cb({ stageExecution: { upsert: vi.fn() } }),
    ),
    writable: true,
  })
  return service as CompanyDesignPrismaService & {
    stageExecution: MockDelegate
    workflowRun: { findMany: Mock }
    $transaction: Mock
  }
}

const sampleRow = {
  id: 'se-1',
  runId: 'run-1',
  workflowId: 'wf-1',
  stageName: 'Stage 1',
  stageIndex: 0,
  status: 'pending',
  assigneeId: null,
  blockReason: null,
  startedAt: null,
  completedAt: null,
}

describe('PrismaStageExecutionRepository', () => {
  let repo: PrismaStageExecutionRepository
  let prisma: ReturnType<typeof createMockPrisma>

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaStageExecutionRepository(prisma)
  })

  it('findById returns domain entity when found', async () => {
    prisma.stageExecution.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('se-1')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('se-1')
  })

  it('findById returns null when not found', async () => {
    prisma.stageExecution.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('listByRun returns array', async () => {
    prisma.stageExecution.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByRun('run-1')
    expect(results).toHaveLength(1)
  })

  it('listByProject returns empty when no runs', async () => {
    prisma.workflowRun.findMany.mockResolvedValue([])
    const results = await repo.listByProject('proj-1')
    expect(results).toEqual([])
  })

  it('listByProject queries stage executions by run ids', async () => {
    prisma.workflowRun.findMany.mockResolvedValue([{ id: 'run-1' }])
    prisma.stageExecution.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByProject('proj-1')
    expect(results).toHaveLength(1)
    expect(prisma.stageExecution.findMany).toHaveBeenCalledWith({
      where: { runId: { in: ['run-1'] } },
    })
  })

  it('save upserts the stage execution', async () => {
    prisma.stageExecution.upsert.mockResolvedValue(sampleRow)
    const exec = StageExecution.reconstitute({ ...sampleRow, status: 'pending' as const })
    await repo.save(exec)
    expect(prisma.stageExecution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'se-1' } }),
    )
  })

  it('saveAll uses transaction', async () => {
    const exec = StageExecution.reconstitute({ ...sampleRow, status: 'pending' as const })
    await repo.saveAll([exec])
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('saveAll does nothing for empty array', async () => {
    await repo.saveAll([])
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('delete removes by id', async () => {
    prisma.stageExecution.delete.mockResolvedValue(sampleRow)
    await repo.delete('se-1')
    expect(prisma.stageExecution.delete).toHaveBeenCalledWith({ where: { id: 'se-1' } })
  })
})
