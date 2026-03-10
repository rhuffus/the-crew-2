import type {
  ReleaseDto,
  CreateReleaseDto,
  UpdateReleaseDto,
  ReleaseDiffDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const releasesApi = {
  list(projectId: string): Promise<ReleaseDto[]> {
    return apiClient.get(`/projects/${projectId}/releases`)
  },

  get(projectId: string, id: string): Promise<ReleaseDto> {
    return apiClient.get(`/projects/${projectId}/releases/${id}`)
  },

  create(projectId: string, dto: CreateReleaseDto): Promise<ReleaseDto> {
    return apiClient.post(`/projects/${projectId}/releases`, dto)
  },

  update(projectId: string, id: string, dto: UpdateReleaseDto): Promise<ReleaseDto> {
    return apiClient.patch(`/projects/${projectId}/releases/${id}`, dto)
  },

  publish(projectId: string, id: string): Promise<ReleaseDto> {
    return apiClient.post(`/projects/${projectId}/releases/${id}/publish`, {})
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/releases/${id}`)
  },

  diff(projectId: string, baseId: string, compareId: string): Promise<ReleaseDiffDto> {
    return apiClient.get(`/projects/${projectId}/releases/${baseId}/diff/${compareId}`)
  },
}
