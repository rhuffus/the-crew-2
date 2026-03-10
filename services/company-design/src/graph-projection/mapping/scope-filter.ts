import type {
  GraphScope,
  LayerId,
  VisualNodeDto,
  VisualEdgeDto,
  ReleaseSnapshotDto,
} from '@the-crew/shared-types'

interface FilterResult {
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
}

export function filterByScope(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  scope: GraphScope,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): FilterResult {
  let filteredNodes: VisualNodeDto[]

  switch (scope.level) {
    case 'L1':
      filteredNodes = filterL1(nodes, activeLayers)
      break
    case 'L2':
      filteredNodes = filterL2(nodes, scope.entityId!, activeLayers, snapshot)
      break
    case 'L3':
      filteredNodes = filterL3(nodes, scope.entityId!, activeLayers, snapshot)
      break
    default:
      filteredNodes = nodes
  }

  // Layer filtering pass
  filteredNodes = applyLayerFilter(filteredNodes, activeLayers, scope)

  // Keep only edges where both endpoints survive
  const nodeIdSet = new Set(filteredNodes.map((n) => n.id))
  const filteredEdges = edges.filter(
    (e) =>
      nodeIdSet.has(e.sourceId) &&
      nodeIdSet.has(e.targetId) &&
      e.layerIds.some((l) => activeLayers.includes(l)),
  )

  return { nodes: filteredNodes, edges: filteredEdges }
}

function filterL1(nodes: VisualNodeDto[], activeLayers: LayerId[]): VisualNodeDto[] {
  return nodes.filter((n) => {
    // Company and department always visible at L1
    if (n.nodeType === 'company' || n.nodeType === 'department') return true
    // Other nodes only if their layer is active
    return n.layerIds.some((l) => activeLayers.includes(l))
  })
}

function filterL2(
  nodes: VisualNodeDto[],
  deptId: string,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): VisualNodeDto[] {
  const deptVisualId = `dept:${deptId}`

  // Find archetype IDs in this department
  const archetypeIds = new Set(
    snapshot.agentArchetypes
      .filter((a) => a.departmentId === deptId)
      .map((a) => a.id),
  )

  // Find skill IDs referenced by archetypes in scope
  const skillIds = new Set<string>()
  for (const a of snapshot.agentArchetypes) {
    if (a.departmentId === deptId) {
      for (const s of a.skillIds ?? []) skillIds.add(s)
    }
  }

  // Find contract IDs where dept or its capabilities are party
  const capIds = new Set(
    snapshot.capabilities
      .filter((c) => c.ownerDepartmentId === deptId)
      .map((c) => c.id),
  )
  const contractIds = new Set<string>()
  for (const c of snapshot.contracts) {
    const providerMatch =
      (c.providerType === 'department' && c.providerId === deptId) ||
      (c.providerType === 'capability' && capIds.has(c.providerId))
    const consumerMatch =
      (c.consumerType === 'department' && c.consumerId === deptId) ||
      (c.consumerType === 'capability' && capIds.has(c.consumerId))
    if (providerMatch || consumerMatch) contractIds.add(c.id)
  }

  return nodes.filter((n) => {
    // Context node always visible
    if (n.id === deptVisualId) return true
    // Sub-departments
    if (n.nodeType === 'department' && n.parentId === deptVisualId) return true
    // Roles in this dept
    if (n.nodeType === 'role' && n.parentId === deptVisualId) return true
    // Archetypes in this dept
    if (n.nodeType === 'agent-archetype' && n.parentId === deptVisualId) return true
    // Assignments for archetypes in scope
    if (n.nodeType === 'agent-assignment' && archetypeIds.has(n.entityId.replace('assignment:', ''))) {
      // Match by parentId which is archetype visual id
      return n.parentId !== null && archetypeIds.has(n.parentId.replace('archetype:', ''))
    }
    // Capabilities owned by this dept (if layer active)
    if (n.nodeType === 'capability' && n.parentId === deptVisualId && activeLayers.includes('capabilities'))
      return true
    // Workflows owned by this dept (if layer active)
    if (n.nodeType === 'workflow' && n.parentId === deptVisualId && activeLayers.includes('workflows'))
      return true
    // Skills referenced by archetypes (if layer active)
    if (n.nodeType === 'skill' && skillIds.has(n.entityId) && activeLayers.includes('capabilities'))
      return true
    // Contracts where dept is party (if layer active)
    if (n.nodeType === 'contract' && contractIds.has(n.entityId) && activeLayers.includes('contracts'))
      return true
    // Policies scoped to this dept (if layer active)
    if (n.nodeType === 'policy' && activeLayers.includes('governance')) {
      const policy = snapshot.policies.find((p) => p.id === n.entityId)
      return policy?.departmentId === deptId
    }
    return false
  })
}

function filterL3(
  nodes: VisualNodeDto[],
  workflowId: string,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): VisualNodeDto[] {
  const wfVisualId = `wf:${workflowId}`
  const wf = snapshot.workflows.find((w) => w.id === workflowId)
  if (!wf) return []

  const boundContractIds = new Set(wf.contractIds ?? [])
  const participantIds = new Set(
    (wf.participants ?? []).map((p) => {
      const prefix = p.participantType === 'role' ? 'role' : 'dept'
      return `${prefix}:${p.participantId}`
    }),
  )

  return nodes.filter((n) => {
    // Context node
    if (n.id === wfVisualId) return true
    // Stages
    if (n.nodeType === 'workflow-stage' && n.parentId === wfVisualId) return true
    // Bound contracts
    if (n.nodeType === 'contract' && boundContractIds.has(n.entityId) && activeLayers.includes('contracts'))
      return true
    // Participants
    if ((n.nodeType === 'role' || n.nodeType === 'department') && participantIds.has(n.id) && activeLayers.includes('organization'))
      return true
    // Governing policies
    if (n.nodeType === 'policy' && activeLayers.includes('governance')) {
      const policy = snapshot.policies.find((p) => p.id === n.entityId)
      return policy?.departmentId === wf.ownerDepartmentId
    }
    return false
  })
}

function applyLayerFilter(
  nodes: VisualNodeDto[],
  activeLayers: LayerId[],
  scope: GraphScope,
): VisualNodeDto[] {
  return nodes.filter((n) => {
    // Context nodes are always kept
    if (scope.level === 'L2' && n.id === `dept:${scope.entityId}`) return true
    if (scope.level === 'L3' && n.id === `wf:${scope.entityId}`) return true
    // Company and department at L1 always visible
    if (scope.level === 'L1' && (n.nodeType === 'company' || n.nodeType === 'department'))
      return true
    // Otherwise node must belong to an active layer
    return n.layerIds.some((l) => activeLayers.includes(l))
  })
}
