# Verticaler — Live Company Reference

> Rewritten by **LCP-009**. Supersedes the pre-pivot v1 baseline.
> Verticaler is now a **living company** that demonstrates CEO-first bootstrap, incremental growth, design + live modes.

## 1. Purpose

Verticaler is the canonical reference company of TheCrew. It is not optional demo data — it is the living proof that the platform works end-to-end.

Verticaler must fulfill four functions simultaneously:

### 1.1 Demo company
An empty TheCrew instance starts with a Verticaler project. A new user can explore a real company immediately.

### 1.2 Validation company
Verticaler exercises all canvas views, navigation levels, inspector tabs, overlays, and mode toggles. If Verticaler doesn't work, the product doesn't work.

### 1.3 Regression company
When a feature changes, Verticaler is updated to reflect it. It serves as the canonical manual and automated test reference.

### 1.4 Documentation company
Product documentation describes Verticaler, not an imaginary company. Screenshots, examples, and tutorials use Verticaler data.

### 1.5 What changed in the pivot
Verticaler is no longer a fully pre-populated seed. It is created via `CeoFirstBootstrapService` and grows through a replayed growth story — proposals pre-approved, phase transitions triggered, runtime events simulated.

This document must stay synchronized with:

- `docs/33-live-company-domain-model.md` (domain model)
- `docs/34-live-company-canvas-v3-spec.md` (canvas v3)
- `docs/42-live-company-product-language-spec.md` (product language)
- `docs/45-live-company-ceo-first-bootstrap-spec.md` (bootstrap flow)
- `docs/43-canvas-v3-implementation-plan.md` (visual grammar)
- `docs/44-live-company-growth-engine-spec.md` (growth engine)
- `docs/46-live-company-runtime-implementation-plan.md` (runtime/live mode)

---

## 2. Identity

### 2.1 Company

| Field | Value |
|-------|-------|
| Name | Verticaler |
| Mission | Build the operating system for elevator companies, connecting maintenance, incidents, inspections, technicians, contracts, and billing in a single platform. |
| Vision | Every elevator company in Spain operates with full traceability, zero paperwork, and real-time visibility — powered by Verticaler. |
| Company Type | `saas-startup` |
| Scope | Spain first, multi-region later |

### 2.2 Product domain

Verticaler's product helps elevator companies manage:

- Clients and contracts
- Elevator asset registry
- Preventive maintenance scheduling
- Inspections and regulatory compliance
- Incidents and field dispatch
- Technician work orders
- Billing, renewals, and invoicing
- Document retention and audit trails

### 2.3 Principles

1. Complete traceability — every action is auditable
2. Operations first — field work is the core loop
3. Contractual clarity — every handoff has a contract
4. Compliance visible — regulatory state is never hidden
5. Automation with oversight — AI assists, humans govern
6. Visual-first — understand the company by looking at it

---

## 3. Project Seed

Created by `CeoFirstBootstrapService` with:

```typescript
ProjectSeed {
  projectId: 'verticaler',
  name: 'Verticaler',
  description: 'SaaS platform for elevator company operations',
  mission: 'Build the operating system for elevator companies...',
  vision: 'Every elevator company in Spain operates with full traceability...',
  companyType: 'saas-startup',
  restrictions: ['Spain-first regulatory scope', 'B2B only', 'No consumer-facing features'],
  principles: [
    'Complete traceability',
    'Operations first',
    'Contractual clarity',
    'Compliance visible',
    'Automation with oversight',
    'Visual-first'
  ],
  aiBudget: {
    maxMonthlyTokens: null,
    maxConcurrentAgents: 10,
    costAlertThreshold: 500
  },
  initialObjectives: [
    'Launch MVP',
    'First customer onboarded',
    'Pass regulatory audit'
  ],
  founderPreferences: {
    approvalLevel: 'structural-only',
    communicationStyle: 'detailed',
    growthPace: 'moderate'
  },
  maturityPhase: 'seed'  // advances through growth story
}
```

### Company Constitution

```typescript
CompanyConstitution {
  projectId: 'verticaler',
  operationalPrinciples: [
    'Build the operating system for elevator companies',
    'Traceability in every workflow',
    'Operations drive product priorities',
    'Clear contracts between departments'
  ],
  autonomyLimits: {
    maxDepth: 4,
    maxFanOut: 8,
    maxAgentsPerTeam: 6,
    coordinatorToSpecialistRatio: 0.25
  },
  budgetConfig: {
    globalBudget: 2000,
    perUoBudget: 500,
    perAgentBudget: 100,
    alertThresholds: [50, 80, 95]
  },
  approvalCriteria: [
    { scope: 'create-department', requiredApprover: 'founder', requiresJustification: true },
    { scope: 'create-team', requiredApprover: 'founder', requiresJustification: true },
    { scope: 'create-specialist', requiredApprover: 'ceo', requiresJustification: true },
    { scope: 'retire-unit', requiredApprover: 'founder', requiresJustification: true },
    { scope: 'revise-contract', requiredApprover: 'ceo', requiresJustification: false },
    { scope: 'revise-workflow', requiredApprover: 'ceo', requiresJustification: false },
    { scope: 'update-constitution', requiredApprover: 'founder', requiresJustification: true }
  ],
  namingConventions: ['PascalCase for departments', 'Title Case for agents'],
  expansionRules: [
    { targetType: 'department', conditions: ['Sustained strategic function identified', 'Clear mandate and owner'], requiresBudget: false, requiresOwner: true },
    { targetType: 'team', conditions: ['Department has differentiated recurring work', 'Team lead identified'], requiresBudget: false, requiresOwner: true },
    { targetType: 'specialist', conditions: ['Repeatable specialized function', 'Active workflow requires it'], requiresBudget: false, requiresOwner: true }
  ],
  contextMinimizationPolicy: 'Need-to-know basis. Agents see only their UO subtree and explicitly linked entities.',
  qualityRules: ['All features must pass QA before release', 'Code review mandatory'],
  deliveryRules: ['Sprint-based delivery', 'Release approval policy enforced']
}
```

---

## 4. CEO Bootstrap Narrative

This section shows the conversation between the CEO agent and the founder (user) when Verticaler is created.

### Step 0: Project creation

The founder creates the project with:
- Name: `Verticaler`
- Mission: "Build the operating system for elevator companies..."
- Company Type: `saas-startup`

System creates: ProjectSeed + CompanyConstitution + Company UO + CEO Agent.

**Canvas shows:** Company node with CEO inside. Phase: Seed.

### Step 1: CEO greeting

> **CEO:** Welcome to Verticaler. I'm your CEO agent. I understand our mission is to build the operating system for elevator companies. Let me ask a few questions to understand what we need to build and how to organize the company.

### Step 2: Discovery

> **CEO:** What are the core functions Verticaler needs to perform? Who are our customers, and what does their daily work look like?

> **Founder:** Elevator maintenance companies. They manage technicians, contracts, inspections, and incidents. The product needs to handle field dispatch, work orders, regulatory compliance, billing, and customer communication.

