# Runtime / Live Mode — Implementation Plan

> Produced by LCP-008. Authoritative reference for LCP-015 (live mode implementation) and all downstream runtime tasks.
> Inputs: docs/33 (domain model, §14 RuntimeExecution), docs/36 (runtime spec), docs/43 (canvas v3, §10 Live Mode), docs/35 (growth protocol).

---

## 1. Current State Assessment

### 1.1 What already exists

| Layer | Asset | Status |
|-------|-------|--------|
| Domain entities | `WorkflowRun`, `StageExecution`, `Incident`, `ContractCompliance` | Implemented in `services/company-design/src/operations/` |
| Service layer | `OperationsService`, `StatusAggregator` | Full CRUD + status escalation logic |
| Backend API | REST endpoints for runs, stages, incidents, compliance | Via `operations.controller.ts` |
| API Gateway | Proxy endpoints under `/projects/:projectId/operations/` | Implemented |
| Shared types | `RuntimeExecutionDto`, `RuntimeErrorDto`, `ApprovalRecordDto` | Defined in `live-company-types.ts` (bridge types) |
| Frontend API | `operationsApi` — polls status every 30s via React Query | Implemented |
| Store | `showOperationsOverlay`, `operationsStatus` in workspace store | Implemented |
| Components | `OperationsPanel` (explorer), `OperationsTab` (inspector) | Implemented |
| Overlay | `live-status` overlay defined in `OVERLAY_DEFINITIONS` | Type exists, no runtime data flow |

### 1.2 What is missing

| Gap | Severity | Notes |
|-----|----------|-------|
| RuntimeExecution aggregate | High | New entity wrapping workflow runs + agent tasks with richer observability |
| RuntimeEvent / timeline | High | No event stream — only status snapshots |
| Real-time push | Medium | Poll-only (30s) — no SSE or WebSocket |
| Domain event bus | Medium | `DomainEvent` interface exists in `domain-core` but is not wired |
| Agent activity tracking | High | No concept of agent task execution |
| Budget/cost tracking | Medium | No AI cost accumulation per execution |
| Approval flow runtime | Medium | No approval lifecycle tracking during execution |
| Replay capability | Low | No event replay or execution history |
| Canvas live badges | Medium | Badge system defined in spec but not data-connected |
| Design ↔ Live mode toggle | Medium | Store toggle exists but no behavioral enforcement |

---

## 2. Architecture Overview

### 2.1 Runtime stack layers

```
┌─────────────────────────────────────────────────────────┐
│  Canvas (live-status overlay)                           │
│  ┌───────────┐ ┌──────────┐ ┌─────────────────┐        │
│  │ Node      │ │ Edge     │ │ Timeline Panel  │        │
│  │ Badges    │ │ Anims    │ │ (RuntimeEvents) │        │
│  └─────┬─────┘ └─────┬────┘ └────────┬────────┘        │
│        │              │               │                 │
│  ┌─────┴──────────────┴───────────────┴──────────┐      │
│  │  RuntimeStatusStore (Zustand)                 │      │
│  │  - nodeStatuses: Map<entityId, NodeRuntimeStatus>│   │
│  │  - activeExecutions: RuntimeExecutionDto[]    │      │
│  │  - recentEvents: RuntimeEventDto[]            │      │
│  │  - costSummary: CostSummaryDto                │      │
│  └─────────────────────┬─────────────────────────┘      │
│                        │                                │
│  ┌─────────────────────┴─────────────────────────┐      │
│  │  SSE Connection (EventSource)                 │      │
│  │  GET /projects/:projectId/runtime/events/stream│     │
│  │  + React Query for initial state              │      │
│  └─────────────────────┬─────────────────────────┘      │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│  API Gateway           │                                │
│  ┌─────────────────────┴─────────────────────────┐      │
│  │  RuntimeController                            │      │
│  │  - GET /runtime/status                        │      │
│  │  - GET /runtime/executions                    │      │
│  │  - GET /runtime/events                        │      │
│  │  - GET /runtime/events/stream (SSE)           │      │
│  │  - GET /runtime/timeline                      │      │
│  │  - GET /runtime/cost-summary                  │      │
│  └─────────────────────┬─────────────────────────┘      │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│  company-design service│                                │
│  ┌─────────────────────┴─────────────────────────┐      │
│  │  RuntimeModule                                │      │
│  │  ┌──────────────────┐ ┌─────────────────────┐ │      │
│  │  │ RuntimeExecution │ │ RuntimeEvent        │ │      │
│  │  │ (AggregateRoot)  │ │ (Entity)            │ │      │
│  │  └──────────────────┘ └─────────────────────┘ │      │
│  │  ┌──────────────────┐ ┌─────────────────────┐ │      │
│  │  │ RuntimeService   │ │ EventEmitter        │ │      │
│  │  │                  │ │ (internal pub/sub)  │ │      │
│  │  └──────────────────┘ └─────────────────────┘ │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │  OperationsModule (preserved)                 │      │
│  │  WorkflowRun, StageExecution, Incident,       │      │
│  │  ContractCompliance                           │      │
│  └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Design principle

The runtime system is a **read-heavy observability layer** on top of operations. It does not replace the existing operations module — it wraps and extends it with:

1. **Unified execution model** — `RuntimeExecution` wraps both `WorkflowRun` (via operations module) and agent tasks (new).
2. **Event stream** — `RuntimeEvent` records every meaningful state change.
3. **Real-time push** — SSE pushes events to the frontend instead of polling.
4. **Status projection** — Status aggregator computes per-node runtime state for canvas badges.
5. **Cost tracking** — AI token/cost accumulation per execution and per agent.

---

## 3. Domain Model — Runtime Module

### 3.1 RuntimeExecution (Aggregate Root)

Defined in docs/33 §14. Implementation spec:

```typescript
// services/company-design/src/runtime/domain/runtime-execution.ts

