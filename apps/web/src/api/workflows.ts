import type {
  WorkflowDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const workflowsApi = {
  list(projectId: string): Promise<WorkflowDto[]> {
    return apiClient.get(`/projects/${projectId}/workflows`)
  },

  get(projectId: string, id: string): Promise<WorkflowDto> {
    return apiClient.get(`/projects/${projectId}/workflows/${id}`)
  },

  create(projectId: string, dto: CreateWorkflowDto): Promise<WorkflowDto> {
    return apiClient.post(`/projects/${projectId}/workflows`, dto)
  },

  update(projectId: string, id: string, dto: UpdateWorkflowDto): Promise<WorkflowDto> {
    return apiClient.patch(`/projects/${projectId}/workflows/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/workflows/${id}`)
  },
}
