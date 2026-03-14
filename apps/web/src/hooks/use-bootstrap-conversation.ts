import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChatMessageDto } from '@the-crew/shared-types'
import { bootstrapConversationApi } from '@/lib/bootstrap-conversation-api'

function conversationKey(projectId: string) {
  return ['bootstrap-conversation', projectId] as const
}

function messagesKey(projectId: string, threadId: string) {
  return ['chat', 'messages', projectId, threadId] as const
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  queryClient.invalidateQueries({ queryKey: conversationKey(projectId) })
  queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] })
  queryClient.invalidateQueries({ queryKey: ['chat', 'thread'] })
  queryClient.invalidateQueries({ queryKey: ['proposals', projectId] })
}

export function useBootstrapConversation(projectId: string) {
  return useQuery({
    queryKey: conversationKey(projectId),
    queryFn: () => bootstrapConversationApi.getStatus(projectId),
    enabled: !!projectId,
    retry: false,
  })
}

export function useStartBootstrapConversation(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bootstrapConversationApi.startConversation(projectId),
    onSettled: () => invalidateAll(queryClient, projectId),
  })
}

export function useSendBootstrapMessage(projectId: string, threadId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => bootstrapConversationApi.sendMessage(projectId, content),
    onMutate: async (content) => {
      if (!threadId) return
      const key = messagesKey(projectId, threadId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ChatMessageDto[]>(key)
      queryClient.setQueryData<ChatMessageDto[]>(key, (old) => [
        ...(old ?? []),
        {
          id: `optimistic-${Date.now()}`,
          threadId,
          role: 'user' as const,
          content,
          entityRefs: [],
          actions: [],
          createdAt: new Date().toISOString(),
        },
      ])
      return { previous }
    },
    onError: (_err, _content, context) => {
      if (threadId && context?.previous) {
        queryClient.setQueryData(messagesKey(projectId, threadId), context.previous)
      }
    },
    onSettled: () => invalidateAll(queryClient, projectId),
  })
}

export function useProposeGrowth(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bootstrapConversationApi.proposeGrowth(projectId),
    onSuccess: () => invalidateAll(queryClient, projectId),
  })
}

export function useApproveGrowthProposal(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (proposalId: string) => bootstrapConversationApi.approveGrowthProposal(projectId, proposalId),
    onSuccess: () => invalidateAll(queryClient, projectId),
  })
}

export function useRejectGrowthProposal(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason: string }) =>
      bootstrapConversationApi.rejectGrowthProposal(projectId, proposalId, reason),
    onSuccess: () => invalidateAll(queryClient, projectId),
  })
}