import { AggregateRoot } from '@the-crew/domain-core'

type RuntimeExecutionType = 'workflow-run' | 'agent-task'

type RuntimeExecutionStatus =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled'

interface RuntimeExecutionProps {
  id: string
  projectId: string
  executionType: RuntimeExecutionType
  workflowId: string | null
  agentId: string | null
  status: RuntimeExecutionStatus
  startedAt: Date | null
  completedAt: Date | null
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  errors: RuntimeErrorProps[]
  waitingFor: string | null
  approvals: ApprovalRecordProps[]
  aiCost: number
  logSummary: string
  parentExecutionId: string | null   // for nested executions (workflow run → agent tasks)
  operationsRunId: string | null     // back-reference to existing WorkflowRun
  createdAt: Date
  updatedAt: Date
}

interface RuntimeErrorProps {
  message: string
  occurredAt: Date
  severity: 'warning' | 'error' | 'fatal'
  context: string | null
}

interface ApprovalRecordProps {
  requestedAt: Date
  approvedAt: Date | null
  approvedBy: string | null
  subject: string
  status: 'pending' | 'approved' | 'rejected'
}
```

#### Key additions vs docs/33

| Field | Reason |
|-------|--------|
| `parentExecutionId` | Workflow run spawns agent task executions — enables tree traversal |
| `operationsRunId` | Links to existing `WorkflowRun.id` for backward compatibility |

#### Invariants

- `workflowId` required when `executionType === 'workflow-run'`.
- `agentId` required when `executionType === 'agent-task'`.
- `completedAt` set only when status is terminal (`completed`, `failed`, `cancelled`).
- `aiCost >= 0`.
- `parentExecutionId` cannot reference itself.
- Status transitions:

```
pending → running → completed
                  → failed
                  → cancelled
running → waiting → running
                  → blocked → running
                            → failed
                            → cancelled
```

#### Domain Events emitted

- `RuntimeExecutionStarted { executionId, projectId, executionType, workflowId?, agentId? }`
- `RuntimeExecutionStatusChanged { executionId, from, to, waitingFor? }`
- `RuntimeExecutionCompleted { executionId, status, output, aiCost }`
- `RuntimeExecutionFailed { executionId, error }`
- `RuntimeExecutionBlocked { executionId, waitingFor }`
- `ApprovalRequested { executionId, subject }`
- `ApprovalResolved { executionId, subject, status, approvedBy? }`

### 3.2 RuntimeEvent (Entity)

New entity — the backbone of the event stream / timeline.

```typescript
// services/company-design/src/runtime/domain/runtime-event.ts

import { Entity } from '@the-crew/domain-core'

type RuntimeEventType =
  // Execution lifecycle
  | 'execution-started'
  | 'execution-completed'
  | 'execution-failed'
  | 'execution-blocked'
  | 'execution-waiting'
  // Stage/handoff
  | 'stage-entered'
  | 'stage-completed'
  | 'stage-failed'
  | 'handoff-initiated'
  | 'handoff-completed'
  | 'handoff-failed'
  | 'handoff-timed-out'
  // Artifacts
  | 'artifact-produced'
  | 'artifact-approved'
  | 'artifact-rejected'
  // Decisions & governance
  | 'proposal-created'
  | 'proposal-approved'
  | 'proposal-rejected'
  | 'decision-made'
  // Incidents
  | 'incident-detected'
  | 'incident-resolved'
  | 'escalation-raised'
  // Budget
  | 'budget-alert'
  | 'budget-exceeded'
  // Agent
  | 'agent-activated'
  | 'agent-idle'
  | 'agent-error'
  // Objective
  | 'objective-achieved'
  | 'objective-abandoned'

