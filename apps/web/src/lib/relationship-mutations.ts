import type {
  EdgeType,
  NodeType,
  VisualNodeDto,
  WorkflowParticipantDto,
} from '@the-crew/shared-types'

// --- Public interfaces ---

export type MutableEntityType =
  | 'department'
  | 'capability'
  | 'workflow'
  | 'role'
  | 'agent-archetype'
  | 'skill'
  | 'contract'
  | 'policy'
  | 'artifact'

export interface RelationshipMutation {
  /** Which entity to PATCH */
  entityType: MutableEntityType
  /** ID of the entity to PATCH */
  entityId: string
  /** The PATCH payload */
  patch: Record<string, unknown>
  /** Human-readable description of the change */
  description: string
}

/** Metadata for participates_in edge creation */
export interface ParticipatesInMetadata {
  responsibility: string
}

// --- NodeType → providerType/consumerType mapping ---

function toPartyType(nodeType: NodeType): 'department' | 'capability' {
  if (nodeType === 'department') return 'department'
  if (nodeType === 'capability') return 'capability'
  throw new Error(`Invalid party type node: ${nodeType}. Expected department or capability.`)
}

// --- NodeType → participantType mapping ---

function toParticipantType(nodeType: NodeType): 'role' | 'department' {
  if (nodeType === 'role') return 'role'
  if (nodeType === 'department') return 'department'
  throw new Error(
    `Invalid participant type node: ${nodeType}. Expected role or department.`,
  )
}

// --- NodeType → MutableEntityType mapping ---

const NODE_TYPE_TO_ENTITY_TYPE: Partial<Record<NodeType, MutableEntityType>> = {
  department: 'department',
  capability: 'capability',
  workflow: 'workflow',
  role: 'role',
  'agent-archetype': 'agent-archetype',
  skill: 'skill',
  contract: 'contract',
  policy: 'policy',
  artifact: 'artifact',
}

function toEntityType(nodeType: NodeType): MutableEntityType {
  const et = NODE_TYPE_TO_ENTITY_TYPE[nodeType]
  if (!et) {
    throw new Error(`No mutable entity type for node type: ${nodeType}`)
  }
  return et
}

// --- Edge creation resolution ---

/**
 * Resolve an edge creation to the domain mutation that must be executed.
 *
 * For array fields, `currentEntityData` must contain the current array value
 * so the new value can be appended (Approach A from spec).
 *
 * @throws Error if the edge type is not creatable or node types are invalid.
 */
