# Graph Projection v1 — Formal Specification

Epic 21 | VIS-003 | Plan deliverable

## 1. Purpose

This document specifies the **graph projection / visual read model** that transforms domain entities from the existing CRUD model into a `VisualGraphDto` optimized for canvas rendering. It defines endpoints, mapping logic, scope filtering, edge extraction, validation overlay, breadcrumb generation, and the visual diff strategy.

It builds directly on VIS-002 (`docs/11-visual-grammar-v1-spec.md`) which defined the grammar (types, rules, layers). This spec defines **how those types are populated from real data**.

---

## 2. Architecture Overview

```
                    ┌─────────────────────────────────────────────┐
                    │          company-design-service              │
                    │                                             │
                    │  ┌──────────────┐     ┌──────────────────┐  │
  GET /visual-graph │  │   GraphProj  │     │ SnapshotCollector│  │
  ─────────────────►│  │  Controller  │────►│   (existing)     │  │
                    │  └──────┬───────┘     └──────────────────┘  │
                    │         │                      │            │
                    │         ▼                      ▼            │
                    │  ┌──────────────┐     ┌──────────────────┐  │
                    │  │ GraphProj    │     │ ValidationEngine │  │
                    │  │  Service     │────►│   (existing)     │  │
                    │  └──────┬───────┘     └──────────────────┘  │
                    │         │                                   │
                    │         ▼                                   │
                    │  ┌──────────────────────────────────────┐   │
                    │  │         Pure Mapping Functions        │   │
                    │  │                                      │   │
                    │  │  mapNodes()     mapEdges()           │   │
                    │  │  filterByScope()  applyValidation()  │   │
                    │  │  buildBreadcrumb()                   │   │
                    │  └──────────────────────────────────────┘   │
                    └─────────────────────────────────────────────┘
```

### 2.1 Module structure

```
services/company-design/src/
  graph-projection/
    graph-projection.module.ts        # NestJS module
    application/
      graph-projection.service.ts     # orchestrates collect → map → filter → validate
      graph-projection.controller.ts  # REST endpoints
    mapping/
      node-mapper.ts                  # ReleaseSnapshotDto → VisualNodeDto[]
      edge-extractor.ts              # ReleaseSnapshotDto → VisualEdgeDto[]
      scope-filter.ts                # filters nodes/edges by GraphScope + layers
      validation-overlay.ts          # merges ValidationIssue[] into NodeStatus
      breadcrumb-builder.ts          # builds BreadcrumbEntry[] from scope
      visual-id.ts                   # deterministic ID generation
```

All files in `mapping/` are **pure functions** (no DI, no side effects). This maximizes testability.

### 2.2 Dependencies

```
GraphProjectionModule
  imports: [ReleasesModule (for SnapshotCollector), ValidationsModule (for ValidationEngine)]
  providers: [GraphProjectionService]
  controllers: [GraphProjectionController]
```

The module reuses the existing `SnapshotCollector` and `ValidationEngine` via their respective modules. No new repositories or domain entities are introduced.

---

## 3. REST Endpoints

### 3.1 Get visual graph

```
GET /projects/:projectId/visual-graph
```

**Query parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `level` | `L1` \| `L2` \| `L3` | No | `L1` | Zoom level |
| `entityId` | `string` | If L2/L3 | — | ID of the department (L2) or workflow (L3) |
| `layers` | `string` (comma-separated) | No | Level defaults | Active layer IDs |

**Response:** `VisualGraphDto` (200 OK)

**Errors:**
- `400` if `level=L2` or `L3` without `entityId`
- `404` if `entityId` not found in the project

**Examples:**

```
# Company map (L1)
GET /projects/p1/visual-graph

# Department drilldown (L2)
GET /projects/p1/visual-graph?level=L2&entityId=dept-abc

# Workflow drilldown (L3)
GET /projects/p1/visual-graph?level=L3&entityId=wf-xyz

# L1 with extra layers active
GET /projects/p1/visual-graph?layers=organization,capabilities,governance
```

### 3.2 Get visual diff between releases (placeholder for VIS-015)

```
GET /projects/:projectId/visual-graph/diff?base=:releaseId&compare=:releaseId
```

This endpoint is specified here for contract completeness but will be implemented in VIS-015. It compares two release snapshots and returns the structural changes projected onto the visual graph.

**Response:** `VisualGraphDiffDto` (see §8)

---

## 4. Node Mapping

