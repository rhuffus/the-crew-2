import type {
  ConnectionRule,
  EdgeType,
  NodeType,
  VisualEdgeDto,
} from '@the-crew/shared-types'

// --- Public interfaces ---

export interface ConnectionValidation {
  valid: boolean
  possibleEdgeTypes: EdgeType[]
}

export interface DuplicateCheck {
  isDuplicate: boolean
  /** True when the edge type uses a single-ID field (replaces existing value) */
  isReplacement: boolean
  /** The existing edge that would be duplicated or replaced */
  existingEdge: VisualEdgeDto | null
}

// --- Non-creatable edge types (derived, not user-initiated) ---

const NON_CREATABLE_EDGE_TYPES: ReadonlySet<EdgeType> = new Set(['hands_off_to'])

// --- Core validation functions ---

/**
 * Validate whether a connection between two node types is allowed.
 * Returns the list of possible edge types for the pair.
 * Excludes non-creatable edge types (e.g. hands_off_to).
 */
export function validateConnection(
  sourceNodeType: NodeType,
  targetNodeType: NodeType,
  rules: ConnectionRule[],
): ConnectionValidation {
  const possibleEdgeTypes = rules
    .filter(
      (rule) =>
        rule.sourceTypes.includes(sourceNodeType) &&
        rule.targetTypes.includes(targetNodeType) &&
        !NON_CREATABLE_EDGE_TYPES.has(rule.edgeType),
    )
    .map((rule) => rule.edgeType)

  return {
    valid: possibleEdgeTypes.length > 0,
    possibleEdgeTypes,
  }
}

/**
 * Get all node types that are valid targets when dragging from a given source type.
 * Excludes non-creatable edge types.
 */
export function getValidTargetTypes(
  sourceNodeType: NodeType,
  rules: ConnectionRule[],
): NodeType[] {
  const targetSet = new Set<NodeType>()
  for (const rule of rules) {
    if (
      rule.sourceTypes.includes(sourceNodeType) &&
      !NON_CREATABLE_EDGE_TYPES.has(rule.edgeType)
    ) {
      for (const t of rule.targetTypes) {
        targetSet.add(t)
      }
    }
  }
  return [...targetSet]
}

/**
 * Get all node types that are valid sources when dragging to a given target type.
 * Excludes non-creatable edge types.
 */
export function getValidSourceTypes(
  targetNodeType: NodeType,
  rules: ConnectionRule[],
): NodeType[] {
  const sourceSet = new Set<NodeType>()
  for (const rule of rules) {
    if (
      rule.targetTypes.includes(targetNodeType) &&
      !NON_CREATABLE_EDGE_TYPES.has(rule.edgeType)
    ) {
      for (const s of rule.sourceTypes) {
        sourceSet.add(s)
      }
    }
  }
  return [...sourceSet]
}

/**
 * Prevent self-loops: source and target must be different entities.
 */
export function isSelfLoop(sourceEntityId: string, targetEntityId: string): boolean {
  return sourceEntityId === targetEntityId
}

/**
 * Check if a connection is ambiguous (multiple possible edge types).
 */
export function isAmbiguousConnection(validation: ConnectionValidation): boolean {
  return validation.possibleEdgeTypes.length > 1
}

// --- Single-ID edge types: creating these replaces the previous value ---

const SINGLE_ID_EDGE_TYPES: ReadonlySet<EdgeType> = new Set([
  'reports_to',
  'owns',
  'assigned_to',
  'provides',
  'consumes',
  'governs',
])

/**
 * Check if a proposed edge would duplicate an existing relationship.
 * For single-ID fields, it's a replacement (not a duplicate per se, but user should be warned).
 * For array fields, a true duplicate is rejected.
 */
export function checkDuplicate(
  edgeType: EdgeType,
  sourceVisualId: string,
  targetVisualId: string,
  existingEdges: VisualEdgeDto[],
): DuplicateCheck {
  const isReplacement = SINGLE_ID_EDGE_TYPES.has(edgeType)

  // For single-ID fields, look for an existing edge of the same type from the same source
  // (the source is the "owner" that will have its field replaced)
  if (isReplacement) {
    const existing = existingEdges.find(
      (e) => e.edgeType === edgeType && e.sourceId === sourceVisualId,
    )
    if (existing && existing.targetId !== targetVisualId) {
      return { isDuplicate: false, isReplacement: true, existingEdge: existing }
    }
    // Same source and target → true duplicate
    if (existing && existing.targetId === targetVisualId) {
      return { isDuplicate: true, isReplacement: false, existingEdge: existing }
    }
    return { isDuplicate: false, isReplacement: false, existingEdge: null }
  }

  // For array fields, check exact source+target+edgeType match
  const existing = existingEdges.find(
    (e) =>
      e.edgeType === edgeType &&
      e.sourceId === sourceVisualId &&
      e.targetId === targetVisualId,
  )

  return {
    isDuplicate: existing != null,
    isReplacement: false,
    existingEdge: existing ?? null,
  }
}

/**
 * Detect circular dependency for reports_to edges.
 * Given a proposed source→target (source.parentId = target),
 * traverse the existing parent chain from target upward.
 * If we encounter the source, the connection would create a cycle.
 *
 * @param sourceVisualId - The department node that will set parentId
 * @param targetVisualId - The department node that will become the parent
 * @param existingEdges - All existing edges (filtered to reports_to internally)
 */
export function wouldCreateCycle(
  sourceVisualId: string,
  targetVisualId: string,
  existingEdges: VisualEdgeDto[],
): boolean {
  // Build a parent map from reports_to edges: child (source) → parent (target)
  const parentMap = new Map<string, string>()
  for (const e of existingEdges) {
    if (e.edgeType === 'reports_to') {
      parentMap.set(e.sourceId, e.targetId)
    }
  }

  // Traverse from target upward. If we reach source, it's a cycle.
  let current: string | undefined = targetVisualId
  const visited = new Set<string>()

  while (current != null) {
    if (current === sourceVisualId) {
      return true
    }
    if (visited.has(current)) {
      // Already a cycle in existing data; don't get stuck
      break
    }
    visited.add(current)
    current = parentMap.get(current)
  }

  return false
}
