import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { SavedViewService } from './saved-view.service'
import { InMemorySavedViewRepository } from '../infra/in-memory-saved-view.repository'

describe('SavedViewService', () => {
  let service: SavedViewService

  beforeEach(() => {
    const repo = new InMemorySavedViewRepository()
    service = new SavedViewService(repo)
  })

  it('should list empty views', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a saved view', async () => {
    const result = await service.create('p1', {
      name: 'My View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    expect(result.name).toBe('My View')
    expect(result.projectId).toBe('p1')
    expect(result.state.activeLayers).toEqual(['organization'])
    expect(result.id).toBeDefined()
  })

  it('should list by project', async () => {
    await service.create('p1', {
      name: 'A',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    await service.create('p1', {
      name: 'B',
      state: { activeLayers: ['capabilities'], nodeTypeFilter: null, statusFilter: null },
    })
    await service.create('p2', {
      name: 'C',
      state: { activeLayers: ['workflows'], nodeTypeFilter: null, statusFilter: null },
    })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', {
      name: 'View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    const found = await service.get(created.id)
    expect(found.name).toBe('View')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update name', async () => {
    const created = await service.create('p1', {
      name: 'Old',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    const updated = await service.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should update state', async () => {
    const created = await service.create('p1', {
      name: 'View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    const updated = await service.update(created.id, {
      state: { activeLayers: ['workflows'], nodeTypeFilter: ['workflow'], statusFilter: null },
    })
    expect(updated.state.activeLayers).toEqual(['workflows'])
    expect(updated.state.nodeTypeFilter).toEqual(['workflow'])
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { name: 'Y' })).rejects.toThrow(NotFoundException)
  })

  it('should remove', async () => {
    const created = await service.create('p1', {
      name: 'Temp',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })
})
