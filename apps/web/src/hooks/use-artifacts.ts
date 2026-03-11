import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateArtifactDto, UpdateArtifactDto } from '@the-crew/shared-types'
import { artifactsApi } from '@/api/artifacts'

function artifactsKey(projectId: string) {
  return ['projects', projectId, 'artifacts'] as const
}

export function useArtifacts(projectId: string) {
  return useQuery({
    queryKey: artifactsKey(projectId),
    queryFn: () => artifactsApi.list(projectId),
  })
}

export function useCreateArtifact(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateArtifactDto) => artifactsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactsKey(projectId) })
    },
  })
}

export function useUpdateArtifact(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateArtifactDto }) =>
      artifactsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactsKey(projectId) })
    },
  })
}

export function useDeleteArtifact(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => artifactsApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactsKey(projectId) })
    },
  })
}
