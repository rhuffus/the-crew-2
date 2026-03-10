import { describe, it, expect } from 'vitest'
import type { EdgeType, NodeType, VisualNodeDto } from '@the-crew/shared-types'
import {
  resolveEdgeCreation,
  resolveEdgeDeletion,
  requiresCurrentData,
  requiresMetadata,
  getEntityToFetch,
  ARRAY_MUTATION_EDGE_TYPES,
  METADATA_REQUIRED_EDGE_TYPES,
  NON_CREATABLE_EDGE_TYPES,
} from './relationship-mutations'

// --- Helper to create a minimal VisualNodeDto ---

function makeNode(
  nodeType: NodeType,
  entityId: string,
  label: string,
): VisualNodeDto {
  return {
    id: `${nodeType}::${entityId}`,
    nodeType,
    entityId,
    label,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: [],
    parentId: null,
  }
}

// ============================================================
// resolveEdgeCreation
// ============================================================

describe('resolveEdgeCreation', () => {
  it('reports_to: patches source department parentId', () => {
    const source = makeNode('department', 'dept-sales', 'Sales')
    const target = makeNode('department', 'dept-ceo', 'CEO Office')
    const result = resolveEdgeCreation('reports_to', source, target)
    expect(result.entityType).toBe('department')
    expect(result.entityId).toBe('dept-sales')
    expect(result.patch).toEqual({ parentId: 'dept-ceo' })
    expect(result.description).toContain('Sales')
    expect(result.description).toContain('CEO Office')
  })

  it('owns: dept → capability patches target ownerDepartmentId', () => {
    const source = makeNode('department', 'dept-eng', 'Engineering')
    const target = makeNode('capability', 'cap-deploy', 'Deployment')
    const result = resolveEdgeCreation('owns', source, target)
    expect(result.entityType).toBe('capability')
    expect(result.entityId).toBe('cap-deploy')
    expect(result.patch).toEqual({ ownerDepartmentId: 'dept-eng' })
  })

  it('owns: dept → workflow patches target ownerDepartmentId', () => {
    const source = makeNode('department', 'dept-eng', 'Engineering')
    const target = makeNode('workflow', 'wf-cicd', 'CI/CD Pipeline')
    const result = resolveEdgeCreation('owns', source, target)
    expect(result.entityType).toBe('workflow')
    expect(result.entityId).toBe('wf-cicd')
    expect(result.patch).toEqual({ ownerDepartmentId: 'dept-eng' })
  })

  it('owns: throws for invalid target type', () => {
    const source = makeNode('department', 'dept-eng', 'Engineering')
    const target = makeNode('role', 'role-dev', 'Developer')
    expect(() => resolveEdgeCreation('owns', source, target)).toThrow(
      'owns edge target must be capability or workflow',
    )
  })

  it('assigned_to: patches source archetype roleId', () => {
    const source = makeNode('agent-archetype', 'arch-reviewer', 'Code Reviewer')
    const target = makeNode('role', 'role-dev', 'Developer')
    const result = resolveEdgeCreation('assigned_to', source, target)
    expect(result.entityType).toBe('agent-archetype')
    expect(result.entityId).toBe('arch-reviewer')
    expect(result.patch).toEqual({ roleId: 'role-dev' })
  })

  it('contributes_to: appends to role capabilityIds', () => {
    const source = makeNode('role', 'role-dev', 'Developer')
    const target = makeNode('capability', 'cap-ui', 'UI Development')
    const currentData = { capabilityIds: ['cap-existing'] }
    const result = resolveEdgeCreation('contributes_to', source, target, undefined, currentData)
    expect(result.entityType).toBe('role')
    expect(result.entityId).toBe('role-dev')
    expect(result.patch).toEqual({ capabilityIds: ['cap-existing', 'cap-ui'] })
  })

  it('contributes_to: works with empty current data', () => {
    const source = makeNode('role', 'role-dev', 'Developer')
    const target = makeNode('capability', 'cap-ui', 'UI Development')
    const result = resolveEdgeCreation('contributes_to', source, target)
    expect(result.patch).toEqual({ capabilityIds: ['cap-ui'] })
  })

  it('has_skill: appends to archetype skillIds', () => {
    const source = makeNode('agent-archetype', 'arch-1', 'Data Analyst')
    const target = makeNode('skill', 'skill-sql', 'SQL')
    const currentData = { skillIds: ['skill-python'] }
    const result = resolveEdgeCreation('has_skill', source, target, undefined, currentData)
    expect(result.entityType).toBe('agent-archetype')
    expect(result.entityId).toBe('arch-1')
    expect(result.patch).toEqual({ skillIds: ['skill-python', 'skill-sql'] })
  })

  it('compatible_with: appends to skill compatibleRoleIds', () => {
    const source = makeNode('skill', 'skill-ts', 'TypeScript')
    const target = makeNode('role', 'role-fe', 'Frontend Dev')
    const currentData = { compatibleRoleIds: ['role-be'] }
    const result = resolveEdgeCreation('compatible_with', source, target, undefined, currentData)
    expect(result.entityType).toBe('skill')
    expect(result.entityId).toBe('skill-ts')
    expect(result.patch).toEqual({ compatibleRoleIds: ['role-be', 'role-fe'] })
  })

  it('provides: patches contract with providerId and providerType (department)', () => {
    const source = makeNode('department', 'dept-api', 'API Team')
    const target = makeNode('contract', 'contract-sla', 'API SLA')
    const result = resolveEdgeCreation('provides', source, target)
    expect(result.entityType).toBe('contract')
    expect(result.entityId).toBe('contract-sla')
    expect(result.patch).toEqual({ providerId: 'dept-api', providerType: 'department' })
  })

  it('provides: patches contract with providerType (capability)', () => {
    const source = makeNode('capability', 'cap-auth', 'Authentication')
    const target = makeNode('contract', 'contract-auth', 'Auth Contract')
    const result = resolveEdgeCreation('provides', source, target)
    expect(result.patch).toEqual({ providerId: 'cap-auth', providerType: 'capability' })
  })

  it('consumes: patches contract with consumerId and consumerType (department)', () => {
    const source = makeNode('department', 'dept-fe', 'Frontend')
    const target = makeNode('contract', 'contract-api', 'API Contract')
    const result = resolveEdgeCreation('consumes', source, target)
    expect(result.entityType).toBe('contract')
    expect(result.entityId).toBe('contract-api')
    expect(result.patch).toEqual({ consumerId: 'dept-fe', consumerType: 'department' })
  })

  it('consumes: patches contract with consumerType (capability)', () => {
    const source = makeNode('capability', 'cap-billing', 'Billing')
    const target = makeNode('contract', 'contract-pay', 'Payment Contract')
    const result = resolveEdgeCreation('consumes', source, target)
    expect(result.patch).toEqual({ consumerId: 'cap-billing', consumerType: 'capability' })
  })

  it('bound_by: appends to workflow contractIds', () => {
    const source = makeNode('workflow', 'wf-deploy', 'Deploy Flow')
    const target = makeNode('contract', 'contract-1', 'SLA')
    const currentData = { contractIds: ['contract-existing'] }
    const result = resolveEdgeCreation('bound_by', source, target, undefined, currentData)
    expect(result.entityType).toBe('workflow')
    expect(result.entityId).toBe('wf-deploy')
    expect(result.patch).toEqual({ contractIds: ['contract-existing', 'contract-1'] })
  })

  it('participates_in: appends participant VO to workflow', () => {
    const source = makeNode('role', 'role-qa', 'QA Lead')
    const target = makeNode('workflow', 'wf-release', 'Release Flow')
    const metadata = { responsibility: 'Approve release' }
    const currentData = {
      participants: [
        { participantId: 'role-dev', participantType: 'role', responsibility: 'Build' },
      ],
    }
    const result = resolveEdgeCreation('participates_in', source, target, metadata, currentData)
    expect(result.entityType).toBe('workflow')
    expect(result.entityId).toBe('wf-release')
    expect(result.patch.participants).toHaveLength(2)
    const participants = result.patch.participants as Array<Record<string, unknown>>
    expect(participants[1]).toEqual({
      participantId: 'role-qa',
      participantType: 'role',
      responsibility: 'Approve release',
    })
  })

  it('participates_in: department as participant', () => {
    const source = makeNode('department', 'dept-ops', 'Operations')
    const target = makeNode('workflow', 'wf-incident', 'Incident Response')
    const metadata = { responsibility: 'First responder' }
    const result = resolveEdgeCreation('participates_in', source, target, metadata)
    const participants = result.patch.participants as Array<Record<string, unknown>>
    expect(participants[0]).toEqual({
      participantId: 'dept-ops',
      participantType: 'department',
      responsibility: 'First responder',
    })
  })

  it('participates_in: defaults responsibility to empty string', () => {
    const source = makeNode('role', 'role-x', 'Role X')
    const target = makeNode('workflow', 'wf-y', 'WF Y')
    const result = resolveEdgeCreation('participates_in', source, target)
    const participants = result.patch.participants as Array<Record<string, unknown>>
    expect(participants[0]!.responsibility).toBe('')
  })

  it('governs: policy → department sets scope=department', () => {
    const source = makeNode('policy', 'pol-budget', 'Budget Policy')
    const target = makeNode('department', 'dept-fin', 'Finance')
    const result = resolveEdgeCreation('governs', source, target)
    expect(result.entityType).toBe('policy')
    expect(result.entityId).toBe('pol-budget')
    expect(result.patch).toEqual({ scope: 'department', departmentId: 'dept-fin' })
  })

  it('governs: policy → company sets scope=global', () => {
    const source = makeNode('policy', 'pol-ethics', 'Ethics Policy')
    const target = makeNode('company', 'comp-1', 'Acme Corp')
    const result = resolveEdgeCreation('governs', source, target)
    expect(result.entityType).toBe('policy')
    expect(result.entityId).toBe('pol-ethics')
    expect(result.patch).toEqual({ scope: 'global', departmentId: null })
  })

  it('governs: throws for invalid target type', () => {
    const source = makeNode('policy', 'pol-1', 'Policy')
    const target = makeNode('role', 'role-1', 'Role')
    expect(() => resolveEdgeCreation('governs', source, target)).toThrow(
      'governs edge target must be company or department',
    )
  })

  it('hands_off_to: throws (non-creatable)', () => {
    const source = makeNode('workflow-stage', 'ws-1', 'Stage 1')
    const target = makeNode('workflow-stage', 'ws-2', 'Stage 2')
    expect(() => resolveEdgeCreation('hands_off_to', source, target)).toThrow(
      'hands_off_to edges are not user-creatable',
    )
  })

  it('unknown edge type throws', () => {
    const source = makeNode('department', 'd1', 'D1')
    const target = makeNode('department', 'd2', 'D2')
    expect(() =>
      resolveEdgeCreation('bogus' as EdgeType, source, target),
    ).toThrow('Unknown edge type: bogus')
  })
})

