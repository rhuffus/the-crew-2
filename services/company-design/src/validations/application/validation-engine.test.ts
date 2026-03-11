import { describe, it, expect } from 'vitest'
import { ValidationEngine } from './validation-engine'
import type { ReleaseSnapshotDto } from '@the-crew/shared-types'

const baseSnapshot: ReleaseSnapshotDto = {
  companyModel: { projectId: 'p1', purpose: 'Build things', type: 'SaaS', scope: 'Global', principles: ['Quality'], updatedAt: '2026-01-01T00:00:00Z' },
  departments: [{ id: 'd1', projectId: 'p1', name: 'Engineering', description: 'Eng', mandate: 'Build', parentId: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
  capabilities: [{ id: 'c1', projectId: 'p1', name: 'API', description: 'API dev', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
  roles: [{ id: 'r1', projectId: 'p1', name: 'Tech Lead', description: 'Leads tech', departmentId: 'd1', capabilityIds: ['c1'], accountability: 'Delivery', authority: 'Decisions', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
  agentArchetypes: [],
  agentAssignments: [],
  skills: [],
  contracts: [{ id: 'ct1', projectId: 'p1', name: 'SLA', description: 'SLA desc', type: 'SLA', status: 'active', providerId: 'd1', providerType: 'department', consumerId: 'c1', consumerType: 'capability', acceptanceCriteria: ['99.9%'], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
  workflows: [{ id: 'w1', projectId: 'p1', name: 'Deploy', description: 'Deploy flow', ownerDepartmentId: 'd1', status: 'active', triggerDescription: 'Push', stages: [], participants: [], contractIds: ['ct1'], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
  policies: [],
  artifacts: [],
}

describe('ValidationEngine', () => {
  const engine = new ValidationEngine()

  it('should return no issues for a valid snapshot', () => {
    const issues = engine.validate(baseSnapshot)
    expect(issues).toEqual([])
  })

  describe('CompanyModel rules', () => {
    it('should report error when company model is null', () => {
      const snapshot = { ...baseSnapshot, companyModel: null }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'CompanyModel',
        severity: 'error',
        field: 'purpose',
      }))
    })

    it('should report error when company model purpose is empty', () => {
      const snapshot = {
        ...baseSnapshot,
        companyModel: { ...baseSnapshot.companyModel!, purpose: '  ' },
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'CompanyModel',
        severity: 'error',
      }))
    })
  })

  describe('Department rules', () => {
    it('should report warning for department without mandate', () => {
      const snapshot = {
        ...baseSnapshot,
        departments: [{ ...baseSnapshot.departments[0]!, mandate: '' }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Department',
        entityId: 'd1',
        severity: 'warning',
        field: 'mandate',
      }))
    })
  })

  describe('Capability rules', () => {
    it('should report warning for capability without owner', () => {
      const snapshot = {
        ...baseSnapshot,
        capabilities: [{ ...baseSnapshot.capabilities[0]!, ownerDepartmentId: null }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Capability',
        entityId: 'c1',
        severity: 'warning',
        field: 'ownerDepartmentId',
      }))
    })

    it('should report error for capability with non-existent owner department', () => {
      const snapshot = {
        ...baseSnapshot,
        capabilities: [{ ...baseSnapshot.capabilities[0]!, ownerDepartmentId: 'nonexistent' }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Capability',
        entityId: 'c1',
        severity: 'error',
        field: 'ownerDepartmentId',
        message: expect.stringContaining('non-existent department'),
      }))
    })

    it('should not report error for capability with valid owner department', () => {
      const issues = engine.validate(baseSnapshot)
      expect(issues.filter((i) => i.entity === 'Capability')).toEqual([])
    })
  })

  describe('Contract rules', () => {
    it('should report error for contract with non-existent provider department', () => {
      const snapshot = {
        ...baseSnapshot,
        contracts: [{ ...baseSnapshot.contracts[0]!, providerId: 'ghost', providerType: 'department' as const }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Contract',
        entityId: 'ct1',
        severity: 'error',
        field: 'providerId',
        message: expect.stringContaining('non-existent department "ghost"'),
      }))
    })

    it('should report error for contract with non-existent consumer capability', () => {
      const snapshot = {
        ...baseSnapshot,
        contracts: [{ ...baseSnapshot.contracts[0]!, consumerId: 'ghost', consumerType: 'capability' as const }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Contract',
        entityId: 'ct1',
        severity: 'error',
        field: 'consumerId',
        message: expect.stringContaining('non-existent capability "ghost"'),
      }))
    })

    it('should report errors for both provider and consumer if both are invalid', () => {
      const snapshot = {
        ...baseSnapshot,
        contracts: [{
          ...baseSnapshot.contracts[0]!,
          providerId: 'ghost1',
          providerType: 'department' as const,
          consumerId: 'ghost2',
          consumerType: 'department' as const,
        }],
      }
      const issues = engine.validate(snapshot)
      const contractIssues = issues.filter((i) => i.entity === 'Contract')
      expect(contractIssues).toHaveLength(2)
      expect(contractIssues.map((i) => i.field)).toContain('providerId')
      expect(contractIssues.map((i) => i.field)).toContain('consumerId')
    })

    it('should not report error for contract with valid references', () => {
      const issues = engine.validate(baseSnapshot)
      expect(issues.filter((i) => i.entity === 'Contract')).toEqual([])
    })
  })

  describe('Workflow rules', () => {
    it('should report warning for workflow without contracts', () => {
      const snapshot = {
        ...baseSnapshot,
        workflows: [{ ...baseSnapshot.workflows[0]!, contractIds: [] }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Workflow',
        entityId: 'w1',
        severity: 'warning',
        field: 'contractIds',
      }))
    })

    it('should report error for workflow with non-existent contract reference', () => {
      const snapshot = {
        ...baseSnapshot,
        workflows: [{ ...baseSnapshot.workflows[0]!, contractIds: ['ghost-contract'] }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Workflow',
        entityId: 'w1',
        severity: 'error',
        field: 'contractIds',
        message: expect.stringContaining('non-existent contract "ghost-contract"'),
      }))
    })

    it('should report error for workflow with non-existent owner department', () => {
      const snapshot = {
        ...baseSnapshot,
        workflows: [{ ...baseSnapshot.workflows[0]!, ownerDepartmentId: 'ghost-dept' }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Workflow',
        entityId: 'w1',
        severity: 'error',
        field: 'ownerDepartmentId',
        message: expect.stringContaining('non-existent department "ghost-dept"'),
      }))
    })

    it('should not report owner error when ownerDepartmentId is null', () => {
      const snapshot = {
        ...baseSnapshot,
        workflows: [{ ...baseSnapshot.workflows[0]!, ownerDepartmentId: null, contractIds: ['ct1'] }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.field === 'ownerDepartmentId')).toEqual([])
    })

    it('should report multiple errors for workflow with multiple invalid contract refs', () => {
      const snapshot = {
        ...baseSnapshot,
        workflows: [{ ...baseSnapshot.workflows[0]!, contractIds: ['ghost1', 'ghost2'] }],
      }
      const issues = engine.validate(snapshot)
      const wfContractIssues = issues.filter((i) => i.entity === 'Workflow' && i.field === 'contractIds')
      expect(wfContractIssues).toHaveLength(2)
    })
  })

  describe('Policy rules', () => {
    it('should report error for department-scoped policy with non-existent department', () => {
      const snapshot = {
        ...baseSnapshot,
        policies: [{
          id: 'pol1',
          projectId: 'p1',
          name: 'Gate',
          description: 'Approval',
          scope: 'department' as const,
          departmentId: 'ghost-dept',
          type: 'approval-gate' as const,
          condition: 'Needs approval',
          enforcement: 'mandatory' as const,
          status: 'active' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Policy',
        entityId: 'pol1',
        severity: 'error',
        field: 'departmentId',
        message: expect.stringContaining('non-existent department "ghost-dept"'),
      }))
    })

    it('should not report error for global policy without departmentId', () => {
      const snapshot = {
        ...baseSnapshot,
        policies: [{
          id: 'pol1',
          projectId: 'p1',
          name: 'Rule',
          description: 'Global rule',
          scope: 'global' as const,
          departmentId: null,
          type: 'rule' as const,
          condition: 'Always',
          enforcement: 'mandatory' as const,
          status: 'active' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'Policy')).toEqual([])
    })

    it('should not report error for department-scoped policy with valid department', () => {
      const snapshot = {
        ...baseSnapshot,
        policies: [{
          id: 'pol1',
          projectId: 'p1',
          name: 'Gate',
          description: 'Approval',
          scope: 'department' as const,
          departmentId: 'd1',
          type: 'approval-gate' as const,
          condition: 'Needs approval',
          enforcement: 'mandatory' as const,
          status: 'active' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'Policy')).toEqual([])
    })
  })

  describe('Role rules', () => {
    it('should report error for role with non-existent department', () => {
      const snapshot = {
        ...baseSnapshot,
        roles: [{ ...baseSnapshot.roles[0]!, departmentId: 'ghost-dept' }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Role',
        entityId: 'r1',
        severity: 'error',
        field: 'departmentId',
        message: expect.stringContaining('non-existent department "ghost-dept"'),
      }))
    })

    it('should report error for role with non-existent capability', () => {
      const snapshot = {
        ...baseSnapshot,
        roles: [{ ...baseSnapshot.roles[0]!, capabilityIds: ['ghost-cap'] }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Role',
        entityId: 'r1',
        severity: 'error',
        field: 'capabilityIds',
        message: expect.stringContaining('non-existent capability "ghost-cap"'),
      }))
    })

    it('should report multiple errors for role with multiple invalid capabilities', () => {
      const snapshot = {
        ...baseSnapshot,
        roles: [{ ...baseSnapshot.roles[0]!, capabilityIds: ['ghost1', 'ghost2'] }],
      }
      const issues = engine.validate(snapshot)
      const roleCapIssues = issues.filter((i) => i.entity === 'Role' && i.field === 'capabilityIds')
      expect(roleCapIssues).toHaveLength(2)
    })

    it('should not report error for role with valid references', () => {
      const issues = engine.validate(baseSnapshot)
      expect(issues.filter((i) => i.entity === 'Role')).toEqual([])
    })

    it('should not report error for role with empty capabilityIds', () => {
      const snapshot = {
        ...baseSnapshot,
        roles: [{ ...baseSnapshot.roles[0]!, capabilityIds: [] }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'Role')).toEqual([])
    })
  })

  describe('AgentArchetype rules', () => {
    it('should report error for archetype with non-existent role', () => {
      const snapshot = {
        ...baseSnapshot,
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'ghost-role',
          departmentId: 'd1', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'AgentArchetype',
        entityId: 'aa1',
        severity: 'error',
        field: 'roleId',
        message: expect.stringContaining('non-existent role "ghost-role"'),
      }))
    })

    it('should report error for archetype with non-existent department', () => {
      const snapshot = {
        ...baseSnapshot,
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1',
          departmentId: 'ghost-dept', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'AgentArchetype',
        entityId: 'aa1',
        severity: 'error',
        field: 'departmentId',
        message: expect.stringContaining('non-existent department "ghost-dept"'),
      }))
    })

    it('should report errors for both invalid role and department', () => {
      const snapshot = {
        ...baseSnapshot,
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'ghost-role',
          departmentId: 'ghost-dept', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      const archetypeIssues = issues.filter((i) => i.entity === 'AgentArchetype')
      expect(archetypeIssues).toHaveLength(2)
      expect(archetypeIssues.map((i) => i.field)).toContain('roleId')
      expect(archetypeIssues.map((i) => i.field)).toContain('departmentId')
    })

    it('should not report error for archetype with valid references', () => {
      const snapshot = {
        ...baseSnapshot,
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1',
          departmentId: 'd1', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'AgentArchetype')).toEqual([])
    })
  })

  describe('AgentAssignment rules', () => {
    it('should report error for assignment with non-existent archetype', () => {
      const snapshot = {
        ...baseSnapshot,
        agentAssignments: [{
          id: 'asgn1', projectId: 'p1', name: 'Bot Instance', archetypeId: 'ghost-archetype',
          status: 'active' as const, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'AgentAssignment',
        entityId: 'asgn1',
        severity: 'error',
        field: 'archetypeId',
        message: expect.stringContaining('non-existent archetype "ghost-archetype"'),
      }))
    })

    it('should not report error for assignment with valid archetype', () => {
      const snapshot = {
        ...baseSnapshot,
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1',
          departmentId: 'd1', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
        agentAssignments: [{
          id: 'asgn1', projectId: 'p1', name: 'Bot Instance', archetypeId: 'aa1',
          status: 'active' as const, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'AgentAssignment')).toEqual([])
    })
  })

  describe('Skill rules', () => {
    it('should report error for skill with non-existent compatibleRoleId', () => {
      const snapshot = {
        ...baseSnapshot,
        skills: [{
          id: 's1', projectId: 'p1', name: 'Deploy', description: '', category: 'DevOps',
          tags: [], compatibleRoleIds: ['ghost-role'],
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'Skill',
        entityId: 's1',
        severity: 'error',
        field: 'compatibleRoleIds',
        message: expect.stringContaining('non-existent role "ghost-role"'),
      }))
    })

    it('should not report error for skill with valid compatibleRoleIds', () => {
      const snapshot = {
        ...baseSnapshot,
        skills: [{
          id: 's1', projectId: 'p1', name: 'Deploy', description: '', category: 'DevOps',
          tags: [], compatibleRoleIds: ['r1'],
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'Skill')).toEqual([])
    })

    it('should not report error for skill with empty compatibleRoleIds', () => {
      const snapshot = {
        ...baseSnapshot,
        skills: [{
          id: 's1', projectId: 'p1', name: 'Deploy', description: '', category: 'DevOps',
          tags: [], compatibleRoleIds: [],
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'Skill')).toEqual([])
    })
  })

  describe('AgentArchetype skillIds rules', () => {
    it('should report error for archetype with non-existent skillId', () => {
      const snapshot = {
        ...baseSnapshot,
        skills: [{
          id: 's1', projectId: 'p1', name: 'Deploy', description: '', category: 'DevOps',
          tags: [], compatibleRoleIds: [],
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1',
          departmentId: 'd1', skillIds: ['ghost-skill'], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toContainEqual(expect.objectContaining({
        entity: 'AgentArchetype',
        entityId: 'aa1',
        severity: 'error',
        field: 'skillIds',
        message: expect.stringContaining('non-existent skill "ghost-skill"'),
      }))
    })

    it('should not report error for archetype with valid skillIds', () => {
      const snapshot = {
        ...baseSnapshot,
        skills: [{
          id: 's1', projectId: 'p1', name: 'Deploy', description: '', category: 'DevOps',
          tags: [], compatibleRoleIds: [],
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
        agentArchetypes: [{
          id: 'aa1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1',
          departmentId: 'd1', skillIds: ['s1'], constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
          createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        }],
      }
      const issues = engine.validate(snapshot)
      expect(issues.filter((i) => i.entity === 'AgentArchetype' && i.field === 'skillIds')).toEqual([])
    })
  })

  describe('combined issues', () => {
    it('should report multiple issues across entities', () => {
      const snapshot: ReleaseSnapshotDto = {
        companyModel: null,
        departments: [{ id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' }],
        capabilities: [{ id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: null, inputs: [], outputs: [], createdAt: '', updatedAt: '' }],
        roles: [],
        agentArchetypes: [],
        agentAssignments: [],
        skills: [],
        contracts: [],
        workflows: [{ id: 'w1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'draft', triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
        policies: [],
        artifacts: [],
      }
      const issues = engine.validate(snapshot)
      expect(issues).toHaveLength(4)
      expect(issues.filter((i) => i.severity === 'error')).toHaveLength(1)
      expect(issues.filter((i) => i.severity === 'warning')).toHaveLength(3)
    })

    it('should report referential errors alongside completeness warnings', () => {
      const snapshot: ReleaseSnapshotDto = {
        companyModel: baseSnapshot.companyModel,
        departments: [],
        capabilities: [{ id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: 'ghost', inputs: [], outputs: [], createdAt: '', updatedAt: '' }],
        roles: [],
        agentArchetypes: [],
        agentAssignments: [],
        skills: [],
        contracts: [{ id: 'ct1', projectId: 'p1', name: 'SLA', description: '', type: 'SLA', status: 'active', providerId: 'ghost', providerType: 'department', consumerId: 'c1', consumerType: 'capability', acceptanceCriteria: [], createdAt: '', updatedAt: '' }],
        workflows: [{ id: 'w1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: 'ghost', status: 'draft', triggerDescription: '', stages: [], participants: [], contractIds: ['ct1'], createdAt: '', updatedAt: '' }],
        policies: [{
          id: 'pol1', projectId: 'p1', name: 'Gate', description: '', scope: 'department',
          departmentId: 'ghost', type: 'rule', condition: '', enforcement: 'mandatory',
          status: 'active', createdAt: '', updatedAt: '',
        }],
        artifacts: [],
      }
      const issues = engine.validate(snapshot)
      const errors = issues.filter((i) => i.severity === 'error')
      expect(errors.length).toBeGreaterThanOrEqual(4)
      expect(errors.map((e) => e.entity)).toContain('Capability')
      expect(errors.map((e) => e.entity)).toContain('Contract')
      expect(errors.map((e) => e.entity)).toContain('Workflow')
      expect(errors.map((e) => e.entity)).toContain('Policy')
    })
  })
})
