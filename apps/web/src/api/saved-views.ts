import type {
  SavedViewDto,
  CreateSavedViewDto,
  UpdateSavedViewDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const savedViewsApi = {
  list(projectId: string): Promise<SavedViewDto[]> {
    return apiClient.get(`/projects/${projectId}/saved-views`)
  },

  create(projectId: string, dto: CreateSavedViewDto): Promise<SavedViewDto> {
    return apiClient.post(`/projects/${projectId}/saved-views`, dto)
  },

  update(projectId: string, id: string, dto: UpdateSavedViewDto): Promise<SavedViewDto> {
    return apiClient.patch(`/projects/${projectId}/saved-views/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/saved-views/${id}`)
  },
}
