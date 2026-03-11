import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SavedViewsController } from './saved-views.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listSavedViews: vi.fn(),
  createSavedView: vi.fn(),
  updateSavedView: vi.fn(),
  deleteSavedView: vi.fn(),
}

describe('SavedViewsController (gateway)', () => {
  let controller: SavedViewsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new SavedViewsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list saved views', async () => {
    mockClient.listSavedViews.mockResolvedValue([{ id: '1', name: 'My View' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'My View' }])
    expect(mockClient.listSavedViews).toHaveBeenCalledWith('p1')
  })

  it('should create a saved view', async () => {
    const dto = { name: 'My View', state: { activeLayers: ['organization' as const], nodeTypeFilter: null, statusFilter: null } }
    mockClient.createSavedView.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
    expect(mockClient.createSavedView).toHaveBeenCalledWith('p1', dto)
  })

  it('should update a saved view', async () => {
    mockClient.updateSavedView.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
    expect(mockClient.updateSavedView).toHaveBeenCalledWith('1', 'p1', { name: 'Updated' })
  })

  it('should delete a saved view', async () => {
    mockClient.deleteSavedView.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteSavedView).toHaveBeenCalledWith('1', 'p1')
  })
})
