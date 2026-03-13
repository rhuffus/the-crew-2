# Organizational Growth Engine — Implementable Design

> Produced by LCP-007. Defines the growth engine, approval model, budget enforcement, context minimization, and organizational health system.
> Supersedes the conceptual protocol in `docs/35-live-company-growth-protocol.md` (which remains as reference).

## Design Principles

1. **AI proposes, humans govern** — Agents detect growth needs and create proposals. Humans (or delegated coordinators) approve. The system never creates structure autonomously.
2. **Constitution is the rulebook** — All approval routing, expansion rules, and limits derive from `CompanyConstitution`. The growth engine reads the constitution; it never bypasses it.
3. **Phase-aware behavior** — What's allowed depends on `MaturityPhase`. Early phases are stricter; later phases allow more delegation.
4. **Budget-first growth** — No structural expansion without budget validation when the constitution requires it.
5. **Minimal context by default** — New UOs and agents receive only what they need, not the full project graph.

---

## 1. Growth Engine Service

### 1.1 Responsibilities

The Growth Engine is a domain service that orchestrates the lifecycle of organizational change. It is NOT an aggregate — it coordinates across Proposal, Constitution, OrganizationalUnit, Agent, and ProjectSeed aggregates.

**Module:** `services/company-design/src/growth-engine/`

```
growth-engine/
  domain/
    growth-engine.service.ts          # Domain service — orchestration
    growth-signal.ts                  # Value object — detected need
    growth-evaluation.ts             # Value object — evaluation result
    context-allocation.ts            # Value object — context package for new entity
    budget-validator.ts              # Domain service — budget checks
    approval-router.ts               # Domain service — routes approvals
    health-checker.ts                # Domain service — org health metrics
  application/
    growth-engine.app-service.ts     # Application service — use cases
    growth-signal-detector.ts        # Application service — detects signals
  infra/
    growth-engine.module.ts          # NestJS module
```

### 1.2 Core Flow

```
Signal Detection → Proposal Creation → Validation → Approval Routing →
  Approval/Rejection → Implementation (if approved) → Phase Transition Check
```

Each step is a discrete operation. The engine does not run as a background process — it responds to commands and events.

---

## 2. Growth Signals

A growth signal is a detected need that MAY justify structural expansion. Signals come from agents (coordinators observe workload) or from the system (metrics cross thresholds).

### 2.1 Signal Types

```typescript
type GrowthSignalType =
  | 'workload-overflow'         // agent or UO has too many concurrent tasks
  | 'capability-gap'            // needed skill not present in any agent
  | 'coordination-bottleneck'   // coordinator-to-specialist ratio exceeded
  | 'scope-creep'               // UO responsibilities growing beyond mandate
  | 'repeated-escalation'       // same issue escalated multiple times
  | 'user-initiated'            // founder/user directly requests expansion
  | 'objective-unserved'        // objective has no assigned UO or agent
  | 'workflow-unowned'          // workflow stage has no owner agent

interface GrowthSignalProps {
  id: string
  projectId: string
  signalType: GrowthSignalType
  description: string
  sourceAgentId: string | null     // agent that detected the signal
  sourceUoId: string | null        // UO where the signal was detected
  evidence: string[]               // human-readable evidence
  suggestedAction: ProposalType | null
  detectedAt: Date
  acknowledged: boolean            // has a coordinator acknowledged this signal
  resolvedByProposalId: string | null
}
```

### 2.2 Signal Detection Rules

Signals are detected by coordinators during runtime or by the health checker on demand:

| Signal Type | Detection Source | Trigger Condition |
|-------------|-----------------|-------------------|
| `workload-overflow` | Runtime metrics | Agent has > `maxConcurrentTasks` active tasks |
| `capability-gap` | Coordinator observation | Workflow stage requires skill not present in team |
| `coordination-bottleneck` | Health checker | coordinator-to-specialist ratio below `autonomyLimits.coordinatorToSpecialistRatio` |
| `scope-creep` | Coordinator observation | UO functions list > 8 items, or mandate grows beyond original |
| `repeated-escalation` | Runtime events | Same escalation path triggered > 3 times in 7 days |
| `user-initiated` | User action | User clicks "Request expansion" or CEO proposes |
| `objective-unserved` | Health checker | Active objective with no `ownerUoId` and no `ownerAgentId` |
| `workflow-unowned` | Health checker | Workflow stage with `ownerAgentId: null` |

