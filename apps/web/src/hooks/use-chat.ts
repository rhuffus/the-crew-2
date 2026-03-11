import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ScopeType, ChatEntityRef } from '@the-crew/shared-types'
import { chatApi } from '@/api/chat'

function threadKey(projectId: string, scopeType: ScopeType, entityId?: string) {
  return ['chat', 'thread', projectId, scopeType, entityId ?? null] as const
}

function messagesKey(projectId: string, threadId: string) {
  return ['chat', 'messages', projectId, threadId] as const
}

function threadsKey(projectId: string) {
  return ['chat', 'threads', projectId] as const
}

export function useChatThread(projectId: string, scopeType: ScopeType, entityId?: string) {
  return useQuery({
    queryKey: threadKey(projectId, scopeType, entityId),
    queryFn: () => chatApi.getThread(projectId, scopeType, entityId),
    enabled: !!projectId,
  })
}

export function useChatMessages(projectId: string, threadId: string | undefined) {
  return useQuery({
    queryKey: messagesKey(projectId, threadId ?? ''),
    queryFn: () => chatApi.listMessages(projectId, threadId!),
    enabled: !!projectId && !!threadId,
  })
}

export function useSendMessage(projectId: string, threadId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, entityRefs }: { content: string; entityRefs?: ChatEntityRef[] }) =>
      chatApi.sendMessage(projectId, threadId!, content, entityRefs),
    onSuccess: () => {
      if (threadId) {
        queryClient.invalidateQueries({ queryKey: messagesKey(projectId, threadId) })
        // Invalidate thread to update lastMessageAt/messageCount
        queryClient.invalidateQueries({ queryKey: ['chat', 'thread'] })
        queryClient.invalidateQueries({ queryKey: threadsKey(projectId) })
      }
    },
  })
}

export function useChatThreads(projectId: string) {
  return useQuery({
    queryKey: threadsKey(projectId),
    queryFn: () => chatApi.listThreads(projectId),
    enabled: !!projectId,
  })
}
