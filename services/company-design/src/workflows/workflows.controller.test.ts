import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowsController } from './workflows.controller'
import { WorkflowService } from './application/workflow.service'
import { InMemoryWorkflowRepository } from './infra/in-memory-workflow.repository'

const baseDto = {
  name: 'Deploy Pipeline',
  description: 'CI/CD deployment workflow',
}

describe('WorkflowsController', () => {
  let controller: WorkflowsController

  beforeEach(() => {
    const repo = new InMemoryWorkflowRepository()
    const service = new WorkflowService(repo)
    controller = new WorkflowsController(service)
  })

  it('should list empty workflows', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', baseDto)
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Deploy Pipeline')
  })

  it('should get a workflow', async () => {
    const created = await controller.create('p1', baseDto)
    const found = await controller.get(created.id)
    expect(found.name).toBe('Deploy Pipeline')
  })

  it('should update a workflow', async () => {
    const created = await controller.create('p1', baseDto)
    const updated = await controller.update(created.id, { name: 'Updated Pipeline' })
    expect(updated.name).toBe('Updated Pipeline')
  })

  it('should delete a workflow', async () => {
    const created = await controller.create('p1', baseDto)
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