// ============================================================
// resolveEdgeDeletion
// ============================================================

describe('resolveEdgeDeletion', () => {
  it('reports_to: sets parentId to null', () => {
    const source = makeNode('department', 'dept-sales', 'Sales')
    const target = makeNode('department', 'dept-ceo', 'CEO Office')
    const result = resolveEdgeDeletion('reports_to', source, target)
    expect(result.entityType).toBe('department')
    expect(result.entityId).toBe('dept-sales')
    expect(result.patch).toEqual({ parentId: null })
  })

  it('owns: dept → capability sets ownerDepartmentId to null', () => {
    const source = makeNode('department', 'dept-eng', 'Engineering')
    const target = makeNode('capability', 'cap-deploy', 'Deployment')
    const result = resolveEdgeDeletion('owns', source, target)
    expect(result.entityType).toBe('capability')
    expect(result.entityId).toBe('cap-deploy')
    expect(result.patch).toEqual({ ownerDepartmentId: null })
  })

  it('owns: dept → workflow sets ownerDepartmentId to null', () => {
    const source = makeNode('department', 'dept-eng', 'Engineering')
    const target = makeNode('workflow', 'wf-1', 'Deploy')
    const result = resolveEdgeDeletion('owns', source, target)
    expect(result.entityType).toBe('workflow')
    expect(result.patch).toEqual({ ownerDepartmentId: null })
  })

  it('assigned_to: sets roleId to null', () => {
    const source = makeNode('agent-archetype', 'arch-1', 'Reviewer')
    const target = makeNode('role', 'role-dev', 'Developer')
    const result = resolveEdgeDeletion('assigned_to', source, target)
    expect(result.entityType).toBe('agent-archetype')
    expect(result.entityId).toBe('arch-1')
    expect(result.patch).toEqual({ roleId: null })
  })

  it('contributes_to: removes target from capabilityIds', () => {
    const source = makeNode('role', 'role-dev', 'Developer')
    const target = makeNode('capability', 'cap-ui', 'UI Dev')
    const currentData = { capabilityIds: ['cap-api', 'cap-ui', 'cap-db'] }
    const result = resolveEdgeDeletion('contributes_to', source, target, currentData)
    expect(result.entityType).toBe('role')
    expect(result.entityId).toBe('role-dev')
    expect(result.patch).toEqual({ capabilityIds: ['cap-api', 'cap-db'] })
  })

  it('contributes_to: works with empty current data', () => {
    const source = makeNode('role', 'role-dev', 'Developer')
    const target = makeNode('capability', 'cap-ui', 'UI Dev')
    const result = resolveEdgeDeletion('contributes_to', source, target)
    expect(result.patch).toEqual({ capabilityIds: [] })
  })

  it('has_skill: removes target from skillIds', () => {
    const source = makeNode('agent-archetype', 'arch-1', 'Analyst')
    const target = makeNode('skill', 'skill-sql', 'SQL')
    const currentData = { skillIds: ['skill-python', 'skill-sql'] }
    const result = resolveEdgeDeletion('has_skill', source, target, currentData)
    expect(result.patch).toEqual({ skillIds: ['skill-python'] })
  })

  it('compatible_with: removes target from compatibleRoleIds', () => {
    const source = makeNode('skill', 'skill-ts', 'TypeScript')
    const target = makeNode('role', 'role-fe', 'Frontend')
    const currentData = { compatibleRoleIds: ['role-be', 'role-fe'] }
    const result = resolveEdgeDeletion('compatible_with', source, target, currentData)
    expect(result.patch).toEqual({ compatibleRoleIds: ['role-be'] })
  })

  it('provides: clears providerId and providerType', () => {
    const source = makeNode('department', 'dept-api', 'API Team')
    const target = makeNode('contract', 'contract-sla', 'API SLA')
    const result = resolveEdgeDeletion('provides', source, target)
    expect(result.entityType).toBe('contract')
    expect(result.entityId).toBe('contract-sla')
    expect(result.patch).toEqual({ providerId: null, providerType: null })
  })

  it('consumes: clears consumerId and consumerType', () => {
    const source = makeNode('department', 'dept-fe', 'Frontend')
    const target = makeNode('contract', 'contract-api', 'API Contract')
    const result = resolveEdgeDeletion('consumes', source, target)
    expect(result.entityType).toBe('contract')
    expect(result.patch).toEqual({ consumerId: null, consumerType: null })
  })

  it('bound_by: removes target from contractIds', () => {
    const source = makeNode('workflow', 'wf-deploy', 'Deploy')
    const target = makeNode('contract', 'contract-1', 'SLA')
    const currentData = { contractIds: ['contract-existing', 'contract-1'] }
    const result = resolveEdgeDeletion('bound_by', source, target, currentData)
    expect(result.patch).toEqual({ contractIds: ['contract-existing'] })
  })

  it('participates_in: removes participant by ID', () => {
    const source = makeNode('role', 'role-qa', 'QA Lead')
    const target = makeNode('workflow', 'wf-release', 'Release')
    const currentData = {
      participants: [
        { participantId: 'role-dev', participantType: 'role', responsibility: 'Build' },
        { participantId: 'role-qa', participantType: 'role', responsibility: 'Approve' },
      ],
    }
    const result = resolveEdgeDeletion('participates_in', source, target, currentData)
    expect(result.entityType).toBe('workflow')
    expect(result.entityId).toBe('wf-release')
    const participants = result.patch.participants as Array<Record<string, unknown>>
    expect(participants).toHaveLength(1)
    expect(participants[0]!.participantId).toBe('role-dev')
  })

  it('governs: resets to global scope', () => {
    const source = makeNode('policy', 'pol-budget', 'Budget Policy')
    const target = makeNode('department', 'dept-fin', 'Finance')
    const result = resolveEdgeDeletion('governs', source, target)
    expect(result.entityType).toBe('policy')
    expect(result.entityId).toBe('pol-budget')
    expect(result.patch).toEqual({ departmentId: null, scope: 'global' })
  })

  it('hands_off_to: throws (non-deletable)', () => {
    const source = makeNode('workflow-stage', 'ws-1', 'Stage 1')
    const target = makeNode('workflow-stage', 'ws-2', 'Stage 2')
    expect(() => resolveEdgeDeletion('hands_off_to', source, target)).toThrow(
      'hands_off_to edges are not user-deletable',
    )
  })

  it('unknown edge type throws', () => {
    const source = makeNode('department', 'd1', 'D1')
    const target = makeNode('department', 'd2', 'D2')
    expect(() =>
      resolveEdgeDeletion('bogus' as EdgeType, source, target),
    ).toThrow('Unknown edge type: bogus')
  })
})

