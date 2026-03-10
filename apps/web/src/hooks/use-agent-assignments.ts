import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateAgentAssignmentDto, UpdateAgentAssignmentDto } from '@the-crew/shared-types'
import { agentAssignmentsApi } from '@/api/agent-assignments'

function agentAssignmentsKey(projectId: string) {
  return ['projects', projectId, 'agent-assignments'] as const
}

export function useAgentAssignments(projectId: string) {
  return useQuery({
    queryKey: agentAssignmentsKey(projectId),
    queryFn: () => agentAssignmentsApi.list(projectId),
  })
}

export function useCreateAgentAssignment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateAgentAssignmentDto) => agentAssignmentsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentAssignmentsKey(projectId) })
    },
  })
}

export function useUpdateAgentAssignment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAgentAssignmentDto }) =>
      agentAssignmentsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentAssignmentsKey(projectId) })
    },
  })
}

export function useDeleteAgentAssignment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => agentAssignmentsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentAssignmentsKey(projectId) })
    },
  })
}
