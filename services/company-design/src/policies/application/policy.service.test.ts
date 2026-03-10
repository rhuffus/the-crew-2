import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { PolicyService } from './policy.service'
import { InMemoryPolicyRepository } from '../infra/in-memory-policy.repository'

const baseDto = {
  name: 'No orphan roles',
  description: 'Every role must belong to a department',
  scope: 'global' as const,
  type: 'constraint' as const,
  condition: 'All roles must have a department',
  enforcement: 'mandatory' as const,
}

describe('PolicyService', () => {
  let service: PolicyService

  beforeEach(() => {
    const repo = new InMemoryPolicyRepository()
    service = new PolicyService(repo)
  })

  it('should list empty policies', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a policy', async () => {
    const result = await service.create('p1', baseDto)
    expect(result.name).toBe('No orphan roles')
    expect(result.projectId).toBe('p1')
    expect(result.status).toBe('active')
    expect(result.scope).toBe('global')
  })

  it('should create a department-scoped policy', async () => {
    const result = await service.create('p1', {
      ...baseDto,
      scope: 'department',
      departmentId: 'd1',
      type: 'approval-gate',
    })
    expect(result.scope).toBe('department')
    expect(result.departmentId).toBe('d1')
  })

  it('should list by project', async () => {
    await service.create('p1', baseDto)
    await service.create('p1', { ...baseDto, name: 'Another' })
    await service.create('p2', { ...baseDto, name: 'Other project' })
    expect(await service.list('p1')).toHaveLength(2)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', baseDto)
    const found = await service.get(created.id)
    expect(found.name).toBe('No orphan roles')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', baseDto)
    const updated = await service.update(created.id, {
      name: 'Updated policy',
      status: 'inactive',
    })
    expect(updated.name).toBe('Updated policy')
    expect(updated.status).toBe('inactive')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', baseDto)
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
