import type { Node, Edge } from '@xyflow/react'
import type { OperationsStatusDto, EntityOperationStatusDto } from '@the-crew/shared-types'

export interface FlowGraph {
  nodes: Node[]
  edges: Edge[]
}

/**
 * Enriches flow graph nodes with operations badge data.
 * Pure function — no I/O.
 */
export function enrichWithOperationsBadges(
  flowGraph: FlowGraph,
  operationsStatus: OperationsStatusDto,
): FlowGraph {
  const statusMap = new Map<string, EntityOperationStatusDto>()
  for (const entity of operationsStatus.entities) {
    statusMap.set(entity.visualNodeId, entity)
  }

  const enrichedNodes = flowGraph.nodes.map((node) => {
    const opStatus = statusMap.get(node.id)
    if (!opStatus) return node
    return {
      ...node,
      data: {
        ...node.data,
        operationStatus: opStatus.operationStatus,
        operationBadges: opStatus.badges,
        activeRunCount: opStatus.activeRunCount,
        incidentCount: opStatus.incidentCount,
        queueDepth: opStatus.queueDepth,
        complianceStatus: opStatus.complianceStatus,
      },
    }
  })

  const enrichedEdges = flowGraph.edges.map((edge) => {
    return applyOperationsEdgeStyle(edge, statusMap)
  })

  return { nodes: enrichedNodes, edges: enrichedEdges }
}

function applyOperationsEdgeStyle(
  edge: Edge,
  statusMap: Map<string, EntityOperationStatusDto>,
): Edge {
  const sourceOp = statusMap.get(edge.source)
  const targetOp = statusMap.get(edge.target)
  if (!sourceOp && !targetOp) return edge

  const edgeType = edge.data?.edgeType as string | undefined
  const style = { ...(edge.style ?? {}) }
  let animated = edge.animated ?? false

  // Active handoff: animated blue stroke
  if (edgeType === 'hands_off_to' && sourceOp?.operationStatus === 'running') {
    style.stroke = '#3b82f6' // blue-500
    style.strokeDasharray = '5 5'
    animated = true
  }

  // Failed handoff: red stroke
  if (edgeType === 'hands_off_to' && sourceOp?.operationStatus === 'failed') {
    style.stroke = '#dc2626' // red-600
  }

  // Contract compliance coloring
  if (edgeType === 'bound_by' && targetOp?.complianceStatus) {
    const colors: Record<string, string> = {
      compliant: '#16a34a',
      'at-risk': '#d97706',
      violated: '#dc2626',
    }
    style.stroke = colors[targetOp.complianceStatus] ?? style.stroke
  }

  // Active participant: blue stroke
  if (edgeType === 'participates_in' && targetOp?.operationStatus === 'running') {
    style.stroke = '#3b82f6'
    animated = true
  }

  return { ...edge, style, animated }
}

/**
 * Format a timestamp as relative time (e.g., "5s ago", "2m ago").
 */
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
