import type { VisualNodeDto, VisualEdgeDto, NodeType, EdgeType } from '@the-crew/shared-types'
import { getNodeTypeLabel, getEdgeTypeLabel } from './inspector-utils'

export interface CanvasSummaryProps {
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
}

export function CanvasSummary({ nodes, edges }: CanvasSummaryProps) {
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