### 4.1 Mapping function signature

```typescript
function mapNodes(snapshot: ReleaseSnapshotDto, projectId: string): VisualNodeDto[]
```

### 4.2 Entity → Node mapping rules

Each domain entity produces exactly one `VisualNodeDto`. Workflow stages produce one node per stage.

#### Company node

```
Source: snapshot.companyModel (if exists)
→ {
    id: `company:${projectId}`,
    nodeType: 'company',
    entityId: projectId,
    label: companyModel.purpose (truncated to 60 chars),
    sublabel: companyModel.type,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null
  }
```

If no company model exists, the company node is still produced with `label: '(No purpose defined)'` and `status: 'error'`.

#### Department nodes

```
Source: snapshot.departments[]
→ {
    id: `dept:${dept.id}`,
    nodeType: 'department',
    entityId: dept.id,
    label: dept.name,
    sublabel: truncate(dept.mandate, 50),
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: dept.parentId ? `dept:${dept.parentId}` : `company:${projectId}`
  }
```

#### Role nodes

```
Source: snapshot.roles[]
→ {
    id: `role:${role.id}`,
    nodeType: 'role',
    entityId: role.id,
    label: role.name,
    sublabel: truncate(role.accountability, 50),
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: `dept:${role.departmentId}`
  }
```

#### Agent archetype nodes

```
Source: snapshot.agentArchetypes[]
→ {
    id: `archetype:${archetype.id}`,
    nodeType: 'agent-archetype',
    entityId: archetype.id,
    label: archetype.name,
    sublabel: truncate(archetype.description, 50),
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: `dept:${archetype.departmentId}`
  }
```

#### Agent assignment nodes

```
Source: snapshot.agentAssignments[]
→ {
    id: `assignment:${assignment.id}`,
    nodeType: 'agent-assignment',
    entityId: assignment.id,
    label: assignment.name,
    sublabel: assignment.status,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: `archetype:${assignment.archetypeId}`
  }
```

#### Capability nodes

```
Source: snapshot.capabilities[]
→ {
    id: `cap:${cap.id}`,
    nodeType: 'capability',
    entityId: cap.id,
    label: cap.name,
    sublabel: truncate(cap.description, 50),
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['capabilities'],
    parentId: cap.ownerDepartmentId ? `dept:${cap.ownerDepartmentId}` : null
  }
```

#### Skill nodes

```
Source: snapshot.skills[]
→ {
    id: `skill:${skill.id}`,
    nodeType: 'skill',
    entityId: skill.id,
    label: skill.name,
    sublabel: skill.category,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['capabilities'],
    parentId: null  // skills are not contained, they float
  }
```

#### Workflow nodes

```
Source: snapshot.workflows[]
→ {
    id: `wf:${wf.id}`,
    nodeType: 'workflow',
    entityId: wf.id,
    label: wf.name,
    sublabel: wf.status,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['workflows'],
    parentId: wf.ownerDepartmentId ? `dept:${wf.ownerDepartmentId}` : null
  }
```

#### Workflow stage nodes

```
Source: snapshot.workflows[].stages[]
→ {
    id: `wf-stage:${wf.id}:${stage.order}`,
    nodeType: 'workflow-stage',
    entityId: `${wf.id}:${stage.name}`,
    label: stage.name,
    sublabel: truncate(stage.description, 50),
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['workflows'],
    parentId: `wf:${wf.id}`
  }
```

#### Contract nodes

```
Source: snapshot.contracts[]
→ {
    id: `contract:${contract.id}`,
    nodeType: 'contract',
    entityId: contract.id,
    label: contract.name,
    sublabel: `${contract.type} · ${contract.status}`,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['contracts'],
    parentId: null  // contracts are cross-cutting, not contained
  }
```

#### Policy nodes

```
Source: snapshot.policies[]
→ {
    id: `policy:${policy.id}`,
    nodeType: 'policy',
    entityId: policy.id,
    label: policy.name,
    sublabel: `${policy.type} · ${policy.enforcement}`,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['governance'],
    parentId: null  // policies are cross-cutting
  }
```

### 4.3 Truncation helper

```typescript
function truncate(text: string, maxLength: number): string | null {
  if (!text || !text.trim()) return null
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text
}
```

---

## 5. Edge Extraction

### 5.1 Extraction function signature

```typescript
function extractEdges(snapshot: ReleaseSnapshotDto, projectId: string): VisualEdgeDto[]
```

