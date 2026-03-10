import type { VisualNodeDto, VisualEdgeDto, LayerId, NodeType, NodeStatus } from '@the-crew/shared-types'

export interface GraphFilters {
  activeLayers: LayerId[]
  nodeTypeFilter?: NodeType[] | null
  statusFilter?: NodeStatus[] | null
}

/**
 * Filter nodes by active layers.
 * A node is visible if any of its layerIds is in activeLayers.
 */
export function filterNodesByLayers(
  nodes: VisualNodeDto[],
  activeLayers: LayerId[],
): VisualNodeDto[] {
  if (activeLayers.length === 0) return []
  return nodes.filter((n) => n.layerIds.some((lid) => activeLayers.includes(lid)))
}

/**
 * Filter edges by active layers and visible node set.
 * An edge is visible only if both source and target are visible,
 * AND at least one of its layerIds is in activeLayers.
 */
export function filterEdgesByLayers(
  edges: VisualEdgeDto[],
  activeLayers: LayerId[],
  visibleNodeIds: Set<string>,
): VisualEdgeDto[] {
  if (activeLayers.length === 0) return []
  return edges.filter(
    (e) =>
      visibleNodeIds.has(e.sourceId) &&
      visibleNodeIds.has(e.targetId) &&
      e.layerIds.some((lid) => activeLayers.includes(lid)),
  )
}

/**
 * Filter nodes by node type. Null or empty means no filter (show all).
 */
export function filterNodesByType(
  nodes: VisualNodeDto[],
  nodeTypes: NodeType[] | null | undefined,
): VisualNodeDto[] {
  if (!nodeTypes || nodeTypes.length === 0) return nodes
  return nodes.filter((n) => nodeTypes.includes(n.nodeType))
}

/**
 * Filter nodes by validation status. Null or empty means no filter (show all).
 */
export function filterNodesByStatus(
  nodes: VisualNodeDto[],
  statuses: NodeStatus[] | null | undefined,
): VisualNodeDto[] {
  if (!statuses || statuses.length === 0) return nodes
  return nodes.filter((n) => statuses.includes(n.status))
}

/**
 * Apply all filters in order: layers → nodeType → status → edge pruning.
 * Returns filtered nodes and edges.
 */
export function filterGraph(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  filters: GraphFilters,
): { nodes: VisualNodeDto[]; edges: VisualEdgeDto[] } {
  let filtered = filterNodesByLayers(nodes, filters.activeLayers)
  filtered = filterNodesByType(filtered, filters.nodeTypeFilter)
  filtered = filterNodesByStatus(filtered, filters.statusFilter)

  const visibleIds = new Set(filtered.map((n) => n.id))
  const filteredEdges = filterEdgesByLayers(edges, filters.activeLayers, visibleIds)

  return { nodes: filtered, edges: filteredEdges }
}
