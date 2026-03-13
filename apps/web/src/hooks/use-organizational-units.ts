import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationalUnitsApi } from '@/lib/organizational-units-api'
import type { CreateOrganizationalUnitDto, UpdateOrganizationalUnitDto } from '@the-crew/shared-types'

function uosKey(projectId: string) {
  return ['organizational-units', projectId] as const
}

function uoKey(projectId: string, id: string) {
  return ['organizational-units', projectId, id] as const
}

export function useOrganizationalUnits(projectId: string) {
  return useQuery({
    queryKey: uosKey(projectId),
    queryFn: () => organizationalUnitsApi.list(projectId),
    enabled: !!projectId,
  })
}

export function useOrganizationalUnit(projectId: string, id: string) {
  return useQuery({
    queryKey: uoKey(projectId, id),
    queryFn: () => organizationalUnitsApi.get(projectId, id),
    enabled: !!projectId && !!id,
  })
}

export function useCreateOrganizationalUnit(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateOrganizationalUnitDto) => organizationalUnitsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uosKey(projectId) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}

export function useUpdateOrganizationalUnit(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrganizationalUnitDto }) =>
      organizationalUnitsApi.update(projectId, id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: uosKey(projectId) })
      queryClient.invalidateQueries({ queryKey: uoKey(projectId, id) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}

export function useDeleteOrganizationalUnit(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizationalUnitsApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uosKey(projectId) })
      queryClient.invalidateQueries({ queryKey: ['visual-graph'] })
    },
  })
}
