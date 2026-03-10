import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RolesController } from './roles.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listRoles: vi.fn(),
  getRole: vi.fn(),
  createRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
}

describe('RolesController (gateway)', () => {
  let controller: RolesController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new RolesController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list roles', async () => {
    mockClient.listRoles.mockResolvedValue([{ id: '1', name: 'PM' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'PM' }])
    expect(mockClient.listRoles).toHaveBeenCalledWith('p1')
  })

  it('should get a role', async () => {
    mockClient.getRole.mockResolvedValue({ id: '1', name: 'PM' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'PM' })
  })

  it('should create a role', async () => {
    const dto = { name: 'Tech Lead', description: 'Leads tech', departmentId: 'd1' }
    mockClient.createRole.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update a role', async () => {
    mockClient.updateRole.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a role', async () => {
    mockClient.deleteRole.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteRole).toHaveBeenCalledWith('1', 'p1')
  })
})