> **CEO:** That's clear. I see several distinct operational areas:
> 1. Product development (building the SaaS platform)
> 2. Engineering (implementing and shipping the software)
> 3. Operations (field dispatch, maintenance, incident handling)
> 4. Customer Success (onboarding, support, retention)
> 5. Compliance (inspections, regulatory, audits)
>
> Are there any constraints I should know about?

> **Founder:** Spain-first for regulatory scope. B2B only. And we need to be able to pass a regulatory audit within 6 months.

### Step 3: Objectives

> **CEO:** Based on our conversation, I'd like to propose three initial objectives.

CEO proposes:

1. **"Launch MVP"** — Ship the first version covering maintenance contracts, work orders, and basic billing. Priority: critical.
2. **"First customer onboarded"** — Complete end-to-end onboarding of one elevator company. Priority: high.
3. **"Pass regulatory audit"** — Achieve compliance certification for inspection management. Priority: high.

Founder approves all three.

### Step 4: First structure proposals

> **CEO:** Now I have enough context to propose our initial organizational structure. I'll propose departments one at a time.

**Proposal 1: Engineering Department**

```
Title: Create Engineering Department
Motivation: The company needs software development capabilities to build the core SaaS product.
Problem detected: No team exists to build the product.
Expected benefit: Dedicated engineering function with clear mandate.
Estimated cost: 1 coordinator agent
```

Founder approves. → Engineering Department + VP Engineering created.
→ **Phase transition: seed → formation**

**Proposal 2: Product Department**

```
Title: Create Product Department
Motivation: Product direction needs to be defined independently from engineering execution.
Problem detected: No function owns product discovery, requirements, or prioritization.
Expected benefit: Clear product ownership and roadmap governance.
Estimated cost: 1 coordinator agent
```

Founder approves. → Product Department + Head of Product created.

**Proposal 3: Operations Department**

```
Title: Create Operations Department
Motivation: Field operations (dispatch, maintenance, incident management) is the core domain of Verticaler's customers.
Problem detected: No function models the operational domain we're building for.
Expected benefit: Operations expertise drives product requirements. Also handles internal ops tooling.
Estimated cost: 1 coordinator agent
```

Founder approves. → Operations Department + VP Operations created.

**Proposal 4: Customer Success Department**

```
Title: Create Customer Success Department
Motivation: Onboarding and retaining elevator companies requires dedicated support and relationship management.
Problem detected: No function owns customer onboarding (objective: "First customer onboarded").
Expected benefit: Customer lifecycle management from first contact to renewal.
Estimated cost: 1 coordinator agent
```

Founder approves. → Customer Success Department + CS Lead created.

**Proposal 5: Compliance Department**

```
Title: Create Compliance Department
Motivation: Regulatory compliance is a first-class concern for elevator companies. The "Pass regulatory audit" objective requires dedicated ownership.
Problem detected: No function owns compliance, inspection standards, or audit readiness.
Expected benefit: Regulatory expertise and compliance evidence management.
Estimated cost: 1 coordinator agent
```

Founder approves. → Compliance Department + Compliance Manager created.

### Step 5: Handoff

> **CEO:** We now have 5 departments, each with a coordinator. The company is in the Formation phase. Next steps:
> - Each department executive can propose teams when they identify differentiated work areas.
> - You can drill into any department to see its structure and start adding teams.
> - Workflows can be created to connect departments.

---

## 5. Growth Story (Phase Transitions)

### Phase 1: Seed (only CEO + Company UO)

**State:** Company UO + CEO Agent. Nothing else.

### Phase 2: Formation (first departments approved)

After the bootstrap conversation, the company has:

| UO | Type | Coordinator |
|----|------|-------------|
| Verticaler | company | CEO |
| Engineering | department | VP Engineering |
| Product | department | Head of Product |
| Operations | department | VP Operations |
| Customer Success | department | CS Lead |
| Compliance | department | Compliance Manager |

**Unlocked:** Team creation, workflow creation, specialist proposals.

### Phase 3: Structured (first teams created)

Department executives propose teams:

**VP Engineering proposes:**

| Proposal | Team | Lead | Parent |
|----------|------|------|--------|
| "Platform team needed for infrastructure" | Platform Team | Platform Lead | Engineering |
| "Backend team for core domain services" | Backend Team | Backend Lead | Engineering |
| "QA function is critical for release confidence" | QA Team | QA Lead | Engineering |

**VP Operations proposes:**

| Proposal | Team | Lead | Parent |
|----------|------|------|--------|
| "Dispatch coordination needs dedicated team" | Dispatch Team | Dispatch Coordinator | Operations |
| "Field service management is distinct from dispatch" | Field Service Team | Field Service Lead | Operations |

**Head of Product proposes:**

| Proposal | Team | Lead | Parent |
|----------|------|------|--------|
| "Product discovery needs research and analytics" | Discovery Team | Discovery Lead | Product |

All approved by founder. → **Phase transition: formation → structured**

**Unlocked:** Contracts, split/merge, delegation.

**Team leads propose specialists:**

| Team | Specialist Agents |
|------|-------------------|
| Platform Team | Infrastructure Engineer, DevOps Specialist |
| Backend Team | Domain Engineer, API Specialist |
| QA Team | Test Automation Specialist, Manual QA Specialist |
| Dispatch Team | Dispatch Analyst, Schedule Optimizer |
| Field Service Team | Field Operations Agent |
| Discovery Team | Product Analyst, UX Researcher |
| Customer Success | (direct to dept) Support Agent, Onboarding Specialist |
| Compliance | (direct to dept) Audit Analyst, Inspection Specialist |

### Phase 4: Operating (first workflow execution)

After the first workflow runs to completion → **Phase transition: structured → operating**

**Unlocked:** Live Mode toggle, runtime executions, budget tracking, full canvas navigation.

---

## 6. Organizational Structure

### 6.1 Full UO Hierarchy

```
Verticaler (company)
├── CEO (coordinator-agent)
│
├── Engineering (department)
│   ├── VP Engineering (coordinator-agent)
│   ├── Platform Team (team)
│   │   ├── Platform Lead (coordinator-agent)
│   │   ├── Infrastructure Engineer (specialist-agent)
│   │   └── DevOps Specialist (specialist-agent)
│   ├── Backend Team (team)
│   │   ├── Backend Lead (coordinator-agent)
│   │   ├── Domain Engineer (specialist-agent)
│   │   └── API Specialist (specialist-agent)
│   └── QA Team (team)
│       ├── QA Lead (coordinator-agent)
│       ├── Test Automation Specialist (specialist-agent)
│       └── Manual QA Specialist (specialist-agent)
│
├── Product (department)
│   ├── Head of Product (coordinator-agent)
│   └── Discovery Team (team)
│       ├── Discovery Lead (coordinator-agent)
│       ├── Product Analyst (specialist-agent)
│       └── UX Researcher (specialist-agent)
│
├── Operations (department)
│   ├── VP Operations (coordinator-agent)
│   ├── Dispatch Team (team)
│   │   ├── Dispatch Coordinator (coordinator-agent)
│   │   ├── Dispatch Analyst (specialist-agent)
│   │   └── Schedule Optimizer (specialist-agent)
│   └── Field Service Team (team)
│       ├── Field Service Lead (coordinator-agent)
│       └── Field Operations Agent (specialist-agent)
│
├── Customer Success (department)
│   ├── CS Lead (coordinator-agent)
│   ├── Support Agent (specialist-agent)
│   └── Onboarding Specialist (specialist-agent)
│
└── Compliance (department)
    ├── Compliance Manager (coordinator-agent)
    ├── Audit Analyst (specialist-agent)
    └── Inspection Specialist (specialist-agent)
```

