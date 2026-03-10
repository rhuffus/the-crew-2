import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { AgentAssignmentService } from './agent-assignment.service'
import { InMemoryAgentAssignmentRepository } from '../infra/in-memory-agent-assignment.repository'

describe('AgentAssignmentService', () => {
  let service: AgentAssignmentService

  beforeEach(() => {
    const repo = new InMemoryAgentAssignmentRepository()
    service = new AgentAssignmentService(repo)
  })

  it('should list empty assignments', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create an assignment', async () => {
    const result = await service.create('p1', {
      archetypeId: 'a1',
      name: 'Primary Bot',
    })
    expect(result.name).toBe('Primary Bot')
    expect(result.projectId).toBe('p1')
    expect(result.archetypeId).toBe('a1')
    expect(result.status).toBe('active')
    expect(result.id).toBeDefined()
  })

  it('should list by project', async () => {
    await service.create('p1', { archetypeId: 'a1', name: 'A' })
    await service.create('p1', { archetypeId: 'a2', name: 'B' })
    await service.create('p2', { archetypeId: 'a3', name: 'C' })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', {
      archetypeId: 'a1',
      name: 'Bot',
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('Bot')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', {
      archetypeId: 'a1',
      name: 'Old',
    })
    const updated = await service.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should update status', async () => {
    const created = await service.create('p1', {
      archetypeId: 'a1',
      name: 'Bot',
    })
    const updated = await service.update(created.id, { status: 'inactive' })
    expect(updated.status).toBe('inactive')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', {
      archetypeId: 'a1',
      name: 'Temp',
    })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
