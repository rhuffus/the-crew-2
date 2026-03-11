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
  role: 'role',
  'agent-archetype': 'archetype',
  'agent-assignment': 'assignment',
  capability: 'cap',
  skill: 'skill',
  workflow: 'wf',
  'workflow-stage': 'wf-stage',
  contract: 'contract',
  policy: 'policy',
  artifact: 'artifact',
}

/**
 * Route patterns per scope type.
 */
const SCOPE_ROUTE_PATTERNS: Record<ScopeType, string> = {
  company: '/projects/:projectId/org',
  department: '/projects/:projectId/departments/:entityId',
  workflow: '/projects/:projectId/workflows/:entityId',
  'workflow-stage': '/projects/:projectId/workflows/:parentId/stages/:entityId',
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
 * - department → /projects/:projectId/departments/:entityId (direct L2 scope)
 * - workflow → /projects/:projectId/workflows/:entityId (direct L3 scope)
 * - workflow-stage → /projects/:projectId/workflows/:parentId/stages/:entityId (L4 scope)
 * - Leaf entities with a known parentDeptId → navigate to parent dept L2, focus on entity
 * - contract/policy with no parent dept → navigate to org L1, focus on entity
 * - company → /projects/:projectId/org
 */
export function resolveEntityRoute(
  projectId: string,
  nodeType: NodeType,
  entityId: string,
  parentDeptId?: string | null,
): EntityRoute {
  if (nodeType === 'company') {
    return { path: `/projects/${projectId}/org`, focusNodeId: null }
  }

  if (nodeType === 'department') {
    return {
      path: `/projects/${projectId}/departments/${entityId}`,
      focusNodeId: null,
    }
  }

  if (nodeType === 'workflow') {
    return {
      path: `/projects/${projectId}/workflows/${entityId}`,
      focusNodeId: null,
    }
  }

  if (nodeType === 'workflow-stage') {
    // workflow-stage needs parent workflow info for routing
    // Fallback: focus on the stage in the workflow view if parent is known
    return {
      path: `/projects/${projectId}/org`,
      focusNodeId: buildVisualId(nodeType, entityId),
    }
  }

  const visualId = buildVisualId(nodeType, entityId)

  // Leaf entities with a known parent department → navigate to that dept's L2
  if (LEAF_TYPES_WITH_DEPT.has(nodeType) && parentDeptId) {
    return {
      path: `/projects/${projectId}/departments/${parentDeptId}`,
      focusNodeId: visualId,
    }
  }

  // contract, policy, or entities without a parent dept → org L1, focus on entity
  return {
    path: `/projects/${projectId}/org`,
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
 */
export function resolveDrillTarget(
  nodeType: NodeType,
  entityId: string,
  projectId: string,
): { route: string; scopeType: ScopeType } | null {
  const scopeDef = Object.values(SCOPE_REGISTRY).find(
    def => def.rootNodeType === nodeType,
  )
  if (!scopeDef) return null // not a drillable type

  const routePattern = SCOPE_ROUTE_PATTERNS[scopeDef.scopeType]
  if (!routePattern) return null

  const route = routePattern
    .replace(':projectId', projectId)
    .replace(':entityId', entityId)

  return { route, scopeType: scopeDef.scopeType }
}