// ============================================================
// Metadata & data requirement helpers
// ============================================================

describe('requiresCurrentData', () => {
  it('returns true for array mutation edge types', () => {
    expect(requiresCurrentData('contributes_to')).toBe(true)
    expect(requiresCurrentData('has_skill')).toBe(true)
    expect(requiresCurrentData('compatible_with')).toBe(true)
    expect(requiresCurrentData('bound_by')).toBe(true)
    expect(requiresCurrentData('participates_in')).toBe(true)
  })

  it('returns false for single-ID edge types', () => {
    expect(requiresCurrentData('reports_to')).toBe(false)
    expect(requiresCurrentData('owns')).toBe(false)
    expect(requiresCurrentData('assigned_to')).toBe(false)
    expect(requiresCurrentData('provides')).toBe(false)
    expect(requiresCurrentData('consumes')).toBe(false)
    expect(requiresCurrentData('governs')).toBe(false)
  })
})

describe('requiresMetadata', () => {
  it('returns true for participates_in', () => {
    expect(requiresMetadata('participates_in')).toBe(true)
  })

  it('returns false for other edge types', () => {
    expect(requiresMetadata('reports_to')).toBe(false)
    expect(requiresMetadata('owns')).toBe(false)
    expect(requiresMetadata('contributes_to')).toBe(false)
    expect(requiresMetadata('provides')).toBe(false)
    expect(requiresMetadata('governs')).toBe(false)
  })
})

