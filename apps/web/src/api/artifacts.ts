import type {
  ArtifactDto,
  CreateArtifactDto,
  UpdateArtifactDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const artifactsApi = {
  list(projectId: string): Promise<ArtifactDto[]> {
    return apiClient.get(`/projects/${projectId}/artifacts`)
  },

  get(projectId: string, id: string): Promise<ArtifactDto> {
    return apiClient.get(`/projects/${projectId}/artifacts/${id}`)
  },

  create(projectId: string, dto: CreateArtifactDto): Promise<ArtifactDto> {
    return apiClient.post(`/projects/${projectId}/artifacts`, dto)
  },

  update(projectId: string, id: string, dto: UpdateArtifactDto): Promise<ArtifactDto> {
    return apiClient.patch(`/projects/${projectId}/artifacts/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/artifacts/${id}`)
  },
}
