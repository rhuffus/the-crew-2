import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateRoleDto, UpdateRoleDto } from '@the-crew/shared-types'
import { rolesApi } from '@/api/roles'

function rolesKey(projectId: string) {
  return ['projects', projectId, 'roles'] as const
}

export function useRoles(projectId: string) {
  return useQuery({
    queryKey: rolesKey(projectId),
    queryFn: () => rolesApi.list(projectId),
  })
}

export function useCreateRole(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRoleDto) => rolesApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKey(projectId) })
    },
  })
}

export function useUpdateRole(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      rolesApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKey(projectId) })
    },
  })
}

export function useDeleteRole(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKey(projectId) })
    },
  })
}