describe('getEntityToFetch', () => {
  const deptNode = makeNode('department', 'dept-1', 'Dept')
  const roleNode = makeNode('role', 'role-1', 'Role')
  const capNode = makeNode('capability', 'cap-1', 'Cap')
  const archNode = makeNode('agent-archetype', 'arch-1', 'Arch')
  const skillNode = makeNode('skill', 'skill-1', 'Skill')
  const wfNode = makeNode('workflow', 'wf-1', 'WF')
  const contractNode = makeNode('contract', 'contract-1', 'Contract')

  it('contributes_to: fetches source role', () => {
    const result = getEntityToFetch('contributes_to', roleNode, capNode)
    expect(result).toEqual({ entityType: 'role', entityId: 'role-1' })
  })

  it('has_skill: fetches source archetype', () => {
    const result = getEntityToFetch('has_skill', archNode, skillNode)
    expect(result).toEqual({ entityType: 'agent-archetype', entityId: 'arch-1' })
  })

  it('compatible_with: fetches source skill', () => {
    const result = getEntityToFetch('compatible_with', skillNode, roleNode)
    expect(result).toEqual({ entityType: 'skill', entityId: 'skill-1' })
  })

  it('bound_by: fetches source workflow', () => {
    const result = getEntityToFetch('bound_by', wfNode, contractNode)
    expect(result).toEqual({ entityType: 'workflow', entityId: 'wf-1' })
  })

  it('participates_in: fetches target workflow', () => {
    const result = getEntityToFetch('participates_in', roleNode, wfNode)
    expect(result).toEqual({ entityType: 'workflow', entityId: 'wf-1' })
  })

  it('returns null for single-ID edge types', () => {
    expect(getEntityToFetch('reports_to', deptNode, deptNode)).toBeNull()
    expect(getEntityToFetch('owns', deptNode, capNode)).toBeNull()
    expect(getEntityToFetch('assigned_to', archNode, roleNode)).toBeNull()
    expect(getEntityToFetch('provides', deptNode, contractNode)).toBeNull()
    expect(getEntityToFetch('consumes', capNode, contractNode)).toBeNull()
    expect(getEntityToFetch('governs', makeNode('policy', 'p1', 'P'), deptNode)).toBeNull()
  })
})

