import { apiClient } from '../lib/api-client'
import type {
  OperationsStatusDto,
  WorkflowRunDto,
  CreateWorkflowRunDto,
  UpdateWorkflowRunDto,
  StageExecutionDto,
  StageExecutionStatus,
  IncidentDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  ContractComplianceDto,
  CreateContractComplianceDto,
  UpdateContractComplianceDto,
  ScopeType,
} from '@the-crew/shared-types'

export const operationsApi = {
  // Aggregated status
  getStatus(projectId: string, scopeType: ScopeType, entityId?: string): Promise<OperationsStatusDto> {
    const params = new URLSearchParams({ scopeType })
    if (entityId) params.append('entityId', entityId)
    return apiClient.get(`/projects/${projectId}/operations/status?${params.toString()}`)
  },

  // Workflow runs
  listRuns(projectId: string, workflowId?: string): Promise<WorkflowRunDto[]> {
    const qs = workflowId ? `?workflowId=${workflowId}` : ''
    return apiClient.get(`/projects/${projectId}/operations/runs${qs}`)
  },

  createRun(projectId: string, dto: CreateWorkflowRunDto): Promise<WorkflowRunDto> {
    return apiClient.post(`/projects/${projectId}/operations/runs`, dto)
  },

  updateRun(projectId: string, runId: string, dto: UpdateWorkflowRunDto): Promise<WorkflowRunDto> {
    return apiClient.patch(`/projects/${projectId}/operations/runs/${runId}`, dto)
  },

  advanceStage(
    projectId: string,
    runId: string,
    stageIndex: number,
    status: StageExecutionStatus,
    blockReason?: string | null,
  ): Promise<StageExecutionDto> {
    return apiClient.post(
      `/projects/${projectId}/operations/runs/${runId}/stages/${stageIndex}/advance`,
      { status, blockReason },
    )
  },

  // Incidents
  listIncidents(projectId: string, entityType?: string, entityId?: string): Promise<IncidentDto[]> {
    const params = new URLSearchParams()
    if (entityType) params.append('entityType', entityType)
    if (entityId) params.append('entityId', entityId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get(`/projects/${projectId}/operations/incidents${qs}`)
  },

  createIncident(projectId: string, dto: CreateIncidentDto): Promise<IncidentDto> {
    return apiClient.post(`/projects/${projectId}/operations/incidents`, dto)
  },

  updateIncident(projectId: string, incidentId: string, dto: UpdateIncidentDto): Promise<IncidentDto> {
    return apiClient.patch(`/projects/${projectId}/operations/incidents/${incidentId}`, dto)
  },

  resolveIncident(projectId: string, incidentId: string): Promise<IncidentDto> {
    return apiClient.post(`/projects/${projectId}/operations/incidents/${incidentId}/resolve`, {})
  },

  // Compliance
  listCompliances(projectId: string): Promise<ContractComplianceDto[]> {
    return apiClient.get(`/projects/${projectId}/operations/compliance`)
  },

  setCompliance(projectId: string, dto: CreateContractComplianceDto): Promise<ContractComplianceDto> {
    return apiClient.post(`/projects/${projectId}/operations/compliance`, dto)
  },

  updateCompliance(projectId: string, complianceId: string, dto: UpdateContractComplianceDto): Promise<ContractComplianceDto> {
    return apiClient.patch(`/projects/${projectId}/operations/compliance/${complianceId}`, dto)
  },
}
