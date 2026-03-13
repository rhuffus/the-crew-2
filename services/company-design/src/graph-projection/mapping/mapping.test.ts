import { describe, it, expect } from 'vitest'
import type {
  ReleaseSnapshotDto,
  VisualNodeDto,
  VisualEdgeDto,
  ValidationIssue,
  GraphScope,
} from '@the-crew/shared-types'
import { visualNodeId, workflowStageId, visualEdgeId } from './visual-id'
import { truncate } from './truncate'
import { mapNodes } from './node-mapper'
import { extractEdges } from './edge-extractor'
import { filterByScope } from './scope-filter'
import { applyValidationOverlay } from './validation-overlay'
import { buildBreadcrumb } from './breadcrumb-builder'

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

function createSnapshot(overrides: Partial<ReleaseSnapshotDto> = {}): ReleaseSnapshotDto {
  return {
    companyModel: {
      projectId: 'p1',
      purpose: 'Test Company',
      type: 'SaaS',
      scope: 'Global',
      principles: [],
      updatedAt: '',
    },
    departments: [],
    capabilities: [],
    roles: [],
    agentArchetypes: [],
    agentAssignments: [],
    skills: [],
    contracts: [],
    workflows: [],
    policies: [],
    artifacts: [],
    ...overrides,
  }
}

const PROJECT_ID = 'p1'

// ===========================================================================
// 1. visual-id
// ===========================================================================

describe('visual-id', () => {
  it('should generate company node id with company prefix', () => {
    expect(visualNodeId('company', 'proj-1')).toBe('company:proj-1')
  })

  it('should generate department node id with dept prefix', () => {
    expect(visualNodeId('department', 'd1')).toBe('dept:d1')
  })

  it('should generate agent-archetype node id with archetype prefix', () => {
    expect(visualNodeId('agent-archetype', 'a1')).toBe('archetype:a1')
  })

  it('should generate workflow-stage id with workflow id and order', () => {
    expect(workflowStageId('wf1', 3)).toBe('wf-stage:wf1:3')
  })

  it('should generate edge id with arrow separator', () => {
    const src = visualNodeId('department', 'd1')
    const tgt = visualNodeId('department', 'd2')
    expect(visualEdgeId('reports_to', src, tgt)).toBe(
      'reports_to:dept:d1\u2192dept:d2',
    )
  })
})

// ===========================================================================
// 2. truncate
// ===========================================================================

