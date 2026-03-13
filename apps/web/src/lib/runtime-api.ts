import { apiClient } from './api-client'
import type {
  RuntimeStatusResponse,
  NodeRuntimeStatusDto,
  RuntimeExecutionDto,
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
  RuntimeEventDto,
  CreateRuntimeEventDto,
  CostSummaryDto,
} from '@the-crew/shared-types'

export const runtimeApi = {
  getStatus(projectId: string): Promise<RuntimeStatusResponse> {
    return apiClient.get(`/projects/${projectId}/runtime/status`)
  },

  getNodeStatus(projectId: string, entityId: string, entityType?: string): Promise<NodeRuntimeStatusDto> {
    const params = entityType ? `?entityType=${entityType}` : ''
    return apiClient.get(`/projects/${projectId}/runtime/status/${entityId}${params}`)
  },

  listExecutions(projectId: string): Promise<RuntimeExecutionDto[]> {
    return apiClient.get(`/projects/${projectId}/runtime/executions`)
  },

  getExecution(projectId: string, executionId: string): Promise<RuntimeExecutionDto> {
    return apiClient.get(`/projects/${projectId}/runtime/executions/${executionId}`)
  },

  createExecution(projectId: string, dto: CreateRuntimeExecutionDto): Promise<RuntimeExecutionDto> {
    return apiClient.post(`/projects/${projectId}/runtime/executions`, dto)
  },

  updateExecution(projectId: string, executionId: string, dto: UpdateRuntimeExecutionDto): Promise<RuntimeExecutionDto> {
    return apiClient.patch(`/projects/${projectId}/runtime/executions/${executionId}`, dto)
  },

  listEvents(projectId: string, params?: { limit?: number; offset?: number; executionId?: string; entityId?: string }): Promise<RuntimeEventDto[]> {
    const qs = new URLSearchParams()
    if (params?.limit) qs.append('limit', String(params.limit))
    if (params?.offset) qs.append('offset', String(params.offset))
    if (params?.executionId) qs.append('executionId', params.executionId)
    if (params?.entityId) qs.append('entityId', params.entityId)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiClient.get(`/projects/${projectId}/runtime/events${suffix}`)
  },

  createEvent(projectId: string, dto: CreateRuntimeEventDto): Promise<RuntimeEventDto> {
    return apiClient.post(`/projects/${projectId}/runtime/events`, dto)
  },

  getCostSummary(projectId: string): Promise<CostSummaryDto> {
    return apiClient.get(`/projects/${projectId}/runtime/cost-summary`)
  },

  /** SSE stream URL for EventSource */
  getStreamUrl(projectId: string, scope?: string, entityId?: string): string {
    const qs = new URLSearchParams()
    if (scope) qs.append('scope', scope)
    if (entityId) qs.append('entityId', entityId)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return `/api/projects/${projectId}/runtime/events/stream${suffix}`
  },
}