### 2.3 Signal → Proposal Mapping

| Signal Type | Suggested Proposal Type |
|-------------|------------------------|
| `workload-overflow` | `create-specialist` or `create-team` (if at team level) |
| `capability-gap` | `create-specialist` |
| `coordination-bottleneck` | `create-team` or `split-team` |
| `scope-creep` | `create-department` or `split-team` |
| `repeated-escalation` | `revise-workflow` or `create-specialist` |
| `user-initiated` | (whatever the user/CEO specifies) |
| `objective-unserved` | `create-department` or `create-team` |
| `workflow-unowned` | `create-specialist` |

The mapping is advisory. The coordinator that creates the proposal decides the actual type.

---

## 3. Proposal Evaluation Pipeline

When a proposal is submitted (status: `proposed`), the growth engine validates it before routing for approval.

### 3.1 Validation Steps

```typescript
interface GrowthEvaluationResult {
  proposalId: string
  valid: boolean
  violations: GrowthViolation[]
  warnings: GrowthWarning[]
  budgetImpact: BudgetImpactAssessment
  requiredApprover: ApproverLevel      // computed from constitution
  autoApprovable: boolean              // true if constitution says 'auto'
}

interface GrowthViolation {
  rule: string                          // which rule was violated
  description: string
  blocking: boolean                     // if true, proposal cannot proceed
}

interface GrowthWarning {
  rule: string
  description: string
  advisory: boolean                     // non-blocking, shown to approver
}

interface BudgetImpactAssessment {
  estimatedMonthlyCost: number | null   // USD, null if not applicable
  currentBudgetUsage: number            // percentage 0-100
  projectedBudgetUsage: number          // percentage after approval
  exceedsBudget: boolean
  exceedsAlertThreshold: boolean
  thresholdExceeded: number | null      // which threshold, e.g. 80
}
```

### 3.2 Validation Rules (evaluated in order)

| # | Rule | Check | Blocking? |
|---|------|-------|-----------|
| 1 | **Phase guard** | Is the requested action allowed in the current maturity phase? (see §3.3) | Yes |
| 2 | **Depth limit** | Would the new UO exceed `autonomyLimits.maxDepth`? | Yes |
| 3 | **Fan-out limit** | Would the parent UO exceed `autonomyLimits.maxFanOut` children? | Yes |
| 4 | **Agent limit** | Would the team exceed `autonomyLimits.maxAgentsPerTeam`? | Yes |
| 5 | **Expansion rules match** | Does the proposal satisfy at least one `ExpansionRule` for its target type? | Yes |
| 6 | **Owner exists** | If `requiresOwner`, is a coordinator identified? | Yes |
| 7 | **Budget check** | If `requiresBudget`, is there sufficient budget? | Yes |
| 8 | **Duplicate check** | Does a UO/agent with the same name already exist at the same level? | Yes |
| 9 | **Ratio check** | Would adding this entity violate the coordinator-to-specialist ratio? | Warning |
| 10 | **Justification check** | Does the proposal have non-empty `motivation` and `problemDetected`? | Depends on `requiresJustification` |

### 3.3 Phase Guards

| Action | Minimum Phase | Notes |
|--------|--------------|-------|
| `create-department` | `seed` | CEO can propose from day one |
| `create-team` | `formation` | Requires at least one department to exist |
| `create-specialist` | `formation` | Can be proposed once teams or departments exist |
| `split-team` | `structured` | Teams must exist first |
| `merge-teams` | `structured` | Multiple teams must exist |
| `retire-unit` | `formation` | Can retire proposed or active UOs |
| `revise-contract` | `structured` | Contracts are relevant from structured phase |
| `revise-workflow` | `formation` | Workflows can be created from formation |
| `revise-policy` | `formation` | Policies can be modified from formation |
| `update-constitution` | `seed` | Always allowed (founder governance) |

