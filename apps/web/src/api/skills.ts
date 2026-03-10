import type {
  SkillDto,
  CreateSkillDto,
  UpdateSkillDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const skillsApi = {
  list(projectId: string): Promise<SkillDto[]> {
    return apiClient.get(`/projects/${projectId}/skills`)
  },

  get(projectId: string, id: string): Promise<SkillDto> {
    return apiClient.get(`/projects/${projectId}/skills/${id}`)
  },

  create(projectId: string, dto: CreateSkillDto): Promise<SkillDto> {
    return apiClient.post(`/projects/${projectId}/skills`, dto)
  },

  update(projectId: string, id: string, dto: UpdateSkillDto): Promise<SkillDto> {
    return apiClient.patch(`/projects/${projectId}/skills/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/skills/${id}`)
  },
}
