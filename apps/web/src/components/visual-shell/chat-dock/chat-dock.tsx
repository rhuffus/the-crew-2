import { useEffect } from 'react'
import { MessageSquare, ChevronUp, ChevronDown, Lock, Bot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { usePermission } from '@/hooks/use-permissions'
import { useChatThread, useChatMessages, useSendMessage } from '@/hooks/use-chat'
import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'
import { CeoConversationDock } from './ceo-conversation-dock'

type ChatMode = 'generic' | 'ceo'

export function ChatDock() {
  const chatDockOpen = useVisualWorkspaceStore((s) => s.chatDockOpen)
  const toggleChatDock = useVisualWorkspaceStore((s) => s.toggleChatDock)
  const currentScope = useVisualWorkspaceStore((s) => s.currentScope)
  const projectId = useVisualWorkspaceStore((s) => s.projectId)
  const setActiveChatThread = useVisualWorkspaceStore((s) => s.setActiveChatThread)
  const { t } = useTranslation('chat')

  // Determine chat mode based on maturity phase
  const { data: bootstrapStatus } = useBootstrapStatus(projectId ?? '')
  const phase = bootstrapStatus?.maturityPhase
  const chatMode: ChatMode = phase && (phase === 'seed' || phase === 'formation') ? 'ceo' : 'generic'

  // Permission checks (CAV-020)
  const canRead = usePermission('chat:read')
  const canWriteCompany = usePermission('chat:write:company')
  const canWriteDepartment = usePermission('chat:write:department')
  const canWriteNode = usePermission('chat:write:node')

  // Resolve write permission based on current scope
  const canWrite = currentScope.scopeType === 'company'
    ? canWriteCompany
    : currentScope.scopeType === 'department'
      ? canWriteDepartment
      : canWriteNode

  const scopeLabel = currentScope.entityId
    ? `${currentScope.scopeType} ${currentScope.entityId.slice(0, 8)}`
    : currentScope.scopeType

  const { data: thread } = useChatThread(
    projectId ?? '',
    currentScope.scopeType,
    currentScope.entityId ?? undefined,
  )

  const threadId = thread?.id
  const { data: messages, isLoading: messagesLoading } = useChatMessages(
    projectId ?? '',
    threadId,
  )
  const { mutate: send, isPending } = useSendMessage(projectId ?? '', threadId)

  useEffect(() => {
    setActiveChatThread(threadId ?? null)
  }, [threadId, setActiveChatThread])

  const handleSend = (content: string) => {
    if (!threadId) return
    send({ content })
  }

  return (
    <div data-testid="chat-dock" className="border-t border-border bg-card">
      <button
        type="button"
        onClick={toggleChatDock}
        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {chatMode === 'ceo' ? <Bot className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          <span>{chatMode === 'ceo' ? t('dock.ceoAgent') : t('dock.chatScope', { scope: scopeLabel })}</span>
          {chatMode === 'generic' && thread && thread.messageCount > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
              {thread.messageCount}
            </span>
          )}
        </div>
        {chatDockOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {chatDockOpen && canRead && (
        <div data-testid="chat-dock-panel" className="flex h-52 flex-col border-t border-border">
          {chatMode === 'ceo' && projectId ? (
            <CeoConversationDock projectId={projectId} />
          ) : (
            <>
              <ChatMessageList
                messages={messages ?? []}
                projectId={projectId ?? ''}
                isLoading={messagesLoading}
              />
              {canWrite ? (
                <ChatInput
                  onSend={handleSend}
                  disabled={!threadId}
                  isPending={isPending}
                />
              ) : (
                <div data-testid="chat-read-only" className="flex items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>{t('dock.readOnly')}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
