import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DepartmentsController } from './departments.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listDepartments: vi.fn(),
  getDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
}

describe('DepartmentsController (gateway)', () => {
  let controller: DepartmentsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new DepartmentsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list departments', async () => {
    mockClient.listDepartments.mockResolvedValue([{ id: '1', name: 'Eng' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Eng' }])
    expect(mockClient.listDepartments).toHaveBeenCalledWith('p1')
  })

  it('should get a department', async () => {
    mockClient.getDepartment.mockResolvedValue({ id: '1', name: 'Eng' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Eng' })
  })

  it('should create a department', async () => {
    mockClient.createDepartment.mockResolvedValue({ id: '1', name: 'Sales' })
    const result = await controller.create('p1', { name: 'Sales', description: '', mandate: '' })
    expect(result).toEqual({ id: '1', name: 'Sales' })
    expect(mockClient.createDepartment).toHaveBeenCalledWith('p1', {
      name: 'Sales',
      description: '',
      mandate: '',
    })
  })

  it('should update a department', async () => {
    mockClient.updateDepartment.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete a department', async () => {
    mockClient.deleteDepartment.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteDepartment).toHaveBeenCalledWith('1', 'p1')
  })
})