Edges are **derived** from domain entity relationships. No edges are stored independently — they are all computed from the snapshot on every projection.

### 5.2 Edge extraction rules

#### 5.2.1 `reports_to` edges (department hierarchy)

```
For each department where parentId is not null:
→ {
    id: `reports_to:dept:${dept.id}→dept:${dept.parentId}`,
    edgeType: 'reports_to',
    sourceId: `dept:${dept.id}`,
    targetId: `dept:${dept.parentId}`,
    label: null,
    style: 'solid',
    layerIds: ['organization']
  }
```

#### 5.2.2 `owns` edges (department → capability / workflow)

```
For each capability where ownerDepartmentId is not null:
→ {
    id: `owns:dept:${cap.ownerDepartmentId}→cap:${cap.id}`,
    edgeType: 'owns',
    sourceId: `dept:${cap.ownerDepartmentId}`,
    targetId: `cap:${cap.id}`,
    label: null,
    style: 'solid',
    layerIds: ['capabilities']
  }

For each workflow where ownerDepartmentId is not null:
→ {
    id: `owns:dept:${wf.ownerDepartmentId}→wf:${wf.id}`,
    edgeType: 'owns',
    sourceId: `dept:${wf.ownerDepartmentId}`,
    targetId: `wf:${wf.id}`,
    label: null,
    style: 'solid',
    layerIds: ['workflows']
  }
```

#### 5.2.3 `assigned_to` edges (archetype → role)

```
For each agentArchetype:
→ {
    id: `assigned_to:archetype:${archetype.id}→role:${archetype.roleId}`,
    edgeType: 'assigned_to',
    sourceId: `archetype:${archetype.id}`,
    targetId: `role:${archetype.roleId}`,
    label: null,
    style: 'dashed',
    layerIds: ['organization']
  }
```

#### 5.2.4 `contributes_to` edges (role → capability)

```
For each role, for each capabilityId in role.capabilityIds[]:
→ {
    id: `contributes_to:role:${role.id}→cap:${capId}`,
    edgeType: 'contributes_to',
    sourceId: `role:${role.id}`,
    targetId: `cap:${capId}`,
    label: null,
    style: 'dotted',
    layerIds: ['capabilities']
  }
```

#### 5.2.5 `has_skill` edges (archetype → skill)

```
For each agentArchetype, for each skillId in archetype.skillIds[]:
→ {
    id: `has_skill:archetype:${archetype.id}→skill:${skillId}`,
    edgeType: 'has_skill',
    sourceId: `archetype:${archetype.id}`,
    targetId: `skill:${skillId}`,
    label: null,
    style: 'dotted',
    layerIds: ['capabilities']
  }
```

#### 5.2.6 `compatible_with` edges (skill → role)

```
For each skill, for each roleId in skill.compatibleRoleIds[]:
→ {
    id: `compatible_with:skill:${skill.id}→role:${roleId}`,
    edgeType: 'compatible_with',
    sourceId: `skill:${skill.id}`,
    targetId: `role:${roleId}`,
    label: null,
    style: 'dotted',
    layerIds: ['capabilities']
  }
```

#### 5.2.7 `provides` edges (party → contract)

```
For each contract:
→ {
    id: `provides:${providerVisualId}→contract:${contract.id}`,
    edgeType: 'provides',
    sourceId: providerVisualId,  // `dept:${providerId}` or `cap:${providerId}`
    targetId: `contract:${contract.id}`,
    label: null,
    style: 'solid',
    layerIds: ['contracts']
  }
```

Where `providerVisualId`:
- `dept:${contract.providerId}` if `contract.providerType === 'department'`
- `cap:${contract.providerId}` if `contract.providerType === 'capability'`

#### 5.2.8 `consumes` edges (party → contract)

```
For each contract:
→ {
    id: `consumes:${consumerVisualId}→contract:${contract.id}`,
    edgeType: 'consumes',
    sourceId: consumerVisualId,
    targetId: `contract:${contract.id}`,
    label: null,
    style: 'solid',
    layerIds: ['contracts']
  }
```

Same visual ID resolution as `provides`.

#### 5.2.9 `bound_by` edges (workflow → contract)

```
For each workflow, for each contractId in workflow.contractIds[]:
→ {
    id: `bound_by:wf:${wf.id}→contract:${contractId}`,
    edgeType: 'bound_by',
    sourceId: `wf:${wf.id}`,
    targetId: `contract:${contractId}`,
    label: null,
    style: 'dashed',
    layerIds: ['contracts']
  }
```

