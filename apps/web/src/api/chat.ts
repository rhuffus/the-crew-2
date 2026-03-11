import type {
  ChatThreadDto,
  ChatMessageDto,
  ChatEntityRef,
  ScopeType,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const chatApi = {
  getThread(projectId: string, scopeType: ScopeType, entityId?: string): Promise<ChatThreadDto> {
    const params = new URLSearchParams()
    params.append('scopeType', scopeType)
    if (entityId) params.append('entityId', entityId)
    return apiClient.get(`/projects/${projectId}/chat/threads/by-scope?${params.toString()}`)
  },

  listThreads(projectId: string): Promise<ChatThreadDto[]> {
    return apiClient.get(`/projects/${projectId}/chat/threads`)
  },

  listMessages(projectId: string, threadId: string, limit?: number, before?: string): Promise<ChatMessageDto[]> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', String(limit))
    if (before) params.append('before', before)
    const query = params.toString()
    return apiClient.get(`/projects/${projectId}/chat/threads/${threadId}/messages${query ? `?${query}` : ''}`)
  },

  sendMessage(projectId: string, threadId: string, content: string, entityRefs?: ChatEntityRef[]): Promise<ChatMessageDto> {
    return apiClient.post(`/projects/${projectId}/chat/threads/${threadId}/messages`, {
      content,
      entityRefs,
    })
  },

  deleteThread(projectId: string, threadId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/chat/threads/${threadId}`)
  },
}
