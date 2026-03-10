import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { RoleService } from './role.service'
import { InMemoryRoleRepository } from '../infra/in-memory-role.repository'

describe('RoleService', () => {
  let service: RoleService

  beforeEach(() => {
    const repo = new InMemoryRoleRepository()
    service = new RoleService(repo)
  })

  it('should list empty roles', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a role', async () => {
    const result = await service.create('p1', {
      name: 'Product Manager',
      description: 'Manages product',
      departmentId: 'd1',
    })
    expect(result.name).toBe('Product Manager')
    expect(result.projectId).toBe('p1')
    expect(result.departmentId).toBe('d1')
    expect(result.id).toBeDefined()
  })

  it('should create a role with all fields', async () => {
    const result = await service.create('p1', {
      name: 'Tech Lead',
      description: 'Leads tech',
      departmentId: 'd1',
      capabilityIds: ['c1', 'c2'],
      accountability: 'Technical delivery',
      authority: 'Architecture decisions',
    })
    expect(result.capabilityIds).toEqual(['c1', 'c2'])
    expect(result.accountability).toBe('Technical delivery')
    expect(result.authority).toBe('Architecture decisions')
  })

  it('should list by project', async () => {
    await service.create('p1', { name: 'A', description: '', departmentId: 'd1' })
    await service.create('p1', { name: 'B', description: '', departmentId: 'd1' })
    await service.create('p2', { name: 'C', description: '', departmentId: 'd2' })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', {
      name: 'PM',
      description: '',
      departmentId: 'd1',
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('PM')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', {
      name: 'Old',
      description: '',
      departmentId: 'd1',
    })
    const updated = await service.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', {
      name: 'Temp',
      description: '',
      departmentId: 'd1',
    })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
