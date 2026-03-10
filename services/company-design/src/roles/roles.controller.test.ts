import { describe, it, expect, beforeEach } from 'vitest'
import { RolesController } from './roles.controller'
import { RoleService } from './application/role.service'
import { InMemoryRoleRepository } from './infra/in-memory-role.repository'

describe('RolesController', () => {
  let controller: RolesController

  beforeEach(() => {
    const repo = new InMemoryRoleRepository()
    const service = new RoleService(repo)
    controller = new RolesController(service)
  })

  it('should list empty roles', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', {
      name: 'Product Manager',
      description: 'Manages product',
      departmentId: 'd1',
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Product Manager')
  })

  it('should get a role', async () => {
    const created = await controller.create('p1', {
      name: 'Tech Lead',
      description: '',
      departmentId: 'd1',
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Tech Lead')
  })

  it('should update a role', async () => {
    const created = await controller.create('p1', {
      name: 'Old',
      description: '',
      departmentId: 'd1',
    })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete a role', async () => {
    const created = await controller.create('p1', {
      name: 'Temp',
      description: '',
      departmentId: 'd1',
    })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