// ============================================================
// Constants
// ============================================================

describe('exported constants', () => {
  it('ARRAY_MUTATION_EDGE_TYPES contains 5 types', () => {
    expect(ARRAY_MUTATION_EDGE_TYPES.size).toBe(5)
  })

  it('METADATA_REQUIRED_EDGE_TYPES contains only participates_in', () => {
    expect(METADATA_REQUIRED_EDGE_TYPES.size).toBe(1)
    expect(METADATA_REQUIRED_EDGE_TYPES.has('participates_in')).toBe(true)
  })

  it('NON_CREATABLE_EDGE_TYPES contains only hands_off_to', () => {
    expect(NON_CREATABLE_EDGE_TYPES.size).toBe(1)
    expect(NON_CREATABLE_EDGE_TYPES.has('hands_off_to')).toBe(true)
  })
})

// ============================================================
// Description strings
// ============================================================

describe('mutation descriptions', () => {
  it('creation descriptions include source and target labels', () => {
    const source = makeNode('department', 'd1', 'Sales')
    const target = makeNode('department', 'd2', 'HQ')
    const result = resolveEdgeCreation('reports_to', source, target)
    expect(result.description).toContain('Sales')
    expect(result.description).toContain('HQ')
  })

  it('deletion descriptions include source and target labels', () => {
    const source = makeNode('role', 'r1', 'Developer')
    const target = makeNode('capability', 'c1', 'API Design')
    const currentData = { capabilityIds: ['c1'] }
    const result = resolveEdgeDeletion('contributes_to', source, target, currentData)
    expect(result.description).toContain('Developer')
    expect(result.description).toContain('API Design')
  })
})
