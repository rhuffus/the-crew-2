import type {
  VisualNodeDto,
  VisualEdgeDto,
  VisualNodeDiffDto,
  VisualEdgeDiffDto,
  VisualDiffSummary,
  VisualGraphDiffDto,
  GraphScope,
  ZoomLevel,
  LayerId,
  BreadcrumbEntry,
} from '@the-crew/shared-types'

// ---------------------------------------------------------------------------
// Node comparison — compared visual properties
// ---------------------------------------------------------------------------

const NODE_COMPARED_KEYS = ['label', 'sublabel', 'parentId', 'layerIds', 'nodeType'] as const

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function diffNodeFields(
  base: VisualNodeDto,
  compare: VisualNodeDto,
): Record<string, { before: unknown; after: unknown }> | null {
  const changes: Record<string, { before: unknown; after: unknown }> = {}

  for (const key of NODE_COMPARED_KEYS) {
    const bVal = base[key]
    const cVal = compare[key]

    if (Array.isArray(bVal) && Array.isArray(cVal)) {
      if (!arraysEqual(bVal, cVal)) {
        changes[key] = { before: bVal, after: cVal }
      }
    } else if (bVal !== cVal) {
      changes[key] = { before: bVal, after: cVal }
    }
  }

  return Object.keys(changes).length > 0 ? changes : null
}

// ---------------------------------------------------------------------------
// Edge comparison — compared visual properties
// ---------------------------------------------------------------------------

const EDGE_COMPARED_KEYS = ['label', 'sourceId', 'targetId', 'edgeType', 'style'] as const

function diffEdgeFields(base: VisualEdgeDto, compare: VisualEdgeDto): boolean {
  for (const key of EDGE_COMPARED_KEYS) {
    if (base[key] !== compare[key]) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Main diff function
// ---------------------------------------------------------------------------

export function diffVisualGraphs(
  baseGraph: { nodes: VisualNodeDto[]; edges: VisualEdgeDto[] },
  compareGraph: { nodes: VisualNodeDto[]; edges: VisualEdgeDto[] },
  baseReleaseId: string,
  compareReleaseId: string,
  scope: GraphScope,
  zoomLevel: ZoomLevel,
  activeLayers: LayerId[],
  breadcrumb: BreadcrumbEntry[],
  projectId: string,
): VisualGraphDiffDto {
  // Build lookup maps by visual ID
  const baseNodeMap = new Map<string, VisualNodeDto>()
  for (const node of baseGraph.nodes) {
    baseNodeMap.set(node.id, node)
  }

  const compareNodeMap = new Map<string, VisualNodeDto>()
  for (const node of compareGraph.nodes) {
    compareNodeMap.set(node.id, node)
  }

  const baseEdgeMap = new Map<string, VisualEdgeDto>()
  for (const edge of baseGraph.edges) {
    baseEdgeMap.set(edge.id, edge)
  }

  const compareEdgeMap = new Map<string, VisualEdgeDto>()
  for (const edge of compareGraph.edges) {
    compareEdgeMap.set(edge.id, edge)
  }

  // Diff nodes
  const diffNodes: VisualNodeDiffDto[] = []
  const summary: VisualDiffSummary = {
    nodesAdded: 0,
    nodesRemoved: 0,
    nodesModified: 0,
    nodesUnchanged: 0,
    edgesAdded: 0,
    edgesRemoved: 0,
    edgesModified: 0,
    edgesUnchanged: 0,
  }

  // Process compare nodes (added, modified, unchanged)
  for (const [id, compareNode] of compareNodeMap) {
    const baseNode = baseNodeMap.get(id)

    if (!baseNode) {
      diffNodes.push({ ...compareNode, diffStatus: 'added' })
      summary.nodesAdded++
    } else {
      const changes = diffNodeFields(baseNode, compareNode)
      if (changes) {
        diffNodes.push({ ...compareNode, diffStatus: 'modified', changes })
        summary.nodesModified++
      } else {
        diffNodes.push({ ...compareNode, diffStatus: 'unchanged' })
        summary.nodesUnchanged++
      }
    }
  }

  // Process base-only nodes (removed)
  for (const [id, baseNode] of baseNodeMap) {
    if (!compareNodeMap.has(id)) {
      diffNodes.push({ ...baseNode, diffStatus: 'removed' })
      summary.nodesRemoved++
    }
  }

  // Diff edges
  const diffEdges: VisualEdgeDiffDto[] = []

  // Process compare edges (added, modified, unchanged)
  for (const [id, compareEdge] of compareEdgeMap) {
    const baseEdge = baseEdgeMap.get(id)

    if (!baseEdge) {
      diffEdges.push({ ...compareEdge, diffStatus: 'added' })
      summary.edgesAdded++
    } else {
      if (diffEdgeFields(baseEdge, compareEdge)) {
        diffEdges.push({ ...compareEdge, diffStatus: 'modified' })
        summary.edgesModified++
      } else {
        diffEdges.push({ ...compareEdge, diffStatus: 'unchanged' })
        summary.edgesUnchanged++
      }
    }
  }

  // Process base-only edges (removed)
  for (const [id, baseEdge] of baseEdgeMap) {
    if (!compareEdgeMap.has(id)) {
      diffEdges.push({ ...baseEdge, diffStatus: 'removed' })
      summary.edgesRemoved++
    }
  }

  return {
    projectId,
    scope,
    zoomLevel,
    baseReleaseId,
    compareReleaseId,
    nodes: diffNodes,
    edges: diffEdges,
    activeLayers,
    breadcrumb,
    summary,
  }
}