type EventSeverity = 'info' | 'warning' | 'error' | 'critical'

interface RuntimeEventProps {
  id: string
  projectId: string
  eventType: RuntimeEventType
  severity: EventSeverity
  title: string
  description: string
  sourceEntityType: string      // NodeType of the source (e.g., 'coordinator-agent')
  sourceEntityId: string        // ID of the source entity
  targetEntityType: string | null
  targetEntityId: string | null
  executionId: string | null    // link to RuntimeExecution if applicable
  metadata: Record<string, unknown>   // event-type-specific data
  occurredAt: Date
}
```

#### Invariants

- `title` cannot be empty.
- `sourceEntityType` + `sourceEntityId` are required.
- `occurredAt` cannot be in the future.
- Events are append-only — no updates or deletes.

#### Query patterns

| Query | Use case |
|-------|----------|
| By project, paginated, newest-first | Global timeline |
| By project + scope (UO, agent, workflow) | Scoped timeline |
| By executionId | Execution detail replay |
| By eventType + time range | Filtered timeline (e.g., "show all incidents last 24h") |
| By severity >= warning | Alert/issue timeline |

### 3.3 AgentActivityStatus (Value Object)

Computed view — not persisted as entity, derived from active RuntimeExecutions.

```typescript
type AgentRuntimeState = 'idle' | 'active' | 'waiting' | 'blocked' | 'error'

interface AgentActivityStatus {
  agentId: string
  state: AgentRuntimeState
  activeExecutionCount: number
  queuedTaskCount: number
  lastActivityAt: Date | null
  currentExecutionId: string | null
  accumulatedCost: number          // USD, current billing period
  errorCountLast24h: number
}
```

### 3.4 NodeRuntimeStatus (Value Object)

Canvas-facing projection — one per visible node when live-status overlay is active.

```typescript
type NodeRuntimeState = 'idle' | 'active' | 'waiting' | 'blocked' | 'error' | 'degraded'

interface NodeRuntimeStatus {
  entityId: string
  entityType: string              // NodeType
  state: NodeRuntimeState
  badges: RuntimeBadge[]
  lastEventAt: Date | null
}

type RuntimeBadgeType = 'running' | 'waiting' | 'blocked' | 'error' | 'queue' | 'cost'

interface RuntimeBadge {
  type: RuntimeBadgeType
  label: string                   // e.g., "3 queued", "$12.40", "Error"
  severity: 'info' | 'warning' | 'error'
}
```

---

## 4. Module Structure

```
services/company-design/src/
  runtime/
    domain/
      runtime-execution.ts              # AggregateRoot
      runtime-execution.repository.ts   # Repository interface
      runtime-event.ts                  # Entity
      runtime-event.repository.ts       # Repository interface (append-only)
      runtime-error.vo.ts               # ValueObject
      approval-record.vo.ts             # ValueObject
      node-runtime-status.vo.ts         # Computed projection
      agent-activity-status.vo.ts       # Computed projection
    application/
      runtime.service.ts                # Orchestrates executions, emits events
      runtime-status.projector.ts       # Computes NodeRuntimeStatus from executions + events
      runtime-timeline.service.ts       # Timeline queries and filtering
      runtime-cost.service.ts           # Budget/cost aggregation
      runtime.controller.ts             # NestJS REST + SSE controller
      runtime.mapper.ts                 # Domain ↔ DTO mapping
    infra/
      in-memory-runtime-execution.repository.ts
      in-memory-runtime-event.repository.ts
      runtime-event-emitter.ts          # NestJS EventEmitter2 bridge
    runtime.module.ts
```

### Relationship to existing operations module

```
operations/                         runtime/
├── WorkflowRun          ←───────── RuntimeExecution (wraps, type: workflow-run)
├── StageExecution       ←───────── RuntimeEvent (stage-entered, stage-completed)
├── Incident             ←───────── RuntimeEvent (incident-detected, incident-resolved)
├── ContractCompliance   ←───────── RuntimeEvent (budget-alert if violated)
└── StatusAggregator     ←───────── RuntimeStatusProjector (supersedes for live mode)
```

The operations module is **preserved** during LCP-015. RuntimeExecution references `WorkflowRun` via `operationsRunId`. The runtime module adds the event stream and richer status model on top. After validation, the status aggregator in operations can be deprecated in favor of `RuntimeStatusProjector`.

---

## 5. Backend API

### 5.1 REST endpoints

```typescript
// New RuntimeController endpoints

