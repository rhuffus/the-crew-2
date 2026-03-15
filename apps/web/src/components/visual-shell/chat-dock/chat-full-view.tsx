import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { ChatConversationContent } from './chat-conversation-content'

export function ChatFullView() {
  const projectId = useVisualWorkspaceStore((s) => s.projectId)
  const currentScope = useVisualWorkspaceStore((s) => s.currentScope)
  const centerView = useVisualWorkspaceStore((s) => s.centerView)

  const agentId = centerView.type === 'chat' ? centerView.agentId : undefined

  if (!projectId) return null

  return (
    <div data-testid="chat-full-view" className="flex h-full flex-col">
      <ChatConversationContent
        projectId={projectId}
        agentId={agentId}
        currentScope={currentScope}
      />
    </div>
  )
}
