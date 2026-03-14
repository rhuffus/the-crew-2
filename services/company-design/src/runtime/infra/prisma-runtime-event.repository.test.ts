import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaRuntimeEventRepository } from './prisma-runtime-event.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { RuntimeEvent } from '../domain/runtime-event'

interface MockDelegate {
  findUnique: Mock
  findFirst: Mock
  findMany: Mock
  create: Mock
  count: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'runtimeEvent', {
    value: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { runtimeEvent: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'evt-1',
  projectId: 'proj-1',
  eventType: 'execution-started',
  severity: 'info',
  title: 'Task started',
  description: '',
  sourceEntityType: 'agent',
  sourceEntityId: 'agent-1',
  targetEntityType: null,
  targetEntityId: null,
  executionId: 'exec-1',
  metadata: {},
  occurredAt: now,
}

describe('PrismaRuntimeEventRepository', () => {
  let repo: PrismaRuntimeEventRepository
  let prisma: CompanyDesignPrismaService & { runtimeEvent: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaRuntimeEventRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.runtimeEvent.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('evt-1')
    expect(result).not.toBeNull()
    expect(result!.eventType).toBe('execution-started')
  })

  it('findById returns null when not found', async () => {
    prisma.runtimeEvent.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('append creates a new event', async () => {
    prisma.runtimeEvent.create.mockResolvedValue(sampleRow)
    const event = RuntimeEvent.reconstitute({
      ...sampleRow,
      eventType: 'execution-started' as const,
      severity: 'info' as const,
    })
    await repo.append(event)
    expect(prisma.runtimeEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 'evt-1' }) }),
    )
  })

  it('listByProject returns ordered events', async () => {
    prisma.runtimeEvent.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByProject('proj-1')
    expect(results).toHaveLength(1)
    expect(prisma.runtimeEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { occurredAt: 'desc' } }),
    )
  })

  it('listByProject respects limit and offset', async () => {
    prisma.runtimeEvent.findMany.mockResolvedValue([])
    await repo.listByProject('proj-1', 10, 5)
    expect(prisma.runtimeEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 5 }),
    )
  })

  it('listByExecution filters by executionId', async () => {
    prisma.runtimeEvent.findMany.mockResolvedValue([])
    await repo.listByExecution('exec-1')
    expect(prisma.runtimeEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { executionId: 'exec-1' } }),
    )
  })

  it('listByEntity uses OR on source/target entity', async () => {
    prisma.runtimeEvent.findMany.mockResolvedValue([])
    await repo.listByEntity('entity-1')
    expect(prisma.runtimeEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ sourceEntityId: 'entity-1' }, { targetEntityId: 'entity-1' }] },
      }),
    )
  })

  it('findLatestByEntity returns single event', async () => {
    prisma.runtimeEvent.findFirst.mockResolvedValue(sampleRow)
    const result = await repo.findLatestByEntity('agent-1')
    expect(result).not.toBeNull()
  })

  it('countByProject returns count', async () => {
    prisma.runtimeEvent.count.mockResolvedValue(42)
    const result = await repo.countByProject('proj-1')
    expect(result).toBe(42)
  })
})