#### 5.2.10 `participates_in` edges (role/dept → workflow)

```
For each workflow, for each participant in workflow.participants[]:
→ {
    id: `participates_in:${participantVisualId}→wf:${wf.id}`,
    edgeType: 'participates_in',
    sourceId: participantVisualId,
    targetId: `wf:${wf.id}`,
    label: participant.responsibility || null,
    style: 'dotted',
    layerIds: ['workflows']
  }
```

Where `participantVisualId`:
- `role:${participant.participantId}` if `participant.participantType === 'role'`
- `dept:${participant.participantId}` if `participant.participantType === 'department'`

#### 5.2.11 `hands_off_to` edges (stage → stage)

```
For each workflow, for stages sorted by order, for each consecutive pair (stageN, stageN+1):
→ {
    id: `hands_off_to:wf-stage:${wf.id}:${stageN.order}→wf-stage:${wf.id}:${stageN1.order}`,
    edgeType: 'hands_off_to',
    sourceId: `wf-stage:${wf.id}:${stageN.order}`,
    targetId: `wf-stage:${wf.id}:${stageN1.order}`,
    label: null,
    style: 'solid',
    layerIds: ['workflows']
  }
```

#### 5.2.12 `governs` edges (policy → target)

```
For each policy:
  if policy.scope === 'global':
  → {
      id: `governs:policy:${policy.id}→company:${projectId}`,
      edgeType: 'governs',
      sourceId: `policy:${policy.id}`,
      targetId: `company:${projectId}`,
      label: null,
      style: 'dashed',
      layerIds: ['governance']
    }

  if policy.scope === 'department' && policy.departmentId:
  → {
      id: `governs:policy:${policy.id}→dept:${policy.departmentId}`,
      edgeType: 'governs',
      sourceId: `policy:${policy.id}`,
      targetId: `dept:${policy.departmentId}`,
      label: null,
      style: 'dashed',
      layerIds: ['governance']
    }
```

### 5.3 Edge integrity

After extraction, edges where either `sourceId` or `targetId` does not match any node in the current graph are **silently dropped**. This handles dangling references (e.g., a role references a deleted capability) without crashing the projection. The validation overlay will flag the underlying entity as having an error.

---

## 6. Scope Filtering

### 6.1 Filter function signature

```typescript
function filterByScope(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  scope: GraphScope,
  activeLayers: LayerId[]
): { nodes: VisualNodeDto[]; edges: VisualEdgeDto[] }
```

### 6.2 L1 — Company Map

**Include nodes:**
- `company` (always)
- `department` (always)
- Nodes from active layers according to VIS-002 §5.2 (L1 visibility rules)

**Behavior:**
- All roles, agents, skills, capabilities, stages, assignments are excluded unless their layer is explicitly active and the grammar permits them at L1.
- At L1 with only `organization` layer, only company + departments + `reports_to` edges are shown.
- Activating `governance` adds global policies + `governs` edges targeting company.

### 6.3 L2 — Department Map

**Scope entity:** One department (identified by `entityId`).

**Include nodes:**
- The scoped department (as context node)
- Sub-departments (`parentId === entityId`)
- Roles where `departmentId === entityId`
- Agent archetypes where `departmentId === entityId`
- Agent assignments where `archetypeId` belongs to an archetype in this scope
- Capabilities where `ownerDepartmentId === entityId` (if Capabilities layer active)
- Workflows where `ownerDepartmentId === entityId` (if Workflows layer active)
- Skills referenced by archetypes in this scope (if Capabilities layer active)
- Contracts where provider or consumer is this department or its capabilities (if Contracts layer active)
- Policies where `departmentId === entityId` (if Governance layer active)

**Edges:** Include only edges where both source and target are in the filtered node set.

### 6.4 L3 — Workflow Map

**Scope entity:** One workflow (identified by `entityId`).

**Include nodes:**
- The scoped workflow (as context node)
- All workflow-stage nodes belonging to this workflow
- Contracts bound to this workflow (if Contracts layer active)
- Participants (roles/departments) as reference badges (if Organization layer active)
- Policies governing the workflow's department (if Governance layer active)

**Edges:** Include only edges where both source and target are in the filtered node set.

### 6.5 Layer filtering

After scope filtering, a second pass removes nodes/edges not matching active layers:

