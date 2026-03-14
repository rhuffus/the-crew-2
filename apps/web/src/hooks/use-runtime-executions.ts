import { useQuery } from '@tanstack/react-query'
import { runtimeApi } from '@/lib/runtime-api'

function executionsKey(projectId: string) {
  return ['runtime', 'executions', projectId] as const
}

function executionKey(projectId: string, executionId: string) {
  return ['runtime', 'executions', projectId, executionId] as const
}

function eventsKey(projectId: string, params?: { executionId?: string; entityId?: string }) {
  return ['runtime', 'events', projectId, params] as const
}

export function useRuntimeExecutions(projectId: string, options?: { enabled?: boolean; pollingInterval?: number }) {
  const enabled = options?.enabled !== false && !!projectId
  return useQuery({
    queryKey: executionsKey(projectId),
    queryFn: () => runtimeApi.listExecutions(projectId),
    enabled,
    refetchInterval: options?.pollingInterval,
  })
}

export function useRuntimeExecution(projectId: string, executionId: string | null) {
  return useQuery({
    queryKey: executionKey(projectId, executionId ?? ''),
    queryFn: () => runtimeApi.getExecution(projectId, executionId!),
    enabled: !!projectId && !!executionId,
  })
}

export function useRuntimeEvents(
  projectId: string,
  params?: { executionId?: string; entityId?: string; limit?: number },
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false && !!projectId
  return useQuery({
    queryKey: eventsKey(projectId, params),
    queryFn: () => runtimeApi.listEvents(projectId, params),
    enabled,
  })
}
