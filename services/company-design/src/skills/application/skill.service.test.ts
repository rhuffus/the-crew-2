import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { SkillService } from './skill.service'
import { InMemorySkillRepository } from '../infra/in-memory-skill.repository'

describe('SkillService', () => {
  let service: SkillService

  beforeEach(() => {
    const repo = new InMemorySkillRepository()
    service = new SkillService(repo)
  })

  it('should list empty skills', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a skill', async () => {
    const result = await service.create('p1', {
      name: 'Code Review',
      description: 'Reviews code',
      category: 'Engineering',
    })
    expect(result.name).toBe('Code Review')
    expect(result.projectId).toBe('p1')
    expect(result.category).toBe('Engineering')
    expect(result.id).toBeDefined()
  })

  it('should list by project', async () => {
    await service.create('p1', { name: 'A', description: '', category: 'Cat1' })
    await service.create('p1', { name: 'B', description: '', category: 'Cat2' })
    await service.create('p2', { name: 'C', description: '', category: 'Cat3' })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', {
      name: 'Deploy',
      description: 'Deploys services',
      category: 'DevOps',
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('Deploy')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', {
      name: 'Old',
      description: '',
      category: 'Cat',
    })
    const updated = await service.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should update tags', async () => {
    const created = await service.create('p1', {
      name: 'Skill',
      description: '',
      category: 'Cat',
    })
    const updated = await service.update(created.id, { tags: ['tag1', 'tag2'] })
    expect(updated.tags).toEqual(['tag1', 'tag2'])
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', {
      name: 'Temp',
      description: '',
      category: 'Cat',
    })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
