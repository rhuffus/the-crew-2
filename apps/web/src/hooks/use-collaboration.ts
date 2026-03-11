import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateReviewMarkerDto, UpdateReviewMarkerDto, AcquireLockDto } from '@the-crew/shared-types'
import { reviewsApi, locksApi } from '@/api/collaboration'

function reviewsKey(projectId: string) {
  return ['reviews', projectId] as const
}

function reviewByEntityKey(projectId: string, entityId: string) {
  return ['reviews', projectId, entityId] as const
}

function locksKey(projectId: string) {
  return ['locks', projectId] as const
}

function lockByEntityKey(projectId: string, entityId: string) {
  return ['locks', projectId, entityId] as const
}

// --- Reviews ---

export function useReviews(projectId: string) {
  return useQuery({
    queryKey: reviewsKey(projectId),
    queryFn: () => reviewsApi.list(projectId),
    enabled: !!projectId,
  })
}

export function useReviewByEntity(projectId: string, entityId: string | null) {
  return useQuery({
    queryKey: reviewByEntityKey(projectId, entityId ?? ''),
    queryFn: () => reviewsApi.getByEntity(projectId, entityId!),
    enabled: !!projectId && !!entityId,
  })
}

export function useCreateReview(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateReviewMarkerDto) => reviewsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', projectId] })
    },
  })
}

export function useUpdateReview(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReviewMarkerDto }) =>
      reviewsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', projectId] })
    },
  })
}

export function useDeleteReview(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => reviewsApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', projectId] })
    },
  })
}

// --- Locks ---

export function useLocks(projectId: string) {
  return useQuery({
    queryKey: locksKey(projectId),
    queryFn: () => locksApi.list(projectId),
    enabled: !!projectId,
  })
}

export function useLockByEntity(projectId: string, entityId: string | null) {
  return useQuery({
    queryKey: lockByEntityKey(projectId, entityId ?? ''),
    queryFn: () => locksApi.getByEntity(projectId, entityId!),
    enabled: !!projectId && !!entityId,
  })
}

export function useAcquireLock(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: AcquireLockDto) => locksApi.acquire(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks', projectId] })
    },
  })
}

export function useReleaseLock(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entityId }: { entityId: string }) => locksApi.release(projectId, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks', projectId] })
    },
  })
}
