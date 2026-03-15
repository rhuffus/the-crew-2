import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { ChatConversationContent } from './chat-conversation-content'

interface CeoConversationDockProps {
  projectId: string
}

/**
 * Thin wrapper — delegates to ChatConversationContent with the CEO agentId.
 * Used directly by integration tests (live-company-flow, smoke-ceo-bootstrap).
 */
export function CeoConversationDock({ projectId }: CeoConversationDockProps) {
  const { data: bootstrapStatus } = useBootstrapStatus(projectId)
  const ceoAgentId = bootstrapStatus?.ceoAgentId ?? undefined

  return (
    <div className="flex h-full flex-col" data-testid="ceo-conversation-dock">
      <ChatConversationContent
        projectId={projectId}
        agentId={ceoAgentId}
        currentScope={{ scopeType: 'company', entityId: null, zoomLevel: 'L1' }}
      />
    </div>
  )
}
