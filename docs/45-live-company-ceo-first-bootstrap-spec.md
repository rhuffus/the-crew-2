# CEO-First Bootstrap Spec

> Produced by LCP-006. Defines how a new Live Company project is created from a minimal seed and grows through a governed CEO-first conversation.

## Design Principles

1. **Minimal seed, maximal intent** — The user provides only name, mission, and company type. Everything else is discovered through conversation.
2. **CEO is the first and only agent** — No departments, teams, or specialists exist at creation. The CEO agent is the user's conversational counterpart.
3. **Structure emerges from need** — Departments are proposed by the CEO when conversation reveals a clear function. Nothing is pre-populated.
4. **Human governance always** — Every structural change requires user approval, at minimum for the `seed` and `formation` phases.
5. **Canvas reflects reality** — After bootstrap, the canvas shows exactly what exists: the company, the CEO, and whatever the user has approved.

---

## 1. Bootstrap UX Flow

### 1.1 Project Creation (Step 0)

User clicks "New Project" or equivalent entry point.

**Minimal creation form:**

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| Name | yes | — | Company name |
| Mission | yes | — | One-sentence mission statement |
| Company Type | yes | — | Dropdown or free text: `saas-startup`, `agency`, `consultancy`, `marketplace`, `internal-tool`, `custom` |
| Vision | no | `""` | Optional longer-term vision |
| Growth Pace | no | `moderate` | `conservative` / `moderate` / `aggressive` |
| Approval Level | no | `structural-only` | `all-changes` / `structural-only` / `budget-only` / `none` |

The form is intentionally short. The rest is discovered through conversation.

**What happens on submit:**

```
User submits form
  → API: CreateProject (platform service)
  → API: BootstrapCeoFirst (company-design service)
    → 1. Create ProjectSeed (phase: seed)
    → 2. Create CompanyConstitution (with defaults)
    → 3. Create Company UO (type: company, status: active)
    → 4. Create CEO Agent (type: coordinator, status: active)
  → Redirect to: /projects/$projectId/org (canvas L1)
  → Open Chat Dock with CEO bootstrap conversation
```

### 1.2 CEO Bootstrap Conversation (Step 1)

Once the project is created, the chat dock opens with the CEO agent's first message. The CEO drives the conversation.

**CEO's goals in the bootstrap conversation:**

1. Greet the user and confirm the mission
2. Explore what the company needs to do (functions, not departments)
3. Identify initial objectives
4. Identify restrictions or principles
5. Propose a first organizational structure (departments + coordinators)

**Conversation phases:**

| Phase | CEO behavior | User role | Exits when |
|-------|-------------|-----------|------------|
| Discovery | Asks about business model, customers, core functions, constraints | Answers questions, clarifies intent | CEO has enough context to propose structure |
| Refinement | Summarizes understanding, proposes mission/vision updates | Confirms or corrects | User approves the refined seed |
| Objectives | Proposes initial objectives and priorities | Approves, edits, or rejects objectives | At least 1 objective exists |
| Structure Proposal | Proposes first departments with rationale | Reviews and approves/rejects each | User has approved or rejected all proposals |
| Handoff | Summarizes what was created, explains next steps | Acknowledges | Phase transitions to `formation` |

**Key UX rules:**

- The CEO never creates structure without explicit user approval.
- Each proposal is presented as a card in the chat with Accept / Reject / Edit actions.
- The canvas updates in real-time as proposals are approved.
- The user can pause the conversation at any time and resume later.
- The user can also create structure manually via the canvas toolbar — this is not exclusive to the chat.

### 1.3 First Proposals (Step 2)

When the CEO proposes a department, the system creates a `Proposal` entity:

```
CEO proposes "Engineering Department"
  → Create Proposal {
      proposalType: 'create-department',
      title: 'Create Engineering Department',
      motivation: 'The company needs software development capabilities...',
      problemDetected: 'No team exists to build the core product',
      expectedBenefit: 'Dedicated engineering function with clear mandate',
      estimatedCost: '1 coordinator + context allocation',
      contextToAssign: 'Product requirements, tech stack, quality standards',
      proposedByAgentId: ceoAgentId,
      requiredApproval: 'founder',
      status: 'proposed'
    }
  → Chat displays proposal card with rationale
  → User clicks Accept
    → Proposal status → 'approved'
    → Create OrganizationalUnit { uoType: 'department', name: 'Engineering', parentUoId: companyUoId }
    → Create Agent { agentType: 'coordinator', name: 'VP Engineering', role: 'Department Executive', uoId: engineeringUoId }
    → Proposal status → 'implemented'
    → Canvas adds Department node + Executive node
```