// Status
GET /projects/:projectId/runtime/status
  → RuntimeStatusResponse { nodeStatuses: NodeRuntimeStatus[], summary: RuntimeSummary }

GET /projects/:projectId/runtime/status/:entityId
  → NodeRuntimeStatus

// Executions
GET /projects/:projectId/runtime/executions
  → PaginatedResponse<RuntimeExecutionDto>
  Query: ?status=running&type=workflow-run&page=1&limit=20

GET /projects/:projectId/runtime/executions/:executionId
  → RuntimeExecutionDto (with child executions if workflow-run)

POST /projects/:projectId/runtime/executions
  → RuntimeExecutionDto
  Body: CreateRuntimeExecutionDto

PATCH /projects/:projectId/runtime/executions/:executionId
  → RuntimeExecutionDto
  Body: UpdateRuntimeExecutionDto (status changes, add error, add approval)

// Timeline / events
GET /projects/:projectId/runtime/events
  → PaginatedResponse<RuntimeEventDto>
  Query: ?eventType=...&severity=...&sourceEntityId=...&executionId=...&since=...&until=...&page=1&limit=50

// SSE stream
GET /projects/:projectId/runtime/events/stream
  → SSE stream of RuntimeEventDto
  Query: ?scope=company|department|team|agent&entityId=...
  Headers: Accept: text/event-stream

// Cost
GET /projects/:projectId/runtime/cost-summary
  → CostSummaryDto { totalCost, costByAgent[], costByWorkflow[], period }
```

### 5.2 SSE (Server-Sent Events) design

**Why SSE over WebSocket:**

| Criterion | SSE | WebSocket |
|-----------|-----|-----------|
| Direction | Server → client (sufficient for observability) | Bidirectional |
| Protocol | HTTP (works with existing middleware, CORS, auth) | Upgrade to ws:// |
| Auto-reconnect | Built into EventSource API | Manual |
| Complexity | Low — NestJS has `@Sse()` decorator | Medium — needs gateway |
| Load balancing | Standard HTTP | Sticky sessions needed |

SSE is the right choice because the runtime system is read-only from the frontend's perspective. All mutations (start execution, advance stage) go through REST.

#### SSE implementation

```typescript
// API Gateway — RuntimeController

@Sse('events/stream')
streamEvents(
  @Param('projectId') projectId: string,
  @Query('scope') scope?: string,
  @Query('entityId') entityId?: string,
): Observable<MessageEvent<RuntimeEventDto>> {
  return this.runtimeService.getEventStream(projectId, scope, entityId)
}
```

```typescript
// company-design RuntimeService — internal event emitter

@Injectable()
export class RuntimeService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    // ...repositories
  ) {}

  async emitRuntimeEvent(event: RuntimeEvent): Promise<void> {
    await this.runtimeEventRepository.append(event)
    this.eventEmitter.emit('runtime.event', event)
  }

  getEventStream(
    projectId: string,
    scope?: string,
    entityId?: string,
  ): Observable<RuntimeEventDto> {
    return new Observable((subscriber) => {
      const handler = (event: RuntimeEvent) => {
        if (event.projectId !== projectId) return
        if (scope && entityId && !this.matchesScope(event, scope, entityId)) return
        subscriber.next(this.mapper.toDto(event))
      }
      this.eventEmitter.on('runtime.event', handler)
      return () => this.eventEmitter.off('runtime.event', handler)
    })
  }
}
```

#### Event format (SSE)

```
event: runtime-event
data: {"id":"evt-1","eventType":"execution-started","severity":"info","title":"Content Pipeline started","sourceEntityType":"workflow","sourceEntityId":"wf-1",...}

event: runtime-event
data: {"id":"evt-2","eventType":"stage-entered","severity":"info","title":"Stage: Research entered","sourceEntityType":"workflow-stage","sourceEntityId":"stage-1",...}