### 6.2 Agent Summary

| # | Agent | Type | UO | Role |
|---|-------|------|----|------|
| 1 | CEO | coordinator | Verticaler | Chief Executive Officer |
| 2 | VP Engineering | coordinator | Engineering | Department Executive |
| 3 | Head of Product | coordinator | Product | Department Executive |
| 4 | VP Operations | coordinator | Operations | Department Executive |
| 5 | CS Lead | coordinator | Customer Success | Department Executive |
| 6 | Compliance Manager | coordinator | Compliance | Department Executive |
| 7 | Platform Lead | coordinator | Platform Team | Team Lead |
| 8 | Backend Lead | coordinator | Backend Team | Team Lead |
| 9 | QA Lead | coordinator | QA Team | Team Lead |
| 10 | Discovery Lead | coordinator | Discovery Team | Team Lead |
| 11 | Dispatch Coordinator | coordinator | Dispatch Team | Team Lead |
| 12 | Field Service Lead | coordinator | Field Service Team | Team Lead |
| 13 | Infrastructure Engineer | specialist | Platform Team | Infrastructure & Cloud |
| 14 | DevOps Specialist | specialist | Platform Team | CI/CD & Deployment |
| 15 | Domain Engineer | specialist | Backend Team | Domain Logic & DDD |
| 16 | API Specialist | specialist | Backend Team | API Design & Integration |
| 17 | Test Automation Specialist | specialist | QA Team | Automated Testing |
| 18 | Manual QA Specialist | specialist | QA Team | Exploratory & Manual QA |
| 19 | Product Analyst | specialist | Discovery Team | Market & Data Analysis |
| 20 | UX Researcher | specialist | Discovery Team | User Research & Prototyping |
| 21 | Dispatch Analyst | specialist | Dispatch Team | Dispatch Planning & Analysis |
| 22 | Schedule Optimizer | specialist | Dispatch Team | Route & Schedule Optimization |
| 23 | Field Operations Agent | specialist | Field Service Team | Field Execution & Reporting |
| 24 | Support Agent | specialist | Customer Success | Customer Support |
| 25 | Onboarding Specialist | specialist | Customer Success | Customer Onboarding |
| 26 | Audit Analyst | specialist | Compliance | Audit & Evidence Collection |
| 27 | Inspection Specialist | specialist | Compliance | Inspection Standards |

**Total: 27 agents** (12 coordinators + 15 specialists)

### 6.3 Agent Detail Examples

**CEO Agent:**
```typescript
Agent {
  name: 'CEO',
  agentType: 'coordinator',
  role: 'Chief Executive Officer',
  uoId: companyUoId,
  skills: [
    { name: 'Strategic Planning', category: 'leadership', description: 'Define company direction and priorities' },
    { name: 'Organization Design', category: 'leadership', description: 'Structure the company for effectiveness' },
    { name: 'Stakeholder Communication', category: 'communication', description: 'Communicate with founders and external parties' }
  ],
  responsibilities: ['Define company vision', 'Propose organizational structure', 'Govern company growth', 'Set strategic objectives'],
  inputs: ['Founder directives', 'Market signals', 'Department reports'],
  outputs: ['Strategic decisions', 'Structural proposals', 'Objective definitions']
}
```

**Domain Engineer (specialist):**
```typescript
Agent {
  name: 'Domain Engineer',
  agentType: 'specialist',
  role: 'Domain Logic & DDD',
  uoId: backendTeamUoId,
  skills: [
    { name: 'Domain Modeling', category: 'engineering', description: 'Design aggregates, entities, value objects' },
    { name: 'TypeScript', category: 'coding', description: 'Implement domain in TypeScript/NestJS' },
    { name: 'Code Review', category: 'quality', description: 'Review pull requests for domain correctness' }
  ],
  responsibilities: ['Implement core domain aggregates', 'Ensure DDD patterns are followed'],
  inputs: ['Tech specs', 'PRDs', 'Domain model docs'],
  outputs: ['Domain code', 'Code reviews', 'Technical documentation']
}
```

---

## 7. Objectives

### 7.1 Strategic Objectives

| ID | Title | Priority | Owner UO | Owner Agent | Status | Key Results |
|----|-------|----------|----------|-------------|--------|-------------|
| obj-1 | Launch MVP | critical | Verticaler | CEO | active | Ship maintenance contracts module; Ship work orders module; Ship basic billing; Deploy to staging |
| obj-2 | First customer onboarded | high | Customer Success | CS Lead | active | Identify pilot customer; Complete onboarding flow; Customer uses platform for 30 days |
| obj-3 | Pass regulatory audit | high | Compliance | Compliance Manager | active | Map regulatory requirements; Implement inspection evidence trail; Complete audit preparation |

### 7.2 Linked Workflows

| Objective | Linked Workflows |
|-----------|-----------------|
| Launch MVP | Product Delivery, Inspection & Compliance |
| First customer onboarded | Maintenance Contract Lifecycle |
| Pass regulatory audit | Inspection & Compliance |

---

## 8. Workflows

### 8.1 Product Delivery