```
For each node: keep if node.layerIds intersects activeLayers
For each edge: keep if edge.layerIds intersects activeLayers AND both source/target nodes are kept
```

Exception: **context nodes** (the department at L2, the workflow at L3) are always kept regardless of layer state.

### 6.6 Default active layers per level

| Level | Default layers |
|-------|---------------|
| L1 | `['organization']` |
| L2 | `['organization', 'capabilities']` |
| L3 | `['workflows']` |

If the `layers` query param is provided, it overrides the defaults.

---

## 7. Validation Overlay

### 7.1 Overlay function signature

```typescript
function applyValidationOverlay(
  nodes: VisualNodeDto[],
  issues: ValidationIssue[]
): VisualNodeDto[]
```

### 7.2 Mapping logic

The existing `ValidationEngine` returns `ValidationIssue[]` with `entity` (string) and `entityId` fields. These map to visual node IDs:

| `issue.entity` | Visual node ID pattern |
|----------------|----------------------|
| `CompanyModel` | `company:${projectId}` |
| `Department` | `dept:${issue.entityId}` |
| `Capability` | `cap:${issue.entityId}` |
| `Role` | `role:${issue.entityId}` |
| `AgentArchetype` | `archetype:${issue.entityId}` |
| `AgentAssignment` | `assignment:${issue.entityId}` |
| `Skill` | `skill:${issue.entityId}` |
| `Contract` | `contract:${issue.entityId}` |
| `Workflow` | `wf:${issue.entityId}` |
| `Policy` | `policy:${issue.entityId}` |

### 7.3 Status resolution

For each node, collect all matching issues and resolve the worst severity:
- Any `error` issue → `status: 'error'`
- Only `warning` issues → `status: 'warning'`
- No issues → `status: 'normal'`

The `'dimmed'` status is not set by validation. It is applied client-side when a search/filter highlights specific nodes and others are de-emphasized.

---

## 8. Breadcrumb Generation

### 8.1 Builder function signature

```typescript
function buildBreadcrumb(
  scope: GraphScope,
  snapshot: ReleaseSnapshotDto,
  projectId: string
): BreadcrumbEntry[]
```

### 8.2 Rules

#### L1

```
[{ label: companyModel.purpose || 'Company', nodeType: 'company', entityId: projectId, zoomLevel: 'L1' }]
```

#### L2

```
[
  { label: companyModel.purpose || 'Company', nodeType: 'company', entityId: projectId, zoomLevel: 'L1' },
  { label: department.name, nodeType: 'department', entityId: dept.id, zoomLevel: 'L2' }
]
```

If the department has a parent, intermediate departments are included:

```
[Company, ..., ParentDept, CurrentDept]
```

The chain is built by walking `parentId` up to the root.

#### L3

```
[
  { label: 'Company', ..., zoomLevel: 'L1' },
  { label: ownerDept.name, ..., zoomLevel: 'L2' },   // if workflow has ownerDepartmentId
  { label: workflow.name, ..., zoomLevel: 'L3' }
]
```

---

## 9. GraphProjectionService Orchestration

### 9.1 Service method

```typescript
class GraphProjectionService {
  async projectGraph(
    projectId: string,
    level: ZoomLevel = 'L1',
    entityId: string | null = null,
    requestedLayers: LayerId[] | null = null
  ): Promise<VisualGraphDto>
}
```

### 9.2 Pipeline

```
1. snapshot = SnapshotCollector.collect(projectId)
2. issues = ValidationEngine.validate(snapshot)
3. allNodes = mapNodes(snapshot, projectId)
4. allEdges = extractEdges(snapshot, projectId)
5. scope = { level, entityId, entityType: inferType(level, entityId, snapshot) }
6. activeLayers = requestedLayers ?? defaultLayersFor(level)
7. { nodes, edges } = filterByScope(allNodes, allEdges, scope, activeLayers)
8. nodes = applyValidationOverlay(nodes, issues)
9. edges = dropOrphanEdges(edges, nodes)
10. breadcrumb = buildBreadcrumb(scope, snapshot, projectId)
11. return { projectId, scope, zoomLevel: level, nodes, edges, activeLayers, breadcrumb }
```

Step 9 (`dropOrphanEdges`) removes any edge whose source or target was filtered out by scope or layer filtering. This is a safety net beyond the initial scope filter.

### 9.3 Entity type inference

