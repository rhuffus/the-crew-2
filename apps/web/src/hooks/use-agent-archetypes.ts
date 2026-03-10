import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateAgentArchetypeDto, UpdateAgentArchetypeDto } from '@the-crew/shared-types'
import { agentArchetypesApi } from '@/api/agent-archetypes'

function agentArchetypesKey(projectId: string) {
  return ['projects', projectId, 'agent-archetypes'] as const
}

export function useAgentArchetypes(projectId: string) {
  return useQuery({
    queryKey: agentArchetypesKey(projectId),
    queryFn: () => agentArchetypesApi.list(projectId),
  })
}

export function useCreateAgentArchetype(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateAgentArchetypeDto) => agentArchetypesApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentArchetypesKey(projectId) })
    },
  })
}

export function useUpdateAgentArchetype(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAgentArchetypeDto }) =>
      agentArchetypesApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentArchetypesKey(projectId) })
    },
  })
}

export function useDeleteAgentArchetype(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => agentArchetypesApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentArchetypesKey(projectId) })
    },
  })
}