**Proposal card UI (in chat):**

```
┌──────────────────────────────────────┐
│ 📋 Proposal: Create Engineering Dept │
│                                      │
│ Why: The company needs software      │
│ development capabilities to build    │
│ the core product.                    │
│                                      │
│ What: A new Engineering department   │
│ led by a VP Engineering coordinator  │
│ responsible for product development. │
│                                      │
│ Mandate: Build, test, and ship the   │
│ core product.                        │
│                                      │
│ Cost: 1 coordinator agent            │
│                                      │
│ [Accept]  [Edit]  [Reject]           │
└──────────────────────────────────────┘
```

### 1.4 Post-Bootstrap State (Step 3)

After the bootstrap conversation concludes, the project looks like:

```
Company "Acme Corp"                    (UO, active)
├── CEO                                (Coordinator Agent, active)
├── Engineering Department             (UO, active — if approved)
│   └── VP Engineering                 (Coordinator Agent, active)
├── Product Department                 (UO, active — if approved)
│   └── Head of Product                (Coordinator Agent, active)
└── ... (only what user approved)

Objectives:
├── "Launch MVP by Q3"                 (active, owned by CEO)
└── "Achieve product-market fit"       (active, owned by CEO)

Constitution:
└── Default rules from founder preferences
```

The canvas at L1 shows exactly this structure — no more, no less.

---

## 2. Backend Orchestration

### 2.1 BootstrapService (new)

The new bootstrap service replaces the current Verticaler-specific `BootstrapService`. The old one seeds a pre-defined company; the new one creates a minimal seed.

**Module:** `services/company-design/src/bootstrap/`

```typescript
interface BootstrapInput {
  projectId: string
  name: string
  mission: string
  companyType: string
  vision?: string
  founderPreferences?: Partial<FounderPreferencesProps>
}

interface BootstrapResult {
  projectSeedId: string
  constitutionId: string
  companyUoId: string
  ceoAgentId: string
}
```

**Orchestration steps:**

```
BootstrapCeoFirst(input: BootstrapInput): BootstrapResult
  1. Validate: project exists in platform service, no seed exists yet
  2. Create ProjectSeed
     - name: input.name
     - mission: input.mission
     - companyType: input.companyType
     - vision: input.vision || ''
     - maturityPhase: 'seed'
     - founderPreferences: merge(DEFAULT_PREFERENCES, input.founderPreferences)
     - aiBudget: DEFAULT_AI_BUDGET
     → emit ProjectSeedCreated
  3. Create CompanyConstitution
     - operationalPrinciples: [input.mission]
     - autonomyLimits: DEFAULT_AUTONOMY_LIMITS
     - budgetConfig: DEFAULT_BUDGET_CONFIG
     - approvalCriteria: DEFAULT_APPROVAL_CRITERIA(input.founderPreferences.approvalLevel)
     - expansionRules: DEFAULT_EXPANSION_RULES
     → emit ConstitutionCreated
  4. Create Company UO
     - uoType: 'company'
     - name: input.name
     - mandate: input.mission
     - purpose: input.mission
     - parentUoId: null
     - status: 'active'
     → emit OrganizationalUnitCreated
  5. Create CEO Agent
     - agentType: 'coordinator'
     - name: 'CEO'
     - role: 'Chief Executive Officer'
     - uoId: companyUo.id
     - responsibilities: ['Refine company vision', 'Propose organizational structure', 'Define strategic objectives', 'Govern company growth']
     - skills: [{ name: 'Strategic Planning', category: 'leadership' }, { name: 'Organization Design', category: 'leadership' }, { name: 'Stakeholder Communication', category: 'communication' }]
     - status: 'active'
     → emit AgentCreated
  6. Return { projectSeedId, constitutionId, companyUoId, ceoAgentId }
```

### 2.2 Default Constants

