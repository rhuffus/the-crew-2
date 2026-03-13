import type { Node, Edge } from '@xyflow/react'
import type {
  VisualNodeDto,
  VisualEdgeDto,
  VisualGraphDto,
  VisualNodeDiffDto,
  VisualEdgeDiffDto,
  VisualGraphDiffDto,
  VisualDiffStatus,
  ValidationIssue,
  ScopeType,
  EdgeType,
} from '@the-crew/shared-types'
import { groupIssuesByVisualNodeId } from './validation-mapping'

const NODE_SPACING_X = 250
const NODE_SPACING_Y = 120
const STAGE_START_X = 100
const STAGE_START_Y = 200
const PARTICIPANT_START_Y = 50
const CONTRACT_START_Y = 400

export interface FlowGraph {
  nodes: Node[]
  edges: Edge[]
}

function edgeStyleToReactFlow(style: VisualEdgeDto['style']): string {
  switch (style) {
    case 'dashed':
      return '8 4'
    case 'dotted':
      return '2 4'
    default:
      return 'none'
  }
}

export function statusToColor(status: VisualNodeDto['status']): string {
  switch (status) {
    case 'error':
      return '#ef4444'
    case 'warning':
      return '#eab308'
    case 'dimmed':
      return '#94a3b8'
    default:
      return '#64748b'
  }
}

export function visualNodeToFlowNode(node: VisualNodeDto, position: { x: number; y: number }): Node {
  return {
    id: node.id,
    type: node.nodeType,
    position: node.position ?? position,
    data: {
      label: node.label,
      sublabel: node.sublabel,
      nodeType: node.nodeType,
      entityId: node.entityId,
      status: node.status,
      collapsed: node.collapsed,
      layerIds: node.layerIds,
      parentId: node.parentId,
    },
  }
}

export function visualEdgeToFlowEdge(edge: VisualEdgeDto): Edge {
  const dashArray = edgeStyleToReactFlow(edge.style)
  return {
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    label: edge.label ?? undefined,
    type: 'default',
    style: dashArray !== 'none' ? { strokeDasharray: dashArray } : undefined,
    data: {
      edgeType: edge.edgeType,
      layerIds: edge.layerIds,
    },
  }
}

export function layoutWorkflowGraph(graph: VisualGraphDto): FlowGraph {
  const nodes: Node[] = []

  // Single-pass categorization (perf: replaces 4x filter + 1x find)
  let workflowNode: VisualNodeDto | undefined
  const stages: VisualNodeDto[] = []
  const participants: VisualNodeDto[] = []
  const contracts: VisualNodeDto[] = []
  const policies: VisualNodeDto[] = []

  for (const n of graph.nodes) {
    switch (n.nodeType) {
      case 'workflow': workflowNode = n; break
      case 'workflow-stage': stages.push(n); break
      case 'role':
      case 'department': participants.push(n); break
      case 'contract': contracts.push(n); break
      case 'policy': policies.push(n); break
    }
  }

  stages.sort((a, b) => {
    const orderA = parseInt(a.id.split(':').pop() ?? '0', 10)
    const orderB = parseInt(b.id.split(':').pop() ?? '0', 10)
    return orderA - orderB
  })

  // Layout workflow context node
  if (workflowNode) {
    nodes.push(visualNodeToFlowNode(workflowNode, { x: 0, y: STAGE_START_Y - 80 }))
  }

  // Layout stages horizontally
  stages.forEach((stage, i) => {
    nodes.push(
      visualNodeToFlowNode(stage, {
        x: STAGE_START_X + i * NODE_SPACING_X,
        y: STAGE_START_Y,
      }),
    )
  })

  // Layout participants above stages
  participants.forEach((p, i) => {
    nodes.push(
      visualNodeToFlowNode(p, {
        x: STAGE_START_X + i * NODE_SPACING_X,
        y: PARTICIPANT_START_Y,
      }),
    )
  })

  // Layout contracts below stages
  contracts.forEach((c, i) => {
    nodes.push(
      visualNodeToFlowNode(c, {
        x: STAGE_START_X + i * NODE_SPACING_X,
        y: CONTRACT_START_Y,
      }),
    )
  })

  // Layout policies below contracts
  policies.forEach((p, i) => {
    nodes.push(
      visualNodeToFlowNode(p, {
        x: STAGE_START_X + i * NODE_SPACING_X,
        y: CONTRACT_START_Y + NODE_SPACING_Y,
      }),
    )
  })

  // Convert edges
  const edges = graph.edges.map(visualEdgeToFlowEdge)

  return { nodes, edges }
}

