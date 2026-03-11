import { describe, it, expect, beforeEach } from 'vitest'
import { BootstrapService } from './bootstrap.service'
import { InMemoryProjectRepository } from '../projects/infra/in-memory-project.repository'
import { Project } from '../projects/domain/project'
import {
  VERTICALER_PROJECT_ID,
  VERTICALER_PROJECT_NAME,
  VERTICALER_PROJECT_DESCRIPTION,
} from '@the-crew/shared-types'

describe('BootstrapService (platform)', () => {
  let service: BootstrapService
  let repo: InMemoryProjectRepository

  beforeEach(() => {
    repo = new InMemoryProjectRepository()
    service = new BootstrapService(repo)
  })

  it('should create Verticaler project when instance is empty', async () => {
    await service.onModuleInit()

    const projects = await repo.findAll()
    expect(projects).toHaveLength(1)

    const project = await repo.findById(VERTICALER_PROJECT_ID)
    expect(project).not.toBeNull()
    expect(project!.name).toBe(VERTICALER_PROJECT_NAME)
    expect(project!.description).toBe(VERTICALER_PROJECT_DESCRIPTION)
    expect(project!.status).toBe('active')
  })

  it('should skip bootstrap when projects already exist', async () => {
    const existing = Project.create({ id: 'other-id', name: 'Other', description: 'existing' })
    await repo.save(existing)

    await service.onModuleInit()

    const projects = await repo.findAll()
    expect(projects).toHaveLength(1)
    expect(projects[0]!.id).toBe('other-id')
  })

  it('should be idempotent — running twice produces the same state', async () => {
    await service.onModuleInit()
    await service.onModuleInit()

    const projects = await repo.findAll()
    expect(projects).toHaveLength(1)
    expect(projects[0]!.id).toBe(VERTICALER_PROJECT_ID)
  })

  it('should use deterministic project ID', async () => {
    await service.onModuleInit()

    const project = await repo.findById(VERTICALER_PROJECT_ID)
    expect(project).not.toBeNull()
    expect(project!.id).toBe(VERTICALER_PROJECT_ID)
  })
})
