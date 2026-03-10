import { describe, it, expect, beforeEach } from 'vitest'
import { SkillsController } from './skills.controller'
import { SkillService } from './application/skill.service'
import { InMemorySkillRepository } from './infra/in-memory-skill.repository'

describe('SkillsController', () => {
  let controller: SkillsController

  beforeEach(() => {
    const repo = new InMemorySkillRepository()
    const service = new SkillService(repo)
    controller = new SkillsController(service)
  })

  it('should list empty skills', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', {
      name: 'Code Review',
      description: 'Reviews code',
      category: 'Engineering',
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Code Review')
  })

  it('should get a skill', async () => {
    const created = await controller.create('p1', {
      name: 'Deploy',
      description: 'Deploys',
      category: 'DevOps',
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Deploy')
  })

  it('should update a skill', async () => {
    const created = await controller.create('p1', {
      name: 'Old',
      description: '',
      category: 'Cat',
    })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete a skill', async () => {
    const created = await controller.create('p1', {
      name: 'Temp',
      description: '',
      category: 'Cat',
    })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