---

## 4. Approval Model

### 4.1 Approval Routing

The approval router determines who must approve a proposal based on:
1. The proposal's `proposalType`
2. The constitution's `approvalCriteria`
3. The current `maturityPhase`
4. Phase overrides (see §4.2)

```typescript
interface ApprovalRoute {
  proposalId: string
  requiredApprover: ApproverLevel
  effectiveApprover: ApproverLevel    // after phase overrides
  delegatedTo: string | null          // agentId if delegated
  requiresJustification: boolean
  phaseOverrideApplied: boolean
}
```

**Routing algorithm:**

```
1. Look up ApprovalCriterion where scope matches proposalType
2. Get requiredApprover from the criterion
3. Apply phase override (§4.2)
4. If effectiveApprover is 'auto', mark as autoApprovable
5. Return route
```

### 4.2 Phase Overrides

In early phases, the system enforces stricter approval regardless of constitution settings:

| Phase | Override |
|-------|---------|
| `seed` | ALL proposals require `founder` approval. No delegation. |
| `formation` | Structural proposals (`create-*`, `retire-unit`) require `founder`. Non-structural follow constitution. |
| `structured` | No override — constitution rules apply fully. |
| `operating` | No override. |
| `scaling` | No override. |
| `optimizing` | No override. |

Phase overrides exist to protect early-stage companies from premature autonomous expansion.

### 4.3 Approval Workflow

```
Proposal submitted (status: 'proposed')
  → Growth Engine validates (§3)
  → If validation fails with blocking violations:
      → status → 'rejected' (system rejection, not human)
      → emit ProposalRejected { reason: violations }
  → If validation passes:
      → Approval router computes route
      → If autoApprovable:
          → status → 'approved'
          → proceed to Implementation (§5)
      → If requires human:
          → status → 'under-review'
          → emit ApprovalRequested { proposalId, requiredApprover }
          → Wait for human action:
              → Accept: status → 'approved' → Implementation (§5)
              → Reject: status → 'rejected'
              → Edit: update proposal fields, re-validate
```

### 4.4 Delegation Model

Coordinators can delegate approval authority downward, within limits:

| Delegating Level | Can Delegate To | Constraint |
|-----------------|----------------|------------|
| `founder` | `ceo` | Only for non-structural proposals |
| `ceo` | `executive` | Only within the executive's department scope |
| `executive` | `team-lead` | Only for `create-specialist` within the team |
| `team-lead` | (cannot delegate) | — |

Delegation is recorded in the proposal:

```typescript
interface DelegationRecord {
  fromLevel: ApproverLevel
  toLevel: ApproverLevel
  toAgentId: string
  scope: ApprovalScope
  delegatedAt: Date
  expiresAt: Date | null            // null = permanent until revoked
}
```

Delegation records live on the `CompanyConstitution` aggregate:

```typescript
// Addition to CompanyConstitutionProps
interface CompanyConstitutionProps {
  // ... existing fields ...
  delegations: DelegationRecord[]    // NEW — active delegations
}
```

### 4.5 Approval Timeout and Escalation

Proposals do not expire automatically. However, the system can emit reminder events:

| Duration without action | Event |
|------------------------|-------|
| 24 hours | `ApprovalReminderSent { proposalId }` |
| 72 hours | `ApprovalEscalated { proposalId, escalatedTo }` — escalates up one level |
| 7 days | `ApprovalStale { proposalId }` — flagged in health check |

Escalation follows the hierarchy: `team-lead` → `executive` → `ceo` → `founder`.

If the required approver is already `founder`, no further escalation is possible — only reminders.

### 4.6 Batch Approval

For non-structural proposals (`revise-contract`, `revise-workflow`, `revise-policy`), the UI may present multiple proposals in a batch:

```typescript
interface BatchApprovalRequest {
  proposalIds: string[]
  approvedByUserId: string
  action: 'approve-all' | 'reject-all'
  comment: string | null
}
```

Batch approval creates individual approval records per proposal. If any proposal fails re-validation at approval time, it is excluded from the batch and the user is notified.

---

## 5. Implementation Effects

When a proposal is approved, the growth engine orchestrates the creation of new entities.

### 5.1 Implementation Patterns

Each `ProposalType` has a defined implementation pattern:

#### create-department

```
1. Create OrganizationalUnit { uoType: 'department', parentUoId: company or parent dept }
2. Create Agent { agentType: 'coordinator', role: 'Department Executive', uoId: newUo.id }
3. Assign coordinator to UO: OrganizationalUnit.coordinatorAgentId = agent.id
4. Allocate context (§6)
5. Update proposal: status → 'implemented', implementedAt = now
6. Check phase transition: if first dept and phase === 'seed' → advance to 'formation'
7. Emit: OrganizationalUnitCreated, AgentCreated, CoordinatorAssigned
8. If applicable: emit MaturityPhaseAdvanced
```

#### create-team

```
1. Validate parent is a department UO
2. Create OrganizationalUnit { uoType: 'team', parentUoId: departmentUoId }
3. Create Agent { agentType: 'coordinator', role: 'Team Lead', uoId: newUo.id }
4. Assign coordinator to UO
5. Allocate context (§6)
6. Update proposal: status → 'implemented'
7. Check phase transition: if first team and phase === 'formation' → advance to 'structured'
8. Emit events
```

#### create-specialist

```
1. Validate parent UO is a team (preferred) or department
2. Create Agent { agentType: 'specialist', uoId: parentUoId }
3. Allocate context (§6)
4. Update proposal: status → 'implemented'
5. Emit: AgentCreated
```

#### split-team

```
1. Validate source team exists and has > 1 specialist
2. Create new OrganizationalUnit { uoType: 'team', parentUoId: same department }
3. Create coordinator for new team
4. Move specified agents to new team (update agent.uoId)
5. Update affected workflows and contracts
6. Allocate context for new team
7. Update proposal: status → 'implemented'
8. Emit: OrganizationalUnitCreated, AgentCreated, AgentUpdated (moved agents)
```

#### merge-teams

```
1. Validate both teams exist and share the same parent department
2. Move all agents from team B to team A
3. Merge team B's functions into team A
4. Retire team B (status → 'retired')
5. Update affected workflows and contracts
6. Update proposal: status → 'implemented'
7. Emit: AgentUpdated (moved agents), OrganizationalUnitRetired
```

#### retire-unit

```
1. Validate UO has no active child UOs (must retire children first)
2. Validate UO has no active agents (must deactivate/move agents first)
   — OR — the proposal specifies cascade: deactivate all agents in the UO
3. Set UO status → 'retired'
4. Deactivate coordinator agent
5. Update affected workflows (remove participant, flag for review)
6. Update affected contracts (flag for renegotiation)
7. Update proposal: status → 'implemented'
8. Emit: OrganizationalUnitRetired, AgentDeactivated
```

#### revise-contract / revise-workflow / revise-policy

```
1. Apply the specified changes to the target entity
2. Create a Decision record linking the proposal to the change
3. Update proposal: status → 'implemented'
4. Emit: ContractUpdated / WorkflowUpdated / PolicyUpdated, DecisionCreated
```

#### update-constitution

```
1. Apply changes to CompanyConstitution
2. Create a Decision record
3. If approval criteria changed: existing pending proposals may need re-routing
4. Update proposal: status → 'implemented'
5. Emit: ConstitutionUpdated, DecisionCreated
```

### 5.2 Implementation Atomicity

Each implementation pattern is a single transaction. If any step fails, the entire implementation rolls back and the proposal stays `approved` (not `implemented`). The system emits `ProposalImplementationFailed { proposalId, reason }` for retry.

---

## 6. Context Minimization

### 6.1 Context Allocation