export function layoutOrgGraph(graph: VisualGraphDto): FlowGraph {
  const nodes: Node[] = []

  // Build a tree from parentId relationships
  const childrenMap = new Map<string | null, VisualNodeDto[]>()
  for (const node of graph.nodes) {
    const parent = node.parentId
    const siblings = childrenMap.get(parent) ?? []
    siblings.push(node)
    childrenMap.set(parent, siblings)
  }

  // BFS to assign positions level by level
  const companyNode = graph.nodes.find((n) => n.nodeType === 'company')
  if (!companyNode) {
    // Fallback: flat layout
    graph.nodes.forEach((n, i) => {
      nodes.push(visualNodeToFlowNode(n, { x: i * NODE_SPACING_X, y: 0 }))
    })
    return { nodes, edges: graph.edges.map(visualEdgeToFlowEdge) }
  }

  // Track which nodes are placed to handle orphans
  const placed = new Set<string>()

  // First pass: count nodes per depth
  const depthNodes = new Map<number, VisualNodeDto[]>()
  const bfsQueue: { node: VisualNodeDto; depth: number }[] = [{ node: companyNode, depth: 0 }]
  const visited = new Set<string>([companyNode.id])

  while (bfsQueue.length > 0) {
    const item = bfsQueue.shift()!
    const list = depthNodes.get(item.depth) ?? []
    list.push(item.node)
    depthNodes.set(item.depth, list)

    const children = childrenMap.get(item.node.id) ?? []
    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id)
        bfsQueue.push({ node: child, depth: item.depth + 1 })
      }
    }
  }

  // Assign positions: center each level
  for (const [depth, levelNodes] of depthNodes.entries()) {
    const totalWidth = (levelNodes.length - 1) * NODE_SPACING_X
    const startX = -totalWidth / 2
    levelNodes.forEach((node, i) => {
      nodes.push(
        visualNodeToFlowNode(node, {
          x: startX + i * NODE_SPACING_X,
          y: depth * NODE_SPACING_Y * 1.5,
        }),
      )
      placed.add(node.id)
    })
  }

  // Place orphan nodes (not connected to tree) at the bottom
  const orphans = graph.nodes.filter((n) => !placed.has(n.id))
  if (orphans.length > 0) {
    const maxDepth = Math.max(...depthNodes.keys()) + 1
    const totalWidth = (orphans.length - 1) * NODE_SPACING_X
    const startX = -totalWidth / 2
    orphans.forEach((n, i) => {
      nodes.push(
        visualNodeToFlowNode(n, {
          x: startX + i * NODE_SPACING_X,
          y: maxDepth * NODE_SPACING_Y * 1.5,
        }),
      )
    })
  }

  const edges = graph.edges.map(visualEdgeToFlowEdge)
  return { nodes, edges }
}