export function resolveEdgeCreation(
  edgeType: EdgeType,
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
  metadata?: Record<string, unknown>,
  currentEntityData?: Record<string, unknown>,
): RelationshipMutation {
  switch (edgeType) {
    case 'reports_to':
      return {
        entityType: 'department',
        entityId: sourceNode.entityId,
        patch: { parentId: targetNode.entityId },
        description: `Set "${sourceNode.label}" to report to "${targetNode.label}"`,
      }

    case 'owns':
      return resolveOwnsCreation(sourceNode, targetNode)

    case 'assigned_to':
      return {
        entityType: 'agent-archetype',
        entityId: sourceNode.entityId,
        patch: { roleId: targetNode.entityId },
        description: `Assign "${sourceNode.label}" to role "${targetNode.label}"`,
      }

    case 'contributes_to': {
      const currentIds = extractStringArray(currentEntityData, 'capabilityIds')
      return {
        entityType: 'role',
        entityId: sourceNode.entityId,
        patch: { capabilityIds: [...currentIds, targetNode.entityId] },
        description: `Add capability "${targetNode.label}" to role "${sourceNode.label}"`,
      }
    }

    case 'has_skill': {
      const currentIds = extractStringArray(currentEntityData, 'skillIds')
      return {
        entityType: 'agent-archetype',
        entityId: sourceNode.entityId,
        patch: { skillIds: [...currentIds, targetNode.entityId] },
        description: `Add skill "${targetNode.label}" to archetype "${sourceNode.label}"`,
      }
    }

    case 'compatible_with': {
      const currentIds = extractStringArray(currentEntityData, 'compatibleRoleIds')
      return {
        entityType: 'skill',
        entityId: sourceNode.entityId,
        patch: { compatibleRoleIds: [...currentIds, targetNode.entityId] },
        description: `Add compatible role "${targetNode.label}" to skill "${sourceNode.label}"`,
      }
    }

    case 'provides':
      return {
        entityType: 'contract',
        entityId: targetNode.entityId,
        patch: {
          providerId: sourceNode.entityId,
          providerType: toPartyType(sourceNode.nodeType),
        },
        description: `Set "${sourceNode.label}" as provider for contract "${targetNode.label}"`,
      }

    case 'consumes':
      return {
        entityType: 'contract',
        entityId: targetNode.entityId,
        patch: {
          consumerId: sourceNode.entityId,
          consumerType: toPartyType(sourceNode.nodeType),
        },
        description: `Set "${sourceNode.label}" as consumer for contract "${targetNode.label}"`,
      }

    case 'bound_by': {
      const currentIds = extractStringArray(currentEntityData, 'contractIds')
      return {
        entityType: 'workflow',
        entityId: sourceNode.entityId,
        patch: { contractIds: [...currentIds, targetNode.entityId] },
        description: `Bind workflow "${sourceNode.label}" to contract "${targetNode.label}"`,
      }
    }

    case 'participates_in': {
      const currentParticipants = extractArray<WorkflowParticipantDto>(
        currentEntityData,
        'participants',
      )
      const responsibility =
        (metadata as ParticipatesInMetadata | undefined)?.responsibility ?? ''
      const newParticipant: WorkflowParticipantDto = {
        participantId: sourceNode.entityId,
        participantType: toParticipantType(sourceNode.nodeType),
        responsibility,
      }
      return {
        entityType: 'workflow',
        entityId: targetNode.entityId,
        patch: { participants: [...currentParticipants, newParticipant] },
        description: `Add "${sourceNode.label}" as participant in workflow "${targetNode.label}"`,
      }
    }

    case 'produces_artifact':
      return {
        entityType: 'artifact',
        entityId: targetNode.entityId,
        patch: {
          producerId: sourceNode.entityId,
          producerType: toPartyType(sourceNode.nodeType),
        },
        description: `Set "${sourceNode.label}" as producer of artifact "${targetNode.label}"`,
      }

    case 'consumes_artifact': {
      const currentIds = extractStringArray(currentEntityData, 'consumerIds')
      return {
        entityType: 'artifact',
        entityId: targetNode.entityId,
        patch: { consumerIds: [...currentIds, sourceNode.entityId] },
        description: `Add "${sourceNode.label}" as consumer of artifact "${targetNode.label}"`,
      }
    }

    case 'governs':
      return resolveGovernsCreation(sourceNode, targetNode)

    case 'hands_off_to':
      throw new Error(
        'hands_off_to edges are not user-creatable. They are derived from stage order.',
      )

    default:
      throw new Error(`Unknown edge type: ${edgeType as string}`)
  }
}

// --- Edge deletion resolution ---

/**
 * Resolve an edge deletion to the domain mutation that must be executed.
 *
 * For array fields, `currentEntityData` must contain the current array value
 * so the target can be removed.
 *
 * @throws Error if the edge type is not deletable or node types are invalid.
 */
