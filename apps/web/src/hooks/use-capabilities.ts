import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateCapabilityDto, UpdateCapabilityDto } from '@the-crew/shared-types'
import { capabilitiesApi } from '@/api/capabilities'

function capabilitiesKey(projectId: string) {
  return ['projects', projectId, 'capabilities'] as const
}

export function useCapabilities(projectId: string) {
  return useQuery({
    queryKey: capabilitiesKey(projectId),
    queryFn: () => capabilitiesApi.list(projectId),
  })
}

export function useCreateCapability(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCapabilityDto) => capabilitiesApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capabilitiesKey(projectId) })
    },
  })
}

export function useUpdateCapability(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCapabilityDto }) =>
      capabilitiesApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capabilitiesKey(projectId) })
    },
  })
}

export function useDeleteCapability(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => capabilitiesApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capabilitiesKey(projectId) })
    },
  })
}