For L2, `entityType` is always `'department'`. For L3, always `'workflow'`. The service validates that the `entityId` exists in the snapshot and throws 404 if not found.

---

## 10. Visual Diff Strategy (for VIS-015)

### 10.1 Approach

A visual diff compares two `VisualGraphDto` projections (from two release snapshots) and marks nodes/edges as added, removed, or modified.

### 10.2 Diff DTO

```typescript
export type VisualDiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface VisualNodeDiffDto extends VisualNodeDto {
  diffStatus: VisualDiffStatus
}

export interface VisualEdgeDiffDto extends VisualEdgeDto {
  diffStatus: VisualDiffStatus
}

export interface VisualGraphDiffDto {
  projectId: string
  scope: GraphScope
  baseReleaseId: string
  compareReleaseId: string
  nodes: VisualNodeDiffDto[]
  edges: VisualEdgeDiffDto[]
  summary: {
    nodesAdded: number
    nodesRemoved: number
    nodesModified: number
    edgesAdded: number
    edgesRemoved: number
    edgesModified: number
  }
}
```

### 10.3 Diff algorithm

1. Project both snapshots (base and compare) into full visual graphs at the requested scope.
2. Build maps by visual ID for both graphs.
3. For nodes:
   - Present in compare but not in base → `added`
   - Present in base but not in compare → `removed`
   - Present in both but `label`, `sublabel`, `parentId`, or `layerIds` differ → `modified`
   - Otherwise → `unchanged`
4. For edges:
   - Present in compare but not in base → `added`
   - Present in base but not in compare → `removed`
   - Present in both but `label`, `sourceId`, or `targetId` differ → `modified`
   - Otherwise → `unchanged`

The deterministic visual ID strategy (§2.3 of VIS-002) makes this diff stable across projections.

### 10.4 Reuse of existing SnapshotDiffer

The existing `SnapshotDiffer` works at the domain entity level. The visual diff wraps it:
- Use `SnapshotDiffer.diff()` to get domain-level changes.
- Project both snapshots to visual graphs.
- The visual diff adds layout awareness (e.g., a node moved from one parent to another) on top of the domain diff.

This avoids duplicating comparison logic. The domain diff identifies **what** changed; the visual diff shows **where** it changed on the canvas.

---

## 11. Shared Types to Add

The following types are added to `packages/shared-types/src/index.ts`. They were previewed in VIS-002 §9 and are confirmed here with no changes:

```typescript
// --- Visual Grammar Types ---

export type NodeType =
  | 'company' | 'department' | 'role'
  | 'agent-archetype' | 'agent-assignment'
  | 'capability' | 'skill'
  | 'workflow' | 'workflow-stage'
  | 'contract' | 'policy'

export type EdgeType =
  | 'reports_to' | 'owns' | 'assigned_to'
  | 'contributes_to' | 'has_skill' | 'compatible_with'
  | 'provides' | 'consumes' | 'bound_by'
  | 'participates_in' | 'hands_off_to' | 'governs'

export type EdgeCategory =
  | 'hierarchical' | 'ownership' | 'assignment'
  | 'capability' | 'contract' | 'workflow' | 'governance'

export type LayerId =
  | 'organization' | 'capabilities' | 'workflows'
  | 'contracts' | 'governance'

export type ZoomLevel = 'L1' | 'L2' | 'L3' | 'L4'
export type NodeStatus = 'normal' | 'warning' | 'error' | 'dimmed'
export type EdgeStyle = 'solid' | 'dashed' | 'dotted'

export interface CanvasPosition { x: number; y: number }

export interface VisualNodeDto {
  id: string
  nodeType: NodeType
  entityId: string
  label: string
  sublabel: string | null
  position: CanvasPosition | null
  collapsed: boolean
  status: NodeStatus
  layerIds: LayerId[]
  parentId: string | null
}

export interface VisualEdgeDto {
  id: string
  edgeType: EdgeType
  sourceId: string
  targetId: string
  label: string | null
  style: EdgeStyle
  layerIds: LayerId[]
}

export interface GraphScope {
  level: ZoomLevel
  entityId: string | null
  entityType: NodeType | null
}

export interface BreadcrumbEntry {
  label: string
  nodeType: NodeType
  entityId: string
  zoomLevel: ZoomLevel
}

export interface VisualGraphDto {
  projectId: string
  scope: GraphScope
  zoomLevel: ZoomLevel
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
  activeLayers: LayerId[]
  breadcrumb: BreadcrumbEntry[]
}

export interface ConnectionRule {
  edgeType: EdgeType
  sourceTypes: NodeType[]
  targetTypes: NodeType[]
  category: EdgeCategory
  style: EdgeStyle
}

export interface LayerDefinition {
  id: LayerId
  label: string
  nodeTypes: NodeType[]
  edgeTypes: EdgeType[]
}

// --- Visual Diff Types (for VIS-015) ---

export type VisualDiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface VisualNodeDiffDto extends VisualNodeDto {
  diffStatus: VisualDiffStatus
}

export interface VisualEdgeDiffDto extends VisualEdgeDto {
  diffStatus: VisualDiffStatus
}

export interface VisualGraphDiffDto {
  projectId: string
  scope: GraphScope
  baseReleaseId: string
  compareReleaseId: string
  nodes: VisualNodeDiffDto[]
  edges: VisualEdgeDiffDto[]
  summary: {
    nodesAdded: number
    nodesRemoved: number
    nodesModified: number
    edgesAdded: number
    edgesRemoved: number
    edgesModified: number
  }
}
```

