# Operations Overlay — Design Specification

> **Task:** CAV-018
> **Epic:** 43 — Operations Overlay
> **Mode:** plan
> **Status:** design complete

---

## Problem Statement

TheCrew designs autonomous companies. But "designing" is only half the vision — the other half is **operating** them. Today the canvas is a static design surface: it shows what the company *is*, not what it's *doing*.

The Canvas Editor v2 spec (doc 18) defines an operations overlay that projects runtime state onto the design graph:
- Active workflow runs
- Executing stages
- Blocked handoffs
- Queue depths
- Incidents
- Contract compliance/violations

The gap analysis (doc 17, gap E.7) notes that without operations, the canvas "cannot show the company's activity."

### What exists today

| Concept | Current state |
|---------|--------------|
| Operations view preset | Defined in `VIEW_PRESET_REGISTRY` with `'Coming soon'` badge |
| Validation overlay | Full implementation (backend enrichment + frontend badges + store toggle) |
| Runtime entities | None — no Run, Incident, Queue, or ComplianceCheck domain objects |
| Operations layer | Not defined (no `'operations'` LayerId) |
| Operations permissions | Not defined |

### What's missing

1. **Runtime domain model** — Entities representing live activity (runs, incidents, queue items, compliance checks)
2. **Operations status endpoint** — API returning aggregated runtime state per entity
3. **Canvas overlay system** — Visual decorations on existing nodes/edges showing live state
4. **Operations layer** — Dedicated layer toggle for operations decorations
5. **Operations preset activation** — Enable the existing placeholder preset
6. **Explorer operations tab** — Runtime summary panel in the sidebar

---

## Design Goals

1. **Overlay, not replacement.** Operations state decorates existing design-time nodes — it does NOT create new visual entities. A workflow node gets an "active run" badge; a stage node gets a "blocked" indicator. The design graph remains the structural truth.
2. **Separate data stream.** Runtime state is fetched independently from the graph projection. It's a second API call that enriches the already-rendered graph. This avoids coupling the design-time projection with transient runtime data.
3. **Same enrichment pattern as validation.** Follow the `applyValidationOverlay()` → `enrichWithValidationCounts()` → badge rendering pattern exactly. This keeps the architecture consistent and predictable.
4. **Toggleable.** Operations overlay is a store toggle (`showOperationsOverlay`), independent of the validation overlay. Both can be active simultaneously.
5. **Polling-based in v1.** No WebSocket or SSE yet. Runtime state is fetched on mount + periodic polling (30s default). Real-time push is a future optimization.
6. **In-memory for v1.** Runtime entities use InMemoryRepository, matching all other aggregates. When a real queue/event system is introduced, the domain model stays the same.

---

## Non-Goals (for CAV-018/019)

