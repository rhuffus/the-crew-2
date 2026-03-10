import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ValidationsController } from './validations.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  getValidations: vi.fn(),
}

describe('ValidationsController (gateway)', () => {
  let controller: ValidationsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ValidationsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should get validations for a project', async () => {
    const result = {
      projectId: 'p1',
      issues: [],
      summary: { errors: 0, warnings: 0 },
    }
    mockClient.getValidations.mockResolvedValue(result)

    const response = await controller.validate('p1')

    expect(response).toEqual(result)
    expect(mockClient.getValidations).toHaveBeenCalledWith('p1')
  })

  it('should return issues from validation', async () => {
    const result = {
      projectId: 'p1',
      issues: [
        { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
        { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'No mandate', severity: 'warning' },
      ],
      summary: { errors: 1, warnings: 1 },
    }
    mockClient.getValidations.mockResolvedValue(result)

    const response = await controller.validate('p1')

    expect(response.issues).toHaveLength(2)
    expect(response.summary).toEqual({ errors: 1, warnings: 1 })
  })
})
