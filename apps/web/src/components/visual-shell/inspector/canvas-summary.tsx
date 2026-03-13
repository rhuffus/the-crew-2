import type { VisualNodeDto, VisualEdgeDto, NodeType, EdgeType, MaturityPhase } from '@the-crew/shared-types'
import { getNodeTypeLabel, getEdgeTypeLabel } from './inspector-utils'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { useOrgHealth, usePhaseCapabilities } from '@/hooks/use-growth'
import { useProposalsStore } from '@/stores/proposals-store'
import { Sparkles, Heart, MessageSquarePlus } from 'lucide-react'

const PHASE_COLORS: Record<MaturityPhase, string> = {
  seed: 'bg-gray-200 text-gray-700',
  formation: 'bg-blue-100 text-blue-700',
  structured: 'bg-indigo-100 text-indigo-700',
  operating: 'bg-green-100 text-green-700',
  scaling: 'bg-purple-100 text-purple-700',
  optimizing: 'bg-amber-100 text-amber-700',
}

export interface CanvasSummaryProps {
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
}

export function CanvasSummary({ nodes, edges }: CanvasSummaryProps) {
  const projectId = useVisualWorkspaceStore(s => s.projectId)
  const { data: bootstrapStatus } = useBootstrapStatus(projectId ?? '')
  const { data: health } = useOrgHealth(projectId ?? '')
  const { data: capabilities } = usePhaseCapabilities(projectId ?? '')
  const allProposals = useProposalsStore(s => s.proposals)
  const pendingProposals = allProposals.filter(p => p.status === 'proposed' || p.status === 'under-review')

  const phase = (bootstrapStatus?.maturityPhase ?? null) as MaturityPhase | null
  const nodesByType: Partial<Record<NodeType, number>> = {}
  for (const node of nodes) {
    nodesByType[node.nodeType] = (nodesByType[node.nodeType] ?? 0) + 1
  }

  const edgesByType: Partial<Record<EdgeType, number>> = {}
  for (const edge of edges) {
    edgesByType[edge.edgeType] = (edgesByType[edge.edgeType] ?? 0) + 1
  }

  const warningCount = nodes.filter((n) => n.status === 'warning').length
  const errorCount = nodes.filter((n) => n.status === 'error').length

  return (
    <div data-testid="canvas-summary" className="space-y-4">
      {/* Maturity Phase */}
      {phase && (
        <div data-testid="maturity-phase">
          <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Company Phase
          </h4>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${PHASE_COLORS[phase]}`}>
              {phase}
            </span>
          </div>
          {capabilities && (() => {
            const enabledCaps = Object.entries(capabilities)
              .filter(([k, v]) => k.startsWith('can') && v === true)
              .map(([k]) => k.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim())
            return enabledCaps.length > 0 ? (
              <div className="mt-1.5">
                <p className="text-[10px] text-muted-foreground">Capabilities:</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {enabledCaps.map((cap) => (
                    <span key={cap} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{cap}</span>
                  ))}
                </div>
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* Org Health */}
      {health && (
        <div data-testid="org-health">
          <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Heart className="mr-1 inline h-3 w-3" />
            Organization Health
          </h4>
          <div className="space-y-1">
            {Object.entries(health).map(([metric, value]) => {
              const level = typeof value === 'string' ? value : 'unknown'
              const color = level === 'green' ? 'bg-green-500' : level === 'yellow' ? 'bg-yellow-500' : level === 'red' ? 'bg-red-500' : 'bg-gray-400'
              return (
                <div key={metric} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-foreground">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div data-testid="pending-proposals-count">
          <div className="flex items-center gap-2 text-xs">
            <MessageSquarePlus className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-foreground">{pendingProposals.length} pending proposal{pendingProposals.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nodes ({nodes.length})
        </h4>
        {nodes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No nodes in view.</p>
        ) : (
          <ul className="space-y-0.5">
            {(Object.entries(nodesByType) as [NodeType, number][]).map(([type, count]) => (
              <li
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-foreground">{getNodeTypeLabel(type)}</span>
                <span className="text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Edges ({edges.length})
        </h4>
        {edges.length === 0 ? (
          <p className="text-xs text-muted-foreground">No edges in view.</p>
        ) : (
          <ul className="space-y-0.5">
            {(Object.entries(edgesByType) as [EdgeType, number][]).map(([type, count]) => (
              <li
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-foreground">{getEdgeTypeLabel(type)}</span>
                <span className="text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(warningCount > 0 || errorCount > 0) && (
        <div>
          <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Validation
          </h4>
          <div className="flex gap-3 text-xs">
            {errorCount > 0 && (
              <span className="text-red-500">{errorCount} error{errorCount > 1 ? 's' : ''}</span>
            )}
            {warningCount > 0 && (
              <span className="text-yellow-500">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