describe('truncate', () => {
  it('should return null for null input', () => {
    expect(truncate(null, 50)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(truncate('', 50)).toBeNull()
  })

  it('should return text unchanged when shorter than maxLength', () => {
    expect(truncate('Hello', 50)).toBe('Hello')
  })

  it('should truncate long text and append ellipsis', () => {
    const text = 'A'.repeat(60)
    const result = truncate(text, 50)
    expect(result).toHaveLength(50)
    expect(result!.endsWith('\u2026')).toBe(true)
    expect(result).toBe('A'.repeat(49) + '\u2026')
  })

  it('should return null for whitespace-only input', () => {
    expect(truncate('   ', 50)).toBeNull()
  })
})

// ===========================================================================
// 3. node-mapper
// ===========================================================================

describe('mapNodes', () => {
  it('should create company node with label from purpose when model is present', () => {
    const snapshot = createSnapshot()
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const company = nodes.find((n) => n.nodeType === 'company')
    expect(company).toBeDefined()
    expect(company!.id).toBe('company:p1')
    expect(company!.label).toBe('Test Company')
    expect(company!.sublabel).toBe('SaaS')
    expect(company!.status).toBe('normal')
    expect(company!.layerIds).toEqual(['organization'])
    expect(company!.parentId).toBeNull()
  })

  it('should create company node with error status when model is null', () => {
    const snapshot = createSnapshot({ companyModel: null })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const company = nodes.find((n) => n.nodeType === 'company')
    expect(company).toBeDefined()
    expect(company!.label).toBe('(No purpose defined)')
    expect(company!.sublabel).toBeNull()
    expect(company!.status).toBe('error')
  })

  it('should create department node with parentId pointing to parent dept', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Parent', description: '', mandate: 'Lead', parentId: null, createdAt: '', updatedAt: '' },
        { id: 'd2', projectId: 'p1', name: 'Child', description: '', mandate: 'Support', parentId: 'd1', createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const child = nodes.find((n) => n.entityId === 'd2')
    expect(child).toBeDefined()
    expect(child!.parentId).toBe('dept:d1')
    expect(child!.nodeType).toBe('department')
    expect(child!.label).toBe('Child')
    expect(child!.sublabel).toBe('Support')
  })

  it('should create department node with parentId pointing to company when no parentId', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Top', description: '', mandate: 'Run things', parentId: null, createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const dept = nodes.find((n) => n.entityId === 'd1')
    expect(dept!.parentId).toBe('company:p1')
  })

  it('should create role node with department as parent', () => {
    const snapshot = createSnapshot({
      roles: [
        { id: 'r1', projectId: 'p1', name: 'Engineer', description: '', departmentId: 'd1', capabilityIds: [], accountability: 'Build stuff', authority: '', createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const role = nodes.find((n) => n.nodeType === 'role')
    expect(role).toBeDefined()
    expect(role!.id).toBe('role:r1')
    expect(role!.parentId).toBe('dept:d1')
    expect(role!.sublabel).toBe('Build stuff')
    expect(role!.layerIds).toEqual(['organization'])
  })

  it('should create agent-archetype node with department as parent', () => {
    const snapshot = createSnapshot({
      agentArchetypes: [
        { id: 'at1', projectId: 'p1', name: 'Bot', description: 'A helpful bot', roleId: 'r1', departmentId: 'd1', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] }, createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const archetype = nodes.find((n) => n.nodeType === 'agent-archetype')
    expect(archetype).toBeDefined()
    expect(archetype!.id).toBe('archetype:at1')
    expect(archetype!.parentId).toBe('dept:d1')
    expect(archetype!.sublabel).toBe('A helpful bot')
  })

  it('should create agent-assignment node with archetype as parent', () => {
    const snapshot = createSnapshot({
      agentAssignments: [
        { id: 'as1', projectId: 'p1', archetypeId: 'at1', name: 'Instance-1', status: 'active', createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const assignment = nodes.find((n) => n.nodeType === 'agent-assignment')
    expect(assignment).toBeDefined()
    expect(assignment!.id).toBe('assignment:as1')
    expect(assignment!.parentId).toBe('archetype:at1')
    expect(assignment!.sublabel).toBe('active')
  })

  it('should create capability node in capabilities layer with dept parent', () => {
    const snapshot = createSnapshot({
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Onboarding', description: 'Onboard users', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const cap = nodes.find((n) => n.nodeType === 'capability')
    expect(cap).toBeDefined()
    expect(cap!.id).toBe('cap:c1')
    expect(cap!.layerIds).toEqual(['capabilities'])
    expect(cap!.parentId).toBe('dept:d1')
    expect(cap!.sublabel).toBe('Onboard users')
  })

  it('should create capability node with null parentId when no owner dept', () => {
    const snapshot = createSnapshot({
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Shared', description: '', ownerDepartmentId: null, inputs: [], outputs: [], createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const cap = nodes.find((n) => n.nodeType === 'capability')
    expect(cap!.parentId).toBeNull()
  })

  it('should create skill node in capabilities layer with null parent', () => {
    const snapshot = createSnapshot({
      skills: [
        { id: 's1', projectId: 'p1', name: 'Python', description: '', category: 'Programming', tags: [], compatibleRoleIds: [], createdAt: '', updatedAt: '' },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const skill = nodes.find((n) => n.nodeType === 'skill')
    expect(skill).toBeDefined()
    expect(skill!.id).toBe('skill:s1')
    expect(skill!.parentId).toBeNull()
    expect(skill!.sublabel).toBe('Programming')
    expect(skill!.layerIds).toEqual(['capabilities'])
  })

  it('should create workflow node with stages as children', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'Deploy', description: '', ownerDepartmentId: 'd1',
          status: 'active', triggerDescription: '', stages: [
            { name: 'Build', order: 1, description: 'Build artifacts' },
            { name: 'Test', order: 2, description: 'Run tests' },
          ], participants: [], contractIds: [], createdAt: '', updatedAt: '',
        },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const wf = nodes.find((n) => n.nodeType === 'workflow')
    expect(wf).toBeDefined()
    expect(wf!.id).toBe('wf:wf1')
    expect(wf!.sublabel).toBe('active')
    expect(wf!.layerIds).toEqual(['workflows'])
    expect(wf!.parentId).toBe('dept:d1')

    const stages = nodes.filter((n) => n.nodeType === 'workflow-stage')
    expect(stages).toHaveLength(2)
    expect(stages[0]!.id).toBe('wf-stage:wf1:1')
    expect(stages[0]!.label).toBe('Build')
    expect(stages[0]!.sublabel).toBe('Build artifacts')
    expect(stages[0]!.parentId).toBe('wf:wf1')
    expect(stages[1]!.id).toBe('wf-stage:wf1:2')
  })

  it('should create contract node with type and status sublabel', () => {
    const snapshot = createSnapshot({
      contracts: [
        {
          id: 'ct1', projectId: 'p1', name: 'SLA-1', description: '', type: 'SLA', status: 'active',
          providerId: 'd1', providerType: 'department', consumerId: 'd2', consumerType: 'department',
          acceptanceCriteria: [], createdAt: '', updatedAt: '',
        },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const contract = nodes.find((n) => n.nodeType === 'contract')
    expect(contract).toBeDefined()
    expect(contract!.id).toBe('contract:ct1')
    expect(contract!.sublabel).toBe('SLA \u00b7 active')
    expect(contract!.layerIds).toEqual(['contracts'])
    expect(contract!.parentId).toBeNull()
  })

  // ── v3 node mapping ─────────────────────────────────────────────

  it('should create UO company node replacing legacy company node', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-co', uoType: 'company', name: 'LiveCo', mandate: 'Build things', parentUoId: null, status: 'active' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const companies = nodes.filter(n => n.nodeType === 'company')
    expect(companies).toHaveLength(1)
    expect(companies[0]!.label).toBe('LiveCo')
    expect(companies[0]!.sublabel).toBe('Build things')
    expect(companies[0]!.entityId).toBe('uo-co')
  })

  it('should create UO department node with correct parent', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-co', uoType: 'company', name: 'LiveCo', mandate: '', parentUoId: null, status: 'active' } as never,
        { id: 'uo-d1', uoType: 'department', name: 'Engineering', mandate: 'Build', parentUoId: 'uo-co', status: 'active' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const dept = nodes.find(n => n.entityId === 'uo-d1')
    expect(dept).toBeDefined()
    expect(dept!.nodeType).toBe('department')
    expect(dept!.parentId).toBe('company:uo-co')
  })

  it('should create UO team node', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-co', uoType: 'company', name: 'Co', mandate: '', parentUoId: null, status: 'active' } as never,
        { id: 'uo-t1', uoType: 'team', name: 'Alpha', mandate: 'Ship fast', parentUoId: 'uo-co', status: 'active' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const team = nodes.find(n => n.entityId === 'uo-t1')
    expect(team).toBeDefined()
    expect(team!.nodeType).toBe('team')
    expect(team!.id).toBe('team:uo-t1')
  })

  it('should create coordinator-agent node with UO as parent', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-t1', uoType: 'team', name: 'Alpha', mandate: '', parentUoId: null, status: 'active' } as never,
      ],
      agents: [
        { id: 'ag1', agentType: 'coordinator', name: 'Team Lead', role: 'Coordinates work', uoId: 'uo-t1' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const agent = nodes.find(n => n.entityId === 'ag1')
    expect(agent).toBeDefined()
    expect(agent!.nodeType).toBe('coordinator-agent')
    expect(agent!.id).toBe('coord:ag1')
    expect(agent!.parentId).toBe('team:uo-t1')
    expect(agent!.sublabel).toBe('Coordinates work')
  })

  it('should create specialist-agent node', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-t1', uoType: 'team', name: 'Alpha', mandate: '', parentUoId: null, status: 'active' } as never,
      ],
      agents: [
        { id: 'ag2', agentType: 'specialist', name: 'Dev Agent', role: 'Writes code', uoId: 'uo-t1' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const agent = nodes.find(n => n.entityId === 'ag2')
    expect(agent).toBeDefined()
    expect(agent!.nodeType).toBe('specialist-agent')
    expect(agent!.id).toBe('spec:ag2')
  })

  it('should create proposal node in governance layer', () => {
    const snapshot = createSnapshot({
      proposals: [
        { id: 'prop1', title: 'Create Dept', proposalType: 'create-unit', status: 'proposed', motivation: 'We need one', expectedBenefit: 'Better org' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const proposal = nodes.find(n => n.entityId === 'prop1')
    expect(proposal).toBeDefined()
    expect(proposal!.nodeType).toBe('proposal')
    expect(proposal!.id).toBe('proposal:prop1')
    expect(proposal!.layerIds).toEqual(['governance'])
    expect(proposal!.sublabel).toBe('create-unit · proposed')
  })

  it('should set error status for rejected proposals', () => {
    const snapshot = createSnapshot({
      proposals: [
        { id: 'prop1', title: 'Bad Idea', proposalType: 'create-unit', status: 'rejected' } as never,
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)
    const proposal = nodes.find(n => n.entityId === 'prop1')
    expect(proposal!.status).toBe('error')
  })

  it('should create policy node with type and enforcement sublabel', () => {
    const snapshot = createSnapshot({
      policies: [
        {
          id: 'pol1', projectId: 'p1', name: 'Approval', description: '', scope: 'global',
          departmentId: null, type: 'approval-gate', condition: '', enforcement: 'mandatory',
          status: 'active', createdAt: '', updatedAt: '',
        },
      ],
    })
    const nodes = mapNodes(snapshot, PROJECT_ID)

    const policy = nodes.find((n) => n.nodeType === 'policy')
    expect(policy).toBeDefined()
    expect(policy!.id).toBe('policy:pol1')
    expect(policy!.sublabel).toBe('approval-gate \u00b7 mandatory')
    expect(policy!.layerIds).toEqual(['governance'])
    expect(policy!.parentId).toBeNull()
  })
})

// ===========================================================================
// 4. edge-extractor
// ===========================================================================

describe('extractEdges', () => {
  it('should extract reports_to edge for department hierarchy', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'A', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        { id: 'd2', projectId: 'p1', name: 'B', description: '', mandate: '', parentId: 'd1', createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const reportsTo = edges.filter((e) => e.edgeType === 'reports_to')
    expect(reportsTo).toHaveLength(1)
    expect(reportsTo[0]!.sourceId).toBe('dept:d2')
    expect(reportsTo[0]!.targetId).toBe('dept:d1')
    expect(reportsTo[0]!.style).toBe('solid')
    expect(reportsTo[0]!.layerIds).toEqual(['organization'])
  })

  it('should not extract reports_to edge when department has no parent', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'A', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)
    expect(edges.filter((e) => e.edgeType === 'reports_to')).toHaveLength(0)
  })

  it('should extract owns edge from department to capability', () => {
    const snapshot = createSnapshot({
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const owns = edges.filter((e) => e.edgeType === 'owns')
    expect(owns).toHaveLength(1)
    expect(owns[0]!.sourceId).toBe('dept:d1')
    expect(owns[0]!.targetId).toBe('cap:c1')
    expect(owns[0]!.layerIds).toEqual(['capabilities'])
  })

  it('should extract owns edge from department to workflow', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: 'd1',
          status: 'active', triggerDescription: '', stages: [], participants: [], contractIds: [],
          createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const owns = edges.filter((e) => e.edgeType === 'owns')
    expect(owns).toHaveLength(1)
    expect(owns[0]!.sourceId).toBe('dept:d1')
    expect(owns[0]!.targetId).toBe('wf:wf1')
    expect(owns[0]!.layerIds).toEqual(['workflows'])
  })

  it('should extract assigned_to edge from archetype to role', () => {
    const snapshot = createSnapshot({
      agentArchetypes: [
        { id: 'at1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1', departmentId: 'd1', skillIds: [], constraints: { maxConcurrency: null, allowedDepartmentIds: [] }, createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const assigned = edges.filter((e) => e.edgeType === 'assigned_to')
    expect(assigned).toHaveLength(1)
    expect(assigned[0]!.sourceId).toBe('archetype:at1')
    expect(assigned[0]!.targetId).toBe('role:r1')
    expect(assigned[0]!.style).toBe('dashed')
  })

  it('should extract contributes_to edges from role to capabilities', () => {
    const snapshot = createSnapshot({
      roles: [
        { id: 'r1', projectId: 'p1', name: 'Dev', description: '', departmentId: 'd1', capabilityIds: ['c1', 'c2'], accountability: '', authority: '', createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const contrib = edges.filter((e) => e.edgeType === 'contributes_to')
    expect(contrib).toHaveLength(2)
    expect(contrib[0]!.sourceId).toBe('role:r1')
    expect(contrib[0]!.targetId).toBe('cap:c1')
    expect(contrib[0]!.style).toBe('dotted')
  })

  it('should extract has_skill edges from archetype to skills', () => {
    const snapshot = createSnapshot({
      agentArchetypes: [
        { id: 'at1', projectId: 'p1', name: 'Bot', description: '', roleId: 'r1', departmentId: 'd1', skillIds: ['s1', 's2'], constraints: { maxConcurrency: null, allowedDepartmentIds: [] }, createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const hasSkill = edges.filter((e) => e.edgeType === 'has_skill')
    expect(hasSkill).toHaveLength(2)
    expect(hasSkill[0]!.targetId).toBe('skill:s1')
    expect(hasSkill[1]!.targetId).toBe('skill:s2')
  })

  it('should extract compatible_with edges from skill to roles', () => {
    const snapshot = createSnapshot({
      skills: [
        { id: 's1', projectId: 'p1', name: 'Go', description: '', category: '', tags: [], compatibleRoleIds: ['r1'], createdAt: '', updatedAt: '' },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const compat = edges.filter((e) => e.edgeType === 'compatible_with')
    expect(compat).toHaveLength(1)
    expect(compat[0]!.sourceId).toBe('skill:s1')
    expect(compat[0]!.targetId).toBe('role:r1')
  })

  it('should extract provides and consumes edges for contracts', () => {
    const snapshot = createSnapshot({
      contracts: [
        {
          id: 'ct1', projectId: 'p1', name: 'SLA', description: '', type: 'SLA', status: 'active',
          providerId: 'd1', providerType: 'department', consumerId: 'c1', consumerType: 'capability',
          acceptanceCriteria: [], createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const provides = edges.filter((e) => e.edgeType === 'provides')
    expect(provides).toHaveLength(1)
    expect(provides[0]!.sourceId).toBe('dept:d1')
    expect(provides[0]!.targetId).toBe('contract:ct1')

    const consumes = edges.filter((e) => e.edgeType === 'consumes')
    expect(consumes).toHaveLength(1)
    expect(consumes[0]!.sourceId).toBe('cap:c1')
    expect(consumes[0]!.targetId).toBe('contract:ct1')
  })

  it('should extract bound_by edges from workflow to contracts', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null,
          status: 'active', triggerDescription: '', stages: [], participants: [],
          contractIds: ['ct1', 'ct2'], createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const bound = edges.filter((e) => e.edgeType === 'bound_by')
    expect(bound).toHaveLength(2)
    expect(bound[0]!.sourceId).toBe('wf:wf1')
    expect(bound[0]!.targetId).toBe('contract:ct1')
    expect(bound[0]!.style).toBe('dashed')
  })

  it('should extract participates_in edges with responsibility label', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null,
          status: 'active', triggerDescription: '', stages: [],
          participants: [
            { participantId: 'r1', participantType: 'role', responsibility: 'Review' },
            { participantId: 'd1', participantType: 'department', responsibility: '' },
          ],
          contractIds: [], createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const participates = edges.filter((e) => e.edgeType === 'participates_in')
    expect(participates).toHaveLength(2)
    expect(participates[0]!.sourceId).toBe('role:r1')
    expect(participates[0]!.targetId).toBe('wf:wf1')
    expect(participates[0]!.label).toBe('Review')
    expect(participates[1]!.sourceId).toBe('dept:d1')
    expect(participates[1]!.label).toBeNull()
  })

  it('should extract hands_off_to edges between consecutive workflow stages', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null,
          status: 'active', triggerDescription: '',
          stages: [
            { name: 'A', order: 1, description: '' },
            { name: 'B', order: 2, description: '' },
            { name: 'C', order: 3, description: '' },
          ],
          participants: [], contractIds: [], createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const handoff = edges.filter((e) => e.edgeType === 'hands_off_to')
    expect(handoff).toHaveLength(2)
    expect(handoff[0]!.sourceId).toBe('wf-stage:wf1:1')
    expect(handoff[0]!.targetId).toBe('wf-stage:wf1:2')
    expect(handoff[1]!.sourceId).toBe('wf-stage:wf1:2')
    expect(handoff[1]!.targetId).toBe('wf-stage:wf1:3')
    expect(handoff[0]!.style).toBe('solid')
  })

  it('should extract governs edge from global policy to company', () => {
    const snapshot = createSnapshot({
      policies: [
        {
          id: 'pol1', projectId: 'p1', name: 'Global Policy', description: '',
          scope: 'global', departmentId: null, type: 'rule', condition: '',
          enforcement: 'mandatory', status: 'active', createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const governs = edges.filter((e) => e.edgeType === 'governs')
    expect(governs).toHaveLength(1)
    expect(governs[0]!.sourceId).toBe('policy:pol1')
    expect(governs[0]!.targetId).toBe('company:p1')
    expect(governs[0]!.style).toBe('dashed')
    expect(governs[0]!.layerIds).toEqual(['governance'])
  })

  // ── v3 edges ──────────────────────────────────────────────────────

  it('should extract contains edge for UO parent-child hierarchy', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-co', uoType: 'company', name: 'TestCo', mandate: '', parentUoId: null, status: 'active' } as never,
        { id: 'uo-d1', uoType: 'department', name: 'Eng', mandate: '', parentUoId: 'uo-co', status: 'active' } as never,
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)
    const contains = edges.filter(e => e.edgeType === 'contains')
    expect(contains).toHaveLength(1)
    expect(contains[0]!.sourceId).toBe('company:uo-co')
    expect(contains[0]!.targetId).toBe('dept:uo-d1')
    expect(contains[0]!.layerIds).toEqual(['organization'])
  })

  it('should extract led_by edge for coordinator agent (UO -> agent)', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-t1', uoType: 'team', name: 'Alpha', mandate: '', parentUoId: null, status: 'active' } as never,
      ],
      agents: [
        { id: 'ag1', agentType: 'coordinator', name: 'Lead', role: 'Leads team', uoId: 'uo-t1' } as never,
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)
    const ledBy = edges.filter(e => e.edgeType === 'led_by')
    expect(ledBy).toHaveLength(1)
    expect(ledBy[0]!.sourceId).toBe('team:uo-t1')
    expect(ledBy[0]!.targetId).toBe('coord:ag1')
  })

  it('should extract belongs_to edge for specialist agent', () => {
    const snapshot = createSnapshot({
      organizationalUnits: [
        { id: 'uo-t1', uoType: 'team', name: 'Alpha', mandate: '', parentUoId: null, status: 'active' } as never,
      ],
      agents: [
        { id: 'ag2', agentType: 'specialist', name: 'Dev', role: 'Developer', uoId: 'uo-t1' } as never,
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)
    const belongsTo = edges.filter(e => e.edgeType === 'belongs_to')
    expect(belongsTo).toHaveLength(1)
    expect(belongsTo[0]!.sourceId).toBe('spec:ag2')
    expect(belongsTo[0]!.targetId).toBe('team:uo-t1')
    expect(belongsTo[0]!.style).toBe('dashed')
  })

  it('should extract proposed_by edge for proposal with agent', () => {
    const snapshot = createSnapshot({
      agents: [
        { id: 'ag1', agentType: 'coordinator', name: 'CEO', role: 'CEO', uoId: 'uo1' } as never,
      ],
      proposals: [
        { id: 'prop1', title: 'Create Dept', proposalType: 'create-unit', status: 'proposed', proposedByAgentId: 'ag1' } as never,
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)
    const proposedBy = edges.filter(e => e.edgeType === 'proposed_by')
    expect(proposedBy).toHaveLength(1)
    expect(proposedBy[0]!.sourceId).toBe('proposal:prop1')
    expect(proposedBy[0]!.targetId).toBe('coord:ag1')
    expect(proposedBy[0]!.layerIds).toEqual(['governance'])
  })

  it('should not extract proposed_by when agent is not found', () => {
    const snapshot = createSnapshot({
      proposals: [
        { id: 'prop1', title: 'Create Dept', proposalType: 'create-unit', status: 'proposed', proposedByAgentId: 'nonexistent' } as never,
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)
    const proposedBy = edges.filter(e => e.edgeType === 'proposed_by')
    expect(proposedBy).toHaveLength(0)
  })

  it('should extract governs edge from department-scoped policy to department', () => {
    const snapshot = createSnapshot({
      policies: [
        {
          id: 'pol2', projectId: 'p1', name: 'Dept Policy', description: '',
          scope: 'department', departmentId: 'd1', type: 'constraint', condition: '',
          enforcement: 'advisory', status: 'active', createdAt: '', updatedAt: '',
        },
      ],
    })
    const edges = extractEdges(snapshot, PROJECT_ID)

    const governs = edges.filter((e) => e.edgeType === 'governs')
    expect(governs).toHaveLength(1)
    expect(governs[0]!.sourceId).toBe('policy:pol2')
    expect(governs[0]!.targetId).toBe('dept:d1')
  })
})

// ===========================================================================
// 5. scope-filter
// ===========================================================================

describe('filterByScope', () => {
  const baseNodes: VisualNodeDto[] = [
    { id: 'company:p1', nodeType: 'company', entityId: 'p1', label: 'Co', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['organization'], parentId: null },
    { id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Eng', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['organization'], parentId: 'company:p1' },
    { id: 'role:r1', nodeType: 'role', entityId: 'r1', label: 'Dev', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['organization'], parentId: 'dept:d1' },
    { id: 'cap:c1', nodeType: 'capability', entityId: 'c1', label: 'Cap', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['capabilities'], parentId: 'dept:d1' },
    { id: 'policy:pol1', nodeType: 'policy', entityId: 'pol1', label: 'Pol', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['governance'], parentId: null },
    { id: 'wf:wf1', nodeType: 'workflow', entityId: 'wf1', label: 'WF', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['workflows'], parentId: 'dept:d1' },
    { id: 'wf-stage:wf1:1', nodeType: 'workflow-stage', entityId: 'wf1:A', label: 'A', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['workflows'], parentId: 'wf:wf1' },
    { id: 'contract:ct1', nodeType: 'contract', entityId: 'ct1', label: 'SLA', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['contracts'], parentId: null },
  ]

  const baseEdges: VisualEdgeDto[] = [
    { id: 'e1', edgeType: 'reports_to', sourceId: 'dept:d1', targetId: 'company:p1', label: null, style: 'solid', layerIds: ['organization'] },
    { id: 'e2', edgeType: 'owns', sourceId: 'dept:d1', targetId: 'cap:c1', label: null, style: 'solid', layerIds: ['capabilities'] },
    { id: 'e3', edgeType: 'governs', sourceId: 'policy:pol1', targetId: 'company:p1', label: null, style: 'dashed', layerIds: ['governance'] },
  ]

  it('should keep company and departments at L1 with only organization layer', () => {
    const scope: GraphScope = { level: 'L1', entityId: null, entityType: null }
    const result = filterByScope(baseNodes, baseEdges, scope, ['organization'], createSnapshot())

    const types = result.nodes.map((n) => n.nodeType)
    expect(types).toContain('company')
    expect(types).toContain('department')
    expect(types).toContain('role')
    expect(types).not.toContain('capability')
    expect(types).not.toContain('policy')
  })

  it('should include governance nodes at L1 when governance layer is active', () => {
    const scope: GraphScope = { level: 'L1', entityId: null, entityType: null }
    const result = filterByScope(baseNodes, baseEdges, scope, ['organization', 'governance'], createSnapshot())

    const types = result.nodes.map((n) => n.nodeType)
    expect(types).toContain('policy')
    expect(types).toContain('company')

    const govEdge = result.edges.find((e) => e.edgeType === 'governs')
    expect(govEdge).toBeDefined()
  })

  it('should filter L2 to specific department scope', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
      ],
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
      ],
      policies: [
        { id: 'pol1', projectId: 'p1', name: 'Pol', description: '', scope: 'department', departmentId: 'd1', type: 'rule', condition: '', enforcement: 'mandatory', status: 'active', createdAt: '', updatedAt: '' },
      ],
    })

    const scope: GraphScope = { level: 'L2', entityId: 'd1', entityType: 'department' }
    const result = filterByScope(baseNodes, baseEdges, scope, ['organization', 'capabilities', 'governance'], snapshot)

    const ids = result.nodes.map((n) => n.id)
    expect(ids).toContain('dept:d1')
    expect(ids).toContain('role:r1')
    expect(ids).toContain('cap:c1')
    expect(ids).toContain('policy:pol1')
    // Company node should NOT be in L2 (not the context dept)
    expect(ids).not.toContain('company:p1')
  })

  it('should filter L3 to specific workflow scope', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: 'd1',
          status: 'active', triggerDescription: '',
          stages: [{ name: 'A', order: 1, description: '' }],
          participants: [{ participantId: 'r1', participantType: 'role', responsibility: '' }],
          contractIds: ['ct1'], createdAt: '', updatedAt: '',
        },
      ],
      policies: [
        { id: 'pol1', projectId: 'p1', name: 'Pol', description: '', scope: 'department', departmentId: 'd1', type: 'rule', condition: '', enforcement: 'mandatory', status: 'active', createdAt: '', updatedAt: '' },
      ],
    })

    const scope: GraphScope = { level: 'L3', entityId: 'wf1', entityType: 'workflow' }
    const result = filterByScope(baseNodes, baseEdges, scope, ['workflows', 'contracts', 'organization', 'governance'], snapshot)

    const ids = result.nodes.map((n) => n.id)
    expect(ids).toContain('wf:wf1')
    expect(ids).toContain('wf-stage:wf1:1')
    expect(ids).toContain('contract:ct1')
    expect(ids).toContain('role:r1')
    expect(ids).toContain('policy:pol1')
    // Company should not appear in L3
    expect(ids).not.toContain('company:p1')
  })

  it('should remove nodes not in any active layer', () => {
    const scope: GraphScope = { level: 'L1', entityId: null, entityType: null }
    // Only organization active -> capabilities/governance/workflows/contracts nodes excluded
    const result = filterByScope(baseNodes, baseEdges, scope, ['organization'], createSnapshot())

    const types = new Set(result.nodes.map((n) => n.nodeType))
    expect(types.has('capability')).toBe(false)
    expect(types.has('policy')).toBe(false)
    expect(types.has('workflow')).toBe(false)
    expect(types.has('contract')).toBe(false)
  })

  it('should remove edges whose endpoints are not in filtered nodes', () => {
    const scope: GraphScope = { level: 'L1', entityId: null, entityType: null }
    const result = filterByScope(baseNodes, baseEdges, scope, ['organization'], createSnapshot())

    // The 'owns' edge (dept->cap) should be removed since cap is filtered out
    const ownsEdge = result.edges.find((e) => e.edgeType === 'owns')
    expect(ownsEdge).toBeUndefined()

    // The governs edge should be removed (governance layer not active)
    const governsEdge = result.edges.find((e) => e.edgeType === 'governs')
    expect(governsEdge).toBeUndefined()

    // The reports_to edge should survive (both endpoints in organization)
    const reportsTo = result.edges.find((e) => e.edgeType === 'reports_to')
    expect(reportsTo).toBeDefined()
  })
})

// ===========================================================================
// 6. validation-overlay
// ===========================================================================

describe('applyValidationOverlay', () => {
  const nodes: VisualNodeDto[] = [
    { id: 'company:p1', nodeType: 'company', entityId: 'p1', label: 'Co', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['organization'], parentId: null },
    { id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Eng', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['organization'], parentId: 'company:p1' },
    { id: 'cap:c1', nodeType: 'capability', entityId: 'c1', label: 'Cap', sublabel: null, position: null, collapsed: false, status: 'normal', layerIds: ['capabilities'], parentId: null },
  ]

  it('should keep normal status when there are no issues', () => {
    const result = applyValidationOverlay(nodes, [], PROJECT_ID)
    expect(result.every((n) => n.status === 'normal')).toBe(true)
  })

  it('should set warning status for warning issue', () => {
    const issues: ValidationIssue[] = [
      { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'Empty mandate', severity: 'warning' },
    ]
    const result = applyValidationOverlay(nodes, issues, PROJECT_ID)

    const dept = result.find((n) => n.id === 'dept:d1')
    expect(dept!.status).toBe('warning')

    // Other nodes unaffected
    expect(result.find((n) => n.id === 'company:p1')!.status).toBe('normal')
  })

  it('should set error status for error issue', () => {
    const issues: ValidationIssue[] = [
      { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
    ]
    const result = applyValidationOverlay(nodes, issues, PROJECT_ID)

    const company = result.find((n) => n.id === 'company:p1')
    expect(company!.status).toBe('error')
  })

  it('should prefer error over warning when both exist on same node', () => {
    const issues: ValidationIssue[] = [
      { entity: 'Capability', entityId: 'c1', field: 'description', message: 'Empty desc', severity: 'warning' },
      { entity: 'Capability', entityId: 'c1', field: 'ownerDepartmentId', message: 'No owner', severity: 'error' },
    ]
    const result = applyValidationOverlay(nodes, issues, PROJECT_ID)

    const cap = result.find((n) => n.id === 'cap:c1')
    expect(cap!.status).toBe('error')
  })
})

// ===========================================================================
// 7. breadcrumb-builder
// ===========================================================================

describe('buildBreadcrumb', () => {
  it('should return single company crumb at L1', () => {
    const scope: GraphScope = { level: 'L1', entityId: null, entityType: null }
    const snapshot = createSnapshot()
    const crumbs = buildBreadcrumb(scope, snapshot, PROJECT_ID)

    expect(crumbs).toHaveLength(1)
    expect(crumbs[0]!.label).toBe('Test Company')
    expect(crumbs[0]!.nodeType).toBe('company')
    expect(crumbs[0]!.entityId).toBe('p1')
    expect(crumbs[0]!.zoomLevel).toBe('L1')
  })

  it('should build L2 breadcrumb with full parent chain', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Engineering', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        { id: 'd2', projectId: 'p1', name: 'Frontend', description: '', mandate: '', parentId: 'd1', createdAt: '', updatedAt: '' },
      ],
    })
    const scope: GraphScope = { level: 'L2', entityId: 'd2', entityType: 'department' }
    const crumbs = buildBreadcrumb(scope, snapshot, PROJECT_ID)

    expect(crumbs).toHaveLength(3)
    expect(crumbs[0]!.label).toBe('Test Company')
    expect(crumbs[0]!.zoomLevel).toBe('L1')
    expect(crumbs[1]!.label).toBe('Engineering')
    expect(crumbs[1]!.nodeType).toBe('department')
    expect(crumbs[1]!.zoomLevel).toBe('L2')
    expect(crumbs[2]!.label).toBe('Frontend')
    expect(crumbs[2]!.entityId).toBe('d2')
  })

  it('should build L3 breadcrumb with owner department chain', () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Ops', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
      ],
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'Deploy', description: '', ownerDepartmentId: 'd1',
          status: 'active', triggerDescription: '', stages: [], participants: [], contractIds: [],
          createdAt: '', updatedAt: '',
        },
      ],
    })
    const scope: GraphScope = { level: 'L3', entityId: 'wf1', entityType: 'workflow' }
    const crumbs = buildBreadcrumb(scope, snapshot, PROJECT_ID)

    expect(crumbs).toHaveLength(3)
    expect(crumbs[0]!.label).toBe('Test Company')
    expect(crumbs[1]!.label).toBe('Ops')
    expect(crumbs[1]!.nodeType).toBe('department')
    expect(crumbs[2]!.label).toBe('Deploy')
    expect(crumbs[2]!.nodeType).toBe('workflow')
    expect(crumbs[2]!.zoomLevel).toBe('L3')
  })

  it('should build L3 breadcrumb without department when workflow has no owner', () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'Orphan WF', description: '', ownerDepartmentId: null,
          status: 'draft', triggerDescription: '', stages: [], participants: [], contractIds: [],
          createdAt: '', updatedAt: '',
        },
      ],
    })
    const scope: GraphScope = { level: 'L3', entityId: 'wf1', entityType: 'workflow' }
    const crumbs = buildBreadcrumb(scope, snapshot, PROJECT_ID)

    expect(crumbs).toHaveLength(2)
    expect(crumbs[0]!.label).toBe('Test Company')
    expect(crumbs[1]!.label).toBe('Orphan WF')
    expect(crumbs[1]!.nodeType).toBe('workflow')
  })
})
