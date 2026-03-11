import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ArtifactsController } from './artifacts.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listArtifacts: vi.fn(),
  getArtifact: vi.fn(),
  createArtifact: vi.fn(),
  updateArtifact: vi.fn(),
  deleteArtifact: vi.fn(),
}

describe('ArtifactsController (gateway)', () => {
  let controller: ArtifactsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ArtifactsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list artifacts', async () => {
    mockClient.listArtifacts.mockResolvedValue([{ id: '1', name: 'Spec' }])
    const result = await controller.list('p1')
    expect(result).toEqual([{ id: '1', name: 'Spec' }])
    expect(mockClient.listArtifacts).toHaveBeenCalledWith('p1')
  })

  it('should get an artifact', async () => {
    mockClient.getArtifact.mockResolvedValue({ id: '1', name: 'Spec' })
    const result = await controller.get('1', 'p1')
    expect(result).toEqual({ id: '1', name: 'Spec' })
  })

  it('should create an artifact', async () => {
    const dto = { name: 'Spec', description: 'API Spec', type: 'document' as const }
    mockClient.createArtifact.mockResolvedValue({ id: '1', ...dto })
    const result = await controller.create('p1', dto)
    expect(result).toEqual({ id: '1', ...dto })
  })

  it('should update an artifact', async () => {
    mockClient.updateArtifact.mockResolvedValue({ id: '1', name: 'Updated' })
    const result = await controller.update('1', 'p1', { name: 'Updated' })
    expect(result).toEqual({ id: '1', name: 'Updated' })
  })

  it('should delete an artifact', async () => {
    mockClient.deleteArtifact.mockResolvedValue(undefined)
    await controller.remove('1', 'p1')
    expect(mockClient.deleteArtifact).toHaveBeenCalledWith('1', 'p1')
  })
})