event: runtime-event
data: {"id":"evt-3","eventType":"agent-error","severity":"error","title":"Research Agent: API timeout","sourceEntityType":"specialist-agent","sourceEntityId":"agent-5",...}
```

### 5.3 Scope filtering for SSE

The SSE stream supports scope-based filtering so the frontend only receives events relevant to the current canvas view:

| Scope | Events included |
|-------|----------------|
| `company` | All events for the project |
| `department:$id` | Events where source or target entity belongs to the department or its children |
| `team:$id` | Events where source or target entity belongs to the team |
| `agent:$id` | Events where source entity is the agent or execution involves the agent |

---

## 6. Internal Event Bus

### 6.1 Technology choice

**NestJS EventEmitter2** (already a NestJS dependency):
- In-process pub/sub — sufficient for single-service architecture.
- Typed events via decorator `@OnEvent('runtime.event')`.
- No external infrastructure needed.
- When the system scales to multi-instance, bridge to Redis Pub/Sub (infrastructure already planned for inter-service communication).

### 6.2 Event flow

```
Domain action (e.g., advance stage)
  → OperationsService.advanceStage()
  → StageExecution.advance()
  → RuntimeService.onStageAdvanced(stageExecution)
    → creates RuntimeEvent('stage-completed')
    → creates RuntimeEvent('handoff-initiated') if next stage exists
    → updates RuntimeExecution status
    → emits via EventEmitter2
      → SSE handler pushes to connected clients
      → RuntimeStatusProjector recomputes affected node statuses
```

### 6.3 Integration points with existing operations module

The runtime module subscribes to operations-level changes and projects them into RuntimeEvents:

| Operations action | RuntimeEvent(s) generated |
|-------------------|--------------------------|
| `createWorkflowRun()` | `execution-started` |
| `advanceStage()` | `stage-completed` (prev) + `stage-entered` (next) + `handoff-completed` |
| `updateRun(status: 'completed')` | `execution-completed` |
| `updateRun(status: 'failed')` | `execution-failed` |
| `createIncident()` | `incident-detected` |
| `resolveIncident()` | `incident-resolved` |
| `setCompliance(status: 'violated')` | `budget-alert` |

This integration is done via `@OnEvent()` decorators in the runtime module — the operations module is not modified.

---

## 7. Frontend Architecture

### 7.1 New store: RuntimeStatusStore

Separate from `visual-workspace-store` to keep concerns clean.

```typescript
// apps/web/src/stores/runtime-status-store.ts

interface RuntimeStatusState {
  // Connection
  connected: boolean
  connectionError: string | null

  // Per-node status (used by canvas badges)
  nodeStatuses: Map<string, NodeRuntimeStatus>

  // Active executions (used by operations panel + inspector)
  activeExecutions: RuntimeExecutionDto[]

  // Recent events (used by timeline panel)
  recentEvents: RuntimeEventDto[]
  eventBuffer: RuntimeEventDto[]        // unread events since last render

  // Cost
  costSummary: CostSummaryDto | null

  // Actions
  connect: (projectId: string, scope?: string, entityId?: string) => void
  disconnect: () => void
  getNodeStatus: (entityId: string) => NodeRuntimeStatus | null
  getExecutionsForEntity: (entityId: string) => RuntimeExecutionDto[]
  getEventsForEntity: (entityId: string) => RuntimeEventDto[]
}
```

### 7.2 SSE connection lifecycle

```typescript
// apps/web/src/hooks/use-runtime-stream.ts

function useRuntimeStream(projectId: string, canvasMode: 'design' | 'live') {
  const store = useRuntimeStatusStore()

  useEffect(() => {
    if (canvasMode !== 'live') {
      store.disconnect()
      return
    }

    store.connect(projectId)

    return () => store.disconnect()
  }, [projectId, canvasMode])
}
```

Connection rules:
- SSE connects **only when Live Mode is active** (saves resources in Design Mode).
- On scope change (drill-in/out), reconnect with new scope filter.
- On disconnect/error, EventSource auto-reconnects (built-in).
- Initial state is fetched via REST (`GET /runtime/status`), then SSE streams deltas.

### 7.3 Canvas badge integration

When `live-status` overlay is active, each node receives a `RuntimeBadge[]` from the store:

```typescript
// In node component (e.g., CoordinatorAgentNode)

function CoordinatorAgentNode({ data }: NodeProps) {
  const canvasMode = useVisualWorkspaceStore(s => s.canvasMode)
  const nodeStatus = useRuntimeStatusStore(s => s.getNodeStatus(data.entityId))

  return (
    <div className={nodeStatusClass(nodeStatus?.state)}>
      {/* normal node content */}
      {canvasMode === 'live' && nodeStatus && (
        <RuntimeBadges badges={nodeStatus.badges} />
      )}
    </div>
  )
}
```

Badge rendering:

| Badge type | Visual | Condition |
|------------|--------|-----------|
| `running` | Green pulse dot | Entity has active execution |
| `waiting` | Amber pulse dot | Entity execution in `waiting` status |
| `blocked` | Red static dot | Entity execution in `blocked` status |
| `error` | Red exclamation | Entity has errors in last execution |
| `queue` | Number badge (e.g., "3") | Queued tasks > 0 |
| `cost` | Dollar badge (amber/red) | Cost threshold exceeded |

### 7.4 Edge animation integration

```typescript
// In edge component

