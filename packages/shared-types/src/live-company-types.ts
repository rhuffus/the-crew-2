/**
 * Live Company Pivot — Bridge Types
 *
 * These types coexist with old types during the bridge phase (LCP-011).
 * Old types are NOT modified or deleted until the new modules are proven.
 *
 * Source of truth: docs/33-live-company-domain-model.md
 * Migration map: docs/41-live-company-adr-preserve-adapt-deprecate.md
 */

// ---------------------------------------------------------------------------
// 1. ProjectSeed (new — replaces CompanyModel partially)
// ---------------------------------------------------------------------------

export type MaturityPhase =
  | 'seed'
  | 'formation'
  | 'structured'
  | 'operating'
  | 'scaling'
  | 'optimizing'

export interface AiBudgetDto {
  maxMonthlyTokens: number | null
  maxConcurrentAgents: number | null
  costAlertThreshold: number | null
}

export type ApprovalLevel = 'all-changes' | 'structural-only' | 'budget-only' | 'none'
export type CommunicationStyle = 'detailed' | 'concise' | 'minimal'
export type GrowthPace = 'conservative' | 'moderate' | 'aggressive'

export interface FounderPreferencesDto {
  approvalLevel: ApprovalLevel
  communicationStyle: CommunicationStyle
  growthPace: GrowthPace
}

export interface ProjectSeedDto {
  projectId: string
  name: string
  description: string
  mission: string
  vision: string
  companyType: string
  restrictions: string[]
  principles: string[]
  aiBudget: AiBudgetDto
  initialObjectives: string[]
  founderPreferences: FounderPreferencesDto
  maturityPhase: MaturityPhase
  createdAt: string
  updatedAt: string
}

export interface CreateProjectSeedDto {
  name: string
  description?: string
  mission: string
  vision?: string
  companyType: string
  restrictions?: string[]
  principles?: string[]
  aiBudget?: Partial<AiBudgetDto>
  initialObjectives?: string[]
  founderPreferences?: Partial<FounderPreferencesDto>
}

export interface UpdateProjectSeedDto {
  name?: string
  description?: string
  mission?: string
  vision?: string
  companyType?: string
  restrictions?: string[]
  principles?: string[]
  aiBudget?: Partial<AiBudgetDto>
  initialObjectives?: string[]
  founderPreferences?: Partial<FounderPreferencesDto>
  maturityPhase?: MaturityPhase
}

// ---------------------------------------------------------------------------
// 2. CompanyConstitution (new — replaces CompanyModel partially)
// ---------------------------------------------------------------------------

export interface AutonomyLimitsDto {
  maxDepth: number
  maxFanOut: number
  maxAgentsPerTeam: number
  coordinatorToSpecialistRatio: number
}

export interface BudgetConfigDto {
  globalBudget: number | null
  perUoBudget: number | null
  perAgentBudget: number | null
  alertThresholds: number[]
}

export type ApprovalScope =
  | 'create-department'
  | 'create-team'
  | 'create-specialist'
  | 'retire-unit'
  | 'revise-contract'
  | 'revise-workflow'
  | 'update-constitution'

export type ApproverLevel = 'founder' | 'ceo' | 'executive' | 'team-lead' | 'auto'

export interface ApprovalCriterionDto {
  scope: ApprovalScope
  requiredApprover: ApproverLevel
  requiresJustification: boolean
}

export interface ExpansionRuleDto {
  targetType: 'department' | 'team' | 'specialist'
  conditions: string[]
  requiresBudget: boolean
  requiresOwner: boolean
}