When a new UO or agent is created, the growth engine computes a **context package** — the minimal set of information the new entity needs.

```typescript
interface ContextAllocation {
  targetEntityId: string
  targetEntityType: 'uo' | 'agent'
  inheritedPrinciples: string[]         // from constitution, filtered by relevance
  relevantObjectiveIds: string[]        // objectives this entity should know about
  relevantContractIds: string[]         // contracts involving this entity
  relevantWorkflowIds: string[]         // workflows this entity participates in
  relevantPolicyIds: string[]           // policies governing this entity
  relevantArtifactIds: string[]         // artifacts this entity needs access to
  parentMandateSummary: string          // summarized mandate of parent UO
  siblingUoNames: string[]              // names of sibling UOs (for awareness, not full context)
}
```

### 6.2 Allocation Rules

| Entity Type | What it receives |
|------------|-----------------|
| **Department UO** | Company mission, relevant company-level objectives, constitution principles, existing inter-department contracts it's party to |
| **Team UO** | Department mandate, department-level objectives, contracts within department, workflows the team participates in |
| **Coordinator Agent** | Full context of its UO + child UOs summary + relevant escalation paths |
| **Specialist Agent** | Team mandate, assigned workflows, contracts for its stages, quality/delivery rules |

### 6.3 Context Boundaries

- A UO does NOT inherit the full context of sibling UOs — only names and mandates for cross-reference.
- An agent does NOT see the full company graph — only its UO subtree and explicitly linked entities.
- Context expands only through explicit contract or workflow linkage.
- The `contextMinimizationPolicy` field on the constitution provides a human-readable description of the policy (e.g., "need-to-know basis with explicit cross-references").

### 6.4 Context Refresh

When contracts, workflows, or objectives change, affected agents should receive context updates:

```
ContractUpdated / WorkflowUpdated / ObjectiveUpdated
  → Identify agents linked to the changed entity
  → Recompute context allocation for those agents
  → Emit: AgentContextRefreshed { agentId, changedEntities[] }
```

Context refresh is an event-driven process, not polling.

---

## 7. Budget Enforcement

### 7.1 Budget Hierarchy

```
Company Budget (BudgetConfig.globalBudget)
  └── Per-UO Budget (BudgetConfig.perUoBudget)
       └── Per-Agent Budget (BudgetConfig.perAgentBudget)
```

Each level can be null (unlimited) or a USD cap.

### 7.2 Budget Tracking

```typescript
interface BudgetLedgerEntry {
  id: string
  projectId: string
  entityId: string                    // UO or agent
  entityType: 'uo' | 'agent'
  periodStart: Date                   // monthly period
  periodEnd: Date
  allocated: number                   // USD allocated
  consumed: number                    // USD consumed (from RuntimeExecution.aiCost)
  remaining: number                   // allocated - consumed
}
```

Budget tracking is materialized from `RuntimeExecution.aiCost` events. Each time a runtime execution completes, its cost is attributed to the executing agent and rolled up to the UO hierarchy.

### 7.3 Budget Validation at Proposal Time

When a proposal requires budget (`ExpansionRule.requiresBudget`):

```
1. Estimate the new entity's monthly cost (from proposal.estimatedCost or default)
2. Check: parent UO remaining budget >= estimated cost
3. Check: global remaining budget >= estimated cost
4. If either fails: add blocking violation
5. If within budget but exceeds alert threshold: add warning
```

### 7.4 Budget Alerts

```typescript
type BudgetAlertLevel = 'info' | 'warning' | 'critical'

interface BudgetAlert {
  projectId: string
  entityId: string
  entityType: 'project' | 'uo' | 'agent'
  level: BudgetAlertLevel
  threshold: number                   // percentage that was exceeded
  currentUsage: number                // percentage
  message: string
}
```

Alerts are emitted when consumption crosses a threshold defined in `BudgetConfig.alertThresholds` (default: [50, 80, 95]).

### 7.5 Budget Enforcement Modes

The constitution's `budgetConfig` determines enforcement:

| Mode | Behavior |
|------|----------|
| Budget is `null` (unlimited) | No enforcement. Budget alerts still fire if `alertThresholds` are set relative to a soft cap. |
| Budget is set, enforcement advisory | Warnings but no blocking. Proposals can proceed. |
| Budget is set, enforcement mandatory | Blocking. Proposals that exceed budget are rejected. Runtime executions that would exceed budget are paused. |

The enforcement mode is determined by whether a `BudgetEnforcement` policy exists with `enforcement: 'mandatory'` for the scope.

---

## 8. Organizational Health Checks

### 8.1 Health Metrics

The health checker runs on demand (triggered by user, CEO, or scheduled) and produces an organizational health report.

```typescript
interface OrgHealthReport {
  projectId: string
  generatedAt: Date
  phase: MaturityPhase
  metrics: OrgHealthMetric[]
  signals: GrowthSignalProps[]        // detected signals
  recommendations: string[]           // human-readable recommendations
  overallHealth: 'healthy' | 'attention-needed' | 'at-risk'
}

interface OrgHealthMetric {
  name: string
  value: number
  threshold: number | null
  status: 'ok' | 'warning' | 'violation'
  description: string
}
```

### 8.2 Standard Metrics

| Metric | Computation | Threshold Source |
|--------|------------|-----------------|
| `depth` | Max nesting level of UO tree | `autonomyLimits.maxDepth` |
| `max-fanout` | Max children of any single UO | `autonomyLimits.maxFanOut` |
| `max-team-size` | Max agents in any single team | `autonomyLimits.maxAgentsPerTeam` |
| `coordinator-ratio` | coordinators / total agents | `autonomyLimits.coordinatorToSpecialistRatio` |
| `unowned-workflows` | Count of workflow stages with `ownerAgentId: null` | Threshold: 0 |
| `unserved-objectives` | Count of active objectives with no owner | Threshold: 0 |
| `pending-proposals` | Count of proposals in `proposed` or `under-review` | Warning at > 5 |
| `stale-proposals` | Count of proposals under review > 72 hours | Warning at > 0 |
| `retired-units` | Count of retired UOs (informational) | No threshold |
| `budget-usage` | Global budget consumption percentage | `budgetConfig.alertThresholds` |

### 8.3 Overall Health Computation

```
if any metric has status 'violation': overallHealth = 'at-risk'
else if any metric has status 'warning': overallHealth = 'attention-needed'
else: overallHealth = 'healthy'
```

### 8.4 Health Check API

```
GET /projects/:projectId/health
  → Returns OrgHealthReport

GET /projects/:projectId/health/signals
  → Returns active (unresolved) growth signals
```

---

## 9. Phase Transition Engine

Phase transitions are triggered by the growth engine when specific conditions are met.

### 9.1 Transition Rules

| From | To | Trigger | Automatic? | Guard |
|------|----|---------|------------|-------|
| `seed` | `formation` | First department approved and created | Yes | At least 1 active department UO exists |
| `formation` | `structured` | First team created within a department | Yes | At least 1 active team UO exists |
| `structured` | `operating` | First workflow execution completes | Yes | At least 1 RuntimeExecution with status `completed` |
| `operating` | `scaling` | User/CEO decision | No (requires proposal + approval) | — |
| `scaling` | `optimizing` | User/CEO decision | No (requires proposal + approval) | — |

### 9.2 Transition Effects

Each phase transition unlocks new capabilities:

```typescript
interface PhaseCapabilities {
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
  approvalOverride: 'all-founder' | 'structural-founder' | 'constitution-rules'
}

const PHASE_CAPABILITIES: Record<MaturityPhase, PhaseCapabilities> = {
  seed: {
    phase: 'seed',
    canCreateDepartments: true,
    canCreateTeams: false,
    canCreateSpecialists: false,
    canSplitMerge: false,
    canCreateWorkflows: false,
    canCreateContracts: false,
    canToggleLiveMode: false,
    canDelegateApprovals: false,
    canAutoApprove: false,
    approvalOverride: 'all-founder',
  },
  formation: {
    phase: 'formation',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: false,
    canCreateWorkflows: true,
    canCreateContracts: false,
    canToggleLiveMode: false,
    canDelegateApprovals: false,
    canAutoApprove: false,
    approvalOverride: 'structural-founder',
  },
  structured: {
    phase: 'structured',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: false,
    canDelegateApprovals: true,
    canAutoApprove: false,
    approvalOverride: 'constitution-rules',
  },
  operating: {
    phase: 'operating',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: true,
    canDelegateApprovals: true,
    canAutoApprove: true,
    approvalOverride: 'constitution-rules',
  },
  scaling: {
    phase: 'scaling',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: true,
    canDelegateApprovals: true,
    canAutoApprove: true,
    approvalOverride: 'constitution-rules',
  },
  optimizing: {
    phase: 'optimizing',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: true,
    canDelegateApprovals: true,
    canAutoApprove: true,
    approvalOverride: 'constitution-rules',
  },
}
```

### 9.3 Transition Domain Events

```
MaturityPhaseAdvanced { projectId, from, to, triggeredBy }
PhaseCapabilitiesUnlocked { projectId, phase, newCapabilities[] }
```

---

## 10. Domain Events Summary

All events emitted by the growth engine:

### Growth Signals

| Event | Payload |
|-------|---------|
| `GrowthSignalDetected` | `{ id, projectId, signalType, description, sourceAgentId }` |
| `GrowthSignalAcknowledged` | `{ id, acknowledgedByAgentId }` |
| `GrowthSignalResolved` | `{ id, resolvedByProposalId }` |

### Proposal Lifecycle (extending docs/33 §12)

| Event | Payload |
|-------|---------|
| `ProposalValidated` | `{ proposalId, valid, violations[], warnings[] }` |
| `ProposalAutoApproved` | `{ proposalId, reason }` |
| `ProposalImplementationStarted` | `{ proposalId }` |
| `ProposalImplementationFailed` | `{ proposalId, reason }` |
| `ApprovalDelegated` | `{ proposalId, fromLevel, toLevel, toAgentId }` |
| `ApprovalReminderSent` | `{ proposalId, hours }` |
| `ApprovalEscalated` | `{ proposalId, fromLevel, toLevel }` |
| `ApprovalStale` | `{ proposalId, daysPending }` |

### Budget

| Event | Payload |
|-------|---------|
| `BudgetAlertTriggered` | `{ projectId, entityId, entityType, level, threshold, currentUsage }` |
| `BudgetExceeded` | `{ projectId, entityId, entityType }` |

### Health

| Event | Payload |
|-------|---------|
| `OrgHealthCheckCompleted` | `{ projectId, overallHealth, metricCount, signalCount }` |

---

## 11. API Endpoints

New endpoints in the company-design service:

### Growth Engine

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/projects/:projectId/proposals` | Submit a proposal |
| `GET` | `/projects/:projectId/proposals` | List proposals (filterable by status, type) |
| `GET` | `/projects/:projectId/proposals/:proposalId` | Get proposal detail with evaluation |
| `PATCH` | `/projects/:projectId/proposals/:proposalId` | Update proposal (edit before approval) |
| `POST` | `/projects/:projectId/proposals/:proposalId/approve` | Approve a proposal |
| `POST` | `/projects/:projectId/proposals/:proposalId/reject` | Reject a proposal |
| `POST` | `/projects/:projectId/proposals/batch-approve` | Batch approve non-structural proposals |
| `POST` | `/projects/:projectId/proposals/:proposalId/implement` | Trigger implementation of approved proposal |

### Signals

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:projectId/growth-signals` | List active signals |
| `POST` | `/projects/:projectId/growth-signals/:signalId/acknowledge` | Acknowledge a signal |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:projectId/health` | Run health check and return report |
| `GET` | `/projects/:projectId/health/signals` | Alias for growth signals |

### Budget

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:projectId/budget` | Get current budget status |
| `GET` | `/projects/:projectId/budget/ledger` | Get budget ledger entries |

