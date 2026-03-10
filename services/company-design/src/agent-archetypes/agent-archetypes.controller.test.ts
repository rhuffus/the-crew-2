import { describe, it, expect, beforeEach } from 'vitest'
import { AgentArchetypesController } from './agent-archetypes.controller'
import { AgentArchetypeService } from './application/agent-archetype.service'
import { InMemoryAgentArchetypeRepository } from './infra/in-memory-agent-archetype.repository'

describe('AgentArchetypesController', () => {
  let controller: AgentArchetypesController

  beforeEach(() => {
    const repo = new InMemoryAgentArchetypeRepository()
    const service = new AgentArchetypeService(repo)
    controller = new AgentArchetypesController(service)
  })

  it('should list empty archetypes', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', {
      name: 'Code Reviewer',
      description: 'Reviews PRs',
      roleId: 'r1',
      departmentId: 'd1',
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Code Reviewer')
  })

  it('should get an archetype', async () => {
    const created = await controller.create('p1', {
      name: 'Deployer',
      description: '',
      roleId: 'r1',
      departmentId: 'd1',
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Deployer')
  })

  it('should update an archetype', async () => {
    const created = await controller.create('p1', {
      name: 'Old',
      description: '',
      roleId: 'r1',
      departmentId: 'd1',
    })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete an archetype', async () => {
    const created = await controller.create('p1', {
      name: 'Temp',
      description: '',
      roleId: 'r1',
      departmentId: 'd1',
    })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