```typescript
const DEFAULT_PREFERENCES: FounderPreferencesProps = {
  approvalLevel: 'structural-only',
  communicationStyle: 'detailed',
  growthPace: 'moderate',
}

const DEFAULT_AI_BUDGET: AiBudgetProps = {
  maxMonthlyTokens: null,        // unlimited during seed
  maxConcurrentAgents: 5,
  costAlertThreshold: null,
}

const DEFAULT_AUTONOMY_LIMITS: AutonomyLimitsProps = {
  maxDepth: 4,
  maxFanOut: 10,
  maxAgentsPerTeam: 8,
  coordinatorToSpecialistRatio: 0.25,
}

const DEFAULT_BUDGET_CONFIG: BudgetConfigProps = {
  globalBudget: null,
  perUoBudget: null,
  perAgentBudget: null,
  alertThresholds: [50, 80, 95],
}

const DEFAULT_APPROVAL_CRITERIA: ApprovalCriterionProps[] = [
  { scope: 'create-department', requiredApprover: 'founder', requiresJustification: true },
  { scope: 'create-team', requiredApprover: 'founder', requiresJustification: true },
  { scope: 'create-specialist', requiredApprover: 'ceo', requiresJustification: true },
  { scope: 'retire-unit', requiredApprover: 'founder', requiresJustification: true },
  { scope: 'revise-contract', requiredApprover: 'ceo', requiresJustification: false },
  { scope: 'revise-workflow', requiredApprover: 'ceo', requiresJustification: false },
  { scope: 'update-constitution', requiredApprover: 'founder', requiresJustification: true },
]

const DEFAULT_EXPANSION_RULES: ExpansionRuleProps[] = [
  {
    targetType: 'department',
    conditions: ['Sustained strategic function identified', 'Clear mandate and owner'],
    requiresBudget: false,
    requiresOwner: true,
  },
  {
    targetType: 'team',
    conditions: ['Department has differentiated recurring work', 'Team lead identified'],
    requiresBudget: false,
    requiresOwner: true,
  },
  {
    targetType: 'specialist',
    conditions: ['Repeatable specialized function', 'Active workflow requires it'],
    requiresBudget: false,
    requiresOwner: true,
  },
]
```

### 2.3 API Endpoints

**New endpoints in company-design service:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/projects/:projectId/bootstrap` | Execute CEO-first bootstrap |
| `GET` | `/projects/:projectId/bootstrap/status` | Get bootstrap status (seed phase, CEO agent id, etc.) |

**Request body for POST bootstrap:**

```typescript
{
  name: string
  mission: string
  companyType: string
  vision?: string
  growthPace?: 'conservative' | 'moderate' | 'aggressive'
  approvalLevel?: 'all-changes' | 'structural-only' | 'budget-only' | 'none'
}
```

**Response:**

```typescript
{
  projectSeedId: string
  constitutionId: string
  companyUoId: string
  ceoAgentId: string
  maturityPhase: 'seed'
  nextStep: 'bootstrap-conversation'
}
```

### 2.4 Domain Events Sequence

```
1. ProjectSeedCreated
2. ConstitutionCreated
3. OrganizationalUnitCreated (company)
4. AgentCreated (CEO)
— bootstrap conversation begins —
5. ProjectSeedUpdated (mission/vision refined)          — if user edits
6. ObjectiveCreated (per objective approved)             — 0..n
7. ProposalCreated (per department proposed by CEO)      — 0..n
8. ProposalApproved / ProposalRejected                   — per proposal
9. OrganizationalUnitCreated (department)                — per approved proposal
10. AgentCreated (department executive)                  — per approved proposal
11. MaturityPhaseAdvanced { from: 'seed', to: 'formation' } — when first dept approved
```

---

## 3. CEO Agent Conversation Protocol

### 3.1 CEO System Prompt Template

The CEO agent's system prompt is generated dynamically from the project seed:

```
You are the CEO of {{company.name}}.

Mission: {{seed.mission}}
Vision: {{seed.vision || 'Not yet defined'}}
Company Type: {{seed.companyType}}
Growth Pace: {{preferences.growthPace}}

Your role in this conversation:
1. Help the founder refine the company's mission, vision, and key principles.
2. Understand what the company needs to achieve (objectives).
3. Propose an initial organizational structure (departments) when you have enough context.
4. Each proposal must include: name, mandate, purpose, rationale, and coordinator role.
5. Never create structure without the founder's explicit approval.
6. Ask focused questions — avoid overwhelming the founder with too many topics at once.
7. When you have enough context, summarize your understanding before proposing.

Current state:
- Phase: {{seed.maturityPhase}}
- Existing UOs: {{uos.map(u => u.name).join(', ') || 'None (just the company)'}}
- Existing Objectives: {{objectives.map(o => o.title).join(', ') || 'None yet'}}
- Constitution principles: {{constitution.operationalPrinciples.join(', ')}}
```

### 3.2 Conversation State Machine

```
GREETING
  → CEO introduces itself, confirms mission
  → transition: user responds

DISCOVERY
  → CEO asks about: core functions, customers, market, constraints
  → iterates until CEO has enough context (3-5 exchanges typically)
  → transition: CEO says "I think I understand enough to suggest some structure"

REFINEMENT
  → CEO summarizes understanding
  → proposes mission/vision updates if needed
  → user confirms or corrects
  → transition: user confirms understanding

