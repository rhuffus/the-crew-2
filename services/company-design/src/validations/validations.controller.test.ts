import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ValidationsController } from './validations.controller'
import type { ValidationService } from './application/validation.service'
import type { ValidationResultDto } from '@the-crew/shared-types'

const mockService = {
  validate: vi.fn(),
}

describe('ValidationsController', () => {
  let controller: ValidationsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ValidationsController(mockService as unknown as ValidationService)
  })

  it('should call validation service with projectId', async () => {
    const result: ValidationResultDto = {
      projectId: 'p1',
      issues: [],
      summary: { errors: 0, warnings: 0 },
    }
    mockService.validate.mockResolvedValue(result)

    const response = await controller.validate('p1')

    expect(response).toEqual(result)
    expect(mockService.validate).toHaveBeenCalledWith('p1')
  })

  it('should return issues from validation service', async () => {
    const result: ValidationResultDto = {
      projectId: 'p1',
      issues: [
        { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
      ],
      summary: { errors: 1, warnings: 0 },
    }
    mockService.validate.mockResolvedValue(result)

    const response = await controller.validate('p1')

    expect(response.issues).toHaveLength(1)
    expect(response.summary.errors).toBe(1)
  })
})
