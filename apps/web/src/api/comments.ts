import type { CommentDto, CreateCommentDto, UpdateCommentDto, CommentTargetType } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const commentsApi = {
  list(projectId: string, targetType?: CommentTargetType, targetId?: string | null): Promise<CommentDto[]> {
    const params = new URLSearchParams()
    if (targetType) params.append('targetType', targetType)
    if (targetId) params.append('targetId', targetId)
    const query = params.toString()
    return apiClient.get(`/projects/${projectId}/comments${query ? `?${query}` : ''}`)
  },

  get(projectId: string, id: string): Promise<CommentDto> {
    return apiClient.get(`/projects/${projectId}/comments/${id}`)
  },

  create(projectId: string, dto: CreateCommentDto): Promise<CommentDto> {
    return apiClient.post(`/projects/${projectId}/comments`, dto)
  },

  update(projectId: string, id: string, dto: UpdateCommentDto): Promise<CommentDto> {
    return apiClient.patch(`/projects/${projectId}/comments/${id}`, dto)
  },

  resolve(projectId: string, id: string): Promise<CommentDto> {
    return apiClient.patch(`/projects/${projectId}/comments/${id}/resolve`, {})
  },

  delete(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/comments/${id}`)
  },
}
