import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateCommentDto, UpdateCommentDto, CommentTargetType } from '@the-crew/shared-types'
import { commentsApi } from '@/api/comments'

function commentsKey(projectId: string, targetType?: CommentTargetType, targetId?: string | null) {
  return ['comments', projectId, targetType ?? null, targetId ?? null] as const
}

export function useComments(projectId: string, targetType?: CommentTargetType, targetId?: string | null) {
  return useQuery({
    queryKey: commentsKey(projectId, targetType, targetId),
    queryFn: () => commentsApi.list(projectId, targetType, targetId),
    enabled: !!projectId,
  })
}

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCommentDto) => commentsApi.create(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] })
    },
  })
}

export function useUpdateComment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCommentDto }) =>
      commentsApi.update(projectId, id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] })
    },
  })
}

export function useResolveComment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => commentsApi.resolve(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] })
    },
  })
}

export function useDeleteComment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => commentsApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] })
    },
  })
}
