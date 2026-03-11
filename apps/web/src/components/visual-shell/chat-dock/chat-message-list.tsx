import { useRef, useEffect, useState } from 'react'
import type { ChatMessageDto } from '@the-crew/shared-types'
import { ChatMessageBubble } from './chat-message'

interface ChatMessageListProps {
  messages: ChatMessageDto[]
  projectId: string
  isLoading?: boolean
}

export function ChatMessageList({ messages, projectId, isLoading }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView?.({ behavior: 'smooth' })
    }
  }, [messages.length, autoScroll])

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

  if (messages.length === 0) {
    return (
      <div data-testid="chat-empty" className="flex items-center justify-center p-4 text-xs text-muted-foreground">
        No messages yet. Start a conversation!
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      data-testid="chat-message-list"
      className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
      onScroll={handleScroll}
    >
      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} projectId={projectId} />
      ))}
      <div ref={endRef} />
    </div>
  )
}