function LiveEdge({ data, ...props }: EdgeProps) {
  const canvasMode = useVisualWorkspaceStore(s => s.canvasMode)
  const sourceStatus = useRuntimeStatusStore(s => s.getNodeStatus(data.source))
  const targetStatus = useRuntimeStatusStore(s => s.getNodeStatus(data.target))

  const animated = canvasMode === 'live' && isHandoffActive(sourceStatus, targetStatus)
  const errorPulse = canvasMode === 'live' && isHandoffBlocked(data, sourceStatus)

  return <BaseEdge {...props} animated={animated} className={errorPulse ? 'edge-error-pulse' : ''} />
}
```

### 7.5 Timeline panel

New component in the explorer panel (replaces or extends the Operations tab):

```typescript
// apps/web/src/components/visual-shell/explorer/timeline-panel.tsx

interface TimelinePanelProps {
  projectId: string
}

// Renders:
// - Filterable event stream (by type, severity, entity)
// - Each event is a compact card: icon + title + time + severity badge
// - Click event → highlights source entity on canvas + opens inspector
// - Auto-scrolls to newest events
// - "Load more" for history (REST pagination)
```

### 7.6 Inspector Runtime tab

The Runtime tab in the inspector panel (already spec'd in docs/43 §8) receives data from `RuntimeStatusStore`:

```typescript
// For agent nodes:
// - Current state (idle/active/waiting/blocked)
// - Active tasks list
// - Recent executions (last 10)
// - Last input/output
// - Average duration (computed from completed executions)
// - Error count (last 24h)
// - AI cost (accumulated)
// - Pending approvals

// For workflow nodes:
// - Active runs (count + list)
// - Current stage per run
// - Blocked handoffs
// - SLA status
// - Recent completions
// - Average run time

// For UO nodes (company, department, team):
// - Overall state (aggregated from children)
// - Active runs count
// - Queue depth
// - Recent incidents
// - Budget consumption
```

### 7.7 Design Mode ↔ Live Mode behavior

```typescript
// apps/web/src/stores/visual-workspace-store.ts — extended

setCanvasMode: (mode: 'design' | 'live') => {
  set((state) => {
    const next = new Set(state.activeOverlays)
    if (mode === 'live') {
      next.add('live-status')
    } else {
      next.delete('live-status')
    }
    return {
      canvasMode: mode,
      activeOverlays: next,
    }
  })
}
```

| Aspect | Design Mode | Live Mode |
|--------|-------------|-----------|
| Canvas editing | Full (add/edit/delete nodes and edges) | Disabled (view-only) |
| Toolbar | All modes active (Select, Pan, Connect, Add) | Select and Pan only. Add/Connect/Edit grayed |
| Overlays | All toggleable | `live-status` auto-activated |
| Node badges | Status only (active/proposed/retired) | Runtime badges (running/waiting/blocked/error/queue/cost) |
| Edge animation | None | Active handoffs animate, blocked pulse red |
| Inspector default tab | Overview / Edit | Runtime |
| Explorer Operations tab | Summary + manual actions | Timeline (auto-updating) |
| SSE connection | Disconnected | Connected |
| Context menu | Full edit menu | View-only menu (inspect, navigate, copy) |

---

## 8. Status Projection Algorithm

### 8.1 RuntimeStatusProjector

Computes `NodeRuntimeStatus` for every visible entity in the current scope.

```typescript
// services/company-design/src/runtime/application/runtime-status.projector.ts

class RuntimeStatusProjector {

  computeNodeStatus(entityId: string, entityType: string): NodeRuntimeStatus {
    // 1. Find active RuntimeExecutions involving this entity
    const executions = this.executionRepo.findActiveByEntity(entityId)

    // 2. Compute state with priority escalation
    const state = this.computeState(executions)

    // 3. Generate badges
    const badges = this.computeBadges(entityId, entityType, executions)

    // 4. Get last event time
    const lastEvent = this.eventRepo.findLatestByEntity(entityId)

    return { entityId, entityType, state, badges, lastEventAt: lastEvent?.occurredAt ?? null }
  }

