# Live Company Domain Model — Implementable Design

> Authoritative reference for all LCP implementation tasks.
> Produced by LCP-004. Supersedes the prior conceptual draft.

## Design Principles

1. **Organization first** — The company is modeled as organizational units + agents, not abstract entity layers.
2. **Nothing exists in isolation** — Every artifact, contract, policy must be anchored to responsible parties.
3. **Incremental growth** — A company starts from a seed and grows through governed proposals.
4. **DDD foundations preserved** — All aggregates extend `AggregateRoot<string>`, value objects extend `ValueObject<T>`, repositories implement `Repository<T, string>`.
5. **Coexistence during migration** — New types are introduced alongside old ones (LCP-011). Old modules are not deleted until new ones are proven.

---

## 1. ProjectSeed

**Replaces:** `CompanyModel` (partially — purpose/type/scope move here)
**Module:** `project-seed` (new, in `services/company-design`)
**Aggregate Root:** yes (keyed by `projectId`, one per project)

### Domain Type

```typescript
type MaturityPhase =
  | 'seed'        // only CEO, discovery with user
  | 'formation'   // first departments, first workflows
  | 'structured'  // teams and minimal specialists, main contracts
  | 'operating'   // company executing real work
  | 'scaling'     // optimization, more autonomy
  | 'optimizing'  // reorganization and continuous improvement

interface ProjectSeedProps {
  projectId: string
  name: string
  description: string
  mission: string
  vision: string
  companyType: string                // e.g. 'saas-startup', 'agency', 'consultancy'
  restrictions: string[]
  principles: string[]
  aiBudget: AiBudgetProps
  initialObjectives: string[]
  founderPreferences: FounderPreferencesProps
  maturityPhase: MaturityPhase
  createdAt: Date
  updatedAt: Date
}
```

### Value Objects

```typescript
interface AiBudgetProps {
  maxMonthlyTokens: number | null    // null = unlimited
  maxConcurrentAgents: number | null
  costAlertThreshold: number | null  // USD
}

interface FounderPreferencesProps {
  approvalLevel: 'all-changes' | 'structural-only' | 'budget-only' | 'none'
  communicationStyle: 'detailed' | 'concise' | 'minimal'
  growthPace: 'conservative' | 'moderate' | 'aggressive'
}
```

### Invariants

- `name` cannot be empty.
- `mission` cannot be empty.
- `maturityPhase` transitions must be forward-only (seed → formation → ... → optimizing). No rollback.
- A project starts at `seed` phase.

### Domain Events

- `ProjectSeedCreated { projectId, name, mission }`
- `ProjectSeedUpdated { projectId, changedFields[] }`
- `MaturityPhaseAdvanced { projectId, from, to }`

### Migration Notes

- `CompanyModel.purpose` → `ProjectSeed.description` (or `mission`, depending on content)
- `CompanyModel.type` → `ProjectSeed.companyType`
- `CompanyModel.scope` → absorbed into `ProjectSeed.description` + `restrictions`
- `CompanyModel.principles` → `ProjectSeed.principles` (also copied to `CompanyConstitution.operationalPrinciples`)
- `CompanyModel` entity is deprecated once `ProjectSeed` + `CompanyConstitution` are stable.

---

## 2. CompanyConstitution

**Replaces:** `CompanyModel` (partially — principles/rules move here)
**Module:** `constitution` (new, in `services/company-design`)
**Aggregate Root:** yes (keyed by `projectId`, one per project)

### Domain Type

```typescript
interface CompanyConstitutionProps {
  projectId: string
  operationalPrinciples: string[]
  autonomyLimits: AutonomyLimitsProps
  budgetConfig: BudgetConfigProps
  approvalCriteria: ApprovalCriterionProps[]
  namingConventions: string[]
  expansionRules: ExpansionRuleProps[]
  contextMinimizationPolicy: string
  qualityRules: string[]
  deliveryRules: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Value Objects

```typescript
interface AutonomyLimitsProps {
  maxDepth: number                // max nesting of UOs (e.g. 4)
  maxFanOut: number               // max children per UO (e.g. 10)
  maxAgentsPerTeam: number        // e.g. 8
  coordinatorToSpecialistRatio: number  // e.g. 0.25 (1 coordinator per 4 specialists)
}

interface BudgetConfigProps {
  globalBudget: number | null     // USD, null = unlimited
  perUoBudget: number | null
  perAgentBudget: number | null
  alertThresholds: number[]       // percentages, e.g. [50, 80, 95]
}

type ApprovalScope = 'create-department' | 'create-team' | 'create-specialist'
  | 'retire-unit' | 'revise-contract' | 'revise-workflow' | 'update-constitution'

type ApproverLevel = 'founder' | 'ceo' | 'executive' | 'team-lead' | 'auto'

