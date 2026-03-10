import { describe, it, expect, beforeEach } from 'vitest'
import { AgentAssignmentsController } from './agent-assignments.controller'
import { AgentAssignmentService } from './application/agent-assignment.service'
import { InMemoryAgentAssignmentRepository } from './infra/in-memory-agent-assignment.repository'

describe('AgentAssignmentsController', () => {
  let controller: AgentAssignmentsController

  beforeEach(() => {
    const repo = new InMemoryAgentAssignmentRepository()
    const service = new AgentAssignmentService(repo)
    controller = new AgentAssignmentsController(service)
  })

  it('should list empty assignments', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', {
      archetypeId: 'a1',
      name: 'Primary Bot',
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Primary Bot')
  })

  it('should get an assignment', async () => {
    const created = await controller.create('p1', {
      archetypeId: 'a1',
      name: 'Deployer',
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Deployer')
  })

  it('should update an assignment', async () => {
    const created = await controller.create('p1', {
      archetypeId: 'a1',
      name: 'Old',
    })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete an assignment', async () => {
    const created = await controller.create('p1', {
      archetypeId: 'a1',
      name: 'Temp',
    })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
