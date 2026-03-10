import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { AgentArchetypeService } from './agent-archetype.service'
import { InMemoryAgentArchetypeRepository } from '../infra/in-memory-agent-archetype.repository'

describe('AgentArchetypeService', () => {
  let service: AgentArchetypeService

  beforeEach(() => {
    const repo = new InMemoryAgentArchetypeRepository()
    service = new AgentArchetypeService(repo)
  })

  it('should list empty archetypes', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create an archetype', async () => {
    const result = await service.create('p1', {
      name: 'Code Reviewer',
      description: 'Reviews PRs',
      roleId: 'r1',
      departmentId: 'd1',
    })
    expect(result.name).toBe('Code Reviewer')
    expect(result.projectId).toBe('p1')
    expect(result.roleId).toBe('r1')
    expect(result.departmentId).toBe('d1')
    expect(result.id).toBeDefined()
  })

  it('should create an archetype with all fields', async () => {
    const result = await service.create('p1', {
      name: 'Deployer',
      description: 'Deploys services',
      roleId: 'r1',
      departmentId: 'd1',
      skillIds: ['s1', 's2'],
      constraints: { maxConcurrency: 3, allowedDepartmentIds: ['d1', 'd2'] },
    })
    expect(result.skillIds).toEqual(['s1', 's2'])
    expect(result.constraints.maxConcurrency).toBe(3)
    expect(result.constraints.allowedDepartmentIds).toEqual(['d1', 'd2'])
  })

  it('should list by project', async () => {
    await service.create('p1', { name: 'A', description: '', roleId: 'r1', departmentId: 'd1' })
    await service.create('p1', { name: 'B', description: '', roleId: 'r1', departmentId: 'd1' })
    await service.create('p2', { name: 'C', description: '', roleId: 'r2', departmentId: 'd2' })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', {
      name: 'Bot',
      description: '',
      roleId: 'r1',
      departmentId: 'd1',
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('Bot')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', {
      name: 'Old',
      description: '',
      roleId: 'r1',
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
      roleId: 'r1',
      departmentId: 'd1',
    })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
