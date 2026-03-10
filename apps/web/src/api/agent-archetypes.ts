import type {
  AgentArchetypeDto,
  CreateAgentArchetypeDto,
  UpdateAgentArchetypeDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const agentArchetypesApi = {
  list(projectId: string): Promise<AgentArchetypeDto[]> {
    return apiClient.get(`/projects/${projectId}/agent-archetypes`)
  },

  get(projectId: string, id: string): Promise<AgentArchetypeDto> {
    return apiClient.get(`/projects/${projectId}/agent-archetypes/${id}`)
  },

  create(projectId: string, dto: CreateAgentArchetypeDto): Promise<AgentArchetypeDto> {
    return apiClient.post(`/projects/${projectId}/agent-archetypes`, dto)
  },

  update(projectId: string, id: string, dto: UpdateAgentArchetypeDto): Promise<AgentArchetypeDto> {
    return apiClient.patch(`/projects/${projectId}/agent-archetypes/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/agent-archetypes/${id}`)
  },
}
