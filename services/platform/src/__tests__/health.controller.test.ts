import { describe, it, expect } from 'vitest'
import { Test } from '@nestjs/testing'
import { HealthController } from '../health.controller'

describe('HealthController', () => {
  it('should return ok status', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    const controller = module.get(HealthController)
    expect(controller.check()).toEqual({ status: 'ok', service: 'platform-service' })
  })
})
