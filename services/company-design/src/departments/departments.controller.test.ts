import { describe, it, expect, beforeEach } from 'vitest'
import { DepartmentsController } from './departments.controller'
import { DepartmentService } from './application/department.service'
import { InMemoryDepartmentRepository } from './infra/in-memory-department.repository'

describe('DepartmentsController', () => {
  let controller: DepartmentsController

  beforeEach(() => {
    const repo = new InMemoryDepartmentRepository()
    const service = new DepartmentService(repo)
    controller = new DepartmentsController(service)
  })

  it('should list empty departments', async () => {
    const result = await controller.list('p1')
    expect(result).toEqual([])
  })

  it('should create and list departments', async () => {
    await controller.create('p1', { name: 'Eng', description: '', mandate: '' })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Eng')
  })

  it('should get a department', async () => {
    const created = await controller.create('p1', {
      name: 'Sales',
      description: '',
      mandate: 'Revenue',
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Sales')
  })

  it('should update a department', async () => {
    const created = await controller.create('p1', { name: 'Old', description: '', mandate: '' })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete a department', async () => {
    const created = await controller.create('p1', { name: 'Temp', description: '', mandate: '' })
    await controller.remove(created.id)
    const list = await controller.list('p1')
    expect(list).toHaveLength(0)
  })
})
