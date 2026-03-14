import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient, Prisma: { JsonNull: 'DbNull' } }
})

import { PrismaRuntimeExecutionRepository } from './prisma-runtime-execution.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { RuntimeExecution } from '../domain/runtime-execution'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'runtimeExecution', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { runtimeExecution: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'exec-1',
  projectId: 'proj-1',
  executionType: 'agent-task',
  workflowId: null,
  agentId: 'agent-1',
  status: 'running',
  startedAt: now,
  completedAt: null,
  input: {},
  output: null,
  errors: [],
  waitingFor: null,
  approvals: [],
  aiCost: 0.5,
  logSummary: '',
  parentExecutionId: null,
  operationsRunId: null,
  createdAt: now,
  updatedAt: now,
}

describe('PrismaRuntimeExecutionRepository', () => {
  let repo: PrismaRuntimeExecutionRepository
  let prisma: CompanyDesignPrismaService & { runtimeExecution: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaRuntimeExecutionRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.runtimeExecution.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('exec-1')
    expect(result).not.toBeNull()
    expect(result!.executionType).toBe('agent-task')
  })

  it('findById returns null when not found', async () => {
    prisma.runtimeExecution.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('listByProject returns array', async () => {
    prisma.runtimeExecution.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByProject('proj-1')
    expect(results).toHaveLength(1)
  })

  it('listActiveByProject filters by active statuses', async () => {
    prisma.runtimeExecution.findMany.mockResolvedValue([])
    await repo.listActiveByProject('proj-1')
    expect(prisma.runtimeExecution.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 'proj-1',
        status: { in: ['pending', 'running', 'waiting', 'blocked'] },
      },
    })
  })

  it('listByEntity uses OR on agentId/workflowId', async () => {
    prisma.runtimeExecution.findMany.mockResolvedValue([])
    await repo.listByEntity('entity-1')
    expect(prisma.runtimeExecution.findMany).toHaveBeenCalledWith({
      where: { OR: [{ agentId: 'entity-1' }, { workflowId: 'entity-1' }] },
    })
  })

  it('save upserts the execution', async () => {
    prisma.runtimeExecution.upsert.mockResolvedValue(sampleRow)
    const exec = RuntimeExecution.reconstitute({
      ...sampleRow,
      executionType: 'agent-task' as const,
      status: 'running' as const,
      errors: [],
      approvals: [],
    })
    await repo.save(exec)
    expect(prisma.runtimeExecution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'exec-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.runtimeExecution.delete.mockResolvedValue(sampleRow)
    await repo.delete('exec-1')
    expect(prisma.runtimeExecution.delete).toHaveBeenCalledWith({ where: { id: 'exec-1' } })
  })
})