---

## 12. Gateway BFF Extension

The API gateway needs a new method in `CompanyDesignClient` and a new controller to proxy the visual graph endpoint:

```typescript
// CompanyDesignClient
async getVisualGraph(
  projectId: string,
  level?: string,
  entityId?: string,
  layers?: string
): Promise<VisualGraphDto>

// GraphProjectionController (in api-gateway)
@Get('projects/:projectId/visual-graph')
getVisualGraph(
  @Param('projectId') projectId: string,
  @Query('level') level?: string,
  @Query('entityId') entityId?: string,
  @Query('layers') layers?: string
): Promise<VisualGraphDto>
```

---

## 13. Connection Rules Registry

A static registry of connection rules enables both the graph projection (for edge validation) and the future edge-creation UI (for showing valid connections):

```typescript
export const CONNECTION_RULES: ConnectionRule[] = [
  { edgeType: 'reports_to', sourceTypes: ['department'], targetTypes: ['department'], category: 'hierarchical', style: 'solid' },
  { edgeType: 'owns', sourceTypes: ['department'], targetTypes: ['capability'], category: 'ownership', style: 'solid' },
  { edgeType: 'owns', sourceTypes: ['department'], targetTypes: ['workflow'], category: 'ownership', style: 'solid' },
  { edgeType: 'assigned_to', sourceTypes: ['agent-archetype'], targetTypes: ['role'], category: 'assignment', style: 'dashed' },
  { edgeType: 'contributes_to', sourceTypes: ['role'], targetTypes: ['capability'], category: 'capability', style: 'dotted' },
  { edgeType: 'has_skill', sourceTypes: ['agent-archetype'], targetTypes: ['skill'], category: 'capability', style: 'dotted' },
  { edgeType: 'compatible_with', sourceTypes: ['skill'], targetTypes: ['role'], category: 'capability', style: 'dotted' },
  { edgeType: 'provides', sourceTypes: ['department', 'capability'], targetTypes: ['contract'], category: 'contract', style: 'solid' },
  { edgeType: 'consumes', sourceTypes: ['department', 'capability'], targetTypes: ['contract'], category: 'contract', style: 'solid' },
  { edgeType: 'bound_by', sourceTypes: ['workflow'], targetTypes: ['contract'], category: 'contract', style: 'dashed' },
  { edgeType: 'participates_in', sourceTypes: ['role', 'department'], targetTypes: ['workflow'], category: 'workflow', style: 'dotted' },
  { edgeType: 'hands_off_to', sourceTypes: ['workflow-stage'], targetTypes: ['workflow-stage'], category: 'workflow', style: 'solid' },
  { edgeType: 'governs', sourceTypes: ['policy'], targetTypes: ['department', 'company'], category: 'governance', style: 'dashed' },
]
```

This registry lives in `packages/shared-types` so both backend and frontend can use it.

---

## 14. Layer Definitions Registry

