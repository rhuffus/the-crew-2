import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateDepartmentDto, UpdateDepartmentDto } from '@the-crew/shared-types'
import { departmentsApi } from '@/api/departments'

function departmentsKey(projectId: string) {
  return ['projects', projectId, 'departments'] as const
}

export function useDepartments(projectId: string) {
  return useQuery({
    queryKey: departmentsKey(projectId),
    queryFn: () => departmentsApi.list(projectId),
  })
}

export function useCreateDepartment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateDepartmentDto) => departmentsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsKey(projectId) })
    },
  })
}

export function useUpdateDepartment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepartmentDto }) =>
      departmentsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsKey(projectId) })
    },
  })
}

export function useDeleteDepartment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => departmentsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsKey(projectId) })
    },
  })
}
