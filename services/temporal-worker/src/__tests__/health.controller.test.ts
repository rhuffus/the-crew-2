import { describe, it, expect } from 'vitest'
import { HealthController } from '../health.controller'
import type { WorkerService } from '../temporal/worker.service'

describe('HealthController', () => {
  it('should return health status with worker info', () => {
    const mockWorkerService = {
      getStatus: () => ({ started: true, queues: ['bootstrap', 'documents'] }),
    } as unknown as WorkerService

    const controller = new HealthController(mockWorkerService)
    const result = controller.check()

    expect(result).toEqual({
      status: 'ok',
      service: 'temporal-worker',
      workers: { started: true, queues: ['bootstrap', 'documents'] },
    })
  })

  it('should reflect not-started state', () => {
    const mockWorkerService = {
      getStatus: () => ({ started: false, queues: [] }),
    } as unknown as WorkerService

    const controller = new HealthController(mockWorkerService)
    const result = controller.check()

    expect(result.workers.started).toBe(false)
    expect(result.workers.queues).toEqual([])
  })
})
