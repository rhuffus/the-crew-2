import { describe, it, expect } from 'vitest'
import type {
  MaturityPhase,
  UoType,
  UoStatus,
  LcpAgentType,
  LcpAgentStatus,
  WorkflowType,
  ContractPartyType,
  ArtifactPartyType,
  LcpPolicyScope,
  LcpWorkflowParticipantType,
  ProposalType,
  ProposalStatus,
  DecisionStatus,
  RuntimeExecutionType,
  RuntimeExecutionStatus,
  ObjectivePriority,
  ObjectiveStatus,
  TriggerSourceType,
  SourceCategory,
  ApproverLevel,
  ApprovalScope,
  OverlayId,
  LcpEdgeCategory,
  LcpDiffEntityType,
  ProjectSeedDto,
  CompanyConstitutionDto,
  OrganizationalUnitDto,
  LcpAgentDto,
  ObjectiveDto,
  EventTriggerDto,
  ExternalSourceDto,
  ProposalDto,
  DecisionDto,
  RuntimeExecutionDto,
  HandoffDto,
  CreateProjectSeedDto,
  UpdateProjectSeedDto,
  UpdateConstitutionDto,
  CreateOrganizationalUnitDto,
  UpdateOrganizationalUnitDto,
  CreateLcpAgentDto,
  UpdateLcpAgentDto,
  CreateObjectiveDto,
  CreateEventTriggerDto,
  CreateExternalSourceDto,
  CreateProposalDto,
  CreateDecisionDto,
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
  RuntimeEventType,
  EventSeverity,
  RuntimeEventDto,
  CreateRuntimeEventDto,
  NodeRuntimeState,
  RuntimeBadgeType,
  RuntimeBadgeDto,
  NodeRuntimeStatusDto,
  RuntimeStatusResponse,
  RuntimeSummaryDto,
  CostSummaryDto,
  CostAlertDto,
} from '../live-company-types.js'

// Re-export check: ensure all types are also available from the barrel
import type { ReleaseSnapshotDto } from '../index.js'

// ---------------------------------------------------------------------------
// Type-level assertions (compile-time checks)
// ---------------------------------------------------------------------------