```typescript
Workflow {
  name: 'Product Delivery',
  workflowType: 'strategic',
  ownerUoId: engineeringDeptId,
  triggerDescription: 'New product initiative approved by Head of Product',
  objectiveIds: [objLaunchMvpId],
  definitionOfDone: 'Feature released to production with QA sign-off and release notes',
  stages: [
    { id: 'pd-1', name: 'PRD Draft', order: 1, ownerAgentId: productAnalystId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'pd-2', name: 'Design Spec', order: 2, ownerAgentId: uxResearcherId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'pd-3', name: 'Tech Spec', order: 3, ownerAgentId: backendLeadId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'pd-4', name: 'Sprint Planning', order: 4, ownerAgentId: vpEngineeringId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'pd-5', name: 'Implementation', order: 5, ownerAgentId: domainEngineerId, inputArtifactTypes: ['document'], outputArtifactTypes: ['deliverable'] },
    { id: 'pd-6', name: 'Code Review', order: 6, ownerAgentId: backendLeadId, inputArtifactTypes: ['deliverable'], outputArtifactTypes: ['deliverable'] },
    { id: 'pd-7', name: 'QA Validation', order: 7, ownerAgentId: qaLeadId, inputArtifactTypes: ['deliverable'], outputArtifactTypes: ['document'] },
    { id: 'pd-8', name: 'Release', order: 8, ownerAgentId: devOpsSpecialistId, inputArtifactTypes: ['deliverable', 'document'], outputArtifactTypes: ['document'] }
  ],
  handoffs: [
    { id: 'pd-h1', sourceStageId: 'pd-1', targetStageId: 'pd-2', triggerType: 'manual', condition: null, contractId: prdToDesignContractId, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'PRD reviewed and accepted by Design', validations: ['PRD has acceptance criteria', 'PRD has user stories'], sla: { maxDurationMinutes: 1440, warningAtPercent: 80 }, escalationRules: [] },
    { id: 'pd-h2', sourceStageId: 'pd-2', targetStageId: 'pd-3', triggerType: 'manual', condition: null, contractId: designToEngContractId, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'Design package reviewed by Engineering', validations: ['Design spec includes wireframes', 'Design spec includes interaction flows'], sla: { maxDurationMinutes: 2880, warningAtPercent: 80 }, escalationRules: [] },
    { id: 'pd-h3', sourceStageId: 'pd-5', targetStageId: 'pd-6', triggerType: 'automatic', condition: null, contractId: null, inputArtifactTypes: ['deliverable'], expectedOutputArtifactTypes: ['deliverable'], definitionOfDone: 'Code committed and PR created', validations: ['All tests pass', 'Lint clean'], sla: null, escalationRules: [] },
    { id: 'pd-h4', sourceStageId: 'pd-6', targetStageId: 'pd-7', triggerType: 'manual', condition: null, contractId: engToQaContractId, inputArtifactTypes: ['deliverable'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'Code review approved, candidate build ready', validations: ['No critical findings', 'Coverage threshold met'], sla: { maxDurationMinutes: 480, warningAtPercent: 80 }, escalationRules: [{ condition: 'Review blocked for > 4h', escalateTo: vpEngineeringId, action: 'Reassign review or unblock' }] },
    { id: 'pd-h5', sourceStageId: 'pd-7', targetStageId: 'pd-8', triggerType: 'manual', condition: null, contractId: qaToReleaseContractId, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'QA report with pass status', validations: ['No P1 bugs open', 'QA report signed'], sla: { maxDurationMinutes: 1440, warningAtPercent: 80 }, escalationRules: [] }
  ],
  participants: [
    { participantId: productAnalystId, participantType: 'agent', responsibility: 'Draft PRD' },
    { participantId: uxResearcherId, participantType: 'agent', responsibility: 'Design specification' },
    { participantId: engineeringDeptId, participantType: 'uo', responsibility: 'Build and ship' },
    { participantId: qaTeamId, participantType: 'uo', responsibility: 'Validate quality' }
  ],
  metrics: [
    { name: 'Cycle Time', description: 'Time from PRD Draft to Release', unit: 'days' },
    { name: 'Handoff Wait Time', description: 'Average wait between stages', unit: 'hours' },
    { name: 'QA Pass Rate', description: 'Percentage of builds passing QA on first attempt', unit: 'percentage' }
  ]
}
```

### 8.2 Incident Management

```typescript
Workflow {
  name: 'Incident Management',
  workflowType: 'event-driven',
  ownerUoId: operationsDeptId,
  triggerDescription: 'Customer reports an incident or system detects anomaly',
  objectiveIds: [objFirstCustomerId],
  definitionOfDone: 'Incident resolved, customer notified, post-mortem documented',
  stages: [
    { id: 'im-1', name: 'Incident Intake', order: 1, ownerAgentId: supportAgentId, inputArtifactTypes: [], outputArtifactTypes: ['document'] },
    { id: 'im-2', name: 'Triage', order: 2, ownerAgentId: dispatchCoordinatorId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'im-3', name: 'Dispatch', order: 3, ownerAgentId: dispatchAnalystId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'im-4', name: 'Field Resolution', order: 4, ownerAgentId: fieldOpsAgentId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document', 'deliverable'] },
    { id: 'im-5', name: 'Verification', order: 5, ownerAgentId: qaLeadId, inputArtifactTypes: ['deliverable'], outputArtifactTypes: ['document'] },
    { id: 'im-6', name: 'Customer Update', order: 6, ownerAgentId: supportAgentId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'im-7', name: 'Close', order: 7, ownerAgentId: vpOperationsId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] }
  ],
  handoffs: [
    { id: 'im-h1', sourceStageId: 'im-1', targetStageId: 'im-2', triggerType: 'automatic', condition: null, contractId: csToOpsContractId, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'Incident report created with severity classification', validations: ['Severity assigned', 'Customer contact recorded'], sla: { maxDurationMinutes: 30, warningAtPercent: 80 }, escalationRules: [{ condition: 'Triage not started within 15 min', escalateTo: vpOperationsId, action: 'Escalate to VP Operations for immediate assignment' }] },
    { id: 'im-h2', sourceStageId: 'im-2', targetStageId: 'im-3', triggerType: 'manual', condition: null, contractId: null, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'Triage complete, dispatch plan created', validations: ['Priority set', 'Technician availability checked'], sla: { maxDurationMinutes: 60, warningAtPercent: 80 }, escalationRules: [] },
    { id: 'im-h3', sourceStageId: 'im-4', targetStageId: 'im-5', triggerType: 'manual', condition: null, contractId: null, inputArtifactTypes: ['deliverable'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'Field work completed, work order submitted', validations: ['Work order signed', 'Photos attached'], sla: null, escalationRules: [] }
  ],
  participants: [
    { participantId: csLeadId, participantType: 'agent', responsibility: 'Intake and customer communication' },
    { participantId: dispatchTeamId, participantType: 'uo', responsibility: 'Triage and dispatch' },
    { participantId: fieldServiceTeamId, participantType: 'uo', responsibility: 'Field resolution' }
  ],
  metrics: [
    { name: 'Time to Triage', description: 'Time from intake to triage completion', unit: 'minutes' },
    { name: 'Resolution Time', description: 'Time from intake to close', unit: 'hours' },
    { name: 'First-Time Fix Rate', description: 'Percentage of incidents resolved on first dispatch', unit: 'percentage' }
  ]
}
```

### 8.3 Maintenance Contract Lifecycle

