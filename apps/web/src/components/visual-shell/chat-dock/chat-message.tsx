import type { ChatMessageDto } from '@the-crew/shared-types'
import { cn } from '@/lib/utils'
import { EntityRefChip } from './entity-ref-chip'
import { ActionButton } from './action-button'

interface ChatMessageProps {
  message: ChatMessageDto
  projectId: string
}

export function ChatMessageBubble({ message, projectId }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <div
      data-testid="chat-message"
      data-role={message.role}
      className={cn(
        'flex flex-col gap-1',
        isUser && 'items-end',
        !isUser && 'items-start',
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser && 'bg-primary text-primary-foreground',
          message.role === 'assistant' && 'bg-muted text-foreground',
          isSystem && 'bg-transparent text-center text-xs italic text-muted-foreground',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.entityRefs.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.entityRefs.map((entityRef) => (
              <EntityRefChip key={entityRef.entityId} entityRef={entityRef} projectId={projectId} />
            ))}
          </div>
        )}
      </div>
      {message.actions.length > 0 && (
        <div className="flex flex-wrap gap-1 px-1">
          {message.actions.map((action, i) => (
            <ActionButton key={i} action={action} projectId={projectId} />
          ))}
        </div>
      )}
      <span className="px-1 text-[10px] text-muted-foreground">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
