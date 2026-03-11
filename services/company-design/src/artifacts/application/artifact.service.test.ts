import { describe, it, expect, beforeEach } from 'vitest'
import { ArtifactService } from './artifact.service'
import { InMemoryArtifactRepository } from '../infra/in-memory-artifact.repository'

describe('ArtifactService', () => {
  let service: ArtifactService

  beforeEach(() => {
    const repo = new InMemoryArtifactRepository()
    service = new ArtifactService(repo)
  })

  it('should list empty', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create an artifact', async () => {
    const result = await service.create('p1', {
      name: 'API Spec',
      description: 'API specification',
      type: 'document',
    })
    expect(result.name).toBe('API Spec')
    expect(result.type).toBe('document')
    expect(result.status).toBe('draft')
    expect(result.projectId).toBe('p1')
    expect(result.id).toBeDefined()
  })

  it('should create with producer and consumers', async () => {
    const result = await service.create('p1', {
      name: 'Report',
      description: 'Monthly report',
      type: 'deliverable',
      producerId: 'd1',
      producerType: 'department',
      consumerIds: ['d2', 'd3'],
      tags: ['monthly'],
    })
    expect(result.producerId).toBe('d1')
    expect(result.producerType).toBe('department')
    expect(result.consumerIds).toEqual(['d2', 'd3'])
    expect(result.tags).toEqual(['monthly'])
  })

  it('should get by id', async () => {
    const created = await service.create('p1', {
      name: 'Spec',
      description: 'A spec',
      type: 'document',
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('Spec')
  })

  it('should throw on get not found', async () => {
    await expect(service.get('nonexistent')).rejects.toThrow('Artifact nonexistent not found')
  })

  it('should list by project', async () => {
    await service.create('p1', { name: 'A', description: '', type: 'document' })
    await service.create('p1', { name: 'B', description: '', type: 'data' })
    await service.create('p2', { name: 'C', description: '', type: 'decision' })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should update', async () => {
    const created = await service.create('p1', { name: 'Old', description: '', type: 'document' })
    const updated = await service.update(created.id, { name: 'New', status: 'active' })
    expect(updated.name).toBe('New')
    expect(updated.status).toBe('active')
  })

  it('should throw on update not found', async () => {
    await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow('Artifact nonexistent not found')
  })

  it('should remove', async () => {
    const created = await service.create('p1', { name: 'Temp', description: '', type: 'template' })
    await service.remove(created.id)
    expect(await service.list('p1')).toHaveLength(0)
  })

  it('should throw on remove not found', async () => {
    await expect(service.remove('nonexistent')).rejects.toThrow('Artifact nonexistent not found')
  })

  it('should return ISO date strings', async () => {
    const result = await service.create('p1', { name: 'A', description: '', type: 'document' })
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
