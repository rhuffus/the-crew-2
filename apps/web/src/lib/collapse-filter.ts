import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'

export interface CollapseResult {
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
  hiddenCounts: Map<string, number>
}

/**
 * Get IDs of all container nodes (nodes that have children via parentId).
 */
export function getContainerNodeIds(nodes: VisualNodeDto[]): Set<string> {
  const containers = new Set<string>()
  for (const node of nodes) {
    if (node.parentId) {
      containers.add(node.parentId)
    }
  }
  return containers
}

/**
 * Apply collapse filtering: remove descendants of collapsed containers,
 * remove edges to/from removed nodes, return hidden counts per container.
 *
 * This is a pure function applied AFTER filterGraph and BEFORE graphToFlow.
 */
export function applyCollapse(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  collapsedIds: string[],
): CollapseResult {
  if (collapsedIds.length === 0) {
    return { nodes, edges, hiddenCounts: new Map() }
  }

  // Build parent → children map
  const childrenMap = new Map<string, string[]>()
  for (const node of nodes) {
    if (node.parentId) {
      const siblings = childrenMap.get(node.parentId) ?? []
      siblings.push(node.id)
      childrenMap.set(node.parentId, siblings)
    }
  }

  // Only process collapsed IDs that exist in the current node set
  const nodeIdSet = new Set(nodes.map((n) => n.id))
  const validCollapsedIds = collapsedIds.filter((id) => nodeIdSet.has(id))

  // Recursively find all descendant node IDs for each collapsed container
  const removedIds = new Set<string>()
  const hiddenCounts = new Map<string, number>()

  for (const collapsedId of validCollapsedIds) {
    let count = 0
    const queue = [...(childrenMap.get(collapsedId) ?? [])]

    while (queue.length > 0) {
      const childId = queue.shift()!
      if (removedIds.has(childId)) continue
      removedIds.add(childId)
      count++
      const grandchildren = childrenMap.get(childId) ?? []
      queue.push(...grandchildren)
    }

    if (count > 0) {
      hiddenCounts.set(collapsedId, count)
    }
  }

  const filteredNodes = nodes.filter((n) => !removedIds.has(n.id))
  const filteredEdges = edges.filter(
    (e) => !removedIds.has(e.sourceId) && !removedIds.has(e.targetId),
  )

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    hiddenCounts,
  }
}

/**
 * Enrich React Flow nodes with collapse state metadata.
 * Adds isContainer, isCollapsed, and hiddenChildCount to node data.
 */
export function enrichWithCollapseState<T extends { id: string; data: Record<string, unknown> }>(
  flowNodes: T[],
  containerIds: Set<string>,
  collapsedIds: string[],
  hiddenCounts: Map<string, number>,
): T[] {
  const collapsedSet = new Set(collapsedIds)
  return flowNodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      isContainer: containerIds.has(n.id),
      isCollapsed: collapsedSet.has(n.id),
      hiddenChildCount: hiddenCounts.get(n.id) ?? 0,
    },
  }))
}