export interface CompanyConstitutionDto {
  projectId: string
  operationalPrinciples: string[]
  autonomyLimits: AutonomyLimitsDto
  budgetConfig: BudgetConfigDto
  approvalCriteria: ApprovalCriterionDto[]
  namingConventions: string[]
  expansionRules: ExpansionRuleDto[]
  contextMinimizationPolicy: string
  qualityRules: string[]
  deliveryRules: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateConstitutionDto {
  operationalPrinciples?: string[]
  autonomyLimits?: Partial<AutonomyLimitsDto>
  budgetConfig?: Partial<BudgetConfigDto>
  approvalCriteria?: ApprovalCriterionDto[]
  namingConventions?: string[]
  expansionRules?: ExpansionRuleDto[]
  contextMinimizationPolicy?: string
  qualityRules?: string[]
  deliveryRules?: string[]
}

// ---------------------------------------------------------------------------
// 3. OrganizationalUnit (new — replaces Department, generalizes to company/dept/team)
// ---------------------------------------------------------------------------

export type UoType = 'company' | 'department' | 'team'

export type UoStatus = 'active' | 'proposed' | 'retired'

export interface OrganizationalUnitDto {
  id: string
  projectId: string
  name: string
  description: string
  uoType: UoType
  mandate: string
  purpose: string
  parentUoId: string | null
  coordinatorAgentId: string | null
  functions: string[]
  status: UoStatus
  createdAt: string
  updatedAt: string
}

export interface CreateOrganizationalUnitDto {
  name: string
  description: string
  uoType: UoType
  mandate: string
  purpose?: string
  parentUoId?: string | null
  coordinatorAgentId?: string | null
  functions?: string[]
}

export interface UpdateOrganizationalUnitDto {
  name?: string
  description?: string
  mandate?: string
  purpose?: string
  parentUoId?: string | null
  coordinatorAgentId?: string | null
  functions?: string[]
  status?: UoStatus
}

// ---------------------------------------------------------------------------
// 4. Agent (new — replaces AgentArchetype + AgentAssignment + Role)
// ---------------------------------------------------------------------------

export type LcpAgentType = 'coordinator' | 'specialist'

export type LcpAgentStatus = 'active' | 'inactive' | 'proposed'

export interface AgentSkillDto {
  name: string
  description: string
  category: string
}

export interface AgentBudgetDto {
  maxMonthlyTokens: number | null
  maxConcurrentTasks: number | null
  costLimit: number | null
}

export interface LcpAgentDto {
  id: string
  projectId: string
  name: string
  description: string
  agentType: LcpAgentType
  uoId: string
  role: string
  skills: AgentSkillDto[]
  inputs: string[]
  outputs: string[]
  responsibilities: string[]
  budget: AgentBudgetDto | null
  contextWindow: number | null
  status: LcpAgentStatus
  systemPromptRef: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateLcpAgentDto {
  name: string
  description: string
  agentType: LcpAgentType
  uoId: string
  role: string
  skills?: AgentSkillDto[]
  inputs?: string[]
  outputs?: string[]
  responsibilities?: string[]
  budget?: Partial<AgentBudgetDto> | null
  contextWindow?: number | null
  systemPromptRef?: string | null
}

export interface UpdateLcpAgentDto {
  name?: string
  description?: string
  agentType?: LcpAgentType
  uoId?: string
  role?: string
  skills?: AgentSkillDto[]
  inputs?: string[]
  outputs?: string[]
  responsibilities?: string[]
  budget?: Partial<AgentBudgetDto> | null
  contextWindow?: number | null
  status?: LcpAgentStatus
  systemPromptRef?: string | null
}

// ---------------------------------------------------------------------------
// 5. Objective (new)
// ---------------------------------------------------------------------------

export type ObjectivePriority = 'critical' | 'high' | 'medium' | 'low'

export type ObjectiveStatus = 'active' | 'achieved' | 'abandoned' | 'superseded'

export type KeyResultStatus = 'pending' | 'in-progress' | 'achieved' | 'missed'

export interface KeyResultDto {
  description: string
  targetValue: string
  currentValue: string
  status: KeyResultStatus
}

export interface ObjectiveDto {
  id: string
  projectId: string
  title: string
  description: string
  ownerUoId: string | null
  ownerAgentId: string | null
  priority: ObjectivePriority
  status: ObjectiveStatus
  keyResults: KeyResultDto[]
  linkedWorkflowIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateObjectiveDto {
  title: string
  description: string
  ownerUoId?: string | null
  ownerAgentId?: string | null
  priority: ObjectivePriority
  keyResults?: KeyResultDto[]
  linkedWorkflowIds?: string[]
}

export interface UpdateObjectiveDto {
  title?: string
  description?: string
  ownerUoId?: string | null
  ownerAgentId?: string | null
  priority?: ObjectivePriority
  status?: ObjectiveStatus
  keyResults?: KeyResultDto[]
  linkedWorkflowIds?: string[]
}

// ---------------------------------------------------------------------------
// 6. EventTrigger (new)
// ---------------------------------------------------------------------------

export type TriggerSourceType = 'internal' | 'external'

export interface EventTriggerDto {
  id: string
  projectId: string
  name: string
  description: string
  sourceType: TriggerSourceType
  eventPattern: string
  targetWorkflowIds: string[]
  targetAgentIds: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEventTriggerDto {
  name: string
  description: string
  sourceType: TriggerSourceType
  eventPattern: string
  targetWorkflowIds?: string[]
  targetAgentIds?: string[]
}

export interface UpdateEventTriggerDto {
  name?: string
  description?: string
  sourceType?: TriggerSourceType
  eventPattern?: string
  targetWorkflowIds?: string[]
  targetAgentIds?: string[]
  active?: boolean
}

// ---------------------------------------------------------------------------
// 7. ExternalSource (new)
// ---------------------------------------------------------------------------

export type SourceCategory =
  | 'competitor'
  | 'market'
  | 'customer'
  | 'regulation'
  | 'repository'
  | 'third-party-system'

export interface ExternalSourceDto {
  id: string
  projectId: string
  name: string
  description: string
  sourceCategory: SourceCategory
  connectionRef: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateExternalSourceDto {
  name: string
  description: string
  sourceCategory: SourceCategory
  connectionRef?: string | null
}

export interface UpdateExternalSourceDto {
  name?: string
  description?: string
  sourceCategory?: SourceCategory
  connectionRef?: string | null
  active?: boolean
}

// ---------------------------------------------------------------------------
// 8. Workflow bridge types (adapted — enrichments for existing Workflow)
// ---------------------------------------------------------------------------

export type WorkflowType =
  | 'strategic'
  | 'operational'
  | 'service-internal'
  | 'event-driven'
  | 'external-response'

/** Bridge: replaces old WorkflowParticipantType ('role' | 'department') */
export type LcpWorkflowParticipantType = 'agent' | 'uo'

export interface SlaDto {
  maxDurationMinutes: number
  warningAtPercent: number
}

export interface EscalationRuleDto {
  condition: string
  escalateTo: string
  action: string
}

export interface WorkflowMetricDto {
  name: string
  description: string
  unit: string
}

/** Enriched stage (bridge version of WorkflowStageDto) */
export interface LcpWorkflowStageDto {
  id: string
  name: string
  order: number
  description: string
  ownerAgentId: string | null
  inputArtifactTypes: string[]
  outputArtifactTypes: string[]
}

/** Enriched participant (bridge version of WorkflowParticipantDto) */
export interface LcpWorkflowParticipantDto {
  participantId: string
  participantType: LcpWorkflowParticipantType
  responsibility: string
}

export interface HandoffDto {
  id: string
  sourceStageId: string
  targetStageId: string
  triggerType: 'automatic' | 'manual' | 'conditional'
  condition: string | null
  contractId: string | null
  inputArtifactTypes: string[]
  expectedOutputArtifactTypes: string[]
  definitionOfDone: string
  validations: string[]
  sla: SlaDto | null
  escalationRules: EscalationRuleDto[]
}

// ---------------------------------------------------------------------------
// 9. Contract bridge types (adapted party model)
// ---------------------------------------------------------------------------

/** Replaces old PartyType ('department' | 'capability') */
export type ContractPartyType = 'uo' | 'agent' | 'workflow-stage'

// ---------------------------------------------------------------------------
// 10. Policy bridge types (expanded scope)
// ---------------------------------------------------------------------------

/** Replaces old PolicyScope ('global' | 'department') */
export type LcpPolicyScope =
  | 'global'
  | 'uo'
  | 'agent'
  | 'workflow'
  | 'handoff'
  | 'artifact'
  | 'proposal'

// ---------------------------------------------------------------------------
// 11. Artifact bridge types (expanded anchoring)
// ---------------------------------------------------------------------------

/** Replaces old PartyType for artifacts */
export type ArtifactPartyType = 'uo' | 'agent' | 'workflow'

// ---------------------------------------------------------------------------
// 12. Proposal (new — central to organizational growth governance)
// ---------------------------------------------------------------------------

export type ProposalType =
  | 'create-department'
  | 'create-team'
  | 'create-specialist'
  | 'split-team'
  | 'merge-teams'
  | 'retire-unit'
  | 'revise-contract'
  | 'revise-workflow'
  | 'revise-policy'
  | 'update-constitution'

export type ProposalStatus =
  | 'draft'
  | 'proposed'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'superseded'

export interface ProposalDto {
  id: string
  projectId: string
  proposalType: ProposalType
  title: string
  description: string
  motivation: string
  problemDetected: string
  expectedBenefit: string
  estimatedCost: string
  contextToAssign: string
  affectedContractIds: string[]
  affectedWorkflowIds: string[]
  requiredApproval: ApproverLevel
  status: ProposalStatus
  proposedByAgentId: string
  reviewedByUserId: string | null
  approvedByUserId: string | null
  rejectionReason: string | null
  implementedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProposalDto {
  proposalType: ProposalType
  title: string
  description: string
  motivation: string
  problemDetected: string
  expectedBenefit: string
  estimatedCost?: string
  contextToAssign?: string
  affectedContractIds?: string[]
  affectedWorkflowIds?: string[]
  proposedByAgentId: string
}

export interface UpdateProposalDto {
  title?: string
  description?: string
  motivation?: string
  problemDetected?: string
  expectedBenefit?: string
  estimatedCost?: string
  contextToAssign?: string
  affectedContractIds?: string[]
  affectedWorkflowIds?: string[]
  status?: ProposalStatus
  reviewedByUserId?: string | null
  approvedByUserId?: string | null
  rejectionReason?: string | null
}

// ---------------------------------------------------------------------------
// 13. Decision (new — traceable record of important decisions)
// ---------------------------------------------------------------------------

export type DecisionStatus = 'proposed' | 'approved' | 'rejected' | 'superseded'

export interface DecisionDto {
  id: string
  projectId: string
  title: string
  description: string
  rationale: string
  proposedByAgentId: string
  approvedByUserId: string | null
  objectiveId: string | null
  proposalId: string | null
  impactedArtifactIds: string[]
  impactedWorkflowIds: string[]
  status: DecisionStatus
  createdAt: string
  updatedAt: string
}

export interface CreateDecisionDto {
  title: string
  description: string
  rationale: string
  proposedByAgentId: string
  objectiveId?: string | null
  proposalId?: string | null
  impactedArtifactIds?: string[]
  impactedWorkflowIds?: string[]
}

export interface UpdateDecisionDto {
  title?: string
  description?: string
  rationale?: string
  approvedByUserId?: string | null
  objectiveId?: string | null
  proposalId?: string | null
  impactedArtifactIds?: string[]
  impactedWorkflowIds?: string[]
  status?: DecisionStatus
}

// ---------------------------------------------------------------------------
// 14. RuntimeExecution (new — live instance of workflow run or agent task)
// ---------------------------------------------------------------------------

export type RuntimeExecutionType = 'workflow-run' | 'agent-task'

export type RuntimeExecutionStatus =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface RuntimeErrorDto {
  message: string
  occurredAt: string
  severity: 'warning' | 'error' | 'fatal'
  context: string | null
}

export interface ApprovalRecordDto {
  requestedAt: string
  approvedAt: string | null
  approvedBy: string | null
  subject: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface RuntimeExecutionDto {
  id: string
  projectId: string
  executionType: RuntimeExecutionType
  workflowId: string | null
  agentId: string | null
  status: RuntimeExecutionStatus
  startedAt: string | null
  completedAt: string | null
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  errors: RuntimeErrorDto[]
  waitingFor: string | null
  approvals: ApprovalRecordDto[]
  aiCost: number
  logSummary: string
  createdAt: string
  updatedAt: string
}

export interface CreateRuntimeExecutionDto {
  executionType: RuntimeExecutionType
  workflowId?: string | null
  agentId?: string | null
  input?: Record<string, unknown>
  parentExecutionId?: string
}

export interface UpdateRuntimeExecutionDto {
  status?: RuntimeExecutionStatus
  output?: Record<string, unknown>
  waitingFor?: string | null
  logSummary?: string
  addError?: RuntimeErrorDto
  addApproval?: Omit<ApprovalRecordDto, 'approvedAt' | 'approvedBy'>
  resolveApproval?: { subject: string; status: 'approved' | 'rejected'; approvedBy?: string }
  addCost?: number
}

// ---------------------------------------------------------------------------
// 14b. RuntimeEvent (new — backbone of event stream / timeline, LCP-015)
// ---------------------------------------------------------------------------

export type RuntimeEventType =
  | 'execution-started' | 'execution-completed' | 'execution-failed'
  | 'execution-blocked' | 'execution-waiting'
  | 'stage-entered' | 'stage-completed' | 'stage-failed'
  | 'handoff-initiated' | 'handoff-completed' | 'handoff-failed' | 'handoff-timed-out'
  | 'artifact-produced' | 'artifact-approved' | 'artifact-rejected'
  | 'proposal-created' | 'proposal-approved' | 'proposal-rejected' | 'decision-made'
  | 'incident-detected' | 'incident-resolved' | 'escalation-raised'
  | 'budget-alert' | 'budget-exceeded'
  | 'agent-activated' | 'agent-idle' | 'agent-error'
  | 'objective-achieved' | 'objective-abandoned'

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface RuntimeEventDto {
  id: string
  projectId: string
  eventType: RuntimeEventType
  severity: EventSeverity
  title: string
  description: string
  sourceEntityType: string
  sourceEntityId: string
  targetEntityType: string | null
  targetEntityId: string | null
  executionId: string | null
  metadata: Record<string, unknown>
  occurredAt: string
}

export interface CreateRuntimeEventDto {
  eventType: RuntimeEventType
  severity: EventSeverity
  title: string
  description: string
  sourceEntityType: string
  sourceEntityId: string
  targetEntityType?: string
  targetEntityId?: string
  executionId?: string
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// 14c. Runtime status projection (LCP-015)
// ---------------------------------------------------------------------------

export type NodeRuntimeState = 'idle' | 'active' | 'waiting' | 'blocked' | 'error' | 'degraded'

export type RuntimeBadgeType = 'running' | 'waiting' | 'blocked' | 'error' | 'queue' | 'cost'

export interface RuntimeBadgeDto {
  type: RuntimeBadgeType
  label: string
  severity: 'info' | 'warning' | 'error'
}

export interface NodeRuntimeStatusDto {
  entityId: string
  entityType: string
  state: NodeRuntimeState
  badges: RuntimeBadgeDto[]
  lastEventAt: string | null
}

export interface RuntimeStatusResponse {
  projectId: string
  nodeStatuses: NodeRuntimeStatusDto[]
  summary: RuntimeSummaryDto
  fetchedAt: string
}

export interface RuntimeSummaryDto {
  activeExecutionCount: number
  blockedExecutionCount: number
  failedExecutionCount: number
  openIncidentCount: number
  pendingApprovalCount: number
  totalCostCurrentPeriod: number
}

// ---------------------------------------------------------------------------
// 14d. Cost tracking (LCP-015)
// ---------------------------------------------------------------------------

export interface CostSummaryDto {
  projectId: string
  period: { start: string; end: string }
  totalCost: number
  costByAgent: Array<{ agentId: string; agentName: string; cost: number }>
  costByWorkflow: Array<{ workflowId: string; workflowName: string; cost: number }>
  costByDepartment: Array<{ uoId: string; uoName: string; cost: number }>
  budgetUsedPercent: number | null
  alerts: CostAlertDto[]
}

export interface CostAlertDto {
  level: 'warning' | 'critical'
  scope: string
  message: string
  currentCost: number
  threshold: number
}

// ---------------------------------------------------------------------------
// 18. Growth Engine DTOs (LCP-014)
// ---------------------------------------------------------------------------

export type GrowthSignalType =
  | 'workload-overflow'
  | 'capability-gap'
  | 'coordination-bottleneck'
  | 'scope-creep'
  | 'repeated-escalation'
  | 'user-initiated'
  | 'objective-unserved'
  | 'workflow-unowned'

export interface GrowthSignalDto {
  id: string
  projectId: string
  signalType: GrowthSignalType
  description: string
  sourceAgentId: string | null
  sourceUoId: string | null
  evidence: string[]
  suggestedAction: ProposalType | null
  detectedAt: string
  acknowledged: boolean
  resolvedByProposalId: string | null
}

export interface GrowthViolationDto {
  rule: string
  description: string
  blocking: boolean
}

export interface GrowthWarningDto {
  rule: string
  description: string
  advisory: boolean
}

export interface BudgetImpactDto {
  estimatedMonthlyCost: number | null
  currentBudgetUsage: number
  projectedBudgetUsage: number
  exceedsBudget: boolean
  exceedsAlertThreshold: boolean
  thresholdExceeded: number | null
}

export interface GrowthEvaluationResultDto {
  proposalId: string
  valid: boolean
  violations: GrowthViolationDto[]
  warnings: GrowthWarningDto[]
  budgetImpact: BudgetImpactDto
  requiredApprover: ApproverLevel
  autoApprovable: boolean
}

export interface ApprovalRouteDto {
  proposalId: string
  requiredApprover: ApproverLevel
  effectiveApprover: ApproverLevel
  phaseOverrideApplied: boolean
  autoApprovable: boolean
}

export type ApprovalOverride = 'all-founder' | 'structural-founder' | 'constitution-rules'

export interface PhaseCapabilitiesDto {
  phase: MaturityPhase
  canCreateDepartments: boolean
  canCreateTeams: boolean
  canCreateSpecialists: boolean
  canSplitMerge: boolean
  canCreateWorkflows: boolean
  canCreateContracts: boolean
  canToggleLiveMode: boolean
  canDelegateApprovals: boolean
  canAutoApprove: boolean
  approvalOverride: ApprovalOverride
}

export type HealthStatus = 'ok' | 'warning' | 'violation'

export interface OrgHealthMetricDto {
  name: string
  value: number
  threshold: number | null
  status: HealthStatus
  description: string
}

export type OverallHealth = 'healthy' | 'attention-needed' | 'at-risk'

export interface OrgHealthReportDto {
  projectId: string
  generatedAt: string
  phase: MaturityPhase
  metrics: OrgHealthMetricDto[]
  recommendations: string[]
  overallHealth: OverallHealth
}

// ---------------------------------------------------------------------------
// 15. Relationship categories (reference — used by visual grammar in LCP-005)
// ---------------------------------------------------------------------------

export type LcpEdgeCategory =
  | 'structural'
  | 'responsibility'
  | 'collaboration'
  | 'flow'
  | 'governance'

// ---------------------------------------------------------------------------
// 16. Overlay model (bridge — replaces LayerId concept in LCP-005/LCP-012)
// ---------------------------------------------------------------------------

export type OverlayId =
  | 'organization'
  | 'work'
  | 'deliverables'
  | 'rules'
  | 'live-status'

// ---------------------------------------------------------------------------
// 17. Bridge DiffEntityType extension
// ---------------------------------------------------------------------------

export type LcpDiffEntityType =
  | 'companyModel'
  | 'department'
  | 'capability'
  | 'role'
  | 'agentArchetype'
  | 'agentAssignment'
  | 'skill'
  | 'contract'
  | 'workflow'
  | 'policy'
  | 'artifact'
  // new entity types
  | 'projectSeed'
  | 'constitution'
  | 'organizationalUnit'
  | 'agent'
  | 'objective'
  | 'eventTrigger'
  | 'externalSource'
  | 'proposal'
  | 'decision'
