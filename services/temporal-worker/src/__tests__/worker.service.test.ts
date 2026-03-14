import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@temporalio/worker', () => {
  const createMockWorker = () => {
    let resolveRun: () => void
    return {
      run: vi
        .fn()
        .mockImplementation(
          () => new Promise<void>((resolve) => { resolveRun = resolve }),
        ),
      shutdown: vi.fn().mockImplementation(() => {
        if (resolveRun) resolveRun()
      }),
    }
  }

  return {
    NativeConnection: {
      connect: vi.fn().mockResolvedValue({
        close: vi.fn(),
      }),
    },
    Worker: {
      create: vi
        .fn()
        .mockImplementation(() => Promise.resolve(createMockWorker())),
    },
    bundleWorkflowCode: vi.fn().mockResolvedValue({ code: '' }),
  }
})

import { WorkerService } from '../temporal/worker.service'

describe('WorkerService', () => {
  let service: WorkerService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new WorkerService()
  })

  it('should report not started initially', () => {
    const status = service.getStatus()
    expect(status.started).toBe(false)
    expect(status.queues).toEqual([])
  })

  it('should start workers on module init', async () => {
    await service.onModuleInit()
    const status = service.getStatus()
    expect(status.started).toBe(true)
    expect(status.queues).toHaveLength(4)
    expect(status.queues).toContain('bootstrap')
    expect(status.queues).toContain('documents')
    expect(status.queues).toContain('growth')
    expect(status.queues).toContain('agent-execution')
  })

  it('should create a worker for each task queue', async () => {
    const { Worker } = await import('@temporalio/worker')
    await service.onModuleInit()
    expect(Worker.create).toHaveBeenCalledTimes(4)
  })

  it('should connect to Temporal with default address', async () => {
    const { NativeConnection } = await import('@temporalio/worker')
    delete process.env.TEMPORAL_ADDRESS
    await service.onModuleInit()
    expect(NativeConnection.connect).toHaveBeenCalledWith({
      address: 'localhost:7233',
    })
  })

  it('should use TEMPORAL_ADDRESS env var when set', async () => {
    const { NativeConnection } = await import('@temporalio/worker')
    process.env.TEMPORAL_ADDRESS = 'temporal:7233'
    await service.onModuleInit()
    expect(NativeConnection.connect).toHaveBeenCalledWith({
      address: 'temporal:7233',
    })
    delete process.env.TEMPORAL_ADDRESS
  })

  it('should stop workers on module destroy', async () => {
    await service.onModuleInit()
    await service.onModuleDestroy()
    const status = service.getStatus()
    expect(status.started).toBe(false)
    expect(status.queues).toEqual([])
  })
})
