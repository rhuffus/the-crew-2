import type { ReactNode } from 'react'
import { Panel, Group, Separator } from 'react-resizable-panels'
import type { VisualNodeDto, VisualEdgeDto, NodeType, VisualDiffSummary } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { TopBar } from './top-bar'
import { Explorer } from './explorer/explorer'
import { Inspector } from './inspector/inspector'
import { CanvasViewport } from './canvas-viewport'
import { ChatDock } from './chat-dock/chat-dock'

export interface VisualShellProps {
  children?: ReactNode
  graphNodes?: VisualNodeDto[]
  graphEdges?: VisualEdgeDto[]
  diffSummary?: VisualDiffSummary | null
  onNodeUpdate?: (entityId: string, nodeType: NodeType, patch: Record<string, string>) => void
}

export function VisualShell({ children, graphNodes, graphEdges, diffSummary, onNodeUpdate }: VisualShellProps) {
  const { explorerCollapsed, inspectorCollapsed } = useVisualWorkspaceStore()

  return (
    <div data-testid="visual-shell" className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {explorerCollapsed && <Explorer />}
        <Group orientation="horizontal" className="flex-1 overflow-hidden">
          {!explorerCollapsed && (
            <>
              <Panel
                id="panel-explorer"
                defaultSize="20"
                minSize="15"
                maxSize="30"
                collapsible
              >
                <div className="h-full min-w-0 overflow-hidden">
                  <Explorer />
                </div>
              </Panel>
              <Separator className="w-px bg-border hover:w-1 hover:bg-primary/50" />
            </>
          )}
          <Panel id="panel-center" defaultSize={inspectorCollapsed ? "80" : "60"} minSize="30">
            <div className="flex h-full min-w-0 flex-col overflow-hidden">
              {children ?? <CanvasViewport />}
              <ChatDock />
            </div>
          </Panel>
          {!inspectorCollapsed && (
            <>
              <Separator className="w-px bg-border hover:w-1 hover:bg-primary/50" />
              <Panel
                id="panel-inspector"
                defaultSize="20"
                minSize="15"
                maxSize="35"
                collapsible
              >
                <div className="h-full min-w-0 overflow-hidden">
                  <Inspector graphNodes={graphNodes} graphEdges={graphEdges} diffSummary={diffSummary} onNodeUpdate={onNodeUpdate} />
                </div>
              </Panel>
            </>
          )}
        </Group>
        {inspectorCollapsed && <Inspector graphNodes={graphNodes} graphEdges={graphEdges} diffSummary={diffSummary} onNodeUpdate={onNodeUpdate} />}
      </div>
    </div>
  )
}