export function layoutDepartmentGraph(graph: VisualGraphDto): FlowGraph {
  const nodes: Node[] = []

  // Build a tree from parentId relationships
  const childrenMap = new Map<string | null, VisualNodeDto[]>()
  for (const node of graph.nodes) {
    const parent = node.parentId
    const siblings = childrenMap.get(parent) ?? []
    siblings.push(node)
    childrenMap.set(parent, siblings)
  }

  // Find the context department node (the scoped one)
  const deptNode = graph.nodes.find(
    (n) => n.nodeType === 'department' && n.entityId === graph.scope.entityId,
  )

  if (!deptNode) {
    // Fallback: flat layout
    graph.nodes.forEach((n, i) => {
      nodes.push(visualNodeToFlowNode(n, { x: i * NODE_SPACING_X, y: 0 }))
    })
    return { nodes, edges: graph.edges.map(visualEdgeToFlowEdge) }
  }

  const placed = new Set<string>()

  // BFS from dept node through parentId tree
  const depthNodes = new Map<number, VisualNodeDto[]>()
  const bfsQueue: { node: VisualNodeDto; depth: number }[] = [{ node: deptNode, depth: 0 }]
  const visited = new Set<string>([deptNode.id])

  while (bfsQueue.length > 0) {
    const item = bfsQueue.shift()!
    const list = depthNodes.get(item.depth) ?? []
    list.push(item.node)
    depthNodes.set(item.depth, list)

    const children = childrenMap.get(item.node.id) ?? []
    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id)
        bfsQueue.push({ node: child, depth: item.depth + 1 })
      }
    }
  }

  // Assign positions: center each level
  for (const [depth, levelNodes] of depthNodes.entries()) {
    const totalWidth = (levelNodes.length - 1) * NODE_SPACING_X
    const startX = -totalWidth / 2
    levelNodes.forEach((node, i) => {
      nodes.push(
        visualNodeToFlowNode(node, {
          x: startX + i * NODE_SPACING_X,
          y: depth * NODE_SPACING_Y * 1.5,
        }),
      )
      placed.add(node.id)
    })
  }

  // Place orphan nodes (skills, contracts, policies without parentId in tree) at the bottom
  const orphans = graph.nodes.filter((n) => !placed.has(n.id))
  if (orphans.length > 0) {
    const maxDepth = Math.max(...depthNodes.keys()) + 1
    const totalWidth = (orphans.length - 1) * NODE_SPACING_X
    const startX = -totalWidth / 2
    orphans.forEach((n, i) => {
      nodes.push(
        visualNodeToFlowNode(n, {
          x: startX + i * NODE_SPACING_X,
          y: maxDepth * NODE_SPACING_Y * 1.5,
        }),
      )
    })
  }

  const edges = graph.edges.map(visualEdgeToFlowEdge)
  return { nodes, edges }
}

export function enrichWithValidationCounts(
  flowGraph: FlowGraph,
  issues: ValidationIssue[],
  projectId: string,
): FlowGraph {
  if (issues.length === 0) return flowGraph
  const issueMap = groupIssuesByVisualNodeId(issues, projectId)
  return {
    ...flowGraph,
    nodes: flowGraph.nodes.map((node) => {
      const nodeIssues = issueMap.get(node.id)
      if (!nodeIssues) return node
      return {
        ...node,
        data: { ...node.data, validationCount: nodeIssues.length },
      }
    }),
  }
}

/**
 * Counts external references per node: edges where one endpoint is in the graph
 * and the other is NOT. Sets `externalRefCount` on those nodes.
 */
export function enrichWithExternalRefCounts(
  flowGraph: FlowGraph,
  graphEdges: VisualEdgeDto[],
  graphNodeIds: Set<string>,
): FlowGraph {
  const externalRefCounts = new Map<string, number>()

  for (const edge of graphEdges) {
    const sourceIn = graphNodeIds.has(edge.sourceId)
    const targetIn = graphNodeIds.has(edge.targetId)

    // Only count edges where exactly one endpoint is in the graph
    if (sourceIn && !targetIn) {
      externalRefCounts.set(edge.sourceId, (externalRefCounts.get(edge.sourceId) ?? 0) + 1)
    } else if (!sourceIn && targetIn) {
      externalRefCounts.set(edge.targetId, (externalRefCounts.get(edge.targetId) ?? 0) + 1)
    }
  }

  if (externalRefCounts.size === 0) return flowGraph

  return {
    ...flowGraph,
    nodes: flowGraph.nodes.map((node) => {
      const count = externalRefCounts.get(node.id)
      if (!count) return node
      return {
        ...node,
        data: { ...node.data, externalRefCount: count },
      }
    }),
  }
}

/**
 * Applies edge emphasis by dimming edges not in the emphasis list.
 * Used by view presets to highlight relevant edge types.
 */
export function applyEdgeEmphasis(
  flowGraph: FlowGraph,
  emphasisEdgeTypes: EdgeType[] | null | undefined,
): FlowGraph {
  if (!emphasisEdgeTypes || emphasisEdgeTypes.length === 0) return flowGraph
  return {
    ...flowGraph,
    edges: flowGraph.edges.map((edge) => {
      const edgeType = (edge.data as Record<string, unknown> | undefined)?.edgeType as string | undefined
      if (!edgeType || emphasisEdgeTypes.includes(edgeType as EdgeType)) return edge
      return {
        ...edge,
        style: { ...edge.style, opacity: 0.2 },
      }
    }),
  }
}

