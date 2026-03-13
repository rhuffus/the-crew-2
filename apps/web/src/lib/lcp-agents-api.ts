import { apiClient } from './api-client'
import type {
  LcpAgentDto,
  CreateLcpAgentDto,
  UpdateLcpAgentDto,
} from '@the-crew/shared-types'

export const lcpAgentsApi = {
  list(projectId: string): Promise<LcpAgentDto[]> {
    return apiClient.get(`/projects/${projectId}/lcp-agents`)
  },

  get(projectId: string, id: string): Promise<LcpAgentDto> {
    return apiClient.get(`/projects/${projectId}/lcp-agents/${id}`)
  },

  create(projectId: string, dto: CreateLcpAgentDto): Promise<LcpAgentDto> {
    return apiClient.post(`/projects/${projectId}/lcp-agents`, dto)
  },

  update(projectId: string, id: string, dto: UpdateLcpAgentDto): Promise<LcpAgentDto> {
    return apiClient.patch(`/projects/${projectId}/lcp-agents/${id}`, dto)
  },

  delete(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/lcp-agents/${id}`)
  },
}