```typescript
Workflow {
  name: 'Maintenance Contract Lifecycle',
  workflowType: 'operational',
  ownerUoId: csDeptId,
  triggerDescription: 'New lead or contract renewal due',
  objectiveIds: [objFirstCustomerId],
  definitionOfDone: 'Contract active, assets linked, maintenance scheduled, billing activated',
  stages: [
    { id: 'mc-1', name: 'Lead / Renewal', order: 1, ownerAgentId: onboardingSpecialistId, inputArtifactTypes: [], outputArtifactTypes: ['document'] },
    { id: 'mc-2', name: 'Contract Setup', order: 2, ownerAgentId: csLeadId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'mc-3', name: 'Asset Linkage', order: 3, ownerAgentId: fieldServiceLeadId, inputArtifactTypes: ['document'], outputArtifactTypes: ['data'] },
    { id: 'mc-4', name: 'Schedule Maintenance', order: 4, ownerAgentId: scheduleOptimizerId, inputArtifactTypes: ['data'], outputArtifactTypes: ['document'] },
    { id: 'mc-5', name: 'Execute Service', order: 5, ownerAgentId: fieldOpsAgentId, inputArtifactTypes: ['document'], outputArtifactTypes: ['deliverable'] },
    { id: 'mc-6', name: 'Invoice / Renew', order: 6, ownerAgentId: csLeadId, inputArtifactTypes: ['deliverable'], outputArtifactTypes: ['document'] }
  ],
  handoffs: [
    { id: 'mc-h1', sourceStageId: 'mc-2', targetStageId: 'mc-3', triggerType: 'manual', condition: null, contractId: null, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['data'], definitionOfDone: 'Contract terms agreed, ready for asset linkage', validations: ['Contract signed', 'SLA defined'], sla: { maxDurationMinutes: 4320, warningAtPercent: 80 }, escalationRules: [] },
    { id: 'mc-h2', sourceStageId: 'mc-4', targetStageId: 'mc-5', triggerType: 'automatic', condition: null, contractId: null, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['deliverable'], definitionOfDone: 'Maintenance schedule published to field team', validations: ['Technician assigned', 'Parts availability confirmed'], sla: null, escalationRules: [] }
  ],
  participants: [
    { participantId: csDeptId, participantType: 'uo', responsibility: 'Contract lifecycle management' },
    { participantId: fieldServiceTeamId, participantType: 'uo', responsibility: 'Asset linkage and field execution' },
    { participantId: dispatchTeamId, participantType: 'uo', responsibility: 'Schedule optimization' }
  ],
  metrics: [
    { name: 'Contract Activation Time', description: 'Time from lead to active contract', unit: 'days' },
    { name: 'Renewal Rate', description: 'Percentage of contracts renewed on time', unit: 'percentage' }
  ]
}
```

### 8.4 Inspection & Compliance

```typescript
Workflow {
  name: 'Inspection & Compliance',
  workflowType: 'external-response',
  ownerUoId: complianceDeptId,
  triggerDescription: 'Inspection scheduled by regulatory authority or internal calendar',
  objectiveIds: [objRegulatoryAuditId],
  definitionOfDone: 'Inspection completed, findings addressed, evidence archived',
  stages: [
    { id: 'ic-1', name: 'Inspection Scheduled', order: 1, ownerAgentId: inspectionSpecialistId, inputArtifactTypes: [], outputArtifactTypes: ['document'] },
    { id: 'ic-2', name: 'Evidence Collection', order: 2, ownerAgentId: auditAnalystId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document', 'data'] },
    { id: 'ic-3', name: 'Findings Review', order: 3, ownerAgentId: complianceManagerId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] },
    { id: 'ic-4', name: 'Remediation', order: 4, ownerAgentId: backendLeadId, inputArtifactTypes: ['document'], outputArtifactTypes: ['deliverable'] },
    { id: 'ic-5', name: 'Sign-off', order: 5, ownerAgentId: complianceManagerId, inputArtifactTypes: ['deliverable', 'document'], outputArtifactTypes: ['document'] },
    { id: 'ic-6', name: 'Archive', order: 6, ownerAgentId: auditAnalystId, inputArtifactTypes: ['document'], outputArtifactTypes: ['document'] }
  ],
  handoffs: [
    { id: 'ic-h1', sourceStageId: 'ic-2', targetStageId: 'ic-3', triggerType: 'manual', condition: null, contractId: opsToComplianceContractId, inputArtifactTypes: ['document', 'data'], expectedOutputArtifactTypes: ['document'], definitionOfDone: 'All evidence collected and organized', validations: ['Evidence checklist complete', 'Photos and documents uploaded'], sla: { maxDurationMinutes: 10080, warningAtPercent: 80 }, escalationRules: [{ condition: 'Evidence not collected 48h before deadline', escalateTo: complianceManagerId, action: 'Escalate to Compliance Manager for manual collection' }] },
    { id: 'ic-h2', sourceStageId: 'ic-3', targetStageId: 'ic-4', triggerType: 'conditional', condition: 'Findings require remediation', contractId: null, inputArtifactTypes: ['document'], expectedOutputArtifactTypes: ['deliverable'], definitionOfDone: 'All findings reviewed, remediation plan created', validations: ['Each finding has severity', 'Remediation owner assigned'], sla: null, escalationRules: [] }
  ],
  participants: [
    { participantId: complianceDeptId, participantType: 'uo', responsibility: 'Overall compliance ownership' },
    { participantId: operationsDeptId, participantType: 'uo', responsibility: 'Evidence from field operations' },
    { participantId: engineeringDeptId, participantType: 'uo', responsibility: 'Technical remediation' }
  ],
  metrics: [
    { name: 'Evidence Completeness', description: 'Percentage of required evidence collected on time', unit: 'percentage' },
    { name: 'Remediation Time', description: 'Time from finding to resolution', unit: 'days' },
    { name: 'Audit Pass Rate', description: 'Percentage of inspections passed without findings', unit: 'percentage' }
  ]
}
```

---

## 9. Contracts

Contracts use the expanded party model: `uo` | `agent` | `workflow-stage`.

| # | Name | Type | Provider | Consumer | Acceptance Criteria |
|---|------|------|----------|----------|---------------------|
| 1 | PRD to Design Handoff | DataContract | Product (uo) | Engineering (uo) | PRD has user stories; PRD has acceptance criteria; PRD approved by Head of Product |
| 2 | Design to Engineering Handoff | DataContract | Product (uo) | Engineering (uo) | Design spec includes wireframes; Interaction flows documented; Design approved |
| 3 | Engineering to QA Handoff | InterfaceContract | Backend Team (uo) | QA Team (uo) | Candidate build deployed to staging; All unit tests pass; Coverage > 80% |
| 4 | QA to Release Validation | OperationalAgreement | QA Team (uo) | Platform Team (uo) | QA report signed; No P1 bugs; Regression suite passed |
| 5 | Customer Success to Operations Escalation | SLA | Support Agent (agent) | Dispatch Team (uo) | Incident classified with severity; Customer contact recorded; SLA: triage within 30 min |
| 6 | Operations to Compliance Evidence | DataContract | Operations (uo) | Compliance (uo) | Maintenance records complete; Photos attached; Digital signatures present |
| 7 | Customer Onboarding to Billing | OperationalAgreement | Onboarding Specialist (agent) | CS Lead (agent) | Contract signed; Asset registry populated; First invoice scheduled |

---

## 10. Policies

