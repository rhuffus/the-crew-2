import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateSavedViewDto, UpdateSavedViewDto } from '@the-crew/shared-types'
import { savedViewsApi } from '@/api/saved-views'

function savedViewsKey(projectId: string) {
  return ['projects', projectId, 'saved-views'] as const
}

export function useSavedViews(projectId: string) {
  return useQuery({
    queryKey: savedViewsKey(projectId),
    queryFn: () => savedViewsApi.list(projectId),
    enabled: !!projectId,
  })
}

export function useCreateSavedView(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSavedViewDto) => savedViewsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewsKey(projectId) })
    },
  })
}

export function useUpdateSavedView(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSavedViewDto }) =>
      savedViewsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewsKey(projectId) })
    },
  })
}

export function useDeleteSavedView(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => savedViewsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewsKey(projectId) })
    },
  })
}