export function resolveEdgeDeletion(
  edgeType: EdgeType,
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
  currentEntityData?: Record<string, unknown>,
): RelationshipMutation {
  switch (edgeType) {
    case 'reports_to':
      return {
        entityType: 'department',
        entityId: sourceNode.entityId,
        patch: { parentId: null },
        description: `Remove "${sourceNode.label}" from reporting to "${targetNode.label}"`,
      }

    case 'owns':
      return resolveOwnsDeletion(sourceNode, targetNode)

    case 'assigned_to':
      return {
        entityType: 'agent-archetype',
        entityId: sourceNode.entityId,
        patch: { roleId: null },
        description: `Unassign "${sourceNode.label}" from role "${targetNode.label}"`,
      }

    case 'contributes_to': {
      const currentIds = extractStringArray(currentEntityData, 'capabilityIds')
      return {
        entityType: 'role',
        entityId: sourceNode.entityId,
        patch: { capabilityIds: currentIds.filter((id) => id !== targetNode.entityId) },
        description: `Remove capability "${targetNode.label}" from role "${sourceNode.label}"`,
      }
    }

    case 'has_skill': {
      const currentIds = extractStringArray(currentEntityData, 'skillIds')
      return {
        entityType: 'agent-archetype',
        entityId: sourceNode.entityId,
        patch: { skillIds: currentIds.filter((id) => id !== targetNode.entityId) },
        description: `Remove skill "${targetNode.label}" from archetype "${sourceNode.label}"`,
      }
    }

    case 'compatible_with': {
      const currentIds = extractStringArray(currentEntityData, 'compatibleRoleIds')
      return {
        entityType: 'skill',
        entityId: sourceNode.entityId,
        patch: {
          compatibleRoleIds: currentIds.filter((id) => id !== targetNode.entityId),
        },
        description: `Remove compatible role "${targetNode.label}" from skill "${sourceNode.label}"`,
      }
    }

    case 'provides':
      return {
        entityType: 'contract',
        entityId: targetNode.entityId,
        patch: { providerId: null, providerType: null },
        description: `Remove "${sourceNode.label}" as provider from contract "${targetNode.label}"`,
      }

    case 'consumes':
      return {
        entityType: 'contract',
        entityId: targetNode.entityId,
        patch: { consumerId: null, consumerType: null },
        description: `Remove "${sourceNode.label}" as consumer from contract "${targetNode.label}"`,
      }

    case 'bound_by': {
      const currentIds = extractStringArray(currentEntityData, 'contractIds')
      return {
        entityType: 'workflow',
        entityId: sourceNode.entityId,
        patch: { contractIds: currentIds.filter((id) => id !== targetNode.entityId) },
        description: `Unbind workflow "${sourceNode.label}" from contract "${targetNode.label}"`,
      }
    }

    case 'participates_in': {
      const currentParticipants = extractArray<WorkflowParticipantDto>(
        currentEntityData,
        'participants',
      )
      return {
        entityType: 'workflow',
        entityId: targetNode.entityId,
        patch: {
          participants: currentParticipants.filter(
            (p) => p.participantId !== sourceNode.entityId,
          ),
        },
        description: `Remove "${sourceNode.label}" as participant from workflow "${targetNode.label}"`,
      }
    }

    case 'produces_artifact':
      return {
        entityType: 'artifact',
        entityId: targetNode.entityId,
        patch: { producerId: null, producerType: null },
        description: `Remove "${sourceNode.label}" as producer of artifact "${targetNode.label}"`,
      }

    case 'consumes_artifact': {
      const currentIds = extractStringArray(currentEntityData, 'consumerIds')
      return {
        entityType: 'artifact',
        entityId: targetNode.entityId,
        patch: { consumerIds: currentIds.filter((id) => id !== sourceNode.entityId) },
        description: `Remove "${sourceNode.label}" as consumer of artifact "${targetNode.label}"`,
      }
    }

    case 'governs':
      return {
        entityType: 'policy',
        entityId: sourceNode.entityId,
        patch: { departmentId: null, scope: 'global' },
        description: `Remove governance of "${sourceNode.label}" over "${targetNode.label}"`,
      }

    case 'hands_off_to':
      throw new Error(
        'hands_off_to edges are not user-deletable. They are derived from stage order.',
      )

    default:
      throw new Error(`Unknown edge type: ${edgeType as string}`)
  }
}

// --- Helpers for "owns" edge (target can be capability or workflow) ---

function resolveOwnsCreation(
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
): RelationshipMutation {
  const targetEntityType = toEntityType(targetNode.nodeType)
  if (targetEntityType !== 'capability' && targetEntityType !== 'workflow') {
    throw new Error(
      `owns edge target must be capability or workflow, got: ${targetNode.nodeType}`,
    )
  }
  return {
    entityType: targetEntityType,
    entityId: targetNode.entityId,
    patch: { ownerDepartmentId: sourceNode.entityId },
    description: `Set department "${sourceNode.label}" as owner of "${targetNode.label}"`,
  }
}