- WebSocket/SSE real-time push (future)
- Actual workflow execution engine (TheCrew designs companies; it doesn't run them *yet*)
- Integration with external job queues (Temporal, Bull, etc.)
- Runbook automation
- Alerting/notification system
- SLA tracking with time-based triggers
- Historical operations analytics

---

## Part 1: Runtime Domain Model

### Design Decision: Simulated Operations

TheCrew v1 does not execute workflows. There is no real queue processor or agent runtime. Operations overlay in v1 provides a **simulation layer** where users (or future AI agents) can:
- Start a workflow run manually
- Advance/block/complete stages
- Report incidents
- Check contract compliance

This is structurally identical to how the design model works (in-memory entities, CRUD API), but semantically distinct: operations entities are *transient*, *temporal*, and *not part of releases*.

### Core Entities

#### OperationStatus (enum)

```typescript
// packages/shared-types/src/index.ts

export type OperationStatus =
  | 'idle'        // no active operations
  | 'running'     // actively executing
  | 'blocked'     // waiting on dependency/approval
  | 'failed'      // execution failed
  | 'completed'   // finished successfully
```

#### WorkflowRunDto

A single execution instance of a workflow.

```typescript
export type WorkflowRunStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export interface WorkflowRunDto {
  id: string
  projectId: string
  workflowId: string
  status: WorkflowRunStatus
  currentStageIndex: number | null   // which stage is active (-1 or null = not started / all done)
  startedAt: string
  completedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowRunDto {
  workflowId: string
}

export interface UpdateWorkflowRunDto {
  status?: WorkflowRunStatus
  currentStageIndex?: number | null
  failureReason?: string | null
}
```

#### StageExecutionDto

The state of a stage within an active run.

```typescript
export type StageExecutionStatus = 'pending' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped'

export interface StageExecutionDto {
  id: string
  runId: string
  workflowId: string
  stageName: string          // matches WorkflowStageDto.name
  stageIndex: number         // matches WorkflowStageDto.order
  status: StageExecutionStatus
  assigneeId: string | null  // role or agent assignment handling this stage
  blockReason: string | null
  startedAt: string | null
  completedAt: string | null
}
```

Stage executions are auto-created when a run starts (one per workflow stage, all `'pending'`). They are advanced by the user or future automation.

#### IncidentDto

A problem report tied to an entity (workflow, stage, contract, department).

```typescript
export type IncidentSeverity = 'critical' | 'major' | 'minor'
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved'

export interface IncidentDto {
  id: string
  projectId: string
  entityType: NodeType       // what entity is affected
  entityId: string           // which entity
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  reportedAt: string
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateIncidentDto {
  entityType: NodeType
  entityId: string
  severity: IncidentSeverity
  title: string
  description: string
}

export interface UpdateIncidentDto {
  severity?: IncidentSeverity
  status?: IncidentStatus
  description?: string
}
```

#### ContractComplianceDto

Live compliance status of a contract.

```typescript
export type ComplianceStatus = 'compliant' | 'at-risk' | 'violated'

export interface ContractComplianceDto {
  id: string
  projectId: string
  contractId: string
  status: ComplianceStatus
  reason: string | null       // why it's at-risk or violated
  lastCheckedAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateContractComplianceDto {
  contractId: string
  status: ComplianceStatus
  reason?: string | null
}

export interface UpdateContractComplianceDto {
  status?: ComplianceStatus
  reason?: string | null
}
```

#### QueueDepthDto

Aggregated queue depth per stage (how many runs are waiting at that stage).

```typescript
export interface QueueDepthDto {
  workflowId: string
  stageName: string
  stageIndex: number
  pendingCount: number       // runs waiting at this stage
  runningCount: number       // runs actively executing this stage
  blockedCount: number       // runs blocked at this stage
}
```

Queue depths are **derived** from StageExecution data, not stored separately.

---

## Part 2: Aggregated Operations Status

### OperationsStatusDto

The overlay doesn't fetch individual runs/incidents separately for rendering. Instead, a single **aggregated status endpoint** returns per-entity operation state for the current scope.

```typescript
export interface EntityOperationStatusDto {
  entityId: string
  entityType: NodeType
  visualNodeId: string           // pre-computed visual ID for frontend matching
  operationStatus: OperationStatus  // worst-case status (failed > blocked > running > idle)
  activeRunCount: number
  incidentCount: number          // open incidents
  queueDepth: number             // pending items (stages only)
  complianceStatus: ComplianceStatus | null  // contracts only
  badges: OperationBadge[]       // specific badges to render
}

export type OperationBadgeType =
  | 'active-run'        // workflow has active runs
  | 'blocked-stage'     // stage is blocked
  | 'failed-run'        // workflow has failed runs
  | 'incident'          // entity has open incidents
  | 'queue-depth'       // stage has pending queue
  | 'compliance-ok'     // contract compliant
  | 'compliance-risk'   // contract at risk
  | 'compliance-violated' // contract violated

export interface OperationBadge {
  type: OperationBadgeType
  label: string            // e.g., "3 active runs", "Blocked: approval pending"
  severity: 'info' | 'warning' | 'critical'
}

export interface OperationsStatusDto {
  projectId: string
  scopeType: ScopeType
  entityId: string | null
  entities: EntityOperationStatusDto[]
  summary: OperationsSummary
  fetchedAt: string          // ISO timestamp for freshness indicator
}

export interface OperationsSummary {
  totalActiveRuns: number
  totalBlockedStages: number
  totalFailedRuns: number
  totalOpenIncidents: number
  totalComplianceViolations: number
}
```

### Status Aggregation Logic

For each entity visible in the current scope, the backend computes:

| Entity Type | Status Sources |
|-------------|---------------|
| `workflow` | Active runs (running/failed), open incidents |
| `workflow-stage` | Stage executions (running/blocked/failed), queue depth, open incidents |
| `department` | Open incidents, aggregate of owned workflow statuses |
| `contract` | Compliance status, open incidents |
| `capability` | Open incidents |
| `role` | Stage assignments (is this role actively executing?) |
| `company` | Aggregate of all departments/workflows |
| All others | Open incidents only |

**Worst-case escalation:**
```
failed → blocked → running → completed → idle
```

A department with 3 running workflows and 1 failed workflow shows `operationStatus: 'failed'`.

---

## Part 3: Backend Architecture

### Module Structure

```
services/company-design/src/operations/
├── domain/
│   ├── workflow-run.ts              # WorkflowRun aggregate
│   ├── stage-execution.ts           # StageExecution entity (child of run)
│   ├── incident.ts                  # Incident aggregate
│   ├── contract-compliance.ts       # ContractCompliance aggregate
│   ├── operations.repository.ts     # Repository interfaces + Symbol tokens
│   └── operations.test.ts           # Domain unit tests
├── application/
│   ├── operations.service.ts        # CRUD + status aggregation
│   ├── operations.service.spec.ts
│   ├── status-aggregator.ts         # Pure function: snapshot + runs + incidents → OperationsStatusDto
│   ├── status-aggregator.test.ts
│   ├── operations.controller.ts     # REST endpoints
│   ├── operations.controller.spec.ts
│   └── operations.mapper.ts         # Domain ↔ DTO
├── infrastructure/
│   ├── in-memory-workflow-run.repository.ts
│   ├── in-memory-incident.repository.ts
│   └── in-memory-contract-compliance.repository.ts
└── operations.module.ts
```

### StatusAggregator (Pure Function)

The core aggregation logic is a **pure function** — no I/O, no side effects. This follows the same pattern as ValidationEngine.

```typescript
// status-aggregator.ts

export function aggregateOperationsStatus(
  scopeType: ScopeType,
  entityId: string | null,
  snapshot: ReleaseSnapshotDto,
  runs: WorkflowRunDto[],
  stageExecutions: StageExecutionDto[],
  incidents: IncidentDto[],
  compliances: ContractComplianceDto[],
  projectId: string,
): OperationsStatusDto {
  // 1. Build visual node ID map (same as validation overlay)
  // 2. For each entity in scope, compute EntityOperationStatusDto
  // 3. Escalate status (failed > blocked > running > idle)
  // 4. Generate badges
  // 5. Compute summary
}
```

### Service Layer

```typescript
class OperationsService {
  // --- CRUD: Workflow Runs ---
  async createRun(projectId: string, dto: CreateWorkflowRunDto): Promise<WorkflowRunDto>
  async getRun(runId: string): Promise<WorkflowRunDto>
  async listRuns(projectId: string, workflowId?: string): Promise<WorkflowRunDto[]>
  async updateRun(runId: string, dto: UpdateWorkflowRunDto): Promise<WorkflowRunDto>
  async advanceStage(runId: string, stageIndex: number, status: StageExecutionStatus): Promise<StageExecutionDto>

  // --- CRUD: Incidents ---
  async createIncident(projectId: string, dto: CreateIncidentDto): Promise<IncidentDto>
  async listIncidents(projectId: string, entityType?: NodeType, entityId?: string): Promise<IncidentDto[]>
  async updateIncident(incidentId: string, dto: UpdateIncidentDto): Promise<IncidentDto>
  async resolveIncident(incidentId: string): Promise<IncidentDto>

  // --- CRUD: Contract Compliance ---
  async setCompliance(projectId: string, dto: CreateContractComplianceDto): Promise<ContractComplianceDto>
  async listCompliances(projectId: string): Promise<ContractComplianceDto[]>
  async updateCompliance(complianceId: string, dto: UpdateContractComplianceDto): Promise<ContractComplianceDto>

  // --- Aggregated Status ---
  async getOperationsStatus(
    projectId: string,
    scopeType: ScopeType,
    entityId?: string | null,
  ): Promise<OperationsStatusDto>
}
```

#### `getOperationsStatus()` Implementation

1. Fetch current snapshot via `SnapshotCollector.collectSnapshot(projectId)`
2. Fetch active runs for the project
3. Fetch stage executions for active runs
4. Fetch open incidents for the project
5. Fetch contract compliances for the project
6. Call `aggregateOperationsStatus()` pure function
7. Return `OperationsStatusDto`

### Controller (REST API)

```
# Aggregated status (used by overlay)
GET /projects/:projectId/operations/status?scopeType=company&entityId=...

# Workflow Runs CRUD
GET    /projects/:projectId/operations/runs?workflowId=...
POST   /projects/:projectId/operations/runs
GET    /projects/:projectId/operations/runs/:runId
PATCH  /projects/:projectId/operations/runs/:runId
POST   /projects/:projectId/operations/runs/:runId/stages/:stageIndex/advance

# Incidents CRUD
GET    /projects/:projectId/operations/incidents?entityType=...&entityId=...
POST   /projects/:projectId/operations/incidents
PATCH  /projects/:projectId/operations/incidents/:incidentId
POST   /projects/:projectId/operations/incidents/:incidentId/resolve

# Contract Compliance
GET    /projects/:projectId/operations/compliance
POST   /projects/:projectId/operations/compliance
PATCH  /projects/:projectId/operations/compliance/:complianceId
```

### Module Registration

```typescript
// operations.module.ts
@Module({
  imports: [ReleasesModule],  // for SnapshotCollector
  controllers: [OperationsController],
  providers: [
    OperationsService,
    { provide: WORKFLOW_RUN_REPOSITORY, useClass: InMemoryWorkflowRunRepository },
    { provide: INCIDENT_REPOSITORY, useClass: InMemoryIncidentRepository },
    { provide: CONTRACT_COMPLIANCE_REPOSITORY, useClass: InMemoryContractComplianceRepository },
  ],
  exports: [OperationsService],
})
export class OperationsModule {}

// app.module.ts — add OperationsModule to imports
```

---

## Part 4: Gateway BFF

```typescript
// apps/api-gateway/src/company-model/company-design.client.ts — new methods

// Status
getOperationsStatus(projectId: string, scopeType: string, entityId?: string): Promise<OperationsStatusDto>

// Runs
listWorkflowRuns(projectId: string, workflowId?: string): Promise<WorkflowRunDto[]>
createWorkflowRun(projectId: string, dto: CreateWorkflowRunDto): Promise<WorkflowRunDto>
updateWorkflowRun(projectId: string, runId: string, dto: UpdateWorkflowRunDto): Promise<WorkflowRunDto>
advanceStage(projectId: string, runId: string, stageIndex: number, status: string): Promise<StageExecutionDto>

// Incidents
listIncidents(projectId: string, entityType?: string, entityId?: string): Promise<IncidentDto[]>
createIncident(projectId: string, dto: CreateIncidentDto): Promise<IncidentDto>
updateIncident(projectId: string, incidentId: string, dto: UpdateIncidentDto): Promise<IncidentDto>
resolveIncident(projectId: string, incidentId: string): Promise<IncidentDto>

// Compliance
listCompliances(projectId: string): Promise<ContractComplianceDto[]>
setCompliance(projectId: string, dto: CreateContractComplianceDto): Promise<ContractComplianceDto>
updateCompliance(projectId: string, complianceId: string, dto: UpdateContractComplianceDto): Promise<ContractComplianceDto>
```

```typescript
// apps/api-gateway/src/company-model/operations.controller.ts
@Controller('projects/:projectId/operations')
export class OperationsController { ... }
```

---

## Part 5: Shared Types Changes

### New LayerId

```typescript
export type LayerId =
  | 'organization'
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'governance'
  | 'artifacts'
  | 'operations'       // NEW
```

### New LAYER_DEFINITIONS entry

```typescript
{
  id: 'operations',
  label: 'Operations',
  nodeTypes: [],                    // no new node types — overlay decorates existing ones
  edgeTypes: [],                    // no new edge types
}
```

Operations layer is **special**: it doesn't filter nodes/edges by type. Instead, it toggles the operations overlay decorations on/off. The `nodeTypes: []` / `edgeTypes: []` means the layer doesn't add or remove nodes from the graph; it only controls badge rendering.

### Updated VIEW_PRESET_REGISTRY

```typescript
operations: {
  id: 'operations',
  label: 'Operations',
  description: 'Runtime state: active runs, incidents, compliance, and queue depths',
  icon: 'Activity',
  layers: ['workflows', 'contracts', 'operations'],  // ADD 'operations'
  emphasisNodeTypes: ['workflow', 'workflow-stage', 'contract', 'department'],
  emphasisEdgeTypes: ['participates_in', 'hands_off_to', 'bound_by'],
  availableAtScopes: ['company', 'department', 'workflow'],
},
```

### New Permission Strings

```typescript
// Add to VIEWER_PERMISSIONS
'operations:view',

// Add to EDITOR_PERMISSIONS
'operations:run:create', 'operations:run:advance',
'operations:incident:create', 'operations:incident:update',
'operations:compliance:set',
```

---

## Part 6: Frontend Overlay Architecture

### API Layer

```typescript
// apps/web/src/api/operations.ts

export const operationsApi = {
  getStatus(projectId: string, scopeType: ScopeType, entityId?: string): Promise<OperationsStatusDto>,
  listRuns(projectId: string, workflowId?: string): Promise<WorkflowRunDto[]>,
  createRun(projectId: string, dto: CreateWorkflowRunDto): Promise<WorkflowRunDto>,
  updateRun(projectId: string, runId: string, dto: UpdateWorkflowRunDto): Promise<WorkflowRunDto>,
  advanceStage(projectId: string, runId: string, stageIndex: number, status: string): Promise<StageExecutionDto>,
  listIncidents(projectId: string, entityType?: string, entityId?: string): Promise<IncidentDto[]>,
  createIncident(projectId: string, dto: CreateIncidentDto): Promise<IncidentDto>,
  updateIncident(projectId: string, incidentId: string, dto: UpdateIncidentDto): Promise<IncidentDto>,
  resolveIncident(projectId: string, incidentId: string): Promise<IncidentDto>,
  listCompliances(projectId: string): Promise<ContractComplianceDto[]>,
  setCompliance(projectId: string, dto: CreateContractComplianceDto): Promise<ContractComplianceDto>,
  updateCompliance(projectId: string, complianceId: string, dto: UpdateContractComplianceDto): Promise<ContractComplianceDto>,
}
```

### Hooks

```typescript
// apps/web/src/hooks/use-operations.ts

// Aggregated status for overlay (auto-polls)
export function useOperationsStatus(
  projectId: string,
  scopeType: ScopeType,
  entityId?: string,
  options?: { enabled?: boolean; pollingInterval?: number },
): {
  status: OperationsStatusDto | undefined
  isLoading: boolean
  error: Error | null
}
// Default pollingInterval: 30_000ms. Disabled when showOperationsOverlay = false.

// Runs
export function useWorkflowRuns(projectId: string, workflowId?: string): { ... }
export function useCreateWorkflowRun(projectId: string): { create: (...) => void; isPending: boolean }
export function useAdvanceStage(projectId: string): { advance: (...) => void; isPending: boolean }

// Incidents
export function useIncidents(projectId: string, entityType?: string, entityId?: string): { ... }
export function useCreateIncident(projectId: string): { create: (...) => void; isPending: boolean }
export function useResolveIncident(projectId: string): { resolve: (...) => void; isPending: boolean }

// Compliance
export function useContractCompliances(projectId: string): { ... }
export function useSetCompliance(projectId: string): { set: (...) => void; isPending: boolean }
```

#### Query Key Strategy

```typescript
['operations', 'status', projectId, scopeType, entityId]   // aggregated status
['operations', 'runs', projectId, workflowId?]              // runs list
['operations', 'incidents', projectId, entityType?, entityId?]  // incidents list
['operations', 'compliance', projectId]                      // compliance list
```

### Store Changes

```typescript
// visual-workspace-store.ts — new state

showOperationsOverlay: boolean     // default: false (opt-in, unlike validation which defaults true)
operationsStatus: OperationsStatusDto | null

// Actions
toggleOperationsOverlay(): void
setOperationsStatus(status: OperationsStatusDto | null): void
```

**Interaction with diff mode:** `enterDiffMode()` auto-disables `showOperationsOverlay` (operations are meaningless in diff context). `exitDiffMode()` restores previous value.

**Interaction with validation overlay:** Both can be active simultaneously. Validation badges appear top-right, operations badges appear bottom-right.

### Frontend Enrichment

Following the validation pattern exactly:

```typescript
// apps/web/src/lib/operations-enrichment.ts

/**
 * Maps operation status to a visual node and produces badge data for rendering.
 * Pure function — no I/O.
 */
export function enrichWithOperationsBadges(
  flowGraph: FlowGraph,
  operationsStatus: OperationsStatusDto,
): FlowGraph {
  const statusMap = new Map<string, EntityOperationStatusDto>()
  for (const entity of operationsStatus.entities) {
    statusMap.set(entity.visualNodeId, entity)
  }

  const enrichedNodes = flowGraph.nodes.map(node => {
    const opStatus = statusMap.get(node.id)
    if (!opStatus) return node
    return {
      ...node,
      data: {
        ...node.data,
        operationStatus: opStatus.operationStatus,
        operationBadges: opStatus.badges,
        activeRunCount: opStatus.activeRunCount,
        incidentCount: opStatus.incidentCount,
        queueDepth: opStatus.queueDepth,
        complianceStatus: opStatus.complianceStatus,
      },
    }
  })

  return { nodes: enrichedNodes, edges: flowGraph.edges }
}
```

### Visual Node Rendering

Operations badges are rendered in VisualNode alongside (not replacing) validation badges:

```
┌─────────────────────────────────────────┐
│ [validation badge]  ──────  top-right   │
│                                         │
│         Node Label                      │
│         Node Sublabel                   │
│                                         │
│ [operations badge]  ──────  bottom-right│
│ [collapse toggle]   ──────  bottom-left │
│ [drilldown icon]    ──────  bottom-right│
└─────────────────────────────────────────┘
```

**Badge positioning:** Operations badge is rendered at **bottom-left** to avoid collision with the drilldown chevron (bottom-right) and validation badge (top-right).

**Badge rendering:**

```typescript
// In visual-node.tsx

// Operations overlay badges (when showOperationsOverlay is true)
{operationStatus === 'running' && (
  <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
       title={`${activeRunCount} active run(s)`}>
    <Play className="h-3 w-3" />
  </div>
)}
{operationStatus === 'blocked' && (
  <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white"
       title="Blocked">
    <Pause className="h-3 w-3" />
  </div>
)}
{operationStatus === 'failed' && (
  <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white"
       title={`Failed: ${incidentCount} incident(s)`}>
    <XCircle className="h-3 w-3" />
  </div>
)}
{incidentCount > 0 && operationStatus !== 'failed' && (
  <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white"
       title={`${incidentCount} open incident(s)`}>
    <AlertOctagon className="h-3 w-3" />
  </div>
)}
```

**Color scheme:**

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| `running` | `bg-blue-500` | `Play` | Active execution |
| `blocked` | `bg-amber-500` | `Pause` | Waiting on dependency/approval |
| `failed` | `bg-red-600` | `XCircle` | Execution failure |
| `completed` | `bg-green-500` | `CheckCircle` | Successfully finished (transient) |
| `idle` | (no badge) | — | No activity |
| incident | `bg-orange-500` | `AlertOctagon` | Open incident |
| compliance-ok | `bg-green-500` | `Shield` | Contract compliant |
| compliance-risk | `bg-amber-500` | `ShieldAlert` | At risk |
| compliance-violated | `bg-red-600` | `ShieldX` | Contract violated |

### Edge Decorations

Edges get operation-aware styling when the overlay is active:

| Edge Type | Decoration | Condition |
|-----------|-----------|-----------|
| `hands_off_to` | Animated dashed stroke (CSS animation) | Source stage running, target stage pending |
| `hands_off_to` | Red stroke | Source stage failed |
| `bound_by` | Green/amber/red stroke | Contract compliance status |
| `participates_in` | Blue pulse | Participant's role is actively executing a stage |

Implementation: edge styling is applied in `graphToFlow()` edge conversion when operations data is present in node.data.

```typescript
// In graph-to-flow.ts, edge conversion when operations overlay active:

function applyOperationsEdgeStyle(edge: Edge, sourceOp: EntityOperationStatusDto | null, targetOp: EntityOperationStatusDto | null): Edge {
  if (!sourceOp && !targetOp) return edge

  const style = { ...edge.style }

  // Active handoff: animated stroke
  if (edge.data?.edgeType === 'hands_off_to' && sourceOp?.operationStatus === 'running') {
    style.stroke = '#3b82f6'  // blue-500
    style.strokeDasharray = '5 5'
    edge.animated = true
  }

  // Failed handoff
  if (edge.data?.edgeType === 'hands_off_to' && sourceOp?.operationStatus === 'failed') {
    style.stroke = '#dc2626'  // red-600
  }

  // Contract compliance
  if (edge.data?.edgeType === 'bound_by' && targetOp?.complianceStatus) {
    const colors = { compliant: '#16a34a', 'at-risk': '#d97706', violated: '#dc2626' }
    style.stroke = colors[targetOp.complianceStatus]
  }

  return { ...edge, style }
}
```

---

## Part 7: Route Integration

Following the existing validation overlay pattern:

```typescript
// In org.tsx, dept route, workflow route:

const { showOperationsOverlay, operationsStatus, setOperationsStatus } = useVisualWorkspaceStore()

// Fetch operations status (auto-polls when enabled)
const { status: opStatus } = useOperationsStatus(
  projectId,
  currentScope.scopeType,
  currentScope.entityId ?? undefined,
  { enabled: showOperationsOverlay },
)

// Sync to store
useEffect(() => {
  setOperationsStatus(opStatus ?? null)
}, [opStatus, setOperationsStatus])

// In graph enrichment chain (inside useMemo):
let result = graphToFlow(graph)
if (showValidationOverlay && validationResult?.issues?.length) {
  result = enrichWithValidationCounts(result, validationResult.issues, projectId)
}
if (showOperationsOverlay && operationsStatus) {
  result = enrichWithOperationsBadges(result, operationsStatus)
}
```

---

## Part 8: Toolbar & Explorer Integration

### Toolbar

Add an operations overlay toggle button next to the existing validation toggle:

```typescript
// canvas-toolbar.tsx additions

<ToolbarButton
  icon={Activity}
  tooltip="Toggle operations overlay"
  active={showOperationsOverlay}
  onClick={toggleOperationsOverlay}
  disabled={isDiffMode}
  data-testid="toolbar-toggle-operations-overlay"
/>
```

When operations overlay is active, show a freshness indicator:

```typescript
{showOperationsOverlay && operationsStatus && (
  <span className="text-xs text-muted-foreground" title={`Last updated: ${operationsStatus.fetchedAt}`}>
    <Clock className="mr-1 inline h-3 w-3" />
    {formatRelativeTime(operationsStatus.fetchedAt)}
  </span>
)}
```

### Preset Selector

Enable the operations preset (remove the "Coming soon" badge and disabled state):

```typescript
// preset-selector.tsx — remove the isOperations guard
// The preset now activates normally, and also auto-enables showOperationsOverlay
```

When the operations preset is activated:
1. `setActivePreset('operations')` sets layers and filters as usual
2. Additionally: `setShowOperationsOverlay(true)` — auto-enable the overlay
3. When preset is deactivated, overlay stays on (user explicitly toggled it)

### Explorer: Operations Tab

New tab in the Explorer sidebar:

```
Explorer > Operations tab
├── Summary
│   ├── 🔵 3 active runs
│   ├── 🟡 1 blocked stage
│   ├── 🔴 2 open incidents
│   └── ✅ 5/6 contracts compliant
├── Active Runs
│   ├── ▶ Onboarding Workflow (Stage 2/4)     → click to focus
│   ├── ▶ Deployment Pipeline (Stage 1/3)     → click to focus
│   └── ▶ Customer Intake (Completed)          → dimmed
├── Incidents
│   ├── 🔴 Critical: Handoff timeout           → click to focus
│   └── 🟡 Minor: Missing artifact              → click to focus
└── Compliance
    ├── ✅ Data Processing SLA                  → click to focus
    ├── ⚠ Customer Response SLA                → click to focus
    └── ❌ Delivery Agreement                   → click to focus
```

Clicking any item focuses the relevant node on canvas.

**Component structure:**

```typescript
// apps/web/src/components/visual-shell/explorer/operations-panel.tsx

interface OperationsPanelProps {
  projectId: string
  operationsStatus: OperationsStatusDto | null
  onFocusNode: (visualNodeId: string) => void
}
```

### Inspector: Operations Tab

When a node is selected and operations overlay is active, add an "Operations" tab showing:

- Current operation status for the selected entity
- Active runs (if workflow/stage)
- Open incidents
- Compliance status (if contract)
- Actions: "Start Run", "Report Incident", "Update Compliance"

This follows the existing tab pattern (STANDARD_TABS, READ_ONLY_TABS, DIFF_TABS):

```typescript
// When showOperationsOverlay is true:
const OPS_TABS = [...STANDARD_TABS, 'operations']
```

---

## Part 9: Interaction Flows

### Flow 1: View operations status

1. User clicks operations overlay toggle (or activates operations preset)
2. `showOperationsOverlay` → `true`
3. `useOperationsStatus` fires API call
4. `OperationsStatusDto` returned, synced to store
5. `enrichWithOperationsBadges` decorates flow nodes
6. Canvas re-renders with operation badges on relevant nodes
7. Polling begins (30s interval)

### Flow 2: Start a workflow run

1. User right-clicks a workflow node → context menu → "Start Run"
2. `createWorkflowRun({ workflowId })` API call
3. Backend creates WorkflowRun + StageExecutions (all pending)
4. Operations status query invalidated → re-fetched
5. Workflow node now shows "running" badge
6. First stage shows "running" badge

### Flow 3: Advance a stage

1. User clicks a running stage → inspector → Operations tab → "Complete Stage" button
2. `advanceStage(runId, stageIndex, 'completed')` API call
3. Next stage auto-transitions to `'running'`
4. Operations status re-fetched
5. Canvas updates: current stage loses badge, next stage gains "running" badge, handoff edge animates

### Flow 4: Report an incident

1. User right-clicks any entity → "Report Incident"
2. Dialog opens: severity select, title, description
3. `createIncident({ entityType, entityId, severity, title, description })`
4. Entity gains incident badge
5. Explorer Operations tab shows new incident

### Flow 5: Check contract compliance

1. User selects a contract → inspector → Operations tab
2. Shows current compliance status or "Not checked"
3. "Set Compliance" button → status select + reason
4. Contract edge color updates to reflect compliance

### Flow 6: Drill into workflow with active runs

1. User is at L1 with operations overlay active
2. Workflow node shows "3 running" badge
3. User drills into workflow (L3)
4. Operations status re-fetches for workflow scope
5. Individual stages show their execution status (pending/running/blocked/completed)
6. Handoff edges between stages animate for active transitions

---

## Part 10: Context Menu Integration

New context menu actions when operations overlay is active:

### Node context menu additions

```typescript
// context-menu-actions.ts — new section when showOperationsOverlay

// For workflow nodes:
{ id: 'start-run', label: 'Start Run', icon: 'Play', section: 'operations' }
{ id: 'view-runs', label: 'View Runs', icon: 'List', section: 'operations' }

// For any node:
{ id: 'report-incident', label: 'Report Incident', icon: 'AlertOctagon', section: 'operations' }

// For contract nodes:
{ id: 'check-compliance', label: 'Set Compliance', icon: 'Shield', section: 'operations' }

// For running stage nodes:
{ id: 'advance-stage', label: 'Complete Stage', icon: 'CheckCircle', section: 'operations' }
{ id: 'block-stage', label: 'Block Stage', icon: 'Pause', section: 'operations' }
```

Operations context menu actions are **permission-gated** (`operations:run:create`, `operations:incident:create`, etc.).

---

## Part 11: What This Does NOT Change

1. **Visual grammar node/edge types** — No new NodeType or EdgeType. Operations decorate existing entities.
2. **Graph projection** — The graph projection pipeline is unchanged. Operations is a separate data stream.
3. **Release/snapshot system** — Operations data is NOT part of releases. Runs, incidents, and compliance are transient runtime state.
4. **Audit** — Operations CRUD is audited via the existing @Optional() AuditService pattern.
5. **Diff system** — Operations overlay is disabled in diff mode.
6. **Connection rules** — No new connection rules.

---

## Implementation Slices for CAV-019

### CAV-019a: Shared Types (~10 tests)
**Scope:** `packages/shared-types/src/index.ts`
- Add `OperationStatus`, `WorkflowRunStatus`, `StageExecutionStatus`, `IncidentSeverity`, `IncidentStatus`, `ComplianceStatus`
- Add `WorkflowRunDto`, `CreateWorkflowRunDto`, `UpdateWorkflowRunDto`
- Add `StageExecutionDto`
- Add `IncidentDto`, `CreateIncidentDto`, `UpdateIncidentDto`
- Add `ContractComplianceDto`, `CreateContractComplianceDto`, `UpdateContractComplianceDto`
- Add `QueueDepthDto`
- Add `EntityOperationStatusDto`, `OperationBadge`, `OperationBadgeType`, `OperationsStatusDto`, `OperationsSummary`
- Add `'operations'` to `LayerId`
- Update `LAYER_DEFINITIONS` with operations entry
- Update `VIEW_PRESET_REGISTRY['operations']` with emphasis types and operations layer
- Add operations permissions to `EDITOR_PERMISSIONS` and `VIEWER_PERMISSIONS`

### CAV-019b: Backend Domain + Repositories (~50 tests)
**Scope:** `services/company-design/src/operations/domain/`, `infrastructure/`
- `WorkflowRun` aggregate (create, status transitions, stage auto-creation)
- `StageExecution` entity (advance, block, fail, complete)
- `Incident` aggregate (create, acknowledge, resolve)
- `ContractCompliance` aggregate (create, update status)
- Repository interfaces + Symbol tokens
- `InMemoryWorkflowRunRepository`, `InMemoryIncidentRepository`, `InMemoryContractComplianceRepository`

### CAV-019c: Backend StatusAggregator (~30 tests)
**Scope:** `services/company-design/src/operations/application/status-aggregator.ts`
- Pure `aggregateOperationsStatus()` function
- Per-entity status computation (workflow, stage, department, contract, etc.)
- Worst-case escalation logic
- Badge generation
- Summary computation
- Scope-aware filtering (only entities visible in current scope)
- Visual node ID mapping (reuses validation-overlay pattern)

### CAV-019d: Backend Service + Controller (~30 tests)
**Scope:** `services/company-design/src/operations/application/`
- `OperationsService` (CRUD for runs/incidents/compliance + getOperationsStatus)
- `OperationsController` (REST endpoints)
- `OperationsMapper`
- `OperationsModule` registered in AppModule
- AuditService integration

### CAV-019e: Gateway BFF (~10 tests)
**Scope:** `apps/api-gateway/src/company-model/`
- `CompanyDesignClient` new operations methods (14 methods)
- `OperationsController` proxy
- `CompanyModelModule` updated

### CAV-019f: Frontend API + Hooks (~20 tests)
**Scope:** `apps/web/src/api/operations.ts`, `apps/web/src/hooks/use-operations.ts`
- `operationsApi` (all endpoints)
- `useOperationsStatus` (with polling), `useWorkflowRuns`, `useCreateWorkflowRun`, `useAdvanceStage`
- `useIncidents`, `useCreateIncident`, `useResolveIncident`
- `useContractCompliances`, `useSetCompliance`
- Store: `showOperationsOverlay`, `operationsStatus`, `toggleOperationsOverlay()`, `setOperationsStatus()`

### CAV-019g: Frontend Overlay Rendering (~25 tests)
**Scope:** `apps/web/src/lib/operations-enrichment.ts`, visual-node.tsx, graph-to-flow.ts
- `enrichWithOperationsBadges()` pure function
- VisualNode: operations badge rendering (status-based icon + color, bottom-left position)
- Edge operation styling (`applyOperationsEdgeStyle`)
- Toolbar: operations overlay toggle button + freshness indicator
- Preset selector: enable operations preset (remove Coming Soon guard)
- Route integration: useOperationsStatus + enrichment in org/dept/workflow routes

### CAV-019h: Explorer Operations Panel + Inspector Tab (~25 tests)
**Scope:** `apps/web/src/components/visual-shell/explorer/operations-panel.tsx`, inspector
- OperationsPanel (summary + active runs + incidents + compliance)
- Inspector operations tab (per-entity status, action buttons)
- Context menu: operations actions (start run, report incident, etc.)
- Permission gating for operations actions

**Estimated total: ~200 tests across 8 slices.**

---

## API Contract Summary

```
# Aggregated status (overlay data)
GET /projects/:projectId/operations/status?scopeType=company&entityId=...
  → OperationsStatusDto

# Workflow Runs
GET    /projects/:projectId/operations/runs?workflowId=...
  → WorkflowRunDto[]
POST   /projects/:projectId/operations/runs
  Body: { workflowId }
  → WorkflowRunDto
PATCH  /projects/:projectId/operations/runs/:runId
  Body: { status?, currentStageIndex?, failureReason? }
  → WorkflowRunDto
POST   /projects/:projectId/operations/runs/:runId/stages/:stageIndex/advance
  Body: { status: 'completed' | 'blocked' | 'failed', blockReason? }
  → StageExecutionDto

# Incidents
GET    /projects/:projectId/operations/incidents?entityType=...&entityId=...
  → IncidentDto[]
POST   /projects/:projectId/operations/incidents
  Body: { entityType, entityId, severity, title, description }
  → IncidentDto
PATCH  /projects/:projectId/operations/incidents/:incidentId
  Body: { severity?, status?, description? }
  → IncidentDto
POST   /projects/:projectId/operations/incidents/:incidentId/resolve
  → IncidentDto

# Contract Compliance
GET    /projects/:projectId/operations/compliance
  → ContractComplianceDto[]
POST   /projects/:projectId/operations/compliance
  Body: { contractId, status, reason? }
  → ContractComplianceDto
PATCH  /projects/:projectId/operations/compliance/:complianceId
  Body: { status?, reason? }
  → ContractComplianceDto
```

---

## Acceptance Criteria (Checklist H in doc 19)

After CAV-019 implementation:
- [ ] Los errores de validación son navegables desde canvas y sidebar (already done — validation overlay)
- [ ] Existe overlay de runtime/operations (operations toggle + badges + enrichment)
- [ ] Existen estados visuales de incidentes o bloqueos (incident badges, blocked stage indicators)

Additional criteria:
- [ ] Operations overlay toggle works independently of validation overlay
- [ ] Operations badges render without colliding with validation badges
- [ ] Operations preset activates overlay + sets appropriate layers/filters
- [ ] Workflow runs can be created, advanced, and completed via UI
- [ ] Incidents can be reported and resolved
- [ ] Contract compliance can be set and updated
- [ ] Operations panel in Explorer shows aggregated runtime state
- [ ] Inspector operations tab shows entity-specific runtime state
- [ ] Context menu shows operations actions when overlay is active
- [ ] Operations overlay is auto-disabled in diff mode
- [ ] Polling refreshes operations data every 30s when overlay is active
- [ ] Operations CRUD is permission-gated

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Simulated operations (manual CRUD, not real execution) | TheCrew v1 designs companies, doesn't run them. Operations overlay proves the visual model; real execution comes later. |
| Separate data stream from graph projection | Operations state is transient and changes frequently. Coupling it to the design graph would add unnecessary refetch overhead and complexity. |
| Polling-based (no WebSocket) | Simplicity for v1. 30s polling is sufficient for a design tool. Real-time push is a future optimization. |
| Aggregated status endpoint (not per-entity) | One API call per scope fetch vs. N calls per entity. The StatusAggregator pre-computes visual node IDs for efficient frontend matching. |
| Operations layer with empty nodeTypes/edgeTypes | Novel approach: the layer controls overlay visibility, not entity filtering. This avoids creating new visual entities while leveraging the existing layer toggle UI. |
| Badge position: bottom-left | Avoids collision with validation badges (top-right), drilldown chevron (bottom-right), and collapse toggle (left side). |
| Operations not in releases/snapshots | Runtime state is temporal, not designable. Including it in snapshots would contaminate the versioned company model. |
| WorkflowRun creates StageExecutions eagerly | When a run starts, all stages get `'pending'` entries. This simplifies queue depth computation and stage tracking. |
| Incidents tied to any NodeType | Any entity can have incidents, not just workflows. A department can have an organizational incident, a contract can have a compliance incident. |
| 8 implementation slices | Matches established pattern. Backend-first (types → domain → service → gateway), then frontend (API → hooks → rendering → panels). |
