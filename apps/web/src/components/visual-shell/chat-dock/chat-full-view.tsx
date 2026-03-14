import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { ChatConversationContent, type ChatMode } from './chat-conversation-content'

export function ChatFullView() {
  const projectId = useVisualWorkspaceStore((s) => s.projectId)
  const currentScope = useVisualWorkspaceStore((s) => s.currentScope)
  const centerView = useVisualWorkspaceStore((s) => s.centerView)

  const { data: bootstrapStatus } = useBootstrapStatus(projectId ?? '')
  const phase = bootstrapStatus?.maturityPhase

  // Determine chat mode: from centerView if available, otherwise from bootstrap phase
  const chatMode: ChatMode =
    centerView.type === 'chat' && centerView.chatMode
      ? centerView.chatMode
      : phase && (phase === 'seed' || phase === 'formation')
        ? 'ceo'
        : 'generic'

  if (!projectId) return null

  return (
    <div data-testid="chat-full-view" className="flex h-full flex-col">
      <ChatConversationContent
        projectId={projectId}
        chatMode={chatMode}
        currentScope={currentScope}
      />
    </div>
  )
}
