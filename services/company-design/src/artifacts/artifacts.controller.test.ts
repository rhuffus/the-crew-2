import { describe, it, expect, beforeEach } from 'vitest'
import { ArtifactsController } from './artifacts.controller'
import { ArtifactService } from './application/artifact.service'
import { InMemoryArtifactRepository } from './infra/in-memory-artifact.repository'

describe('ArtifactsController', () => {
  let controller: ArtifactsController

  beforeEach(() => {
    const repo = new InMemoryArtifactRepository()
    const service = new ArtifactService(repo)
    controller = new ArtifactsController(service)
  })

  it('should list empty artifacts', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', {
      name: 'API Spec',
      description: 'API specification',
      type: 'document',
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('API Spec')
  })

  it('should get an artifact', async () => {
    const created = await controller.create('p1', {
      name: 'Report',
      description: 'Monthly',
      type: 'deliverable',
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('Report')
  })

  it('should update an artifact', async () => {
    const created = await controller.create('p1', {
      name: 'Old',
      description: '',
      type: 'document',
    })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete an artifact', async () => {
    const created = await controller.create('p1', {
      name: 'Temp',
      description: '',
      type: 'template',
    })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
