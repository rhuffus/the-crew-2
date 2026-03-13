import type {
  GraphScope,
  LayerId,
  VisualNodeDto,
  VisualEdgeDto,
  ReleaseSnapshotDto,
  ScopeType,
  ScopeDescriptor,
} from '@the-crew/shared-types'
import { scopeTypeFromZoomLevel } from '@the-crew/shared-types'

export interface FilterResult {
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
}

type ScopeFilterFn = (
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  entityId: string | null,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
) => FilterResult

const SCOPE_FILTERS: Record<string, ScopeFilterFn> = {
  company: filterCompanyScope,
  department: filterDepartmentScope,
  team: filterTeamScope,
  'agent-detail': filterAgentDetailScope,
  workflow: filterWorkflowScope,
  'workflow-stage': filterWorkflowStageScope,
}

/**
 * Filter graph by scope using dispatch map.
 * Accepts ScopeDescriptor (new) or GraphScope (legacy).
 */
export function filterByScope(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  scope: ScopeDescriptor | GraphScope,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): FilterResult {
  // Determine scopeType: new ScopeDescriptor has scopeType, legacy GraphScope has level+entityType
  const scopeType: ScopeType = 'scopeType' in scope
    ? scope.scopeType
    : (scope.entityType as ScopeType) ?? scopeTypeFromZoomLevel(scope.level)

  const entityId = 'scopeType' in scope ? scope.entityId : scope.entityId

  const filterFn = SCOPE_FILTERS[scopeType]
  if (!filterFn) return { nodes, edges }

  const { nodes: filteredNodes, edges: filteredEdges } = filterFn(nodes, edges, entityId, activeLayers, snapshot)

  // Layer filtering pass
  const layerFiltered = applyLayerFilter(filteredNodes, activeLayers, scopeType, entityId)

  // Keep only edges where both endpoints survive
  // Use scope-filtered edges if provided, otherwise fall back to all edges
  const edgeCandidates = filteredEdges.length > 0 ? filteredEdges : edges
  const nodeIdSet = new Set(layerFiltered.map((n) => n.id))
  const cleanEdges = edgeCandidates.filter(
    (e) =>
      nodeIdSet.has(e.sourceId) &&
      nodeIdSet.has(e.targetId) &&
      e.layerIds.some((l) => activeLayers.includes(l)),
  )

  return { nodes: layerFiltered, edges: cleanEdges }
}

function filterCompanyScope(
  nodes: VisualNodeDto[],
  _edges: VisualEdgeDto[],
  _entityId: string | null,
  activeLayers: LayerId[],
  _snapshot: ReleaseSnapshotDto,
): FilterResult {
  const filteredNodes = nodes.filter((n) => {
    if (n.nodeType === 'company' || n.nodeType === 'department' || n.nodeType === 'team') return true
    return n.layerIds.some((l) => activeLayers.includes(l))
  })
  return { nodes: filteredNodes, edges: [] }
}

function filterTeamScope(
  nodes: VisualNodeDto[],
  _edges: VisualEdgeDto[],
  entityId: string | null,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): FilterResult {
  const teamId = entityId!
  const teamVisualId = `team:${teamId}`

  const teamAgentIds = new Set(
    (snapshot.agents ?? [])
      .filter(a => a.uoId === teamId)
      .map(a => a.id),
  )

  const filteredNodes = nodes.filter((n) => {
    if (n.id === teamVisualId) return true
    if (n.nodeType === 'coordinator-agent' && teamAgentIds.has(n.entityId)) return true
    if (n.nodeType === 'specialist-agent' && teamAgentIds.has(n.entityId)) return true
    if (n.nodeType === 'proposal' && activeLayers.includes('governance')) {
      const proposal = (snapshot.proposals ?? []).find(p => p.id === n.entityId)
      return proposal?.proposedByAgentId ? teamAgentIds.has(proposal.proposedByAgentId) : false
    }
    return false
  })
  return { nodes: filteredNodes, edges: [] }
}

function filterAgentDetailScope(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  entityId: string | null,
  _activeLayers: LayerId[],
  _snapshot: ReleaseSnapshotDto,
): FilterResult {
  const agentNode = nodes.find(
    (n) => n.entityId === entityId && (n.nodeType === 'coordinator-agent' || n.nodeType === 'specialist-agent'),
  )
  if (!agentNode) return { nodes: [], edges: [] }

  const agentEdges = edges.filter(
    (e) => e.sourceId === agentNode.id || e.targetId === agentNode.id,
  )
  const connectedNodeIds = new Set([
    agentNode.id,
    ...agentEdges.flatMap((e) => [e.sourceId, e.targetId]),
  ])
  return {
    nodes: nodes.filter((n) => connectedNodeIds.has(n.id)),
    edges: agentEdges,
  }
}

