import type {
  CapabilityDto,
  CreateCapabilityDto,
  UpdateCapabilityDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const capabilitiesApi = {
  list(projectId: string): Promise<CapabilityDto[]> {
    return apiClient.get(`/projects/${projectId}/capabilities`)
  },

  get(projectId: string, id: string): Promise<CapabilityDto> {
    return apiClient.get(`/projects/${projectId}/capabilities/${id}`)
  },

  create(projectId: string, dto: CreateCapabilityDto): Promise<CapabilityDto> {
    return apiClient.post(`/projects/${projectId}/capabilities`, dto)
  },

  update(projectId: string, id: string, dto: UpdateCapabilityDto): Promise<CapabilityDto> {
    return apiClient.patch(`/projects/${projectId}/capabilities/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/capabilities/${id}`)
  },
}
