import type {
  PolicyDto,
  CreatePolicyDto,
  UpdatePolicyDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const policiesApi = {
  list(projectId: string): Promise<PolicyDto[]> {
    return apiClient.get(`/projects/${projectId}/policies`)
  },

  get(projectId: string, id: string): Promise<PolicyDto> {
    return apiClient.get(`/projects/${projectId}/policies/${id}`)
  },

  create(projectId: string, dto: CreatePolicyDto): Promise<PolicyDto> {
    return apiClient.post(`/projects/${projectId}/policies`, dto)
  },

  update(projectId: string, id: string, dto: UpdatePolicyDto): Promise<PolicyDto> {
    return apiClient.patch(`/projects/${projectId}/policies/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/policies/${id}`)
  },
}
