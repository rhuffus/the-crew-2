import { Bot, Sparkles, Loader2, Lock, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import type { BootstrapConversationStatus, ScopeDescriptor } from '@the-crew/shared-types'
import { usePermission } from '@/hooks/use-permissions'
import { useChatThread, useChatMessages, useSendMessage } from '@/hooks/use-chat'
import { useAgentChat } from '@/hooks/use-agent-chat'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'

interface ChatConversationContentProps {
  projectId: string
  agentId?: string
  currentScope: ScopeDescriptor
}

const STATUS_LABELS: Record<BootstrapConversationStatus, string> = {
  'not-started': 'Not started',
  'collecting-context': 'Collecting context',
  'drafting-foundation-docs': 'Drafting documents',
  'reviewing-foundation-docs': 'Reviewing documents',
  'ready-to-grow': 'Ready to grow',
  'growth-started': 'Growth started',
}

export function ChatConversationContent({
  projectId,
  agentId,
  currentScope,
}: ChatConversationContentProps) {
  if (agentId) {
    return <AgentContent projectId={projectId} agentId={agentId} />
  }
  return <GenericContent projectId={projectId} currentScope={currentScope} />
}

// --- Generic chat content ---

function GenericContent({
  projectId,
  currentScope,
}: {
  projectId: string
  currentScope: ScopeDescriptor
}) {
  const { t } = useTranslation('chat')
  const canRead = usePermission('chat:read')
  const canWriteCompany = usePermission('chat:write:company')
  const canWriteDepartment = usePermission('chat:write:department')
  const canWriteNode = usePermission('chat:write:node')

  const canWrite =
    currentScope.scopeType === 'company'
      ? canWriteCompany
      : currentScope.scopeType === 'department'
        ? canWriteDepartment
        : canWriteNode

  const { data: thread } = useChatThread(
    projectId,
    currentScope.scopeType,
    currentScope.entityId ?? undefined,
  )

  const threadId = thread?.id
  const { data: messages, isLoading: messagesLoading } = useChatMessages(
    projectId,
    threadId,
  )
  const { mutate: send, isPending } = useSendMessage(projectId, threadId)

  const handleSend = (content: string) => {
    if (!threadId) return
    send({ content })
  }

  if (!canRead) return null

  return (
    <div className="flex h-full flex-col" data-testid="generic-chat-content">
      <ChatMessageList
        messages={messages ?? []}
        projectId={projectId}
        isLoading={messagesLoading}
      />
      {canWrite ? (
        <ChatInput
          onSend={handleSend}
          disabled={!threadId}
          isPending={isPending}
          projectId={projectId}
        />
      ) : (
        <div
          data-testid="chat-read-only"
          className="flex items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground"
        >
          <Lock className="h-3 w-3" />
          <span>{t('dock.readOnly')}</span>
        </div>
      )}
    </div>
  )
}

// --- Agent chat content ---

function AgentContent({ projectId, agentId }: { projectId: string; agentId: string }) {
  const { t } = useTranslation('settings')
  const chat = useAgentChat({ projectId, agentId })

  const agentName = chat.agent?.name ?? 'Agent'

  return (
    <div className="flex h-full flex-col" data-testid="agent-chat-content">
      {/* Status bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Bot className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-medium text-blue-700" data-testid="agent-chat-name">{agentName}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] text-muted-foreground">
            {STATUS_LABELS[chat.bootstrapStatus]}
          </span>
        </div>
      </div>

      {/* No provider warning */}
      {chat.hasNoProvider && (
        <div
          className="flex items-center gap-2 border-b border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-800 dark:bg-orange-950"
          data-testid="no-provider-warning"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600" />
          <span className="flex-1 text-xs text-orange-700 dark:text-orange-300">
            {t('noProviderError')}
          </span>
          <Link
            to="/settings"
            className="shrink-0 rounded-md bg-orange-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-orange-700"
            data-testid="go-to-settings-link"
          >
            {t('goToSettings')}
          </Link>
        </div>
      )}

      {/* Messages */}
      {chat.isLoading && !chat.messages.length ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChatMessageList
          messages={chat.messages}
          projectId={projectId}
          isLoading={false}
          isThinking={chat.isSending}
          thinkingStartTime={chat.thinkingStartTime}
          lastThinkingDurationMs={chat.lastThinkingDurationMs}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={chat.send}
        disabled={chat.inputDisabled}
        isPending={chat.isSending}
        projectId={projectId}
      />
    </div>
  )
}
