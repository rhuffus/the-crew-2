import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { CapabilityService } from './capability.service'
import { InMemoryCapabilityRepository } from '../infra/in-memory-capability.repository'

describe('CapabilityService', () => {
  let service: CapabilityService

  beforeEach(() => {
    const repo = new InMemoryCapabilityRepository()
    service = new CapabilityService(repo)
  })

  it('should list empty capabilities', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a capability', async () => {
    const result = await service.create('p1', {
      name: 'Onboarding',
      description: 'Onboard users',
    })
    expect(result.name).toBe('Onboarding')
    expect(result.projectId).toBe('p1')
  })

  it('should create with inputs/outputs', async () => {
    const result = await service.create('p1', {
      name: 'Processing',
      description: '',
      inputs: ['Request'],
      outputs: ['Response'],
    })
    expect(result.inputs).toEqual(['Request'])
    expect(result.outputs).toEqual(['Response'])
  })

  it('should list by project', async () => {
    await service.create('p1', { name: 'A', description: '' })
    await service.create('p1', { name: 'B', description: '' })
    await service.create('p2', { name: 'C', description: '' })
    expect(await service.list('p1')).toHaveLength(2)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', { name: 'Test', description: '' })
    const found = await service.get(created.id)
    expect(found.name).toBe('Test')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', { name: 'Old', description: '' })
    const updated = await service.update(created.id, {
      name: 'New',
      ownerDepartmentId: 'd1',
    })
    expect(updated.name).toBe('New')
    expect(updated.ownerDepartmentId).toBe('d1')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', { name: 'Temp', description: '' })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