  private computeState(executions: RuntimeExecution[]): NodeRuntimeState {
    // Priority: error > blocked > waiting > active > idle
    if (executions.some(e => e.status === 'failed')) return 'error'
    if (executions.some(e => e.status === 'blocked')) return 'blocked'
    if (executions.some(e => e.status === 'waiting')) return 'waiting'
    if (executions.some(e => e.status === 'running')) return 'active'
    if (executions.some(e => e.status === 'pending')) return 'active'
    return 'idle'
  }

  // For UO nodes: aggregate state from child entities
  computeAggregatedStatus(uoId: string): NodeRuntimeStatus {
    const childAgents = this.agentRepo.findByUoId(uoId)
    const childUos = this.uoRepo.findByParentId(uoId)

    const childStatuses = [
      ...childAgents.map(a => this.computeNodeStatus(a.id, 'agent')),
      ...childUos.map(u => this.computeAggregatedStatus(u.id)),
    ]

    // State escalation: if any child is error → parent is degraded, etc.
    const state = this.escalateState(childStatuses.map(s => s.state))
    const badges = this.aggregateBadges(childStatuses)

    return { entityId: uoId, entityType: 'uo', state, badges, lastEventAt: /* max */ }
  }
}
```

### 8.2 State escalation rules for UO containers

| Child states | Parent state |
|-------------|--------------|
| All idle | idle |
| Any active, none error/blocked | active |
| Any waiting, none error/blocked | waiting |
| Any blocked | degraded |
| Any error | error |

---

## 9. Cost Tracking Model

### 9.1 Cost accumulation

Every `RuntimeExecution` tracks `aiCost` in USD. Cost is updated incrementally:

```typescript
// When an agent completes a task execution
execution.addCost(tokenUsage: { inputTokens: number, outputTokens: number, model: string })
  → computes USD cost based on model pricing table
  → updates execution.aiCost
  → emits RuntimeEvent('budget-alert') if threshold crossed
```

### 9.2 Cost summary projection

```typescript
interface CostSummaryDto {
  projectId: string
  period: { start: string, end: string }  // current billing period
  totalCost: number
  costByAgent: Array<{ agentId: string, agentName: string, cost: number }>
  costByWorkflow: Array<{ workflowId: string, workflowName: string, cost: number }>
  costByDepartment: Array<{ uoId: string, uoName: string, cost: number }>
  budgetUsedPercent: number | null   // vs ProjectSeed.aiBudget or Constitution.budgetConfig
  alerts: CostAlertDto[]
}

interface CostAlertDto {
  level: 'warning' | 'critical'
  scope: string                    // entity name or "global"
  message: string
  currentCost: number
  threshold: number
}
```

### 9.3 Budget enforcement

Budget limits from `CompanyConstitution.budgetConfig`:
- `globalBudget` → checked on every cost update
- `perUoBudget` → checked when agent within UO adds cost
- `perAgentBudget` → checked per agent

Alert thresholds from `budgetConfig.alertThresholds` (e.g., [50, 80, 95]):
- At each threshold, emit `RuntimeEvent('budget-alert')`.
- At 100%, emit `RuntimeEvent('budget-exceeded')` and optionally pause pending executions.

---

## 10. Replay Capability

### 10.1 Execution replay

Given an `executionId`, reconstruct the full timeline:

```typescript
GET /projects/:projectId/runtime/executions/:executionId/timeline
  → RuntimeEventDto[] (all events for this execution, ordered by occurredAt)
```

This enables:
- Workflow run replay: see each stage entered/completed/failed, handoffs, artifacts produced.
- Agent task replay: see what the agent received, what it produced, errors encountered.
- Decision replay: trace from proposal → review → decision → implementation.

### 10.2 Entity history

Given any entity (UO, agent, workflow), show its runtime history:

```typescript
GET /projects/:projectId/runtime/events?sourceEntityId=:entityId&limit=100
  → RuntimeEventDto[]
```

### 10.3 Frontend replay component

Not in LCP-015 scope — deferred to a future task. The timeline panel provides the read view; a full replay (animated playback, step-by-step) is a later enhancement.

---

## 11. Shared Types (DTOs)

New types to add to `packages/shared-types/src/live-company-types.ts`:

```typescript
// --- Runtime Events ---

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

// --- Runtime Status Projection ---

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

// --- Cost ---

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

// --- Extended RuntimeExecution fields ---

