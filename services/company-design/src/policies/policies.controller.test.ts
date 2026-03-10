import { describe, it, expect, beforeEach } from 'vitest'
import { PoliciesController } from './policies.controller'
import { PolicyService } from './application/policy.service'
import { InMemoryPolicyRepository } from './infra/in-memory-policy.repository'

const baseDto = {
  name: 'Approval required',
  description: 'Changes require manager approval',
  scope: 'global' as const,
  type: 'approval-gate' as const,
  condition: 'Manager must approve before publish',
  enforcement: 'mandatory' as const,
}

describe('PoliciesController', () => {
  let controller: PoliciesController

  beforeEach(() => {
    const repo = new InMemoryPolicyRepository()
    const service = new PolicyService(repo)
    controller = new PoliciesController(service)
  })

  it('should list empty policies', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', baseDto)
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Approval required')
  })

  it('should get a policy', async () => {
    const created = await controller.create('p1', baseDto)
    const found = await controller.get(created.id)
    expect(found.name).toBe('Approval required')
  })

  it('should update a policy', async () => {
    const created = await controller.create('p1', baseDto)
    const updated = await controller.update(created.id, { name: 'Updated' })
    expect(updated.name).toBe('Updated')
  })

  it('should delete a policy', async () => {
    const created = await controller.create('p1', baseDto)
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
