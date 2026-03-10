import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContractsController } from './contracts.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listContracts: vi.fn(),
  getContract: vi.fn(),
  createContract: vi.fn(),
  updateContract: vi.fn(),
  deleteContract: vi.fn(),
}

describe('ContractsController (gateway)', () => {
  let controller: ContractsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ContractsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list contracts', async () => {
    mockClient.listContracts.mockResolvedValue([{ id: '1', name: 'SLA' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'SLA' }])
    expect(mockClient.listContracts).toHaveBeenCalledWith('p1')
  })

  it('should get a contract', async () => {
    mockClient.getContract.mockResolvedValue({ id: '1', name: 'SLA' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'SLA' })
  })

  it('should create a contract', async () => {
    const dto = {
      name: 'Data Contract',
      description: '',
      type: 'DataContract' as const,
      providerId: 'd1',
      providerType: 'department' as const,
      consumerId: 'd2',
      consumerType: 'department' as const,
    }
    mockClient.createContract.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update a contract', async () => {
    mockClient.updateContract.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a contract', async () => {
    mockClient.deleteContract.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteContract).toHaveBeenCalledWith('1', 'p1')
  })
})