export function layoutWorkflowStageGraph(graph: VisualGraphDto): FlowGraph {
  const nodes: Node[] = []

  // Find the stage node (center)
  const stageNode = graph.nodes.find((n) => n.nodeType === 'workflow-stage')
  const otherNodes = graph.nodes.filter((n) => n.nodeType !== 'workflow-stage')

  if (stageNode) {
    nodes.push(visualNodeToFlowNode(stageNode, { x: 0, y: 0 }))
  }

  // Radial layout for connected nodes around the center
  const radius = 250
  otherNodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(otherNodes.length, 1)
    nodes.push(
      visualNodeToFlowNode(n, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }),
    )
  })

  const edges = graph.edges.map(visualEdgeToFlowEdge)
  return { nodes, edges }
}

export function layoutTeamGraph(graph: VisualGraphDto): FlowGraph {
  const nodes: Node[] = []

  // Find the team node
  const teamNode = graph.nodes.find(
    (n) => n.nodeType === 'team' && n.entityId === graph.scope.entityId,
  )

  if (!teamNode) {
    // Fallback to department-style layout
    return layoutDepartmentGraph(graph)
  }

  // Place team node at center top
  nodes.push(visualNodeToFlowNode(teamNode, { x: 0, y: 0 }))
  const placed = new Set<string>([teamNode.id])

  // Find coordinator agent
  const coordinators = graph.nodes.filter(
    (n) => n.nodeType === 'coordinator-agent' && n.parentId === teamNode.id,
  )
  coordinators.forEach((coord, i) => {
    const totalWidth = (coordinators.length - 1) * NODE_SPACING_X
    nodes.push(visualNodeToFlowNode(coord, {
      x: -totalWidth / 2 + i * NODE_SPACING_X,
      y: NODE_SPACING_Y,
    }))
    placed.add(coord.id)
  })

  // Find specialist agents
  const specialists = graph.nodes.filter(
    (n) => n.nodeType === 'specialist-agent' && n.parentId === teamNode.id,
  )
  if (specialists.length > 0) {
    const totalWidth = (specialists.length - 1) * NODE_SPACING_X
    const startX = -totalWidth / 2
    specialists.forEach((spec, i) => {
      nodes.push(visualNodeToFlowNode(spec, {
        x: startX + i * NODE_SPACING_X,
        y: NODE_SPACING_Y * 2.5,
      }))
      placed.add(spec.id)
    })
  }

  // Place remaining orphan nodes (proposals, etc.)
  const orphans = graph.nodes.filter((n) => !placed.has(n.id))
  if (orphans.length > 0) {
    const totalWidth = (orphans.length - 1) * NODE_SPACING_X
    const startX = -totalWidth / 2
    orphans.forEach((n, i) => {
      nodes.push(visualNodeToFlowNode(n, {
        x: startX + i * NODE_SPACING_X,
        y: NODE_SPACING_Y * 4,
      }))
    })
  }

  const edges = graph.edges.map(visualEdgeToFlowEdge)
  return { nodes, edges }
}

type LayoutFn = (graph: VisualGraphDto) => FlowGraph

const SCOPE_LAYOUTS: Record<ScopeType, LayoutFn> = {
  company: layoutOrgGraph,
  department: layoutDepartmentGraph,
  team: layoutTeamGraph,
  'agent-detail': layoutWorkflowStageGraph,
  workflow: layoutWorkflowGraph,
  'workflow-stage': layoutWorkflowStageGraph,
}

function inferScopeTypeFromLevel(zoomLevel: string): ScopeType {
  switch (zoomLevel) {
    case 'L2': return 'department'
    case 'L3': return 'workflow'
    case 'L4': return 'workflow-stage'
    default: return 'company'
  }
}

export function graphToFlow(graph: VisualGraphDto): FlowGraph {
  const scopeType = graph.scopeType ?? inferScopeTypeFromLevel(graph.zoomLevel)
  const layoutFn = SCOPE_LAYOUTS[scopeType] ?? layoutOrgGraph
  return layoutFn(graph)
}

// --- Diff rendering ---

const DIFF_NODE_STYLES: Record<VisualDiffStatus, { borderClass: string; bgClass: string; opacityClass: string; badge: string | null }> = {
  added: { borderClass: 'border-green-500', bgClass: 'bg-green-50', opacityClass: '', badge: '+' },
  removed: { borderClass: 'border-red-500 border-dashed', bgClass: 'bg-red-50', opacityClass: 'opacity-70', badge: '−' },
  modified: { borderClass: 'border-amber-500', bgClass: 'bg-amber-50', opacityClass: '', badge: '~' },
  unchanged: { borderClass: 'border-gray-200', bgClass: 'bg-white', opacityClass: 'opacity-50', badge: null },
}

