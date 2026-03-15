import { useEffect, useRef, useState } from 'react'
import type { BootstrapConversationStatus } from '@the-crew/shared-types'
import { useLcpAgent } from '@/hooks/use-lcp-agents'
import { useChatThread, useChatMessages, useSendMessage } from '@/hooks/use-chat'
import {
  useBootstrapConversation,
  useStartBootstrapConversation,
  useSendBootstrapMessage,
} from '@/hooks/use-bootstrap-conversation'
import { useAiProviderValidation } from '@/hooks/use-ai-provider-config'

export interface UseAgentChatOptions {
  projectId: string
  agentId?: string
}

export function useAgentChat({ projectId, agentId }: UseAgentChatOptions) {
  const { data: agent } = useLcpAgent(projectId, agentId ?? '')
  const { data: conversation, isError: conversationError } =
    useBootstrapConversation(projectId)
  const startMutation = useStartBootstrapConversation(projectId)
  const startedRef = useRef(false)
  const { data: aiValidation } = useAiProviderValidation('claude-max')

  // Determine if this agentId matches the bootstrap CEO agent
  const isAgentChat = !!agentId
  const isCeoAgent = isAgentChat && conversation?.ceoAgentId === agentId

  // Auto-start bootstrap conversation when needed
  useEffect(() => {
    if (isAgentChat && !startedRef.current && conversationError && !startMutation.isPending) {
      startedRef.current = true
      startMutation.mutate()
    }
  }, [isAgentChat, conversationError, startMutation])

  const threadId = conversation?.threadId
  const { data: thread } = useChatThread(projectId, 'company')
  const effectiveThreadId = threadId ?? thread?.id

  const bootstrapSendMutation = useSendBootstrapMessage(projectId, effectiveThreadId)
  const genericSendMutation = useSendMessage(projectId, effectiveThreadId)
  const { data: messages, isLoading: messagesLoading } = useChatMessages(
    projectId,
    effectiveThreadId,
  )

  // Thinking time tracking
  const thinkingStartRef = useRef<number | null>(null)
  const [lastThinkingDurationMs, setLastThinkingDurationMs] = useState<number | undefined>(undefined)
  const wasPendingRef = useRef(false)

  const activeSendMutation = isCeoAgent ? bootstrapSendMutation : genericSendMutation

  useEffect(() => {
    if (activeSendMutation.isPending) {
      wasPendingRef.current = true
    } else if (wasPendingRef.current) {
      wasPendingRef.current = false
      if (thinkingStartRef.current) {
        setLastThinkingDurationMs(Date.now() - thinkingStartRef.current)
        thinkingStartRef.current = null
      }
    }
  }, [activeSendMutation.isPending])

  const bootstrapStatus = (conversation?.status ?? 'not-started') as BootstrapConversationStatus

  const send = (content: string) => {
    thinkingStartRef.current = Date.now()
    setLastThinkingDurationMs(undefined)
    if (isCeoAgent) {
      bootstrapSendMutation.mutate(content)
    } else {
      genericSendMutation.mutate({ content })
    }
  }

  const hasNoProvider = aiValidation && !aiValidation.configured

  return {
    agent,
    isAgentChat,
    isCeoAgent,
    threadId: effectiveThreadId,
    messages: messages ?? [],
    send,
    isSending: activeSendMutation.isPending,
    isLoading: startMutation.isPending || messagesLoading,
    bootstrapStatus,
    aiValidation,
    hasNoProvider: !!hasNoProvider,
    inputDisabled: (isAgentChat && bootstrapStatus === 'not-started') || !!hasNoProvider,
    thinkingStartTime: thinkingStartRef.current ?? undefined,
    lastThinkingDurationMs,
  }
}