export interface CreateRuntimeExecutionDto {
  executionType: RuntimeExecutionType
  workflowId?: string
  agentId?: string
  input: Record<string, unknown>
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
```

---

## 12. Implementation Sequence (for LCP-015)

### Phase 1: Domain + repository (backend)

1. Create `RuntimeEvent` entity + repository (append-only).
2. Create `RuntimeExecution` aggregate root + repository (extends existing bridge types from LCP-011).
3. Add `parentExecutionId` and `operationsRunId` fields.
4. Implement `RuntimeStatusProjector` with state escalation.
5. Unit tests for all domain invariants and status transitions.

### Phase 2: Service + event bus

1. Create `RuntimeService` — orchestrates execution lifecycle.
2. Wire `EventEmitter2` for internal pub/sub.
3. Create listeners on operations module events → generate `RuntimeEvent`s.
4. Create `RuntimeTimelineService` for paginated queries.
5. Create `RuntimeCostService` for budget tracking.
6. Integration tests.

### Phase 3: API + SSE

1. Create `RuntimeController` with REST endpoints.
2. Add SSE endpoint with scope filtering.
3. Wire API Gateway proxy.
4. Add shared-types DTOs (listed in §11).
5. API integration tests.

### Phase 4: Frontend store + connection

1. Create `RuntimeStatusStore` (Zustand).
2. Create `useRuntimeStream` hook (SSE connection lifecycle).
3. Create `runtimeApi` client (REST for initial load + mutations).
4. Connect to `canvasMode` toggle in workspace store.

### Phase 5: Canvas integration

1. Add `RuntimeBadges` component to node components.
2. Add edge animation logic for live handoffs.
3. Add Design ↔ Live mode behavioral enforcement (disable editing in Live).
4. Update toolbar to show Live mode toggle.

### Phase 6: Timeline + inspector

1. Build `TimelinePanel` in explorer.
2. Connect inspector `RuntimeTab` to `RuntimeStatusStore`.
3. Add cost summary view.

### Phase 7: Polish + testing

1. E2e test: toggle live mode → see badges → events stream → inspector shows runtime.
2. Performance: ensure SSE doesn't degrade canvas with high event volume (throttle badge updates to 1/sec).
3. Reconnection: test SSE reconnect after network loss.
4. Accessibility: screen reader support for runtime badges.

---

## 13. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| High event volume overwhelms canvas | Throttle badge updates to max 1/sec per node. Buffer events in store, flush on animation frame |
| SSE memory leak on long sessions | EventSource auto-closes on component unmount. Store caps `recentEvents` at 500 |
| Timeline query performance | Index `runtime_events` by `(projectId, occurredAt DESC)` and `(projectId, sourceEntityId)` |
| Status recomputation cost | Cache `NodeRuntimeStatus` in projector. Invalidate only affected nodes on event |
| Cost computation | Precompute `CostSummaryDto` periodically (every 60s), not on every request |

---

## 14. Future Enhancements (out of LCP-015 scope)

| Enhancement | When |
|-------------|------|
| Redis Pub/Sub bridge for multi-instance SSE | When scaling beyond single instance |
| Full execution replay with animated playback | After LCP-015 validated |
| AI-powered anomaly detection on event stream | Scaling/optimizing maturity phases |
| Prometheus/Grafana export for production ops | Post-MVP |
| Webhook integrations (Slack, email) on critical events | Post-MVP |
| Event retention/archival policy | When persistence moves to real DB |

---

## 15. Acceptance Criteria

- [ ] RuntimeExecution aggregate fully specified with invariants, status transitions, and domain events.
- [ ] RuntimeEvent entity specified with all event types, query patterns, and append-only semantics.
- [ ] SSE architecture chosen and justified vs WebSocket.
- [ ] Event bus design using NestJS EventEmitter2 with integration points to operations module.
- [ ] NodeRuntimeStatus and badge model specified for canvas live-status overlay.
- [ ] Status projection algorithm with priority escalation for individual nodes and UO containers.
- [ ] Cost tracking model with budget enforcement from CompanyConstitution.
- [ ] Frontend architecture: separate RuntimeStatusStore, SSE connection lifecycle, badge integration.
- [ ] Design Mode ↔ Live Mode behavioral spec with toolbar, editing, and inspector differences.
- [ ] Timeline panel and inspector Runtime tab data flow specified.
- [ ] Implementation sequence for LCP-015 broken into 7 phases.
- [ ] Performance mitigations documented.
- [ ] No contradiction with docs/33 (domain model), docs/43 (canvas v3), docs/36 (runtime spec), or docs/35 (growth protocol).

---

## 16. Cross-Reference

| Downstream task | What it uses from this document |
|----------------|-------------------------------|
| LCP-015 | All sections — this is the primary implementation reference |
| LCP-009 | §3 RuntimeExecution, §11 DTOs — Verticaler demo must include runtime events |
| LCP-016 | §7 frontend architecture, §8 status projection — Verticaler live demo |
