import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CompanyModelController } from './company-model.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  getCompanyModel: vi.fn(),
  updateCompanyModel: vi.fn(),
}

describe('CompanyModelController (gateway)', () => {
  let controller: CompanyModelController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new CompanyModelController(mockClient as unknown as CompanyDesignClient)
  })

  it('should get company model', async () => {
    const dto = { projectId: 'p1', purpose: 'Build', type: '', scope: '', principles: [], updatedAt: '' }
    mockClient.getCompanyModel.mockResolvedValue(dto)
    const result = await controller.get('p1')
    expect(result).toEqual(dto)
    expect(mockClient.getCompanyModel).toHaveBeenCalledWith('p1')
  })

  it('should update company model', async () => {
    const dto = { projectId: 'p1', purpose: 'Updated', type: 'SaaS', scope: '', principles: [], updatedAt: '' }
    mockClient.updateCompanyModel.mockResolvedValue(dto)
    const result = await controller.update('p1', { purpose: 'Updated', type: 'SaaS' })
    expect(result).toEqual(dto)
    expect(mockClient.updateCompanyModel).toHaveBeenCalledWith('p1', { purpose: 'Updated', type: 'SaaS' })
  })
})