OBJECTIVES
  → CEO proposes initial objectives (1-3)
  → each objective presented as a proposal card
  → user approves/rejects/edits
  → transition: at least 1 objective approved

STRUCTURE_PROPOSAL
  → CEO proposes departments one at a time
  → each department is a formal Proposal entity
  → user reviews each: accept / edit / reject
  → after each approval, canvas updates
  → transition: CEO has no more proposals or user says "enough for now"

HANDOFF
  → CEO summarizes what was created
  → explains next steps: "You can now drill into each department, add teams, create workflows..."
  → conversation remains available for ongoing CEO interaction
  → transition: implicit (conversation stays open)
```

### 3.3 Tool Calls Available to CEO

During the bootstrap conversation, the CEO agent has access to these tools (via function calling):

| Tool | Description | Creates |
|------|-------------|---------|
| `refine_seed` | Update mission, vision, or principles | ProjectSeedUpdated event |
| `propose_objective` | Propose a new objective | ObjectiveCreated (after approval) |
| `propose_department` | Propose a new department with coordinator | ProposalCreated → approval flow |
| `summarize_state` | Produce a summary of current company state | (read-only) |

The CEO does NOT have tools to directly create entities. It proposes, and the system creates entities only after user approval.

---

## 4. Phase Transition Rules

### 4.1 Maturity Phase Transitions

| From | To | Trigger | Automatic? |
|------|-----|---------|------------|
| `seed` | `formation` | First department approved and created | Yes |
| `formation` | `structured` | First team created within a department | Yes |
| `structured` | `operating` | First workflow executed (runtime) | Yes |
| `operating` | `scaling` | Manual — user/CEO decides | No |
| `scaling` | `optimizing` | Manual — user/CEO decides | No |

### 4.2 Phase Transition Effects

**seed → formation:**
- Unlocks: team creation proposals by department executives
- Constitution gets default team-level approval rules
- Canvas can show L2 drill-in
- CEO communication shifts from "let's discover" to "let's organize"

**formation → structured:**
- Unlocks: specialist creation proposals by team leads
- Workflows can be created and linked to objectives
- Contracts become relevant
- Canvas can show L3 drill-in

**structured → operating:**
- Unlocks: Live Mode toggle
- Runtime executions can be created
- Budget tracking activates
- Full canvas navigation available

### 4.3 Phase Guards

- Phase transitions are forward-only (enforced by domain invariant).
- A phase cannot advance if the trigger condition is not met.
- The system emits `MaturityPhaseAdvanced` event on transition.
- Phase information is visible in the project header and inspector.

---

## 5. Canvas State During Bootstrap

### 5.1 Immediately After Project Creation

Canvas at L1 shows:

```
┌─────────────────────────────┐
│     Company "Acme Corp"     │
│                             │
│        ┌─────────┐          │
│        │   CEO   │          │
│        └─────────┘          │
│                             │
│  Phase: Seed                │
│  "Start a conversation      │
│   with your CEO →"          │
└─────────────────────────────┘
```

- Single company node with CEO inside.
- Empty state message encouraging the user to open the chat.
- Phase badge on the company node.

### 5.2 After First Department Approved

```
┌─────────────────────────────────────────────┐
│            Company "Acme Corp"              │
│                                             │
│   ┌─────────┐                               │
│   │   CEO   │                               │
│   └────┬────┘                               │
│        │ reports_to                          │
│   ┌────┴────────────────┐                   │
│   │   Engineering Dept  │                   │
│   │  ┌──────────────┐   │                   │
│   │  │VP Engineering│   │                   │
│   │  └──────────────┘   │                   │
│   └─────────────────────┘                   │
│                                             │
│  Phase: Formation                           │
└─────────────────────────────────────────────┘
```

- New department node appears inside the company.
- Executive coordinator appears inside the department.
- Phase badge updates to `Formation`.
- Structural edges appear.

### 5.3 Canvas Animation

When a proposal is approved in the chat:
1. New node fades in on the canvas (300ms animation).
2. Edges animate from source to target.
3. Layout auto-adjusts to accommodate the new node.
4. A subtle notification appears: "Engineering Department created".

---

## 6. Integration Points

### 6.1 With Proposal System (docs/35, §12 of docs/33)

- Bootstrap proposals use the standard `Proposal` entity.
- During seed phase, `requiredApproval` is always `'founder'` regardless of constitution settings.
- This ensures the user explicitly approves everything during initial setup.
- Post-bootstrap, approval follows constitution rules.

### 6.2 With Visual Graph (canvas)

- Each approved entity is immediately reflected in the visual graph.
- The visual graph service returns scoped data for the current navigation level.
- Bootstrap entities are standard domain entities — no special "bootstrap" flag.
- The canvas does not distinguish between entities created via bootstrap vs. created later.

### 6.3 With Chat Dock

- The CEO bootstrap conversation lives in the existing chat dock system.
- It is a persistent, contextual chat anchored to the project.
- The chat message history is preserved and resumable.
- Proposal cards are special message types rendered inline in the chat.

### 6.4 With Inspector

- Selecting the CEO node shows the CEO agent's properties.
- Selecting the company node shows the project seed + constitution.
- Selecting a department shows its mandate, purpose, and coordinator.
- All standard inspector behavior applies.

---

## 7. Edge Cases and Constraints

### 7.1 User Skips the Conversation

The user is free to:
- Close the chat dock immediately.
- Create departments manually via the toolbar.
- Come back to the CEO conversation later.

The project remains in `seed` phase until the first department is created (by any means).

### 7.2 User Creates Structure Manually

If the user creates a department via the canvas toolbar instead of through the CEO conversation:
- A `Proposal` is still created (auto-approved by the founder).
- The CEO agent is notified (its context is updated).
- Phase transition rules apply normally.

### 7.3 Empty Project

A project with only a seed + CEO is valid indefinitely. There is no timeout or forced progression.

### 7.4 Multiple Bootstrap Attempts

- Bootstrap can only be called once per project (idempotent — if seed exists, return existing IDs).
- The CEO conversation can be resumed at any time.

### 7.5 Deleting the CEO

- The CEO agent cannot be deleted or deactivated during `seed` or `formation` phases.
- From `structured` phase onwards, the CEO could theoretically be replaced (but this is out of scope for bootstrap).

### 7.6 Constitution Edits During Bootstrap

- The user can edit the constitution at any time via the inspector.
- Changes take effect immediately for future proposals.
- Already-approved proposals are not retroactively affected.

---

## 8. Migration from Current Bootstrap

### 8.1 Current State

The existing `BootstrapService` in `services/company-design/src/bootstrap/` hardcodes the Verticaler company with all departments, capabilities, roles, skills, archetypes, assignments, contracts, workflows, policies, and artifacts pre-populated.

### 8.2 Migration Path

1. **LCP-006** (this task): Design the CEO-first bootstrap (this document).
2. **LCP-011**: Introduce bridge types. The new `BootstrapService` coexists with the old one.
3. **LCP-013**: Implement the new bootstrap. The old `BootstrapService` is preserved but only used for legacy Verticaler seeding.
4. **LCP-016**: Convert Verticaler to use CEO-first bootstrap. The old `BootstrapService` is deprecated.

During the bridge phase:
- New projects use CEO-first bootstrap → creates new domain entities.
- Verticaler continues using old bootstrap → creates old domain entities.
- Both coexist without interference.

### 8.3 Old BootstrapService Disposition

| Current file | Action | When |
|-------------|--------|------|
| `bootstrap.service.ts` | Rename to `legacy-bootstrap.service.ts` | LCP-013 |
| `verticaler-seed.ts` | Keep as reference | LCP-013 |
| `bootstrap.module.ts` | Split into `legacy-bootstrap.module.ts` + new `bootstrap.module.ts` | LCP-013 |

---

## 9. Acceptance Criteria

- [ ] Bootstrap creates exactly 4 entities: ProjectSeed, CompanyConstitution, Company UO, CEO Agent.
- [ ] No departments, teams, or specialists exist after initial bootstrap.
- [ ] CEO agent has a well-defined system prompt generated from the seed.
- [ ] The conversation protocol covers: discovery, refinement, objectives, structure proposal, handoff.
- [ ] Every structural change during bootstrap goes through a Proposal entity.
- [ ] Proposals require founder approval during seed phase.
- [ ] Phase transitions are automatic: seed→formation on first department, formation→structured on first team.
- [ ] The canvas updates in real-time as proposals are approved.
- [ ] The user can skip the conversation and create structure manually.
- [ ] Bootstrap is idempotent — calling it twice returns existing IDs.
- [ ] The spec is consistent with docs/33 (domain model), docs/34 (canvas v3), docs/35 (growth protocol), and docs/42 (product language).
- [ ] Migration path from old bootstrap is documented and non-breaking.

---

## 10. Downstream Tasks

| Task | What it needs from this spec |
|------|------------------------------|
| LCP-007 | Proposal approval model, phase transition rules, constitution defaults |
| LCP-009 | Verticaler bootstrap conversion — CEO-first instead of pre-populated |
| LCP-013 | Implementation of this spec: new BootstrapService, API endpoints, conversation protocol |
| LCP-016 | Verticaler as live demo using this bootstrap flow |