### Delegations

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/projects/:projectId/delegations` | Create a delegation |
| `GET` | `/projects/:projectId/delegations` | List active delegations |
| `DELETE` | `/projects/:projectId/delegations/:delegationId` | Revoke a delegation |

---

## 12. Constitution Extensions

LCP-007 adds the following to the `CompanyConstitution` aggregate:

### New Fields

```typescript
interface CompanyConstitutionProps {
  // ... existing fields from docs/33 §2 ...

  // NEW — delegation management
  delegations: DelegationRecord[]

  // NEW — budget enforcement mode
  budgetEnforcementMode: 'advisory' | 'mandatory'

  // NEW — health check schedule
  healthCheckIntervalHours: number | null  // null = on-demand only
}
```

### New DTOs

```typescript
interface DelegationRecordDto {
  id: string
  fromLevel: ApproverLevel
  toLevel: ApproverLevel
  toAgentId: string
  scope: ApprovalScope
  delegatedAt: string
  expiresAt: string | null
}

interface CreateDelegationDto {
  fromLevel: ApproverLevel
  toLevel: ApproverLevel
  toAgentId: string
  scope: ApprovalScope
  expiresAt?: string | null
}
```

### Updated Constitution DTO

```typescript
interface CompanyConstitutionDto {
  // ... existing fields ...
  delegations: DelegationRecordDto[]
  budgetEnforcementMode: 'advisory' | 'mandatory'
  healthCheckIntervalHours: number | null
}
```

---

## 13. Consistency with Existing Specs

| Spec | How this doc aligns |
|------|-------------------|
| docs/33 (domain model) | Uses Proposal (§12), Decision (§13), Constitution (§2) as defined. Adds `delegations`, `budgetEnforcementMode`, `healthCheckIntervalHours` to Constitution. |
| docs/35 (growth protocol) | Implements the conceptual rules as executable validation logic. All rules from docs/35 are formalized in §3.2 and §9. |
| docs/43-ceo-first-bootstrap (LCP-006) | Bootstrap proposals flow through the same growth engine. Phase overrides (§4.2) match bootstrap's "all-founder" requirement during seed phase. Default constants from LCP-006 are compatible with the validation rules here. |
| docs/42 (product language) | Uses "overlays" and "organizational unit" terminology consistently. |

---

## 14. Downstream Tasks

| Task | What it needs from this spec |
|------|------------------------------|
| LCP-008 | Runtime cost attribution to budget ledger, signal detection from runtime events |
| LCP-009 | Verticaler growth scenario — CEO proposes departments, approval flow, phase transitions |
| LCP-014 | **Implementation of this spec**: growth engine service, approval routing, budget validation, health checks, API endpoints |
| LCP-015 | Live mode surfaces health check results and budget alerts |

---

## 15. Acceptance Criteria

- [ ] Growth signal types are defined with detection rules and proposal mapping.
- [ ] Proposal evaluation pipeline validates against all constitution rules (depth, fanout, agents, expansion rules, budget, duplicates).
- [ ] Phase guards restrict actions by maturity phase.
- [ ] Approval routing derives from constitution + phase overrides.
- [ ] Delegation model allows controlled downward delegation with constraints.
- [ ] Approval timeout and escalation events are defined.
- [ ] Batch approval is supported for non-structural proposals.
- [ ] Implementation patterns are defined for all 10 proposal types.
- [ ] Context minimization computes minimal context packages for new entities.
- [ ] Budget enforcement validates at proposal time and tracks consumption at runtime.
- [ ] Health checker produces metrics for all organizational limits.
- [ ] Phase transition engine defines triggers, guards, and capability unlocks.
- [ ] API endpoints cover proposals, signals, health, budget, and delegations.
- [ ] Constitution extensions (delegations, budget enforcement mode, health interval) are documented with DTOs.
- [ ] Spec is consistent with docs/33, docs/35, docs/42, and docs/43-ceo-first-bootstrap.
