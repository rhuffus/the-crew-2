import { useRef, useEffect, useState } from 'react'
import type { ChatMessageDto } from '@the-crew/shared-types'
import { ChatMessageBubble } from './chat-message'
import { ThinkingBubble } from './thinking-bubble'

interface ChatMessageListProps {
  messages: ChatMessageDto[]
  projectId: string
  isLoading?: boolean
  isThinking?: boolean
  thinkingStartTime?: number
  lastThinkingDurationMs?: number
}

export function ChatMessageList({
  messages,
  projectId,
  isLoading,
  isThinking,
  thinkingStartTime,
  lastThinkingDurationMs,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView?.({ behavior: 'smooth' })
    }
  }, [messages.length, isThinking, autoScroll])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(isAtBottom)
  }

  if (isLoading) {
    return (
      <div data-testid="chat-loading" className="flex items-center justify-center p-4 text-xs text-muted-foreground">
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0 && !isThinking) {
    return (
      <div data-testid="chat-empty" className="flex items-center justify-center p-4 text-xs text-muted-foreground">
        No messages yet. Start a conversation!
      </div>
    )
  }

  // Find the last assistant message to attach thinking duration
  const lastAssistantIdx = findLastAssistantIndex(messages)

  return (
    <div
      ref={containerRef}
      data-testid="chat-message-list"
      className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
      onScroll={handleScroll}
    >
      {messages.map((msg, idx) => (
        <ChatMessageBubble
          key={msg.id}
          message={msg}
          projectId={projectId}
          thinkingDurationMs={
            idx === lastAssistantIdx && lastThinkingDurationMs
              ? lastThinkingDurationMs
              : undefined
          }
        />
      ))}
      {isThinking && thinkingStartTime && (
        <ThinkingBubble startTime={thinkingStartTime} />
      )}
      <div ref={endRef} />
    </div>
  )
}

function findLastAssistantIndex(messages: ChatMessageDto[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === 'assistant') return i
  }
  return -1
}