describe('Live Company Bridge Types — Union type compile checks', () => {
  it('MaturityPhase has correct literal values', () => {
    const values: MaturityPhase[] = [
      'seed', 'formation', 'structured', 'operating', 'scaling', 'optimizing',
    ]
    expect(values).toHaveLength(6)
  })

  it('UoType has correct literal values', () => {
    const values: UoType[] = ['company', 'department', 'team']
    expect(values).toHaveLength(3)
  })

  it('UoStatus has correct literal values', () => {
    const values: UoStatus[] = ['active', 'proposed', 'retired']
    expect(values).toHaveLength(3)
  })

  it('LcpAgentType has correct literal values', () => {
    const values: LcpAgentType[] = ['coordinator', 'specialist']
    expect(values).toHaveLength(2)
  })

  it('LcpAgentStatus has correct literal values', () => {
    const values: LcpAgentStatus[] = ['active', 'inactive', 'proposed']
    expect(values).toHaveLength(3)
  })

  it('WorkflowType has correct literal values', () => {
    const values: WorkflowType[] = [
      'strategic', 'operational', 'service-internal', 'event-driven', 'external-response',
    ]
    expect(values).toHaveLength(5)
  })

  it('ContractPartyType has correct literal values', () => {
    const values: ContractPartyType[] = ['uo', 'agent', 'workflow-stage']
    expect(values).toHaveLength(3)
  })

  it('ArtifactPartyType has correct literal values', () => {
    const values: ArtifactPartyType[] = ['uo', 'agent', 'workflow']
    expect(values).toHaveLength(3)
  })

  it('LcpPolicyScope has 7 values', () => {
    const values: LcpPolicyScope[] = [
      'global', 'uo', 'agent', 'workflow', 'handoff', 'artifact', 'proposal',
    ]
    expect(values).toHaveLength(7)
  })

  it('LcpWorkflowParticipantType has correct literal values', () => {
    const values: LcpWorkflowParticipantType[] = ['agent', 'uo']
    expect(values).toHaveLength(2)
  })

  it('ProposalType has 10 values', () => {
    const values: ProposalType[] = [
      'create-department', 'create-team', 'create-specialist',
      'split-team', 'merge-teams', 'retire-unit',
      'revise-contract', 'revise-workflow', 'revise-policy',
      'update-constitution',
    ]
    expect(values).toHaveLength(10)
  })

  it('ProposalStatus has 7 values', () => {
    const values: ProposalStatus[] = [
      'draft', 'proposed', 'under-review', 'approved', 'rejected', 'implemented', 'superseded',
    ]
    expect(values).toHaveLength(7)
  })

  it('DecisionStatus has correct literal values', () => {
    const values: DecisionStatus[] = ['proposed', 'approved', 'rejected', 'superseded']
    expect(values).toHaveLength(4)
  })

  it('RuntimeExecutionType has correct literal values', () => {
    const values: RuntimeExecutionType[] = ['workflow-run', 'agent-task']
    expect(values).toHaveLength(2)
  })

  it('RuntimeExecutionStatus has 7 values', () => {
    const values: RuntimeExecutionStatus[] = [
      'pending', 'running', 'waiting', 'blocked', 'completed', 'failed', 'cancelled',
    ]
    expect(values).toHaveLength(7)
  })

  it('ObjectivePriority has correct literal values', () => {
    const values: ObjectivePriority[] = ['critical', 'high', 'medium', 'low']
    expect(values).toHaveLength(4)
  })

  it('ObjectiveStatus has correct literal values', () => {
    const values: ObjectiveStatus[] = ['active', 'achieved', 'abandoned', 'superseded']
    expect(values).toHaveLength(4)
  })

  it('TriggerSourceType has correct literal values', () => {
    const values: TriggerSourceType[] = ['internal', 'external']
    expect(values).toHaveLength(2)
  })

  it('SourceCategory has 6 values', () => {
    const values: SourceCategory[] = [
      'competitor', 'market', 'customer', 'regulation', 'repository', 'third-party-system',
    ]
    expect(values).toHaveLength(6)
  })

  it('ApproverLevel has correct literal values', () => {
    const values: ApproverLevel[] = ['founder', 'ceo', 'executive', 'team-lead', 'auto']
    expect(values).toHaveLength(5)
  })

  it('ApprovalScope has 7 values', () => {
    const values: ApprovalScope[] = [
      'create-department', 'create-team', 'create-specialist',
      'retire-unit', 'revise-contract', 'revise-workflow', 'update-constitution',
    ]
    expect(values).toHaveLength(7)
  })

  it('OverlayId has 5 values', () => {
    const values: OverlayId[] = ['organization', 'work', 'deliverables', 'rules', 'live-status']
    expect(values).toHaveLength(5)
  })

  it('LcpEdgeCategory has 5 values', () => {
    const values: LcpEdgeCategory[] = [
      'structural', 'responsibility', 'collaboration', 'flow', 'governance',
    ]
    expect(values).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// DTO structure checks (runtime shape validation)
// ---------------------------------------------------------------------------

describe('Live Company Bridge Types — DTO shape validation', () => {
  it('ProjectSeedDto has all required fields', () => {
    const dto: ProjectSeedDto = {
      projectId: 'p-1',
      name: 'Test Company',
      description: 'A test company',
      mission: 'Build great products',
      vision: 'Be the best',
      companyType: 'saas-startup',
      restrictions: [],
      principles: ['quality-first'],
      aiBudget: { maxMonthlyTokens: null, maxConcurrentAgents: null, costAlertThreshold: null },
      initialObjectives: ['Launch MVP'],
      founderPreferences: { approvalLevel: 'all-changes', communicationStyle: 'detailed', growthPace: 'moderate' },
      maturityPhase: 'seed',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.projectId).toBe('p-1')
    expect(dto.maturityPhase).toBe('seed')
    expect(dto.founderPreferences.approvalLevel).toBe('all-changes')
  })

  it('CompanyConstitutionDto has all required fields', () => {
    const dto: CompanyConstitutionDto = {
      projectId: 'p-1',
      operationalPrinciples: ['transparency'],
      autonomyLimits: { maxDepth: 4, maxFanOut: 10, maxAgentsPerTeam: 8, coordinatorToSpecialistRatio: 0.25 },
      budgetConfig: { globalBudget: null, perUoBudget: null, perAgentBudget: null, alertThresholds: [80, 95] },
      approvalCriteria: [{ scope: 'create-department', requiredApprover: 'founder', requiresJustification: true }],
      namingConventions: [],
      expansionRules: [],
      contextMinimizationPolicy: '',
      qualityRules: [],
      deliveryRules: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.operationalPrinciples).toContain('transparency')
    expect(dto.autonomyLimits.maxDepth).toBe(4)
  })

  it('OrganizationalUnitDto has all required fields', () => {
    const dto: OrganizationalUnitDto = {
      id: 'uo-1',
      projectId: 'p-1',
      name: 'Engineering',
      description: 'Engineering department',
      uoType: 'department',
      mandate: 'Build the product',
      purpose: 'Deliver technical excellence',
      parentUoId: 'uo-company',
      coordinatorAgentId: 'agent-cto',
      functions: ['software-development', 'architecture'],
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.uoType).toBe('department')
    expect(dto.parentUoId).toBe('uo-company')
  })

  it('LcpAgentDto has all required fields', () => {
    const dto: LcpAgentDto = {
      id: 'agent-1',
      projectId: 'p-1',
      name: 'CEO',
      description: 'Chief Executive Officer',
      agentType: 'coordinator',
      uoId: 'uo-company',
      role: 'CEO',
      skills: [{ name: 'strategy', description: 'Strategic planning', category: 'leadership' }],
      inputs: ['market-data'],
      outputs: ['company-strategy'],
      responsibilities: ['Lead the company'],
      budget: { maxMonthlyTokens: 100000, maxConcurrentTasks: 5, costLimit: 50 },
      contextWindow: 128000,
      status: 'active',
      systemPromptRef: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.agentType).toBe('coordinator')
    expect(dto.skills).toHaveLength(1)
  })

  it('ObjectiveDto has all required fields', () => {
    const dto: ObjectiveDto = {
      id: 'obj-1',
      projectId: 'p-1',
      title: 'Launch MVP',
      description: 'Launch minimum viable product',
      ownerUoId: 'uo-eng',
      ownerAgentId: null,
      priority: 'critical',
      status: 'active',
      keyResults: [{ description: 'Ship v1', targetValue: '1 release', currentValue: '0', status: 'pending' }],
      linkedWorkflowIds: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.priority).toBe('critical')
    expect(dto.keyResults[0]!.status).toBe('pending')
  })

  it('EventTriggerDto has all required fields', () => {
    const dto: EventTriggerDto = {
      id: 'et-1',
      projectId: 'p-1',
      name: 'New Customer Signup',
      description: 'Triggered when a new customer signs up',
      sourceType: 'external',
      eventPattern: 'customer.signup',
      targetWorkflowIds: ['wf-onboarding'],
      targetAgentIds: [],
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.sourceType).toBe('external')
  })

  it('ExternalSourceDto has all required fields', () => {
    const dto: ExternalSourceDto = {
      id: 'es-1',
      projectId: 'p-1',
      name: 'Market Data API',
      description: 'External market data feed',
      sourceCategory: 'market',
      connectionRef: 'https://api.example.com',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.sourceCategory).toBe('market')
  })

  it('ProposalDto has all required fields', () => {
    const dto: ProposalDto = {
      id: 'prop-1',
      projectId: 'p-1',
      proposalType: 'create-department',
      title: 'Create Marketing Department',
      description: 'We need a marketing department',
      motivation: 'Growth requires marketing',
      problemDetected: 'No marketing presence',
      expectedBenefit: 'Increased market reach',
      estimatedCost: '$5000/month',
      contextToAssign: 'Market research context',
      affectedContractIds: [],
      affectedWorkflowIds: [],
      requiredApproval: 'founder',
      status: 'proposed',
      proposedByAgentId: 'agent-ceo',
      reviewedByUserId: null,
      approvedByUserId: null,
      rejectionReason: null,
      implementedAt: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.proposalType).toBe('create-department')
    expect(dto.requiredApproval).toBe('founder')
  })

  it('DecisionDto has all required fields', () => {
    const dto: DecisionDto = {
      id: 'dec-1',
      projectId: 'p-1',
      title: 'Use React for frontend',
      description: 'Decision to use React',
      rationale: 'Ecosystem maturity',
      proposedByAgentId: 'agent-cto',
      approvedByUserId: 'user-1',
      objectiveId: null,
      proposalId: null,
      impactedArtifactIds: [],
      impactedWorkflowIds: [],
      status: 'approved',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.status).toBe('approved')
  })

  it('RuntimeExecutionDto has all required fields', () => {
    const dto: RuntimeExecutionDto = {
      id: 'rt-1',
      projectId: 'p-1',
      executionType: 'workflow-run',
      workflowId: 'wf-1',
      agentId: null,
      status: 'running',
      startedAt: '2026-01-01T00:00:00Z',
      completedAt: null,
      input: { data: 'test' },
      output: null,
      errors: [],
      waitingFor: null,
      approvals: [],
      aiCost: 0.5,
      logSummary: 'Running workflow',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.executionType).toBe('workflow-run')
    expect(dto.aiCost).toBe(0.5)
  })

  it('HandoffDto has all required fields', () => {
    const dto: HandoffDto = {
      id: 'ho-1',
      sourceStageId: 'stage-1',
      targetStageId: 'stage-2',
      triggerType: 'automatic',
      condition: null,
      contractId: null,
      inputArtifactTypes: ['document'],
      expectedOutputArtifactTypes: ['deliverable'],
      definitionOfDone: 'All tests pass',
      validations: ['schema-valid'],
      sla: { maxDurationMinutes: 60, warningAtPercent: 80 },
      escalationRules: [{ condition: 'Overdue by 30min', escalateTo: 'agent-lead', action: 'notify' }],
    }
    expect(dto.triggerType).toBe('automatic')
    expect(dto.sla?.maxDurationMinutes).toBe(60)
  })
})

// ---------------------------------------------------------------------------
// ReleaseSnapshotDto bridge extension
// ---------------------------------------------------------------------------

describe('ReleaseSnapshotDto — Live Company bridge fields', () => {
  it('old fields are still required', () => {
    const snapshot: ReleaseSnapshotDto = {
      companyModel: null,
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
    }
    expect(snapshot.companyModel).toBeNull()
    expect(snapshot.departments).toEqual([])
  })

  it('new bridge fields are optional and default to undefined', () => {
    const snapshot: ReleaseSnapshotDto = {
      companyModel: null,
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
    }
    expect(snapshot.projectSeed).toBeUndefined()
    expect(snapshot.constitution).toBeUndefined()
    expect(snapshot.organizationalUnits).toBeUndefined()
    expect(snapshot.agents).toBeUndefined()
    expect(snapshot.objectives).toBeUndefined()
    expect(snapshot.eventTriggers).toBeUndefined()
    expect(snapshot.externalSources).toBeUndefined()
    expect(snapshot.proposals).toBeUndefined()
    expect(snapshot.decisions).toBeUndefined()
  })

  it('new bridge fields can be populated alongside old fields', () => {
    const snapshot: ReleaseSnapshotDto = {
      companyModel: null,
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
      projectSeed: {
        projectId: 'p-1',
        name: 'Test',
        description: '',
        mission: 'Test',
        vision: '',
        companyType: 'startup',
        restrictions: [],
        principles: [],
        aiBudget: { maxMonthlyTokens: null, maxConcurrentAgents: null, costAlertThreshold: null },
        initialObjectives: [],
        founderPreferences: { approvalLevel: 'all-changes', communicationStyle: 'concise', growthPace: 'moderate' },
        maturityPhase: 'seed',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      constitution: null,
      organizationalUnits: [],
      agents: [],
      objectives: [],
      eventTriggers: [],
      externalSources: [],
      proposals: [],
      decisions: [],
    }
    expect(snapshot.projectSeed?.maturityPhase).toBe('seed')
    expect(snapshot.organizationalUnits).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Create/Update DTO compile checks
// ---------------------------------------------------------------------------

describe('Live Company Bridge Types — Create/Update DTOs compile', () => {
  it('CreateProjectSeedDto minimal fields', () => {
    const dto: CreateProjectSeedDto = { name: 'X', mission: 'Y', companyType: 'agency' }
    expect(dto.name).toBe('X')
  })

  it('UpdateProjectSeedDto all fields optional', () => {
    const dto: UpdateProjectSeedDto = {}
    expect(dto).toEqual({})
  })

  it('UpdateConstitutionDto all fields optional', () => {
    const dto: UpdateConstitutionDto = {}
    expect(dto).toEqual({})
  })

  it('CreateOrganizationalUnitDto minimal fields', () => {
    const dto: CreateOrganizationalUnitDto = { name: 'Eng', description: 'Engineering', uoType: 'department', mandate: 'Build' }
    expect(dto.uoType).toBe('department')
  })

  it('UpdateOrganizationalUnitDto all fields optional', () => {
    const dto: UpdateOrganizationalUnitDto = {}
    expect(dto).toEqual({})
  })

  it('CreateLcpAgentDto minimal fields', () => {
    const dto: CreateLcpAgentDto = { name: 'CEO', description: 'Chief', agentType: 'coordinator', uoId: 'uo-1', role: 'CEO' }
    expect(dto.agentType).toBe('coordinator')
  })

  it('UpdateLcpAgentDto all fields optional', () => {
    const dto: UpdateLcpAgentDto = {}
    expect(dto).toEqual({})
  })

  it('CreateObjectiveDto minimal fields', () => {
    const dto: CreateObjectiveDto = { title: 'Ship', description: 'Ship MVP', priority: 'high' }
    expect(dto.priority).toBe('high')
  })

  it('CreateEventTriggerDto minimal fields', () => {
    const dto: CreateEventTriggerDto = { name: 'T', description: 'D', sourceType: 'internal', eventPattern: 'x.y' }
    expect(dto.sourceType).toBe('internal')
  })

  it('CreateExternalSourceDto minimal fields', () => {
    const dto: CreateExternalSourceDto = { name: 'S', description: 'D', sourceCategory: 'market' }
    expect(dto.sourceCategory).toBe('market')
  })

  it('CreateProposalDto minimal fields', () => {
    const dto: CreateProposalDto = {
      proposalType: 'create-team', title: 'T', description: 'D',
      motivation: 'M', problemDetected: 'P', expectedBenefit: 'B', proposedByAgentId: 'a-1',
    }
    expect(dto.proposalType).toBe('create-team')
  })

  it('CreateDecisionDto minimal fields', () => {
    const dto: CreateDecisionDto = { title: 'T', description: 'D', rationale: 'R', proposedByAgentId: 'a-1' }
    expect(dto.rationale).toBe('R')
  })

  it('CreateRuntimeExecutionDto minimal fields', () => {
    const dto: CreateRuntimeExecutionDto = { executionType: 'agent-task', agentId: 'a-1' }
    expect(dto.executionType).toBe('agent-task')
  })
})

// ---------------------------------------------------------------------------
// LcpDiffEntityType compile check
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Runtime types (LCP-015)
// ---------------------------------------------------------------------------

describe('Runtime types — LCP-015', () => {
  it('RuntimeEventType has 27 values', () => {
    const values: RuntimeEventType[] = [
      'execution-started', 'execution-completed', 'execution-failed',
      'execution-blocked', 'execution-waiting',
      'stage-entered', 'stage-completed', 'stage-failed',
      'handoff-initiated', 'handoff-completed', 'handoff-failed', 'handoff-timed-out',
      'artifact-produced', 'artifact-approved', 'artifact-rejected',
      'proposal-created', 'proposal-approved', 'proposal-rejected', 'decision-made',
      'incident-detected', 'incident-resolved', 'escalation-raised',
      'budget-alert', 'budget-exceeded',
      'agent-activated', 'agent-idle', 'agent-error',
      'objective-achieved', 'objective-abandoned',
    ]
    expect(values).toHaveLength(29)
  })

  it('EventSeverity has 4 values', () => {
    const values: EventSeverity[] = ['info', 'warning', 'error', 'critical']
    expect(values).toHaveLength(4)
  })

  it('NodeRuntimeState has 6 values', () => {
    const values: NodeRuntimeState[] = ['idle', 'active', 'waiting', 'blocked', 'error', 'degraded']
    expect(values).toHaveLength(6)
  })

  it('RuntimeBadgeType has 6 values', () => {
    const values: RuntimeBadgeType[] = ['running', 'waiting', 'blocked', 'error', 'queue', 'cost']
    expect(values).toHaveLength(6)
  })

  it('RuntimeEventDto has all required fields', () => {
    const dto: RuntimeEventDto = {
      id: 'evt-1',
      projectId: 'p-1',
      eventType: 'execution-started',
      severity: 'info',
      title: 'Workflow started',
      description: 'Pipeline execution started',
      sourceEntityType: 'workflow',
      sourceEntityId: 'wf-1',
      targetEntityType: null,
      targetEntityId: null,
      executionId: 'exec-1',
      metadata: {},
      occurredAt: '2026-01-01T00:00:00Z',
    }
    expect(dto.eventType).toBe('execution-started')
    expect(dto.severity).toBe('info')
  })

  it('CreateRuntimeEventDto minimal fields', () => {
    const dto: CreateRuntimeEventDto = {
      eventType: 'agent-activated',
      severity: 'info',
      title: 'Agent active',
      description: '',
      sourceEntityType: 'agent',
      sourceEntityId: 'a-1',
    }
    expect(dto.eventType).toBe('agent-activated')
  })

  it('UpdateRuntimeExecutionDto all fields optional', () => {
    const dto: UpdateRuntimeExecutionDto = {}
    expect(dto).toEqual({})
  })

  it('RuntimeBadgeDto has all fields', () => {
    const badge: RuntimeBadgeDto = { type: 'running', label: '2 running', severity: 'info' }
    expect(badge.type).toBe('running')
  })

  it('NodeRuntimeStatusDto has all fields', () => {
    const status: NodeRuntimeStatusDto = {
      entityId: 'a-1',
      entityType: 'agent',
      state: 'active',
      badges: [{ type: 'running', label: '1 running', severity: 'info' }],
      lastEventAt: '2026-01-01T00:00:00Z',
    }
    expect(status.state).toBe('active')
    expect(status.badges).toHaveLength(1)
  })

  it('RuntimeStatusResponse has all fields', () => {
    const summary: RuntimeSummaryDto = {
      activeExecutionCount: 0,
      blockedExecutionCount: 0,
      failedExecutionCount: 0,
      openIncidentCount: 0,
      pendingApprovalCount: 0,
      totalCostCurrentPeriod: 0,
    }
    const response: RuntimeStatusResponse = {
      projectId: 'p-1',
      nodeStatuses: [],
      summary,
      fetchedAt: '2026-01-01T00:00:00Z',
    }
    expect(response.summary.activeExecutionCount).toBe(0)
  })

  it('CostSummaryDto has all fields', () => {
    const cost: CostSummaryDto = {
      projectId: 'p-1',
      period: { start: '2026-01-01T00:00:00Z', end: '2026-01-31T00:00:00Z' },
      totalCost: 42.5,
      costByAgent: [{ agentId: 'a-1', agentName: 'CEO', cost: 42.5 }],
      costByWorkflow: [],
      costByDepartment: [],
      budgetUsedPercent: 85,
      alerts: [{ level: 'warning', scope: 'global', message: 'Budget 85%', currentCost: 42.5, threshold: 50 }],
    }
    expect(cost.totalCost).toBe(42.5)
    expect(cost.alerts).toHaveLength(1)
  })

  it('CostAlertDto has all fields', () => {
    const alert: CostAlertDto = {
      level: 'critical',
      scope: 'agent:a-1',
      message: 'Agent budget exceeded',
      currentCost: 100,
      threshold: 50,
    }
    expect(alert.level).toBe('critical')
  })
})

describe('LcpDiffEntityType', () => {
  it('includes all old + new entity type strings', () => {
    const oldTypes: LcpDiffEntityType[] = [
      'companyModel', 'department', 'capability', 'role',
      'agentArchetype', 'agentAssignment', 'skill',
      'contract', 'workflow', 'policy', 'artifact',
    ]
    const newTypes: LcpDiffEntityType[] = [
      'projectSeed', 'constitution', 'organizationalUnit', 'agent',
      'objective', 'eventTrigger', 'externalSource',
      'proposal', 'decision',
    ]
    expect(oldTypes).toHaveLength(11)
    expect(newTypes).toHaveLength(9)
    expect([...oldTypes, ...newTypes]).toHaveLength(20)
  })
})