function filterDepartmentScope(
  nodes: VisualNodeDto[],
  _edges: VisualEdgeDto[],
  entityId: string | null,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): FilterResult {
  const deptId = entityId!
  const deptVisualId = `dept:${deptId}`

  const archetypeIds = new Set(
    snapshot.agentArchetypes
      .filter((a) => a.departmentId === deptId)
      .map((a) => a.id),
  )

  const skillIds = new Set<string>()
  for (const a of snapshot.agentArchetypes) {
    if (a.departmentId === deptId) {
      for (const s of a.skillIds ?? []) skillIds.add(s)
    }
  }

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

  const filteredNodes = nodes.filter((n) => {
    if (n.id === deptVisualId) return true
    if (n.nodeType === 'department' && n.parentId === deptVisualId) return true
    if (n.nodeType === 'role' && n.parentId === deptVisualId) return true
    if (n.nodeType === 'agent-archetype' && n.parentId === deptVisualId) return true
    if (n.nodeType === 'agent-assignment' && archetypeIds.has(n.entityId.replace('assignment:', ''))) {
      return n.parentId !== null && archetypeIds.has(n.parentId.replace('archetype:', ''))
    }
    if (n.nodeType === 'capability' && n.parentId === deptVisualId && activeLayers.includes('capabilities'))
      return true
    if (n.nodeType === 'workflow' && n.parentId === deptVisualId && activeLayers.includes('workflows'))
      return true
    if (n.nodeType === 'skill' && skillIds.has(n.entityId) && activeLayers.includes('capabilities'))
      return true
    if (n.nodeType === 'contract' && contractIds.has(n.entityId) && activeLayers.includes('contracts'))
      return true
    if (n.nodeType === 'policy' && activeLayers.includes('governance')) {
      const policy = snapshot.policies.find((p) => p.id === n.entityId)
      return policy?.departmentId === deptId
    }
    if (n.nodeType === 'artifact' && activeLayers.includes('artifacts')) {
      const artifact = (snapshot.artifacts ?? []).find((a) => a.id === n.entityId)
      if (!artifact) return false
      // Show artifacts produced by this dept or its capabilities
      if (artifact.producerType === 'department' && artifact.producerId === deptId) return true
      if (artifact.producerType === 'capability' && artifact.producerId && capIds.has(artifact.producerId)) return true
      // Show artifacts consumed by this dept
      if (artifact.consumerIds.includes(deptId)) return true
      // Show artifacts consumed by dept's capabilities
      for (const cId of artifact.consumerIds) {
        if (capIds.has(cId)) return true
      }
      return false
    }
    return false
  })
  return { nodes: filteredNodes, edges: [] }
}

function filterWorkflowScope(
  nodes: VisualNodeDto[],
  _edges: VisualEdgeDto[],
  entityId: string | null,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): FilterResult {
  const workflowId = entityId!
  const wfVisualId = `wf:${workflowId}`
  const wf = snapshot.workflows.find((w) => w.id === workflowId)
  if (!wf) return { nodes: [], edges: [] }

  const boundContractIds = new Set(wf.contractIds ?? [])
  const participantIds = new Set(
    (wf.participants ?? []).map((p) => {
      const prefix = p.participantType === 'role' ? 'role' : 'dept'
      return `${prefix}:${p.participantId}`
    }),
  )

  const filteredNodes = nodes.filter((n) => {
    if (n.id === wfVisualId) return true
    if (n.nodeType === 'workflow-stage' && n.parentId === wfVisualId) return true
    if (n.nodeType === 'contract' && boundContractIds.has(n.entityId) && activeLayers.includes('contracts'))
      return true
    if ((n.nodeType === 'role' || n.nodeType === 'department') && participantIds.has(n.id) && activeLayers.includes('organization'))
      return true
    if (n.nodeType === 'policy' && activeLayers.includes('governance')) {
      const policy = snapshot.policies.find((p) => p.id === n.entityId)
      return policy?.departmentId === wf.ownerDepartmentId
    }
    if (n.nodeType === 'artifact' && activeLayers.includes('artifacts')) {
      const artifact = (snapshot.artifacts ?? []).find((a) => a.id === n.entityId)
      if (!artifact) return false
      // Show artifacts whose producer/consumer is a workflow participant
      const participantEntityIds = new Set(
        (wf.participants ?? []).map((p) => p.participantId),
      )
      if (wf.ownerDepartmentId) participantEntityIds.add(wf.ownerDepartmentId)
      if (artifact.producerId && participantEntityIds.has(artifact.producerId)) return true
      for (const cId of artifact.consumerIds) {
        if (participantEntityIds.has(cId)) return true
      }
      return false
    }
    return false
  })
  return { nodes: filteredNodes, edges: [] }
}

function filterWorkflowStageScope(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  entityId: string | null,
  _activeLayers: LayerId[],
  _snapshot: ReleaseSnapshotDto,
): FilterResult {
  const stageNode = nodes.find(
    (n) => n.entityId === entityId && n.nodeType === 'workflow-stage',
  )
  if (!stageNode) return { nodes: [], edges: [] }

  const stageEdges = edges.filter(
    (e) => e.sourceId === stageNode.id || e.targetId === stageNode.id,
  )
  const connectedNodeIds = new Set([
    stageNode.id,
    ...stageEdges.flatMap((e) => [e.sourceId, e.targetId]),
  ])
  return {
    nodes: nodes.filter((n) => connectedNodeIds.has(n.id)),
    edges: stageEdges,
  }
}

function applyLayerFilter(
  nodes: VisualNodeDto[],
  activeLayers: LayerId[],
  scopeType: ScopeType,
  entityId: string | null,
): VisualNodeDto[] {
  return nodes.filter((n) => {
    // Context nodes are always kept
    if (scopeType === 'department' && n.id === `dept:${entityId}`) return true
    if (scopeType === 'workflow' && n.id === `wf:${entityId}`) return true
    if (scopeType === 'workflow-stage' && n.entityId === entityId && n.nodeType === 'workflow-stage') return true
    // Company and department at L1 always visible
    if (scopeType === 'company' && (n.nodeType === 'company' || n.nodeType === 'department'))
      return true
    // Otherwise node must belong to an active layer
    return n.layerIds.some((l) => activeLayers.includes(l))
  })
}
