import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CapabilitiesController } from './capabilities.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listCapabilities: vi.fn(),
  getCapability: vi.fn(),
  createCapability: vi.fn(),
  updateCapability: vi.fn(),
  deleteCapability: vi.fn(),
}

describe('CapabilitiesController (gateway)', () => {
  let controller: CapabilitiesController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new CapabilitiesController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list capabilities', async () => {
    mockClient.listCapabilities.mockResolvedValue([{ id: '1', name: 'Auth' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Auth' }])
    expect(mockClient.listCapabilities).toHaveBeenCalledWith('p1')
  })

  it('should get a capability', async () => {
    mockClient.getCapability.mockResolvedValue({ id: '1', name: 'Auth' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Auth' })
  })

  it('should create a capability', async () => {
    mockClient.createCapability.mockResolvedValue({ id: '1', name: 'Billing' })
    const result = await controller.create('p1', { name: 'Billing', description: '' })
    expect(result).toEqual({ id: '1', name: 'Billing' })
  })

  it('should update a capability', async () => {
    mockClient.updateCapability.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a capability', async () => {
    mockClient.deleteCapability.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteCapability).toHaveBeenCalledWith('1', 'p1')
  })
})
