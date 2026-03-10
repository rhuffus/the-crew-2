import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PoliciesController } from './policies.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listPolicies: vi.fn(),
  getPolicy: vi.fn(),
  createPolicy: vi.fn(),
  updatePolicy: vi.fn(),
  deletePolicy: vi.fn(),
}

describe('PoliciesController (gateway)', () => {
  let controller: PoliciesController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new PoliciesController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list policies', async () => {
    mockClient.listPolicies.mockResolvedValue([{ id: '1', name: 'No orphans' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'No orphans' }])
    expect(mockClient.listPolicies).toHaveBeenCalledWith('p1')
  })

  it('should get a policy', async () => {
    mockClient.getPolicy.mockResolvedValue({ id: '1', name: 'No orphans' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'No orphans' })
  })

  it('should create a policy', async () => {
    const dto = {
      name: 'Approval gate',
      description: 'Requires approval',
      scope: 'global' as const,
      type: 'approval-gate' as const,
      condition: 'Manager must approve',
      enforcement: 'mandatory' as const,
    }
    mockClient.createPolicy.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update a policy', async () => {
    mockClient.updatePolicy.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a policy', async () => {
    mockClient.deletePolicy.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deletePolicy).toHaveBeenCalledWith('1', 'p1')
  })
})
