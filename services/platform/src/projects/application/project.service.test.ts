import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { ProjectService } from './project.service'
import { InMemoryProjectRepository } from '../infra/in-memory-project.repository'

describe('ProjectService', () => {
  let service: ProjectService
  let repo: InMemoryProjectRepository

  beforeEach(() => {
    repo = new InMemoryProjectRepository()
    service = new ProjectService(repo)
  })

  it('should create a project', async () => {
    const result = await service.create({ name: 'Acme', description: 'A company' })
    expect(result.name).toBe('Acme')
    expect(result.description).toBe('A company')
    expect(result.status).toBe('active')
    expect(result.id).toBeDefined()
  })

  it('should list projects', async () => {
    await service.create({ name: 'A', description: '' })
    await service.create({ name: 'B', description: '' })
    const list = await service.list()
    expect(list).toHaveLength(2)
  })

  it('should get a project by id', async () => {
    const created = await service.create({ name: 'Acme', description: '' })
    const found = await service.get(created.id)
    expect(found.name).toBe('Acme')
  })

  it('should throw on get unknown id', async () => {
    await expect(service.get('unknown')).rejects.toThrow(NotFoundException)
  })

  it('should update project metadata', async () => {
    const created = await service.create({ name: 'Old', description: 'old' })
    const updated = await service.update(created.id, { name: 'New', description: 'new' })
    expect(updated.name).toBe('New')
    expect(updated.description).toBe('new')
  })

  it('should archive a project', async () => {
    const created = await service.create({ name: 'Acme', description: '' })
    const updated = await service.update(created.id, { status: 'archived' })
    expect(updated.status).toBe('archived')
  })

  it('should throw on update unknown id', async () => {
    await expect(service.update('unknown', { name: 'X' })).rejects.toThrow(NotFoundException)
  })
})