```typescript
export const LAYER_DEFINITIONS: LayerDefinition[] = [
  {
    id: 'organization',
    label: 'Organization',
    nodeTypes: ['company', 'department', 'role', 'agent-archetype', 'agent-assignment'],
    edgeTypes: ['reports_to', 'assigned_to'],
  },
  {
    id: 'capabilities',
    label: 'Capabilities',
    nodeTypes: ['capability', 'skill'],
    edgeTypes: ['owns', 'contributes_to', 'has_skill', 'compatible_with'],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    nodeTypes: ['workflow', 'workflow-stage'],
    edgeTypes: ['owns', 'participates_in', 'hands_off_to'],
  },
  {
    id: 'contracts',
    label: 'Contracts',
    nodeTypes: ['contract'],
    edgeTypes: ['provides', 'consumes', 'bound_by'],
  },
  {
    id: 'governance',
    label: 'Governance',
    nodeTypes: ['policy'],
    edgeTypes: ['governs'],
  },
]
```

Note: `owns` appears in both `capabilities` and `workflows` layers because it connects departments to both capabilities and workflows. The edge's `layerIds` field in the extracted edge reflects which specific relationship it represents.

---

## 15. Implementation Plan (for VIS-003 edit task or follow-up)

### Phase 1: Shared types
1. Add all visual grammar types to `packages/shared-types/src/index.ts`
2. Add `CONNECTION_RULES` and `LAYER_DEFINITIONS` to shared-types
3. Run typecheck

### Phase 2: Mapping functions (pure, no DI)
4. Implement `visual-id.ts` — deterministic ID helpers
5. Implement `node-mapper.ts` — snapshot → nodes
6. Implement `edge-extractor.ts` — snapshot → edges
7. Implement `scope-filter.ts` — scope + layer filtering
8. Implement `validation-overlay.ts` — issues → node status
9. Implement `breadcrumb-builder.ts` — scope → breadcrumb
10. Unit tests for all 6 mapping files (target: 100% coverage)

### Phase 3: Service + controller
11. Implement `GraphProjectionService` — orchestration pipeline
12. Implement `GraphProjectionController` — REST endpoint
13. Implement `GraphProjectionModule` — wiring
14. Register module in `AppModule`
15. Service tests (with mocked SnapshotCollector + ValidationEngine)
16. Controller tests

### Phase 4: Gateway BFF
17. Add `getVisualGraph()` to `CompanyDesignClient`
18. Add `GraphProjectionController` to api-gateway
19. Tests

### Phase 5: Frontend API + hook
20. Add `visualGraphApi` to web app
21. Add `useVisualGraph(projectId, scope)` hook
22. Tests

---

## 16. What This Spec Does NOT Cover

| Deferred to | Topic |
|-------------|-------|
| VIS-005 | Canvas rendering, React Flow integration, auto-layout |
| VIS-007 | Inspector reading graph data and editing entities |
| VIS-008 | Edge creation/editing UI (uses CONNECTION_RULES) |
| VIS-013 | Layer toggle persistence, saved views |
| VIS-015 | Visual diff endpoint implementation |
| Future | Position persistence (server stores layout per user/view) |
| Future | Incremental graph updates (WebSocket/SSE) |
| Future | Caching / materialized projection |

---

## 17. Acceptance Criteria

- [ ] ADR-003 documents the graph projection architecture decision
- [ ] All node mapping rules cover the 11 node types with deterministic visual IDs
- [ ] All 12 edge extraction rules derive edges from domain relationships
- [ ] Scope filtering is specified for L1, L2, L3
- [ ] Layer filtering rules are defined
- [ ] Validation overlay maps ValidationIssue to NodeStatus
- [ ] Breadcrumb generation covers all scope levels
- [ ] REST endpoint contract is defined (path, params, response)
- [ ] Visual diff strategy is specified for VIS-015
- [ ] Shared types are confirmed (no changes from VIS-002 preview)
- [ ] Connection rules and layer definitions registries are specified
- [ ] Gateway BFF extension is specified
- [ ] Implementation plan with clear phases exists
- [ ] No new domain semantics introduced (pure visual projection)

---

## 18. Supersedes

This document is new. It complements `docs/11-visual-grammar-v1-spec.md` (VIS-002) which defines the grammar; this spec defines the projection that populates it.

---

## 19. References

- `docs/11-visual-grammar-v1-spec.md` — Visual Grammar v1 (VIS-002)
- `docs/adr/ADR-001-visual-first-pivot.md` — Pivot decision
- `docs/adr/ADR-002-visual-shell-design.md` — Shell design
- `docs/adr/ADR-003-graph-projection-architecture.md` — Architecture decision (this task)
- `services/company-design/src/releases/application/snapshot-collector.ts` — Existing snapshot collection
- `services/company-design/src/validations/application/validation-engine.ts` — Existing validation engine