| # | Name | Type | Scope | Target | Enforcement | Condition |
|---|------|------|-------|--------|-------------|-----------|
| 1 | Release Approval Policy | approval-gate | workflow | Product Delivery workflow | mandatory | Release stage requires QA Lead sign-off and VP Engineering approval |
| 2 | Production Change Gate | approval-gate | workflow | Product Delivery workflow | mandatory | No production deployment without passing release approval policy |
| 3 | Compliance Evidence Retention | rule | global | null | mandatory | All inspection evidence must be retained for 5 years. Archival is automatic at workflow close. |
| 4 | Incident Severity Escalation | rule | workflow | Incident Management workflow | mandatory | P1 incidents must be triaged within 15 minutes. P2 within 1 hour. Escalation to VP Operations on SLA breach. |
| 5 | Contract Acceptance Criteria | constraint | global | null | advisory | Every inter-department contract must have at least 2 acceptance criteria defined. |

---

## 11. Artifacts

Artifacts are anchored to workflows, handoffs, and decisions.

| # | Name | Type | Producer | Workflow | Stage |
|---|------|------|----------|----------|-------|
| 1 | PRD | document | Product Analyst (agent) | Product Delivery | PRD Draft |
| 2 | Design Spec | document | UX Researcher (agent) | Product Delivery | Design Spec |
| 3 | Tech Spec | document | Backend Lead (agent) | Product Delivery | Tech Spec |
| 4 | Delivery Plan | document | VP Engineering (agent) | Product Delivery | Sprint Planning |
| 5 | QA Report | document | QA Lead (agent) | Product Delivery | QA Validation |
| 6 | Release Note | document | DevOps Specialist (agent) | Product Delivery | Release |
| 7 | Incident Report | document | Support Agent (agent) | Incident Management | Incident Intake |
| 8 | Work Order | deliverable | Field Operations Agent (agent) | Incident Management | Field Resolution |
| 9 | Maintenance Contract | document | CS Lead (agent) | Maintenance Contract Lifecycle | Contract Setup |
| 10 | Inspection Evidence | data | Audit Analyst (agent) | Inspection & Compliance | Evidence Collection |
| 11 | Compliance Finding | document | Compliance Manager (agent) | Inspection & Compliance | Findings Review |
| 12 | Billing Activation Record | document | CS Lead (agent) | Maintenance Contract Lifecycle | Invoice / Renew |

---

## 12. Event Triggers & External Sources

### 12.1 Event Triggers

| # | Name | Source Type | Event Pattern | Target Workflows | Target Agents |
|---|------|------------|---------------|------------------|---------------|
| 1 | Customer Reports Incident | external | Customer submits incident via portal or phone | Incident Management | Support Agent |
| 2 | Inspection Deadline Approaching | internal | Scheduled inspection is within 14 days | Inspection & Compliance | Inspection Specialist |
| 3 | Contract Renewal Due | internal | Maintenance contract renewal date within 30 days | Maintenance Contract Lifecycle | Onboarding Specialist |

### 12.2 External Sources

| # | Name | Category | Description | Connection Ref |
|---|------|----------|-------------|----------------|
| 1 | Regulatory Database (ITE) | regulation | Spanish elevator inspection standards and requirements | `https://ite.example.com/api` |
| 2 | CRM System | third-party-system | Customer data, contracts, communication history | `https://crm.verticaler.io/api` |
| 3 | Asset Monitoring IoT | third-party-system | Real-time elevator sensor data (temperature, vibration, usage) | `mqtt://sensors.verticaler.io` |

---

## 13. Proposals & Decisions

### 13.1 Example Proposals (from growth story)

| # | Type | Title | Proposed By | Motivation | Status |
|---|------|-------|-------------|------------|--------|
| 1 | create-department | Create Engineering Department | CEO | The company needs software development capabilities to build the core product | implemented |
| 2 | create-team | Create Platform Team | VP Engineering | Infrastructure work is distinct from domain logic — needs dedicated team | implemented |
| 3 | create-specialist | Add Domain Engineer | Backend Lead | Backend Team needs a domain modeling specialist for aggregate design | implemented |
| 4 | revise-workflow | Add SLA to Incident Triage Handoff | VP Operations | Customer incidents were taking too long to triage — need enforceable SLA | implemented |

### 13.2 Example Decisions

| # | Title | Rationale | Proposed By | Linked Proposal | Impacted Workflows |
|---|-------|-----------|-------------|-----------------|-------------------|
| 1 | Adopt DDD for domain services | Domain complexity justifies explicit aggregate boundaries | VP Engineering | — | Product Delivery |
| 2 | Require triage SLA for incidents | Customer feedback showed unacceptable response times | VP Operations | Proposal #4 | Incident Management |
| 3 | Separate Platform and Backend teams | Infrastructure concerns were slowing down feature delivery | VP Engineering | Proposal #2 | Product Delivery |

---

## 14. Runtime Demo Data

This section provides example runtime data for Live Mode demonstration.

### 14.1 Runtime Executions

**Active Product Delivery Run:**

```typescript
RuntimeExecution {
  id: 'exec-pd-001',
  executionType: 'workflow-run',
  workflowId: productDeliveryId,
  status: 'running',
  startedAt: '2026-03-10T09:00:00Z',
  input: { feature: 'Maintenance Contract Module', sprint: 'S-2026-11' },
  output: null,
  errors: [],
  waitingFor: null,
  approvals: [],
  aiCost: 12.40,
  logSummary: 'PRD drafted, design spec completed, currently in implementation stage.',
  parentExecutionId: null,
  operationsRunId: 'run-pd-001'
}
```

**Completed Incident Management Run:**

```typescript
RuntimeExecution {
  id: 'exec-im-001',
  executionType: 'workflow-run',
  workflowId: incidentMgmtId,
  status: 'completed',
  startedAt: '2026-03-11T14:22:00Z',
  completedAt: '2026-03-11T16:45:00Z',
  input: { incidentId: 'INC-042', severity: 'P2', customer: 'Ascensores Madrid S.L.' },
  output: { resolution: 'Motor contactor replaced', technicianId: 'T-007' },
  errors: [],
  waitingFor: null,
  approvals: [],
  aiCost: 3.20,
  logSummary: 'P2 incident resolved in 2h23m. First-time fix. Customer notified.',
  parentExecutionId: null,
  operationsRunId: 'run-im-001'
}
```

**Agent Task (within Product Delivery):**

```typescript
RuntimeExecution {
  id: 'exec-at-001',
  executionType: 'agent-task',
  workflowId: null,
  agentId: domainEngineerId,
  status: 'running',
  startedAt: '2026-03-12T10:15:00Z',
  input: { task: 'Implement MaintenanceContract aggregate', spec: 'tech-spec-mc-v2' },
  output: null,
  errors: [],
  waitingFor: null,
  approvals: [],
  aiCost: 4.80,
  logSummary: 'Implementing MaintenanceContract aggregate root with renewal logic.',
  parentExecutionId: 'exec-pd-001',
  operationsRunId: null
}
```

