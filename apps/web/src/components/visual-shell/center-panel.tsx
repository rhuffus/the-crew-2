import { type ReactNode, lazy, Suspense, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { CanvasViewport } from './canvas-viewport'
import { ChatFullView } from './chat-dock/chat-full-view'

const DocumentEmbeddedView = lazy(() =>
  import('@/components/documents/document-embedded-view').then((m) => ({ default: m.DocumentEmbeddedView })),
)

export interface CenterPanelProps {
  canvasContent?: ReactNode
}

export function CenterPanel({ canvasContent }: CenterPanelProps) {
  const centerView = useVisualWorkspaceStore((s) => s.centerView)
  const projectId = useVisualWorkspaceStore((s) => s.projectId)
  const openChatView = useVisualWorkspaceStore((s) => s.openChatView)
  const seedChatAutoOpened = useVisualWorkspaceStore((s) => s.seedChatAutoOpened)
  const markSeedChatAutoOpened = useVisualWorkspaceStore((s) => s.markSeedChatAutoOpened)

  // Auto-open chat as center view when landing on a seed-phase project (AIR-008 / VSR-008)
  // Uses store flag instead of ref so it persists across remounts/route changes
  const { data: bootstrapStatus } = useBootstrapStatus(projectId ?? '')
  const phase = bootstrapStatus?.maturityPhase
  useEffect(() => {
    if (phase === 'seed' && centerView.type !== 'chat' && !seedChatAutoOpened) {
      markSeedChatAutoOpened()
      openChatView(null, 'ceo')
    }
  }, [phase, centerView.type, openChatView, seedChatAutoOpened, markSeedChatAutoOpened])

  switch (centerView.type) {
    case 'chat':
      return (
        <div data-testid="center-panel" className="flex h-full min-w-0 flex-col overflow-hidden">
          <ChatFullView />
        </div>
      )
    case 'document':
      return (
        <div data-testid="center-panel" className="flex h-full min-w-0 flex-col overflow-hidden">
          {projectId ? (
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
              <DocumentEmbeddedView projectId={projectId} documentId={centerView.documentId} />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No project selected</p>
            </div>
          )}
        </div>
      )
    case 'canvas':
    default:
      return (
        <div data-testid="center-panel" className="flex h-full min-w-0 flex-col overflow-hidden">
          {canvasContent ?? <CanvasViewport />}
        </div>
      )
  }
}
