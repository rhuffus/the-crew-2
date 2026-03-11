import { describe, it, expect, vi, beforeEach } from 'vitest'
import { permissionsApi } from '@/api/permissions'
import { apiClient } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('permissionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getManifest calls the correct endpoint', async () => {
    const mockManifest = {
      platformRole: 'platform:member',
      projectRole: 'project:editor',
      permissions: ['canvas:node:create'],
    }
    vi.mocked(apiClient.get).mockResolvedValue(mockManifest)

    const result = await permissionsApi.getManifest('proj-1')

    expect(apiClient.get).toHaveBeenCalledWith('/projects/proj-1/permissions')
    expect(result).toEqual(mockManifest)
  })
})