interface ApprovalCriterionProps {
  scope: ApprovalScope
  requiredApprover: ApproverLevel
  requiresJustification: boolean
}

interface ExpansionRuleProps {
  targetType: 'department' | 'team' | 'specialist'
  conditions: string[]            // human-readable conditions
  requiresBudget: boolean
  requiresOwner: boolean
}
```

### Invariants

- `operationalPrinciples` must have at least one entry.
- `autonomyLimits.maxDepth` must be >= 1.
- Each `approvalCriteria.scope` must be unique.

### Domain Events

- `ConstitutionCreated { projectId }`
- `ConstitutionUpdated { projectId, changedSections[] }`

---

## 3. OrganizationalUnit (UO)

**Replaces:** `Department` (generalized to include company, department, team)
**Module:** `organizational-units` (replaces `departments` in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type UoType = 'company' | 'department' | 'team'

type UoStatus = 'active' | 'proposed' | 'retired'

interface OrganizationalUnitProps {
  id: string
  projectId: string
  name: string
  description: string
  uoType: UoType
  mandate: string                       // what this UO is accountable for
  purpose: string                       // why this UO exists
  parentUoId: string | null             // null for company-level UO
  coordinatorAgentId: string | null     // the agent that leads this UO
  functions: string[]                   // replaces capabilities at UO level
  status: UoStatus
  createdAt: Date
  updatedAt: Date
}
```

### Invariants

- `name` cannot be empty.
- A `company` UO has no parent (`parentUoId` must be null).
- A `department` UO must have a parent of type `company` or `department`.
- A `team` UO must have a parent of type `department`.
- Cannot be its own parent.
- Only one `company`-type UO per project.
- `status` transitions: `proposed` → `active` → `retired`. A `proposed` UO can also go to `retired` (rejected proposal).

### Domain Events

- `OrganizationalUnitCreated { id, projectId, uoType, name, parentUoId }`
- `OrganizationalUnitUpdated { id, changedFields[] }`
- `OrganizationalUnitRetired { id, reason }`
- `CoordinatorAssigned { uoId, agentId }`

### Migration Notes

