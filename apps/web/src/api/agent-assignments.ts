import type {
  AgentAssignmentDto,
  CreateAgentAssignmentDto,
  UpdateAgentAssignmentDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const agentAssignmentsApi = {
  list(projectId: string): Promise<AgentAssignmentDto[]> {
    return apiClient.get(`/projects/${projectId}/agent-assignments`)
  },

  get(projectId: string, id: string): Promise<AgentAssignmentDto> {
    return apiClient.get(`/projects/${projectId}/agent-assignments/${id}`)
  },

  create(projectId: string, dto: CreateAgentAssignmentDto): Promise<AgentAssignmentDto> {
    return apiClient.post(`/projects/${projectId}/agent-assignments`, dto)
  },

  update(projectId: string, id: string, dto: UpdateAgentAssignmentDto): Promise<AgentAssignmentDto> {
    return apiClient.patch(`/projects/${projectId}/agent-assignments/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/agent-assignments/${id}`)
  },
}
