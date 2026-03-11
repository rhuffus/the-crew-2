import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { operationsApi } from '../api/operations'
import type {
  ScopeType,
  CreateWorkflowRunDto,
  UpdateWorkflowRunDto,
  StageExecutionStatus,
  CreateIncidentDto,
  UpdateIncidentDto,
  CreateContractComplianceDto,
  UpdateContractComplianceDto,
} from '@the-crew/shared-types'

// --- Query Keys ---

function statusKey(projectId: string, scopeType: ScopeType, entityId?: string) {
  return ['operations', 'status', projectId, scopeType, entityId] as const
}

function runsKey(projectId: string, workflowId?: string) {
  return ['operations', 'runs', projectId, workflowId] as const
}

function incidentsKey(projectId: string, entityType?: string, entityId?: string) {
  return ['operations', 'incidents', projectId, entityType, entityId] as const
}

function complianceKey(projectId: string) {
  return ['operations', 'compliance', projectId] as const
}

// --- Aggregated Status (with polling) ---

export function useOperationsStatus(
  projectId: string,
  scopeType: ScopeType,
  entityId?: string,
  options?: { enabled?: boolean; pollingInterval?: number },
) {
  const enabled = options?.enabled !== false && !!projectId
  const pollingInterval = options?.pollingInterval ?? 30_000

  return useQuery({
    queryKey: statusKey(projectId, scopeType, entityId),
    queryFn: () => operationsApi.getStatus(projectId, scopeType, entityId),
    enabled,
    refetchInterval: enabled ? pollingInterval : false,
  })
}

// --- Workflow Runs ---

export function useWorkflowRuns(projectId: string, workflowId?: string) {
  return useQuery({
    queryKey: runsKey(projectId, workflowId),
    queryFn: () => operationsApi.listRuns(projectId, workflowId),
    enabled: !!projectId,
  })
}

export function useCreateWorkflowRun(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateWorkflowRunDto) => operationsApi.createRun(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'runs', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

export function useUpdateWorkflowRun(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ runId, dto }: { runId: string; dto: UpdateWorkflowRunDto }) =>
      operationsApi.updateRun(projectId, runId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'runs', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

export function useAdvanceStage(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      runId,
      stageIndex,
      status,
      blockReason,
    }: {
      runId: string
      stageIndex: number
      status: StageExecutionStatus
      blockReason?: string | null
    }) => operationsApi.advanceStage(projectId, runId, stageIndex, status, blockReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'runs', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

// --- Incidents ---

export function useIncidents(projectId: string, entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: incidentsKey(projectId, entityType, entityId),
    queryFn: () => operationsApi.listIncidents(projectId, entityType, entityId),
    enabled: !!projectId,
  })
}

export function useCreateIncident(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateIncidentDto) => operationsApi.createIncident(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'incidents', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

export function useUpdateIncident(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ incidentId, dto }: { incidentId: string; dto: UpdateIncidentDto }) =>
      operationsApi.updateIncident(projectId, incidentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'incidents', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

export function useResolveIncident(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incidentId: string) => operationsApi.resolveIncident(projectId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'incidents', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

// --- Contract Compliance ---

export function useContractCompliances(projectId: string) {
  return useQuery({
    queryKey: complianceKey(projectId),
    queryFn: () => operationsApi.listCompliances(projectId),
    enabled: !!projectId,
  })
}

export function useSetCompliance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateContractComplianceDto) => operationsApi.setCompliance(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'compliance', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}

export function useUpdateCompliance(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ complianceId, dto }: { complianceId: string; dto: UpdateContractComplianceDto }) =>
      operationsApi.updateCompliance(projectId, complianceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'compliance', projectId] })
      queryClient.invalidateQueries({ queryKey: ['operations', 'status', projectId] })
    },
  })
}
