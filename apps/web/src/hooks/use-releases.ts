import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateReleaseDto, UpdateReleaseDto } from '@the-crew/shared-types'
import { releasesApi } from '@/api/releases'

function releasesKey(projectId: string) {
  return ['projects', projectId, 'releases'] as const
}

function releaseDiffKey(projectId: string, baseId: string, compareId: string) {
  return ['projects', projectId, 'releases', baseId, 'diff', compareId] as const
}

export function useReleases(projectId: string) {
  return useQuery({
    queryKey: releasesKey(projectId),
    queryFn: () => releasesApi.list(projectId),
  })
}

export function useCreateRelease(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateReleaseDto) => releasesApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesKey(projectId) })
    },
  })
}

export function useUpdateRelease(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReleaseDto }) =>
      releasesApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesKey(projectId) })
    },
  })
}

export function usePublishRelease(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => releasesApi.publish(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesKey(projectId) })
    },
  })
}

export function useDeleteRelease(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => releasesApi.remove(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releasesKey(projectId) })
    },
  })
}

export function useReleaseDiff(projectId: string, baseId: string | null, compareId: string | null) {
  return useQuery({
    queryKey: releaseDiffKey(projectId, baseId ?? '', compareId ?? ''),
    queryFn: () => releasesApi.diff(projectId, baseId!, compareId!),
    enabled: !!baseId && !!compareId && baseId !== compareId,
  })
}
