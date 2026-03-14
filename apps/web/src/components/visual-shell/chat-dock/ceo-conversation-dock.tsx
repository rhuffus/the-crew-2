import { ChatConversationContent } from './chat-conversation-content'

interface CeoConversationDockProps {
  projectId: string
}

/**
 * Thin wrapper — delegates to ChatConversationContent in CEO mode.
 * Used directly by integration tests (live-company-flow, smoke-ceo-bootstrap).
 */
export function CeoConversationDock({ projectId }: CeoConversationDockProps) {
  return (
    <div className="flex h-full flex-col" data-testid="ceo-conversation-dock">
      <ChatConversationContent
        projectId={projectId}
        chatMode="ceo"
        currentScope={{ scopeType: 'company', entityId: null, zoomLevel: 'L1' }}
      />
    </div>
  )
}
