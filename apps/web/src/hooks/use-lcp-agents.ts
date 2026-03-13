import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lcpAgentsApi } from '@/lib/lcp-agents-api'
import type { CreateLcpAgentDto, UpdateLcpAgentDto } from '@the-crew/shared-types'

function agentsKey(projectId: string) {
  return ['lcp-agents', projectId] as const
}

function agentKey(projectId: string, id: string) {
  return ['lcp-agents', projectId, id] as const
}

export function useLcpAgents(projectId: string) {
  return useQuery({
    queryKey: agentsKey(projectId),
    queryFn: () => lcpAgentsApi.list(projectId),
    enabled: !!projectId,
  })
}

export function useLcpAgent(projectId: string, id: string) {
  return useQuery({
    queryKey: agentKey(projectId, id),
    queryFn: () => lcpAgentsApi.get(projectId, id),
    enabled: !!projectId && !!id,
  })
}

export function useCreateLcpAgent(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateLcpAgentDto) => lcpAgentsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentsKey(projectId) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}

export function useUpdateLcpAgent(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLcpAgentDto }) =>
      lcpAgentsApi.update(projectId, id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentsKey(projectId) })
      queryClient.invalidateQueries({ queryKey: agentKey(projectId, id) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}

export function useDeleteLcpAgent(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lcpAgentsApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentsKey(projectId) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}