- `Department` → `OrganizationalUnit` with `uoType: 'department'`.
- `Department.mandate` → `OrganizationalUnit.mandate`.
- `Department.parentId` → `OrganizationalUnit.parentUoId`.
- New: `uoType: 'company'` (one per project, represents the company itself).
- New: `uoType: 'team'` (teams didn't exist as entities).
- `Capability.ownerDepartmentId` → capabilities are redistributed as `OrganizationalUnit.functions[]`.

---

## 4. Agent

**Replaces:** `AgentArchetype` + `AgentAssignment` + `Role` (all three collapse into one entity)
**Module:** `agents` (replaces `agent-archetypes`, `agent-assignments`, `roles` in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type AgentType = 'coordinator' | 'specialist'

type AgentStatus = 'active' | 'inactive' | 'proposed'

interface AgentProps {
  id: string
  projectId: string
  name: string
  description: string
  agentType: AgentType
  uoId: string                          // owning organizational unit
  role: string                          // was a separate entity, now a descriptive string
  skills: AgentSkillProps[]             // was separate entity, now embedded
  inputs: string[]                      // what this agent receives
  outputs: string[]                     // what this agent produces
  responsibilities: string[]            // what this agent is accountable for
  budget: AgentBudgetProps | null
  contextWindow: number | null          // max tokens for this agent's context
  status: AgentStatus
  systemPromptRef: string | null        // reference to executable definition (file/template)
  createdAt: Date
  updatedAt: Date
}
```

### Value Objects

```typescript
interface AgentSkillProps {
  name: string
  description: string
  category: string                      // e.g. 'analysis', 'coding', 'communication'
}

interface AgentBudgetProps {
  maxMonthlyTokens: number | null
  maxConcurrentTasks: number | null
  costLimit: number | null              // USD
}
```

### Coordinator-Specific Behaviors

A coordinator agent (CEO, Executive, Team Lead) can:
- Propose structural changes (create department, team, specialist)
- Delegate work
- Negotiate contracts
- Escalate decisions

### Specialist-Specific Behaviors

A specialist agent can:
- Execute assigned work
- Produce artifacts
- Request review or collaboration
- Propose limited improvements (within team scope)

### Invariants

- `name` cannot be empty.
- `role` cannot be empty.
- `uoId` is required (every agent belongs to a UO).
- A coordinator agent should be assigned to a UO of matching level:
  - CEO → company UO
  - Executive → department UO
  - Team Lead → team UO
- `skills` names must be unique within an agent.
- `status` transitions: `proposed` → `active` → `inactive`. Can go back `inactive` → `active`.

### Domain Events

- `AgentCreated { id, projectId, agentType, name, uoId, role }`
- `AgentUpdated { id, changedFields[] }`
- `AgentDeactivated { id, reason }`
- `AgentActivated { id }`

### Migration Notes

- `AgentArchetype.name` + `AgentArchetype.description` → `Agent.name` + `Agent.description`
- `AgentArchetype.roleId` → look up the Role entity → `Agent.role = Role.name`
- `AgentArchetype.departmentId` → `Agent.uoId`
- `AgentArchetype.skillIds` → look up Skill entities → `Agent.skills[]`
- `AgentArchetype.constraints.maxConcurrency` → `Agent.budget.maxConcurrentTasks`
- `AgentAssignment.name` → `Agent.name` (if different from archetype)
- `AgentAssignment.status` → `Agent.status`
- `Role` entity → deprecated. `Role.name` becomes `Agent.role` string.
- `Skill` entity → deprecated. Becomes `AgentSkill` value object embedded in Agent.
- `Capability` entity → deprecated. Redistributed to `OrganizationalUnit.functions[]` and `Agent.skills[]`.

---

## 5. Objective

**New entity** — system input representing a strategic or operational goal.
**Module:** `objectives` (new, in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type ObjectivePriority = 'critical' | 'high' | 'medium' | 'low'

type ObjectiveStatus = 'active' | 'achieved' | 'abandoned' | 'superseded'

interface ObjectiveProps {
  id: string
  projectId: string
  title: string
  description: string
  ownerUoId: string | null              // which UO owns this objective
  ownerAgentId: string | null           // which agent drives this objective
  priority: ObjectivePriority
  status: ObjectiveStatus
  keyResults: KeyResultProps[]
  linkedWorkflowIds: string[]           // workflows that serve this objective
  createdAt: Date
  updatedAt: Date
}
```

### Value Objects

```typescript
type KeyResultStatus = 'pending' | 'in-progress' | 'achieved' | 'missed'

interface KeyResultProps {
  description: string
  targetValue: string                   // human-readable target
  currentValue: string                  // human-readable current state
  status: KeyResultStatus
}
```

### Invariants

- `title` cannot be empty.
- At least one of `ownerUoId` or `ownerAgentId` should be set (soft rule, not hard constraint — early objectives may be unassigned).
- `status` transitions: `active` → `achieved` | `abandoned` | `superseded`.

### Domain Events

- `ObjectiveCreated { id, projectId, title, priority }`
- `ObjectiveUpdated { id, changedFields[] }`
- `ObjectiveAchieved { id }`
- `ObjectiveAbandoned { id, reason }`

---

## 6. EventTrigger

**New entity** — system input representing an event that can trigger workflows.
**Module:** `event-triggers` (new, in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type TriggerSourceType = 'internal' | 'external'

interface EventTriggerProps {
  id: string
  projectId: string
  name: string
  description: string
  sourceType: TriggerSourceType
  eventPattern: string                  // describes what event activates this trigger
  targetWorkflowIds: string[]           // workflows activated by this trigger
  targetAgentIds: string[]              // agents notified by this trigger
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Invariants

- `name` cannot be empty.
- `eventPattern` cannot be empty.
- At least one target (workflow or agent) should be specified.

### Domain Events

- `EventTriggerCreated { id, projectId, name }`
- `EventTriggerUpdated { id, changedFields[] }`
- `EventTriggerActivated { id }`
- `EventTriggerDeactivated { id }`

---

## 7. ExternalSource

**New entity** — system input representing an external information source.
**Module:** `external-sources` (new, in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type SourceCategory =
  | 'competitor'
  | 'market'
  | 'customer'
  | 'regulation'
  | 'repository'
  | 'third-party-system'

interface ExternalSourceProps {
  id: string
  projectId: string
  name: string
  description: string
  sourceCategory: SourceCategory
  connectionRef: string | null          // URL, API ref, or description of how to access
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Invariants

- `name` cannot be empty.
- `sourceCategory` must be a valid value.

### Domain Events

- `ExternalSourceCreated { id, projectId, name, sourceCategory }`
- `ExternalSourceUpdated { id, changedFields[] }`

---

## 8. Workflow (adapted)

**Adapted from:** existing `Workflow` aggregate
**Module:** `workflows` (same location, enriched)
**Aggregate Root:** yes (already)

### Domain Type Changes

```typescript
type WorkflowType =
  | 'strategic'          // company-level, cross-department
  | 'operational'        // department-level, standard process
  | 'service-internal'   // team-internal
  | 'event-driven'       // triggered by events
  | 'external-response'  // response to external input

type WorkflowStatus = 'draft' | 'active' | 'archived'  // unchanged

interface WorkflowProps {
  id: string
  projectId: string
  name: string
  description: string
  workflowType: WorkflowType                    // NEW
  ownerUoId: string | null                      // renamed from ownerDepartmentId
  status: WorkflowStatus
  triggerDescription: string
  stages: WorkflowStageProps[]
  handoffs: HandoffProps[]                      // NEW — first-class links between stages
  participants: WorkflowParticipantProps[]
  contractIds: string[]
  objectiveIds: string[]                        // NEW — objectives this workflow serves
  definitionOfDone: string                      // NEW
  escalationRules: EscalationRuleProps[]        // NEW
  metrics: WorkflowMetricProps[]                // NEW
  createdAt: Date
  updatedAt: Date
}
```

### New/Changed Value Objects

```typescript
// Enriched stage
interface WorkflowStageProps {
  id: string                                    // NEW — stages need IDs for handoff references
  name: string
  order: number
  description: string
  ownerAgentId: string | null                   // NEW — who is responsible for this stage
  inputArtifactTypes: string[]                  // NEW
  outputArtifactTypes: string[]                 // NEW
}

// Updated participant model
type WorkflowParticipantType = 'agent' | 'uo'  // changed from 'role' | 'department'

interface WorkflowParticipantProps {
  participantId: string
  participantType: WorkflowParticipantType
  responsibility: string
}

// First-class handoff (entity-level within workflow)
interface HandoffProps {
  id: string
  sourceStageId: string
  targetStageId: string
  triggerType: 'automatic' | 'manual' | 'conditional'
  condition: string | null                      // for conditional triggers
  contractId: string | null                     // governing contract
  inputArtifactTypes: string[]
  expectedOutputArtifactTypes: string[]
  definitionOfDone: string
  validations: string[]
  sla: SlaProps | null
  escalationRules: EscalationRuleProps[]
}

interface SlaProps {
  maxDurationMinutes: number
  warningAtPercent: number                      // e.g. 80
}

interface EscalationRuleProps {
  condition: string                             // human-readable
  escalateTo: string                            // agentId or role description
  action: string                                // what happens on escalation
}

interface WorkflowMetricProps {
  name: string
  description: string
  unit: string                                  // e.g. 'minutes', 'count', 'percentage'
}
```

### Migration Notes

- `Workflow.ownerDepartmentId` → `Workflow.ownerUoId`
- `WorkflowParticipantType: 'role' | 'department'` → `'agent' | 'uo'`
- Existing `WorkflowStage` gains an `id` field and optional `ownerAgentId`.
- `Handoff` is new — existing `hands_off_to` edge type represented implicit handoffs; now they are explicit entities within the workflow.
- New fields (`workflowType`, `definitionOfDone`, `escalationRules`, `metrics`, `objectiveIds`) are optional during migration — default to empty/null.

---

## 9. Contract (adapted)

**Adapted from:** existing `Contract` aggregate
**Module:** `contracts` (same location, adapted)
**Aggregate Root:** yes (already)

### Domain Type Changes

```typescript
type ContractType = 'SLA' | 'DataContract' | 'InterfaceContract' | 'OperationalAgreement'  // unchanged

type ContractStatus = 'draft' | 'active' | 'deprecated'  // unchanged

// NEW — expanded party model
type ContractPartyType = 'uo' | 'agent' | 'workflow-stage'

interface ContractProps {
  id: string
  projectId: string
  name: string
  description: string
  type: ContractType
  status: ContractStatus
  providerId: string
  providerType: ContractPartyType               // expanded from 'department' | 'capability'
  consumerId: string
  consumerType: ContractPartyType               // expanded from 'department' | 'capability'
  acceptanceCriteria: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Migration Notes

- `PartyType: 'department'` → `ContractPartyType: 'uo'`
- `PartyType: 'capability'` → deprecated. Capabilities are removed; remap to the owning UO or agent.
- Provider/consumer IDs must be remapped to new entity IDs during bridge phase.

---

## 10. Policy (adapted)

**Adapted from:** existing `Policy` aggregate
**Module:** `policies` (same location, adapted)
**Aggregate Root:** yes (already)

### Domain Type Changes

```typescript
// NEW — expanded scope
type PolicyScope = 'global' | 'uo' | 'agent' | 'workflow' | 'handoff' | 'artifact' | 'proposal'

type PolicyType = 'approval-gate' | 'constraint' | 'rule'  // unchanged
type PolicyEnforcement = 'mandatory' | 'advisory'           // unchanged
type PolicyStatus = 'active' | 'inactive'                   // unchanged

interface PolicyProps {
  id: string
  projectId: string
  name: string
  description: string
  scope: PolicyScope                            // expanded
  targetId: string | null                       // NEW — specific entity this policy applies to
  targetType: PolicyScope | null                // NEW — type of the target entity
  type: PolicyType
  condition: string
  enforcement: PolicyEnforcement
  status: PolicyStatus
  createdAt: Date
  updatedAt: Date
}
```

### Migration Notes

- `PolicyScope: 'department'` → `PolicyScope: 'uo'`
- `Policy.departmentId` → `Policy.targetId` + `Policy.targetType: 'uo'`
- `PolicyScope: 'global'` stays the same; `targetId` is null.

---

## 11. Artifact (adapted)

**Adapted from:** existing `Artifact` aggregate
**Module:** `artifacts` (same location, adapted)
**Aggregate Root:** yes (already)

### Domain Type Changes

```typescript
type ArtifactType = 'document' | 'data' | 'deliverable' | 'decision' | 'template'  // unchanged
type ArtifactStatus = 'draft' | 'active' | 'archived'                                // unchanged

// NEW — expanded producer/consumer model
type ArtifactPartyType = 'uo' | 'agent' | 'workflow'

interface ArtifactProps {
  id: string
  projectId: string
  name: string
  description: string
  type: ArtifactType
  status: ArtifactStatus
  producerId: string | null
  producerType: ArtifactPartyType | null        // expanded from 'department' | 'capability'
  consumerIds: string[]
  tags: string[]
  // NEW anchoring fields
  workflowId: string | null                     // workflow that produces/consumes this
  handoffId: string | null                      // handoff this artifact belongs to
  decisionId: string | null                     // decision this artifact documents
  policyId: string | null                       // policy this artifact supports
  createdAt: Date
  updatedAt: Date
}
```

### Migration Notes

- `PartyType` → `ArtifactPartyType` (same change as Contract).
- New anchoring fields default to null during migration.

---

## 12. Proposal

**New entity** — central to organizational growth governance.
**Module:** `proposals` (new, in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type ProposalType =
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

type ProposalStatus =
  | 'draft'
  | 'proposed'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'superseded'

interface ProposalProps {
  id: string
  projectId: string
  proposalType: ProposalType
  title: string
  description: string
  motivation: string                    // why this change is needed
  problemDetected: string               // what problem was observed
  expectedBenefit: string
  estimatedCost: string                 // human-readable cost estimate
  contextToAssign: string               // what context the new entity will receive
  affectedContractIds: string[]
  affectedWorkflowIds: string[]
  requiredApproval: ApproverLevel       // from CompanyConstitution
  status: ProposalStatus
  proposedByAgentId: string             // which agent proposed this
  reviewedByUserId: string | null       // human who reviewed
  approvedByUserId: string | null       // human who approved
  rejectionReason: string | null
  implementedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### Invariants

- `title` cannot be empty.
- `proposedByAgentId` is required.
- Status transitions follow the lifecycle: `draft` → `proposed` → `under-review` → `approved` | `rejected`. `approved` → `implemented`. Any status → `superseded`.
- Cannot approve without `approvedByUserId` when `requiredApproval` is `'founder'`.
- Cannot implement a rejected proposal.

### Domain Events

- `ProposalCreated { id, projectId, proposalType, title, proposedByAgentId }`
- `ProposalSubmitted { id }` (draft → proposed)
- `ProposalUnderReview { id, reviewedByUserId }`
- `ProposalApproved { id, approvedByUserId }`
- `ProposalRejected { id, rejectionReason }`
- `ProposalImplemented { id, implementedAt }`
- `ProposalSuperseded { id, supersededById }`

---

## 13. Decision

**New entity** — traceable record of important decisions.
**Module:** `decisions` (new, in `services/company-design`)
**Aggregate Root:** yes

### Domain Type

```typescript
type DecisionStatus = 'proposed' | 'approved' | 'rejected' | 'superseded'

interface DecisionProps {
  id: string
  projectId: string
  title: string
  description: string
  rationale: string                     // why this decision was made
  proposedByAgentId: string
  approvedByUserId: string | null
  objectiveId: string | null            // which objective this decision serves
  proposalId: string | null             // which proposal led to this decision
  impactedArtifactIds: string[]
  impactedWorkflowIds: string[]
  status: DecisionStatus
  createdAt: Date
  updatedAt: Date
}
```

### Invariants

- `title` cannot be empty.
- `rationale` cannot be empty.
- `proposedByAgentId` is required.
- `approved` requires `approvedByUserId`.

### Domain Events

- `DecisionCreated { id, projectId, title, proposedByAgentId }`
- `DecisionApproved { id, approvedByUserId }`
- `DecisionRejected { id, reason }`
- `DecisionSuperseded { id, supersededById }`

---

## 14. RuntimeExecution

**New entity** — live instance of a workflow run or agent task.
**Module:** `runtime` (new, or extend existing `operations` module)
**Aggregate Root:** yes

> Note: The existing `WorkflowRun` and `StageExecution` in the operations module are **preserved**.
> `RuntimeExecution` is a higher-level concept that wraps workflow runs and agent tasks
> with richer observability. During migration, it coexists with the operations module.

### Domain Type

```typescript
type RuntimeExecutionType = 'workflow-run' | 'agent-task'

type RuntimeExecutionStatus =
  | 'pending'
  | 'running'
  | 'waiting'       // waiting for input, approval, or handoff
  | 'blocked'       // blocked by an error or dependency
  | 'completed'
  | 'failed'
  | 'cancelled'

interface RuntimeExecutionProps {
  id: string
  projectId: string
  executionType: RuntimeExecutionType
  workflowId: string | null             // for workflow-run type
  agentId: string | null                // for agent-task type
  status: RuntimeExecutionStatus
  startedAt: Date | null
  completedAt: Date | null
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  errors: RuntimeErrorProps[]
  waitingFor: string | null             // human-readable description of what is blocking
  approvals: ApprovalRecordProps[]
  aiCost: number                        // accumulated cost in USD
  logSummary: string                    // human-readable summary of execution
  createdAt: Date
  updatedAt: Date
}
```

### Value Objects

```typescript
interface RuntimeErrorProps {
  message: string
  occurredAt: Date
  severity: 'warning' | 'error' | 'fatal'
  context: string | null                // additional context
}

interface ApprovalRecordProps {
  requestedAt: Date
  approvedAt: Date | null
  approvedBy: string | null             // userId
  subject: string                       // what was being approved
  status: 'pending' | 'approved' | 'rejected'
}
```

### Invariants

- `workflowId` is required when `executionType` is `'workflow-run'`.
- `agentId` is required when `executionType` is `'agent-task'`.
- `completedAt` is set only when status is `completed`, `failed`, or `cancelled`.
- `aiCost` is non-negative.

### Domain Events

- `RuntimeExecutionStarted { id, projectId, executionType, workflowId?, agentId? }`
- `RuntimeExecutionCompleted { id, status, output }`
- `RuntimeExecutionFailed { id, error }`
- `RuntimeExecutionBlocked { id, waitingFor }`
- `ApprovalRequested { executionId, subject }`
- `ApprovalGranted { executionId, approvedBy }`

### Relationship to Existing Operations Module

| Existing | New | Relationship |
|----------|-----|-------------|
| `WorkflowRun` | `RuntimeExecution (type: workflow-run)` | RuntimeExecution wraps and extends WorkflowRun with AI cost, approvals, richer status |
| `StageExecution` | Part of RuntimeExecution lifecycle | Stage-level detail remains in operations module |
| `Incident` | Preserved | Referenced by RuntimeExecution errors |
| `ContractCompliance` | Preserved | Extended to check new contract party model |

---

## 15. Relationship Taxonomy

All relationships in the domain fall into five categories.

### Structural (always visible on canvas)

| Relationship | Source → Target | Semantics |
|-------------|----------------|-----------|
| `contains` | UO → UO, UO → Agent | Parent contains child |
| `belongs_to` | Agent → UO, UO → UO (child → parent) | Child belongs to parent |
| `reports_to` | UO → UO (peer or child → parent) | Reporting line |

### Responsibility

| Relationship | Source → Target | Semantics |
|-------------|----------------|-----------|
| `led_by` | UO → Agent (coordinator) | UO is led by this agent |
| `accountable_for` | Agent → UO, Agent → Workflow | Agent is accountable for this entity |
| `supervises` | Agent (coordinator) → Agent (specialist) | Supervision relationship |

### Collaboration

| Relationship | Source → Target | Semantics |
|-------------|----------------|-----------|
| `requests_from` | Agent/UO → Agent/UO | Requests work or information |
| `delegates_to` | Agent → Agent | Delegation of work |
| `reviews` | Agent → Artifact/Handoff | Review responsibility |
| `approves` | Agent/User → Proposal/Decision | Approval authority |
| `hands_off_to` | Stage → Stage, Agent → Agent | Handoff in workflow |
| `escalates_to` | Agent → Agent | Escalation path |

### Flow

| Relationship | Source → Target | Semantics |
|-------------|----------------|-----------|
| `produces` | Agent/UO → Artifact | Produces an artifact |
| `consumes` | Agent/UO → Artifact | Consumes an artifact |
| `informs` | Various → Various | Information flow |
| `triggers` | EventTrigger → Workflow, Objective → Workflow | Activation relationship |

### Governance

| Relationship | Source → Target | Semantics |
|-------------|----------------|-----------|
| `governed_by` | Any entity → Policy | Entity is governed by this policy |
| `constrained_by` | Any entity → Policy/Contract | Entity is constrained by this rule |
| `proposed_by` | Proposal → Agent | Proposal was created by this agent |
| `approved_by` | Decision → User/Agent | Decision was approved by this actor |

---

## 16. Module Structure

Target module layout for `services/company-design/src/`:

```
project-seed/
  domain/
    project-seed.ts              # AggregateRoot
    project-seed.repository.ts   # Repository interface
    ai-budget.vo.ts              # ValueObject
    founder-preferences.vo.ts    # ValueObject
    maturity-phase.ts            # type + transition logic
  application/
    project-seed.service.ts
  infra/
    in-memory-project-seed.repository.ts

constitution/
  domain/
    company-constitution.ts
    company-constitution.repository.ts
    autonomy-limits.vo.ts
    budget-config.vo.ts
    approval-criterion.vo.ts
    expansion-rule.vo.ts
  application/
    constitution.service.ts
  infra/
    in-memory-constitution.repository.ts

organizational-units/
  domain/
    organizational-unit.ts
    organizational-unit.repository.ts
  application/
    organizational-unit.service.ts
  infra/
    in-memory-organizational-unit.repository.ts

agents/
  domain/
    agent.ts
    agent.repository.ts
    agent-skill.vo.ts
    agent-budget.vo.ts
  application/
    agent.service.ts
  infra/
    in-memory-agent.repository.ts

objectives/
  domain/
    objective.ts
    objective.repository.ts
    key-result.vo.ts
  application/
    objective.service.ts
  infra/
    in-memory-objective.repository.ts

event-triggers/
  domain/
    event-trigger.ts
    event-trigger.repository.ts
  application/
    event-trigger.service.ts
  infra/
    in-memory-event-trigger.repository.ts

external-sources/
  domain/
    external-source.ts
    external-source.repository.ts
  application/
    external-source.service.ts
  infra/
    in-memory-external-source.repository.ts

proposals/
  domain/
    proposal.ts
    proposal.repository.ts
  application/
    proposal.service.ts
  infra/
    in-memory-proposal.repository.ts

decisions/
  domain/
    decision.ts
    decision.repository.ts
  application/
    decision.service.ts
  infra/
    in-memory-decision.repository.ts

runtime/
  domain/
    runtime-execution.ts
    runtime-execution.repository.ts
    runtime-error.vo.ts
    approval-record.vo.ts
  application/
    runtime-execution.service.ts
  infra/
    in-memory-runtime-execution.repository.ts
```

### Preserved Modules (adapted in place)

```
workflows/          # enriched with workflowType, handoffs, metrics
contracts/          # adapted party model
policies/           # extended scope
artifacts/          # enriched anchoring
```

### Deprecated Modules (removed after bridge phase)

```
company-model/      # replaced by project-seed + constitution
departments/        # replaced by organizational-units
roles/              # absorbed into agents
agent-archetypes/   # replaced by agents
agent-assignments/  # merged into agents
capabilities/       # redistributed to UO.functions + Agent.skills
skills/             # embedded in Agent
```

---

## 17. Shared-Types DTO Summary

New DTOs to add to `packages/shared-types/src/index.ts`:

### New Types

| DTO | Purpose |
|-----|---------|
| `ProjectSeedDto`, `CreateProjectSeedDto`, `UpdateProjectSeedDto` | Project seed CRUD |
| `CompanyConstitutionDto`, `UpdateConstitutionDto` | Constitution management |
| `OrganizationalUnitDto`, `CreateOrganizationalUnitDto`, `UpdateOrganizationalUnitDto` | UO CRUD |
| `AgentDto`, `CreateAgentDto`, `UpdateAgentDto` | Agent CRUD |
| `ObjectiveDto`, `CreateObjectiveDto`, `UpdateObjectiveDto` | Objective CRUD |
| `EventTriggerDto`, `CreateEventTriggerDto`, `UpdateEventTriggerDto` | Trigger CRUD |
| `ExternalSourceDto`, `CreateExternalSourceDto`, `UpdateExternalSourceDto` | External source CRUD |
| `ProposalDto`, `CreateProposalDto`, `UpdateProposalDto` | Proposal lifecycle |
| `DecisionDto`, `CreateDecisionDto`, `UpdateDecisionDto` | Decision tracking |
| `RuntimeExecutionDto`, `CreateRuntimeExecutionDto` | Runtime observability |
| `HandoffDto` | Handoff within workflows |

### New Enum/Union Types

| Type | Values |
|------|--------|
| `MaturityPhase` | `'seed' \| 'formation' \| 'structured' \| 'operating' \| 'scaling' \| 'optimizing'` |
| `UoType` | `'company' \| 'department' \| 'team'` |
| `UoStatus` | `'active' \| 'proposed' \| 'retired'` |
| `AgentType` | `'coordinator' \| 'specialist'` |
| `AgentStatus` | `'active' \| 'inactive' \| 'proposed'` |
| `WorkflowType` | `'strategic' \| 'operational' \| 'service-internal' \| 'event-driven' \| 'external-response'` |
| `ContractPartyType` | `'uo' \| 'agent' \| 'workflow-stage'` |
| `ArtifactPartyType` | `'uo' \| 'agent' \| 'workflow'` |
| `ProposalType` | (10 values, see §12) |
| `ProposalStatus` | (7 values, see §12) |
| `DecisionStatus` | `'proposed' \| 'approved' \| 'rejected' \| 'superseded'` |
| `RuntimeExecutionType` | `'workflow-run' \| 'agent-task'` |
| `RuntimeExecutionStatus` | (7 values, see §14) |
| `ObjectivePriority` | `'critical' \| 'high' \| 'medium' \| 'low'` |
| `ObjectiveStatus` | `'active' \| 'achieved' \| 'abandoned' \| 'superseded'` |
| `TriggerSourceType` | `'internal' \| 'external'` |
| `SourceCategory` | (6 values, see §7) |
| `ApproverLevel` | `'founder' \| 'ceo' \| 'executive' \| 'team-lead' \| 'auto'` |

### Adapted Types

| Type | Change |
|------|--------|
| `WorkflowParticipantType` | `'role' \| 'department'` → `'agent' \| 'uo'` |
| `PartyType` (contracts) | `'department' \| 'capability'` → `ContractPartyType` |
| `PolicyScope` | `'global' \| 'department'` → expanded (7 values) |

### Visual Grammar Types (summary — detail deferred to LCP-005)

| Type | Change |
|------|--------|
| `NodeType` | Remove 4 old types, add 8 new. See ADR §2.2 |
| `EdgeType` | Remove 8 old types, add 14 new. See ADR §2.2 |
| `EdgeCategory` | Simplify from 8 to 5 |
| `LayerId` → `OverlayId` | Rename + simplify from 7 to 5 |
| `ScopeType` | Redefine L3/L4 scopes |

> Visual grammar implementation details are the responsibility of **LCP-005**.

---

## 18. Snapshot Extension

`ReleaseSnapshotDto` must be extended to include new entities:

```typescript
interface ReleaseSnapshotDto {
  // preserved
  companyModel: CompanyModelDto | null       // kept during bridge, eventually removed
  departments: DepartmentDto[]               // kept during bridge
  capabilities: CapabilityDto[]              // kept during bridge
  roles: RoleDto[]                           // kept during bridge
  agentArchetypes: AgentArchetypeDto[]       // kept during bridge
  agentAssignments: AgentAssignmentDto[]     // kept during bridge
  skills: SkillDto[]                         // kept during bridge
  contracts: ContractDto[]
  workflows: WorkflowDto[]
  policies: PolicyDto[]
  artifacts: ArtifactDto[]

  // new (added progressively)
  projectSeed: ProjectSeedDto | null
  constitution: CompanyConstitutionDto | null
  organizationalUnits: OrganizationalUnitDto[]
  agents: AgentDto[]
  objectives: ObjectiveDto[]
  eventTriggers: EventTriggerDto[]
  externalSources: ExternalSourceDto[]
  proposals: ProposalDto[]
  decisions: DecisionDto[]
}
```

Old fields are preserved during bridge phase (LCP-011) and removed after migration is validated.

---

## 19. Bootstrap Sequence (CEO-first)

When a new project is created:

1. **Create ProjectSeed** — minimal: name, mission, companyType. Phase: `seed`.
2. **Create CompanyConstitution** — with defaults from `FounderPreferences`.
3. **Create Company UO** — single organizational unit of type `company`.
4. **Create CEO Agent** — coordinator agent assigned to the company UO.
5. **Start bootstrap conversation** — CEO agent converses with user to refine:
   - mission, vision, restrictions
   - initial objectives
   - first department proposals
6. **Proposals flow** — CEO proposes departments; user approves; UOs are created.
7. **Phase transitions** — `seed` → `formation` when first department is created.

> Bootstrap implementation is the responsibility of **LCP-006** and **LCP-013**.

---

## 20. Cross-Reference to Downstream Tasks

| Task | What it uses from this document |
|------|-------------------------------|
| LCP-005 | Visual grammar types (§17), relationship taxonomy (§15), node/edge mapping |
| LCP-006 | Bootstrap sequence (§19), ProjectSeed (§1), CEO Agent (§4) |
| LCP-007 | Proposal (§12), Decision (§13), CompanyConstitution (§2), growth protocol alignment |
| LCP-008 | RuntimeExecution (§14), relationship to operations module |
| LCP-009 | All entity types — Verticaler must be rebuilt using this domain |
| LCP-011 | All DTOs (§17), module structure (§16), migration notes per entity |
| LCP-012 | Visual grammar, module structure, relationship taxonomy |
| LCP-013 | Bootstrap sequence (§19), ProjectSeed, Constitution, UO, Agent |
