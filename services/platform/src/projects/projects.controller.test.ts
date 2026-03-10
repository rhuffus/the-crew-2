import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectsController } from './projects.controller'
import { ProjectService } from './application/project.service'
import { InMemoryProjectRepository } from './infra/in-memory-project.repository'

describe('ProjectsController', () => {
  let controller: ProjectsController

  beforeEach(() => {
    const repo = new InMemoryProjectRepository()
    const service = new ProjectService(repo)
    controller = new ProjectsController(service)
  })

  it('should list empty projects', async () => {
    const result = await controller.list()
    expect(result).toEqual([])
  })

  it('should create and get a project', async () => {
    const created = await controller.create({ name: 'Test', description: 'desc' })
    expect(created.name).toBe('Test')

    const found = await controller.get(created.id)
    expect(found.name).toBe('Test')
  })

  it('should update a project', async () => {
    const created = await controller.create({ name: 'Old', description: '' })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })
})
