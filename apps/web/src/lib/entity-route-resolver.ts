import type { NodeType, ScopeType } from '@the-crew/shared-types'
import { SCOPE_REGISTRY } from '@the-crew/shared-types'

export interface EntityRoute {
  path: string
  focusNodeId: string | null
}

/**
 * Maps a nodeType to the prefix used in visual IDs (e.g. 'department' → 'dept').
 */
const NODE_TYPE_TO_PREFIX: Record<NodeType, string> = {
  company: 'company',
  department: 'dept',
  team: 'team',
  'coordinator-agent': 'coord-agent',
  'specialist-agent': 'spec-agent',
  objective: 'objective',
  'event-trigger': 'event-trigger',
  'external-source': 'ext-source',
  workflow: 'wf',
  'workflow-stage': 'wf-stage',
  handoff: 'handoff',
  contract: 'contract',
  policy: 'policy',
  artifact: 'artifact',
  decision: 'decision',
  proposal: 'proposal',
  // Legacy (kept for backend bridge)
  role: 'role',
  'agent-archetype': 'archetype',
  'agent-assignment': 'assignment',
  capability: 'cap',
  skill: 'skill',
}

/**
 * Route patterns per scope type.
 */
const SCOPE_ROUTE_PATTERNS: Record<ScopeType, string> = {
  company: '/projects/:projectSlug/org',
  department: '/projects/:projectSlug/departments/:entityId',
  team: '/projects/:projectSlug/teams/:entityId',
  'agent-detail': '/projects/:projectSlug/agents/:entityId',
  workflow: '/projects/:projectSlug/workflows/:entityId',
  'workflow-stage': '/projects/:projectSlug/workflows/:parentId/stages/:entityId',
}

/**
 * Node types whose parent department can be inferred from parentId.
 * When navigating to these, we go to the parent department's L2 and focus on the entity.
 */
const LEAF_TYPES_WITH_DEPT = new Set<NodeType>([
  'role',
  'agent-archetype',
  'agent-assignment',
  'capability',
  'skill',
])

/**
 * Build a visual ID for the given nodeType + entityId.
 */
export function buildVisualId(nodeType: NodeType, entityId: string): string {
  const prefix = NODE_TYPE_TO_PREFIX[nodeType]
  return `${prefix}:${entityId}`
}

/**
 * Resolves the route and focus target for navigating to a specific entity.
 *
 * @param projectSlug - The project slug used in URL paths
 */
export function resolveEntityRoute(
  projectSlug: string,
  nodeType: NodeType,
  entityId: string,
  parentDeptId?: string | null,
): EntityRoute {
  if (nodeType === 'company') {
    return { path: `/projects/${projectSlug}/org`, focusNodeId: null }
  }

  if (nodeType === 'department') {
    return {
      path: `/projects/${projectSlug}/departments/${entityId}`,
      focusNodeId: null,
    }
  }

  if (nodeType === 'workflow') {
    return {
      path: `/projects/${projectSlug}/workflows/${entityId}`,
      focusNodeId: null,
    }
  }

  if (nodeType === 'team') {
    return {
      path: `/projects/${projectSlug}/teams/${entityId}`,
      focusNodeId: null,
    }
  }

  if (nodeType === 'coordinator-agent' || nodeType === 'specialist-agent') {
    return {
      path: `/projects/${projectSlug}/agents/${entityId}`,
      focusNodeId: null,
    }
  }

  if (nodeType === 'workflow-stage') {
    return {
      path: `/projects/${projectSlug}/org`,
      focusNodeId: buildVisualId(nodeType, entityId),
    }
  }

  const visualId = buildVisualId(nodeType, entityId)

  if (LEAF_TYPES_WITH_DEPT.has(nodeType) && parentDeptId) {
    return {
      path: `/projects/${projectSlug}/departments/${parentDeptId}`,
      focusNodeId: visualId,
    }
  }

  return {
    path: `/projects/${projectSlug}/org`,
    focusNodeId: visualId,
  }
}

/**
 * Checks if a node type supports direct scope navigation (has its own canvas level).
 * Uses SCOPE_REGISTRY for extensibility.
 */
export function isScopeType(nodeType: NodeType): boolean {
  return Object.values(SCOPE_REGISTRY).some(def => def.rootNodeType === nodeType)
}

/**
 * Extracts the department entity ID from a visual parentId like "dept:abc".
 * Returns null if parentId is not a department.
 */
export function extractDeptIdFromParent(parentId: string | null): string | null {
  if (!parentId) return null
  if (parentId.startsWith('dept:')) return parentId.slice(5)
  return null
}

/**
 * Generic drilldown resolution using SCOPE_REGISTRY.
 * Returns the target route and scope type for a given node.
 *
 * @param projectSlug - The project slug used in URL paths
 */
export function resolveDrillTarget(
  nodeType: NodeType,
  entityId: string,
  projectSlug: string,
): { route: string; scopeType: ScopeType } | null {
  const scopeDef = Object.values(SCOPE_REGISTRY).find(
    def => def.rootNodeType === nodeType,
  )
  if (!scopeDef) return null // not a drillable type

  const routePattern = SCOPE_ROUTE_PATTERNS[scopeDef.scopeType]
  if (!routePattern) return null

  const route = routePattern
    .replace(':projectSlug', projectSlug)
    .replace(':entityId', entityId)

  return { route, scopeType: scopeDef.scopeType }
}
