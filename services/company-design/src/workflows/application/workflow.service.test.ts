import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { WorkflowService } from './workflow.service'
import { InMemoryWorkflowRepository } from '../infra/in-memory-workflow.repository'

const baseDto = {
  name: 'Onboarding Flow',
  description: 'New hire onboarding process',
}

describe('WorkflowService', () => {
  let service: WorkflowService

  beforeEach(() => {
    const repo = new InMemoryWorkflowRepository()
    service = new WorkflowService(repo)
  })

  it('should list empty workflows', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a workflow', async () => {
    const result = await service.create('p1', baseDto)
    expect(result.name).toBe('Onboarding Flow')
    expect(result.projectId).toBe('p1')
    expect(result.status).toBe('draft')
    expect(result.stages).toEqual([])
    expect(result.participants).toEqual([])
    expect(result.contractIds).toEqual([])
  })

  it('should create with stages and participants', async () => {
    const result = await service.create('p1', {
      ...baseDto,
      stages: [{ name: 'Setup', order: 1, description: 'Account setup' }],
      participants: [{ participantId: 'd1', participantType: 'department', responsibility: 'Owns' }],
      contractIds: ['c1'],
    })
    expect(result.stages).toHaveLength(1)
    expect(result.participants).toHaveLength(1)
    expect(result.contractIds).toEqual(['c1'])
  })

  it('should list by project', async () => {
    await service.create('p1', baseDto)
    await service.create('p1', { ...baseDto, name: 'Another' })
    await service.create('p2', { ...baseDto, name: 'Other project' })
    expect(await service.list('p1')).toHaveLength(2)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', baseDto)
    const found = await service.get(created.id)
    expect(found.name).toBe('Onboarding Flow')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update', async () => {
    const created = await service.create('p1', {
      ...baseDto,
      stages: [{ name: 'Step 1', order: 1, description: '' }],
    })
    const updated = await service.update(created.id, {
      name: 'Updated Flow',
      status: 'active',
    })
    expect(updated.name).toBe('Updated Flow')
    expect(updated.status).toBe('active')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', baseDto)
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