const DIFF_EDGE_COLORS: Record<VisualDiffStatus, string> = {
  added: '#22c55e',
  removed: '#ef4444',
  modified: '#f59e0b',
  unchanged: '#d1d5db',
}

const DIFF_EDGE_OPACITY: Record<VisualDiffStatus, number> = {
  added: 1.0,
  removed: 0.5,
  modified: 1.0,
  unchanged: 0.3,
}

export function diffNodeToFlowNode(node: VisualNodeDiffDto, position: { x: number; y: number }): Node {
  const style = DIFF_NODE_STYLES[node.diffStatus]
  return {
    id: node.id,
    type: node.nodeType,
    position: node.position ?? position,
    data: {
      label: node.label,
      sublabel: node.sublabel,
      nodeType: node.nodeType,
      entityId: node.entityId,
      status: node.status,
      collapsed: node.collapsed,
      layerIds: node.layerIds,
      parentId: node.parentId,
      diffStatus: node.diffStatus,
      diffBadge: style.badge,
      diffBorderClass: style.borderClass,
      diffBgClass: style.bgClass,
      diffOpacityClass: style.opacityClass,
      changes: node.changes,
    },
  }
}

export function diffEdgeToFlowEdge(edge: VisualEdgeDiffDto): Edge {
  const color = DIFF_EDGE_COLORS[edge.diffStatus]
  const opacity = DIFF_EDGE_OPACITY[edge.diffStatus]
  const isRemoved = edge.diffStatus === 'removed'

  return {
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    label: edge.diffStatus !== 'unchanged'
      ? `${edge.diffStatus === 'added' ? '+' : edge.diffStatus === 'removed' ? '−' : '~'} ${edge.edgeType}`
      : undefined,
    type: 'default',
    style: {
      stroke: color,
      opacity,
      ...(isRemoved ? { strokeDasharray: '8 4' } : {}),
    },
    data: {
      edgeType: edge.edgeType,
      layerIds: edge.layerIds,
      diffStatus: edge.diffStatus,
    },
  }
}

export function layoutDiffGraph(diff: VisualGraphDiffDto): FlowGraph {
  // Separate compare (added + modified + unchanged) from removed nodes
  const compareNodes = diff.nodes.filter((n) => n.diffStatus !== 'removed')
  const removedNodes = diff.nodes.filter((n) => n.diffStatus === 'removed')

  // Layout the compare graph using the standard layout algorithm
  const compareGraph: VisualGraphDto = {
    projectId: diff.projectId,
    scopeType: diff.scopeType,
    scope: diff.scope,
    zoomLevel: diff.zoomLevel,
    nodes: compareNodes,
    edges: [],
    activeLayers: diff.activeLayers,
    breadcrumb: diff.breadcrumb,
  }

  const compareLayout = graphToFlow(compareGraph)

  // Build position map from compare layout
  const positionMap = new Map<string, { x: number; y: number }>()
  for (const node of compareLayout.nodes) {
    positionMap.set(node.id, node.position)
  }

  // Convert compare nodes with diff data
  const nodes: Node[] = compareNodes.map((n) => {
    const pos = positionMap.get(n.id) ?? { x: 0, y: 0 }
    return diffNodeToFlowNode(n, pos)
  })

  // Place removed nodes near their former parent, or in a cluster at the bottom
  if (removedNodes.length > 0) {
    // Find the max y from the compare layout
    let maxY = 0
    for (const n of nodes) {
      if (n.position.y > maxY) maxY = n.position.y
    }
    const removedStartY = maxY + NODE_SPACING_Y * 2

    removedNodes.forEach((n, i) => {
      // Try to place near the former parent if it exists in the layout
      const parentPos = n.parentId ? positionMap.get(n.parentId) : null
      const pos = parentPos
        ? { x: parentPos.x + NODE_SPACING_X * (i + 1), y: parentPos.y + NODE_SPACING_Y }
        : { x: i * NODE_SPACING_X, y: removedStartY }
      nodes.push(diffNodeToFlowNode(n, pos))
    })
  }

  // Convert edges with diff styling
  const edges = diff.edges.map(diffEdgeToFlowEdge)

  return { nodes, edges }
}
