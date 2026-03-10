import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreatePolicyDto, UpdatePolicyDto } from '@the-crew/shared-types'
import { policiesApi } from '@/api/policies'

function policiesKey(projectId: string) {
  return ['projects', projectId, 'policies'] as const
}

export function usePolicies(projectId: string) {
  return useQuery({
    queryKey: policiesKey(projectId),
    queryFn: () => policiesApi.list(projectId),
  })
}

export function useCreatePolicy(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePolicyDto) => policiesApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesKey(projectId) })
    },
  })
}

export function useUpdatePolicy(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePolicyDto }) =>
      policiesApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesKey(projectId) })
    },
  })
}

export function useDeletePolicy(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => policiesApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesKey(projectId) })
    },
  })
}