### 14.2 Runtime Events (Timeline)

| # | Event Type | Severity | Title | Source | Time |
|---|-----------|----------|-------|--------|------|
| 1 | execution-started | info | Product Delivery: Maintenance Contract Module started | Product Delivery (workflow) | 2026-03-10 09:00 |
| 2 | stage-completed | info | PRD Draft completed | PRD Draft (stage) | 2026-03-10 14:30 |
| 3 | handoff-completed | info | PRD handed off to Design | PRD to Design (handoff) | 2026-03-10 14:35 |
| 4 | stage-entered | info | Design Spec stage entered | Design Spec (stage) | 2026-03-10 14:35 |
| 5 | artifact-produced | info | PRD v1.0 produced | Product Analyst (agent) | 2026-03-10 14:30 |
| 6 | stage-completed | info | Design Spec completed | Design Spec (stage) | 2026-03-11 11:00 |
| 7 | execution-started | info | Incident Management: INC-042 started | Incident Management (workflow) | 2026-03-11 14:22 |
| 8 | escalation-raised | warning | Triage SLA approaching limit | Dispatch Team (uo) | 2026-03-11 14:45 |
| 9 | execution-completed | info | Incident INC-042 resolved | Incident Management (workflow) | 2026-03-11 16:45 |
| 10 | agent-activated | info | Domain Engineer started implementation task | Domain Engineer (agent) | 2026-03-12 10:15 |
| 11 | budget-alert | warning | Engineering department at 65% monthly budget | Engineering (uo) | 2026-03-12 10:30 |

### 14.3 Agent Activity Statuses

| Agent | State | Active Executions | Queued | Last Activity | Cost (period) |
|-------|-------|-------------------|--------|---------------|---------------|
| CEO | idle | 0 | 0 | 2026-03-10 09:00 | $2.10 |
| VP Engineering | active | 1 | 0 | 2026-03-12 10:00 | $8.50 |
| Domain Engineer | active | 1 | 0 | 2026-03-12 10:15 | $4.80 |
| QA Lead | idle | 0 | 1 | 2026-03-11 11:30 | $1.90 |
| Support Agent | idle | 0 | 0 | 2026-03-11 16:45 | $3.20 |
| Dispatch Coordinator | idle | 0 | 0 | 2026-03-11 15:00 | $1.10 |

### 14.4 Cost Summary

```typescript
CostSummary {
  period: { start: '2026-03-01', end: '2026-03-31' },
  totalCost: 48.60,
  costByDepartment: [
    { uoName: 'Engineering', cost: 28.40 },
    { uoName: 'Operations', cost: 8.30 },
    { uoName: 'Customer Success', cost: 5.40 },
    { uoName: 'Product', cost: 4.20 },
    { uoName: 'Compliance', cost: 2.30 }
  ],
  budgetUsedPercent: 2.43,
  alerts: [
    { level: 'warning', scope: 'Engineering', message: 'Engineering at 65% of per-UO budget', currentCost: 28.40, threshold: 50 }
  ]
}
```

### 14.5 Live Mode Badge Examples

| Node | Badge Type | Label | Severity |
|------|-----------|-------|----------|
| Domain Engineer | running | Active | info |
| VP Engineering | running | 1 task | info |
| QA Lead | queue | 1 queued | info |
| Engineering | cost | $28.40 | warning |
| Dispatch Team | idle | — | info |
| Incident Management workflow | running | 0 active | info |
| Product Delivery workflow | running | 1 active | info |

---

## 15. Canvas Requirements (v3)

### 15.1 Overlays (replacing layers)

| Overlay | Always Active | What it shows for Verticaler |
|---------|--------------|------------------------------|
| Organization | yes (locked) | All 8 UOs, 27 agents, structural edges (contains, belongs_to, reports_to, led_by, supervises) |
| Work | no | 4 workflows, stages, handoffs, collaboration edges (requests_from, delegates_to, hands_off_to, reviews, escalates_to, triggers) |
| Deliverables | no | 12 artifacts, produces/consumes edges |
| Rules | no | 7 contracts, 5 policies, 4 proposals, 3 decisions, governance edges (governed_by, constrained_by, proposed_by, approved_by) |
| Live Status | no (auto-activates in Live Mode) | Runtime badges on all nodes, edge animations on active handoffs |

### 15.2 Navigation Levels

| Level | Scope | What Verticaler Shows |
|-------|-------|-----------------------|
| L1 (Company) | Verticaler | Company + CEO + 5 departments + executives + 3 objectives + strategic workflows |
| L2 (Department) | e.g., Engineering | Engineering + VP Engineering + 3 teams + leads + department workflows + inter-department contracts |
| L3 (Team) | e.g., Backend Team | Backend Team + Backend Lead + Domain Engineer + API Specialist + intra-team handoffs + objectives |
| L4 (Agent Detail) | e.g., Domain Engineer | Agent definition + skills + active tasks + triggers + contracts + recent runs + logs |

### 15.3 Inspector Content

Every inspector tab must have real content in Verticaler:

| Tab | Example Entity | Content |
|-----|---------------|---------|
| Overview | Backend Team | Name, type, mandate, purpose, status, phase |
| Properties | Domain Engineer | Role, skills (3), inputs, outputs, responsibilities, budget |
| Relationships | VP Engineering | reports_to CEO, led_by Engineering, supervises 3 leads, accountable_for 2 workflows |
| Contracts | QA Team | Engineering to QA Handoff contract, QA to Release Validation contract |
| Artifacts | Product Analyst | PRD (produced), Design Spec (consumed) |
| Policies | Product Delivery | Release Approval Policy, Production Change Gate |
| Proposals | Engineering | Platform Team proposal (implemented), Backend Team proposal (implemented) |
| Runtime | Domain Engineer | State: active, 1 execution, cost: $4.80, last activity: 10:15 |

### 15.4 Design Mode vs Live Mode

| Aspect | Design Mode (Verticaler) | Live Mode (Verticaler) |
|--------|-------------------------|----------------------|
| Default overlays | Organization only | Organization + Live Status |
| Canvas editing | Full — add UOs, agents, workflows | Disabled — view-only |
| Node appearance | Status badges (active/proposed/retired) | Runtime badges (running/waiting/blocked/error/queue/cost) |
| Edge animation | None | Active handoffs animate, blocked pulse red |
| Inspector default tab | Overview | Runtime |
| Explorer default | Entity tree | Timeline (events streaming) |

---

## 16. Relationship Examples (v3 taxonomy)

All 20 edge types from the canvas v3 spec with concrete Verticaler examples.

### Structural

| Edge Type | Source | Target | Concrete Example |
|-----------|--------|--------|-----------------|
| contains | Engineering (dept) | Platform Team (team) | Engineering contains Platform Team |
| contains | Platform Team (team) | Infrastructure Engineer (agent) | Platform Team contains Infrastructure Engineer |
| belongs_to | Backend Lead (agent) | Backend Team (team) | Backend Lead belongs to Backend Team |
| reports_to | Engineering (dept) | Verticaler (company) | Engineering reports to Verticaler |

