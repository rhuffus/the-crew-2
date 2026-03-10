import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { DepartmentService } from './department.service'
import { InMemoryDepartmentRepository } from '../infra/in-memory-department.repository'

describe('DepartmentService', () => {
  let service: DepartmentService

  beforeEach(() => {
    const repo = new InMemoryDepartmentRepository()
    service = new DepartmentService(repo)
  })

  it('should list empty departments for project', async () => {
    const result = await service.list('p1')
    expect(result).toEqual([])
  })

  it('should create a department', async () => {
    const result = await service.create('p1', {
      name: 'Engineering',
      description: 'Builds stuff',
      mandate: 'Ship quality code',
    })
    expect(result.name).toBe('Engineering')
    expect(result.projectId).toBe('p1')
    expect(result.parentId).toBeNull()
  })

  it('should create with parentId', async () => {
    const parent = await service.create('p1', {
      name: 'Engineering',
      description: '',
      mandate: '',
    })
    const child = await service.create('p1', {
      name: 'Frontend',
      description: '',
      mandate: '',
      parentId: parent.id,
    })
    expect(child.parentId).toBe(parent.id)
  })

  it('should list departments for a project', async () => {
    await service.create('p1', { name: 'A', description: '', mandate: '' })
    await service.create('p1', { name: 'B', description: '', mandate: '' })
    await service.create('p2', { name: 'C', description: '', mandate: '' })
    const result = await service.list('p1')
    expect(result).toHaveLength(2)
  })

  it('should get a department by id', async () => {
    const created = await service.create('p1', {
      name: 'Sales',
      description: '',
      mandate: 'Revenue',
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('Sales')
  })

  it('should throw on get unknown id', async () => {
    await expect(service.get('unknown')).rejects.toThrow(NotFoundException)
  })

  it('should update a department', async () => {
    const created = await service.create('p1', {
      name: 'Old',
      description: '',
      mandate: '',
    })
    const updated = await service.update(created.id, { name: 'New', mandate: 'New mandate' })
    expect(updated.name).toBe('New')
    expect(updated.mandate).toBe('New mandate')
  })

  it('should throw on update unknown id', async () => {
    await expect(service.update('unknown', { name: 'X' })).rejects.toThrow(NotFoundException)
  })

  it('should remove a department', async () => {
    const created = await service.create('p1', {
      name: 'Temp',
      description: '',
      mandate: '',
    })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown id', async () => {
    await expect(service.remove('unknown')).rejects.toThrow(NotFoundException)
  })
})