function resolveOwnsDeletion(
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
): RelationshipMutation {
  const targetEntityType = toEntityType(targetNode.nodeType)
  if (targetEntityType !== 'capability' && targetEntityType !== 'workflow') {
    throw new Error(
      `owns edge target must be capability or workflow, got: ${targetNode.nodeType}`,
    )
  }
  return {
    entityType: targetEntityType,
    entityId: targetNode.entityId,
    patch: { ownerDepartmentId: null },
    description: `Remove department "${sourceNode.label}" as owner of "${targetNode.label}"`,
  }
}

// --- Helpers for "governs" edge ---

function resolveGovernsCreation(
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
): RelationshipMutation {
  if (targetNode.nodeType === 'company') {
    return {
      entityType: 'policy',
      entityId: sourceNode.entityId,
      patch: { scope: 'global', departmentId: null },
      description: `Set policy "${sourceNode.label}" to govern the entire company`,
    }
  }
  if (targetNode.nodeType === 'department') {
    return {
      entityType: 'policy',
      entityId: sourceNode.entityId,
      patch: { scope: 'department', departmentId: targetNode.entityId },
      description: `Set policy "${sourceNode.label}" to govern department "${targetNode.label}"`,
    }
  }
  throw new Error(
    `governs edge target must be company or department, got: ${targetNode.nodeType}`,
  )
}

// --- Array extraction helpers ---

function extractStringArray(
  data: Record<string, unknown> | undefined,
  field: string,
): string[] {
  if (!data) return []
  const value = data[field]
  if (!Array.isArray(value)) return []
  return value as string[]
}

function extractArray<T>(
  data: Record<string, unknown> | undefined,
  field: string,
): T[] {
  if (!data) return []
  const value = data[field]
  if (!Array.isArray(value)) return []
  return value as T[]
}

// --- Edge type metadata queries ---

/** Edge types that require fetching current entity data before mutation (array fields) */
export const ARRAY_MUTATION_EDGE_TYPES: ReadonlySet<EdgeType> = new Set([
  'contributes_to',
  'has_skill',
  'compatible_with',
  'bound_by',
  'participates_in',
  'consumes_artifact',
])

/** Edge types that require additional metadata input from the user */
export const METADATA_REQUIRED_EDGE_TYPES: ReadonlySet<EdgeType> = new Set([
  'participates_in',
])

/** Edge types that are not user-creatable */
export const NON_CREATABLE_EDGE_TYPES: ReadonlySet<EdgeType> = new Set(['hands_off_to'])

/**
 * Returns true if creating this edge type requires fetching the entity's current data.
 */
export function requiresCurrentData(edgeType: EdgeType): boolean {
  return ARRAY_MUTATION_EDGE_TYPES.has(edgeType)
}

/**
 * Returns true if creating this edge type requires additional metadata from the user.
 */
export function requiresMetadata(edgeType: EdgeType): boolean {
  return METADATA_REQUIRED_EDGE_TYPES.has(edgeType)
}

/**
 * Determine which entity needs to be fetched for current data before mutation.
 * Returns the entity type and which node (source or target) holds the ID.
 */
export function getEntityToFetch(
  edgeType: EdgeType,
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
): { entityType: MutableEntityType; entityId: string } | null {
  switch (edgeType) {
    case 'contributes_to':
      return { entityType: 'role', entityId: sourceNode.entityId }
    case 'has_skill':
      return { entityType: 'agent-archetype', entityId: sourceNode.entityId }
    case 'compatible_with':
      return { entityType: 'skill', entityId: sourceNode.entityId }
    case 'bound_by':
      return { entityType: 'workflow', entityId: sourceNode.entityId }
    case 'participates_in':
      return { entityType: 'workflow', entityId: targetNode.entityId }
    case 'consumes_artifact':
      return { entityType: 'artifact', entityId: targetNode.entityId }
    default:
      return null
  }
}