### Responsibility

| Edge Type | Source | Target | Concrete Example |
|-----------|--------|--------|-----------------|
| led_by | Engineering (dept) | VP Engineering (agent) | Engineering is led by VP Engineering |
| accountable_for | VP Engineering (agent) | Product Delivery (workflow) | VP Engineering is accountable for Product Delivery |
| supervises | Backend Lead (agent) | Domain Engineer (agent) | Backend Lead supervises Domain Engineer |

### Collaboration

| Edge Type | Source | Target | Concrete Example |
|-----------|--------|--------|-----------------|
| requests_from | Product (uo) | Engineering (uo) | Product requests implementation from Engineering |
| delegates_to | VP Engineering (agent) | Backend Lead (agent) | VP Engineering delegates implementation review to Backend Lead |
| reviews | QA Lead (agent) | QA Report (artifact) | QA Lead reviews QA Report |
| approves | VP Engineering (agent) | Release (proposal/decision) | VP Engineering approves production release |
| hands_off_to | PRD Draft (stage) | Design Spec (stage) | PRD Draft hands off to Design Spec |
| escalates_to | Dispatch Coordinator (agent) | VP Operations (agent) | Dispatch Coordinator escalates SLA breach to VP Operations |

### Flow

| Edge Type | Source | Target | Concrete Example |
|-----------|--------|--------|-----------------|
| produces | Product Analyst (agent) | PRD (artifact) | Product Analyst produces PRD |
| consumes | Backend Lead (agent) | Tech Spec (artifact) | Backend Lead consumes Tech Spec |
| informs | Compliance (uo) | Engineering (uo) | Compliance informs Engineering of regulatory changes |
| triggers | Customer Reports Incident (event-trigger) | Incident Management (workflow) | Customer incident triggers Incident Management workflow |

### Governance

| Edge Type | Source | Target | Concrete Example |
|-----------|--------|--------|-----------------|
| governed_by | Product Delivery (workflow) | Release Approval Policy (policy) | Product Delivery is governed by Release Approval Policy |
| constrained_by | Incident Management (workflow) | Incident Severity Escalation (policy) | Incident Management is constrained by escalation policy |
| proposed_by | Create Engineering Dept (proposal) | CEO (agent) | Engineering dept proposal was proposed by CEO |
| approved_by | Adopt DDD decision (decision) | VP Engineering (agent) | DDD decision was approved by VP Engineering |

---

## 17. Migration Strategy

### 17.1 From old Verticaler

The old Verticaler bootstrap (pre-pivot) created a fully pre-populated company using the legacy entity model (Department, Role, Capability, Skill, AgentArchetype, AgentAssignment). That is now deprecated.

### 17.2 New bootstrap path

Verticaler is created via `CeoFirstBootstrapService` with the growth story replayed:

1. **Bootstrap call** — Creates ProjectSeed + Constitution + Company UO + CEO Agent (phase: seed)
2. **Replay proposals** — 5 department proposals pre-approved → phase: formation
3. **Replay team proposals** — 6 team proposals pre-approved → phase: structured
4. **Replay specialist proposals** — 15 specialist proposals pre-approved
5. **Create objectives** — 3 objectives created and linked
6. **Create workflows** — 4 workflows with stages, handoffs, participants, metrics
7. **Create contracts** — 7 contracts
8. **Create policies** — 5 policies
9. **Create artifacts** — 12 artifacts anchored to workflows
10. **Create event triggers** — 3 event triggers
11. **Create external sources** — 3 external sources
12. **Create decisions** — 3 decisions linked to proposals
13. **Seed runtime data** — Example executions + events + cost data
14. **Advance phase** — First workflow execution → phase: operating

### 17.3 Idempotency

- If no project exists, create Verticaler.
- If Verticaler already exists, return existing IDs.
- Each step checks if the entity already exists before creating.
- Proposals in the replay are auto-approved (founder pre-approval).

### 17.4 Versioning

Each change to Verticaler's reference data is a versioned migration. The migration version is stored on the ProjectSeed and checked before applying.

---

## 18. Acceptance Criteria

1. An empty TheCrew instance starts with a Verticaler project visible.
2. Verticaler is created via `CeoFirstBootstrapService`, not hardcoded fixtures.
3. The growth story demonstrates all 4 phase transitions: seed → formation → structured → operating.
4. The canvas at L1 shows the company structure with CEO + 5 departments + executives.
5. Drill-down works: L1 → L2 (department) → L3 (team) → L4 (agent detail).
6. All 5 overlays have meaningful content for Verticaler data.
7. All inspector tabs have real content for representative entities.
8. The 4 workflows have complete stages, handoffs with SLAs, participants, and metrics.
9. The 7 contracts use the new party model (uo/agent/workflow-stage).
10. The 5 policies use the expanded scope with targetId/targetType.
11. All 12 artifacts are anchored to workflows/handoffs.
12. Runtime demo data enables Live Mode demonstration (badges, timeline, cost).
13. All 20 edge types have at least one concrete Verticaler example.
14. No references to deprecated entities (Role, Capability, Skill, AgentArchetype, AgentAssignment as standalone).
15. This document is consistent with docs/33, docs/42, docs/43-ceo-first, docs/44-growth-engine, docs/44-runtime, docs/43-canvas-v3.

---

## 19. Sync Checklist (v3)

When any reference document changes, validate:

| Source Document | Verticaler Section | What to Validate |
|----------------|-------------------|------------------|
| docs/33 (domain model) | All entity sections | Entity types, fields, invariants match |
| docs/34 (canvas v3) | §15, §16 | Overlays, navigation levels, node/edge types |
| docs/42 (product language) | Entire document | No "layers" terminology, overlays used correctly |
| docs/43-ceo-first-bootstrap | §4, §17 | Bootstrap flow matches, CEO conversation protocol |
| docs/43-canvas-v3-plan | §15, §16 | 16 node types, 20 edge types, 5 overlays, 5 categories |
| docs/44-growth-engine | §5, §13 | Phase transitions, proposals, approval model |
| docs/44-runtime-plan | §14 | Runtime events, statuses, cost model, badge types |
| docs/38 (backlog) | §18 | Acceptance criteria aligned with backlog priorities |
| docs/39 (task registry) | §18 | LCP-009 status reflects this document's state |

---

## 20. Baseline

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| v1 | 2026-03-11 | superseded | Pre-pivot spec. Static seed, old entity model. |
| v2 | 2026-03-12 | **baseline accepted** | Live Company rewrite. CEO-first bootstrap, growth narrative, runtime demo, v3 canvas. Produced by LCP-009. |

Next revision: when LCP-016 implements this spec.

---

## 21. Final Rule

If there is a conflict between "make a quick demo" and "maintain Verticaler as a sustainable canonical reference", the latter wins. Verticaler must be a maintainable living company, not a visual patch to avoid an empty screen.
