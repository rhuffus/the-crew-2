import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReleasesController } from './releases.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listReleases: vi.fn(),
  getRelease: vi.fn(),
  createRelease: vi.fn(),
  updateRelease: vi.fn(),
  publishRelease: vi.fn(),
  deleteRelease: vi.fn(),
  diffReleases: vi.fn(),
}

describe('ReleasesController (gateway)', () => {
  let controller: ReleasesController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ReleasesController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list releases', async () => {
    mockClient.listReleases.mockResolvedValue([{ id: '1', version: 'v1.0' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', version: 'v1.0' }])
    expect(mockClient.listReleases).toHaveBeenCalledWith('p1')
  })

  it('should get a release', async () => {
    mockClient.getRelease.mockResolvedValue({ id: '1', version: 'v1.0' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', version: 'v1.0' })
  })

  it('should create a release', async () => {
    const dto = { version: 'v1.0', notes: 'Initial release' }
    mockClient.createRelease.mockResolvedValue({ id: '1', ...dto, status: 'draft' })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto, status: 'draft' })
  })

  it('should update a release', async () => {
    mockClient.updateRelease.mockResolvedValue({ id: '1', version: 'v1.1' })
    const result = await controller.update('1', 'p1', { version: 'v1.1' })
    expect(result).toEqual({ id: '1', version: 'v1.1' })
  })

  it('should publish a release', async () => {
    mockClient.publishRelease.mockResolvedValue({ id: '1', status: 'published' })
    const result = await controller.publish('1', 'p1')
    expect(result).toEqual({ id: '1', status: 'published' })
  })

  it('should diff two releases', async () => {
    const diffResult = { baseReleaseId: '1', compareReleaseId: '2', changes: [], summary: { added: 0, removed: 0, modified: 0 } }
    mockClient.diffReleases.mockResolvedValue(diffResult)
    const result = await controller.diff('1', '2', 'p1')
    expect(result).toEqual(diffResult)
    expect(mockClient.diffReleases).toHaveBeenCalledWith('1', '2', 'p1')
  })

  it('should delete a release', async () => {
    mockClient.deleteRelease.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteRelease).toHaveBeenCalledWith('1', 'p1')
  })
})
