import { describe, it, expect, beforeEach } from 'vitest'
import { SavedViewsController } from './saved-views.controller'
import { SavedViewService } from './application/saved-view.service'
import { InMemorySavedViewRepository } from './infra/in-memory-saved-view.repository'

describe('SavedViewsController', () => {
  let controller: SavedViewsController

  beforeEach(() => {
    const repo = new InMemorySavedViewRepository()
    const service = new SavedViewService(repo)
    controller = new SavedViewsController(service)
  })

  it('should list empty views', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', {
      name: 'My View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('My View')
  })

  it('should get a saved view', async () => {
    const created = await controller.create('p1', {
      name: 'View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    const found = await controller.get(created.id)
    expect(found.name).toBe('View')
  })

  it('should update a saved view', async () => {
    const created = await controller.create('p1', {
      name: 'Old',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    const updated = await controller.update(created.id, { name: 'New' })
    expect(updated.name).toBe('New')
  })

  it('should delete a saved view', async () => {
    const created = await controller.create('p1', {
      name: 'Temp',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })
})
