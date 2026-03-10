# Visual Grammar v1 — Formal Specification

Epic 20 | VIS-002 | Plan deliverable

## 1. Purpose

This document formalizes the visual grammar of TheCrew: the complete catalog of node types, edge types, connection rules, semantic zoom levels, visual layers, and inspector contracts. It serves as the binding contract for VIS-003 (graph projection) and all canvas implementation tasks.

Everything here maps to existing domain entities in `packages/shared-types`. No new domain semantics are introduced — only visual representation rules.

---

## 2. Node Type Catalog

### 2.1 Node types

| Node Type | Domain Source | Semantic ID | Drilldown | Layer |
|-----------|-------------|-------------|-----------|-------|
| `company` | `CompanyModelDto` | `projectId` | Yes → org canvas | Organization |
| `department` | `DepartmentDto` | `id` | Yes → department canvas | Organization |
| `role` | `RoleDto` | `id` | No (detail) | Organization |
| `agent-archetype` | `AgentArchetypeDto` | `id` | No (detail) | Organization |
| `agent-assignment` | `AgentAssignmentDto` | `id` | No (detail) | Organization |
| `capability` | `CapabilityDto` | `id` | No (detail) | Capabilities |
| `skill` | `SkillDto` | `id` | No (detail) | Capabilities |
| `workflow` | `WorkflowDto` | `id` | Yes → workflow canvas | Workflows |
| `workflow-stage` | `WorkflowStageDto` | `workflowId:stageName` | No (detail) | Workflows |
| `contract` | `ContractDto` | `id` | No (detail) | Contracts |
| `policy` | `PolicyDto` | `id` | No (detail) | Governance |

**Total: 11 node types** mapping to 11 domain concepts.

### 2.2 Node visual properties

Each node on the canvas carries:

```
VisualNode {
  id:         string          // stable visual ID (see §2.3)
  nodeType:   NodeType        // one of the 11 types above
  entityId:   string          // domain entity ID
  label:      string          // display name (from entity.name or entity.purpose)
  sublabel:   string | null   // secondary text (mandate, description excerpt, status)
  position:   { x, y }       // canvas coordinates
  collapsed:  boolean         // whether children are hidden
  status:     NodeStatus      // 'normal' | 'warning' | 'error' | 'dimmed'
  layerIds:   LayerId[]       // which layers this node belongs to
}
```

### 2.3 Visual ID strategy

Visual node IDs are deterministic from domain data:

| Node Type | Visual ID Pattern |
|-----------|------------------|
| `company` | `company:{projectId}` |
| `department` | `dept:{id}` |
| `role` | `role:{id}` |
| `agent-archetype` | `archetype:{id}` |
| `agent-assignment` | `assignment:{id}` |
| `capability` | `cap:{id}` |
| `skill` | `skill:{id}` |
| `workflow` | `wf:{id}` |
| `workflow-stage` | `wf-stage:{workflowId}:{order}` |
| `contract` | `contract:{id}` |
| `policy` | `policy:{id}` |

This ensures stable IDs across graph projection rebuilds and enables visual diff.

### 2.4 Node label mapping

| Node Type | `label` source | `sublabel` source |
|-----------|---------------|-------------------|
| `company` | `companyModel.purpose` (truncated) | `companyModel.type` |
| `department` | `name` | `mandate` (truncated) |
| `role` | `name` | `accountability` (truncated) |
| `agent-archetype` | `name` | `description` (truncated) |
| `agent-assignment` | `name` | `status` |
| `capability` | `name` | `description` (truncated) |
| `skill` | `name` | `category` |
| `workflow` | `name` | `status` |
| `workflow-stage` | `name` | `description` (truncated) |
| `contract` | `name` | `type` + `status` |
| `policy` | `name` | `type` + `enforcement` |

### 2.5 Containment rules

Containment defines parent→child structural relationships for nesting and layout:

| Parent | Can Contain | Derived From |
|--------|------------|--------------|
| `company` | `department` | All departments belong to the project |
| `department` | `department` | `dept.parentId` → sub-departments |
| `department` | `role` | `role.departmentId` |
| `department` | `agent-archetype` | `archetype.departmentId` |
| `department` | `capability` | `capability.ownerDepartmentId` |
| `department` | `workflow` | `workflow.ownerDepartmentId` |
| `workflow` | `workflow-stage` | `workflow.stages[]` |
| `agent-archetype` | `agent-assignment` | `assignment.archetypeId` |

Containment is not an edge type — it is structural grouping used for layout and drilldown. It does not appear as a visible edge on the canvas. Instead, children are rendered inside or adjacent to their parent at the appropriate zoom level.

---

## 3. Edge Type Catalog

### 3.1 Edge types

| Edge Type | Category | Visual Style | Directional | Layer |
|-----------|----------|-------------|-------------|-------|
| `reports_to` | Hierarchical | Solid, muted | Yes (child→parent) | Organization |
| `owns` | Ownership | Solid, primary | Yes (owner→owned) | Organization |
| `assigned_to` | Assignment | Dashed, primary | Yes (archetype→role) | Organization |
| `contributes_to` | Capability | Dotted, accent | Yes (role→capability) | Capabilities |
| `has_skill` | Capability | Dotted, accent | Yes (archetype→skill) | Capabilities |
| `compatible_with` | Capability | Dotted, subtle | Yes (skill→role) | Capabilities |
| `provides` | Contract | Solid, green | Yes (party→contract) | Contracts |
| `consumes` | Contract | Solid, orange | Yes (party→contract) | Contracts |
| `bound_by` | Contract | Dashed, muted | Yes (workflow→contract) | Contracts |
| `participates_in` | Workflow | Dotted, muted | Yes (role/dept→workflow) | Workflows |
| `hands_off_to` | Workflow | Solid, primary | Yes (stage→stage) | Workflows |
| `governs` | Governance | Dashed, red | Yes (policy→target) | Governance |

**Total: 12 edge types.**

### 3.2 Edge visual properties

```
VisualEdge {
  id:         string          // stable visual ID (see §3.3)
  edgeType:   EdgeType        // one of the 12 types above
  sourceId:   string          // visual node ID of source
  targetId:   string          // visual node ID of target
  label:      string | null   // optional label on the edge
  style:      EdgeStyle       // solid | dashed | dotted
  layerIds:   LayerId[]       // which layers this edge belongs to
}
```

### 3.3 Visual edge ID strategy

```
{edgeType}:{sourceVisualId}→{targetVisualId}
```

Example: `reports_to:dept:abc→dept:xyz`

For multi-edges between the same pair (rare), append a discriminator from the domain (e.g., contract ID).

---

## 4. Connection Rules Matrix

This matrix defines which source→edge→target combinations are **valid**. Any combination not listed is invalid and must be rejected by the graph projection and by any future edge-creation UI.

### 4.1 Organization edges

| Edge Type | Valid Source Types | Valid Target Types | Domain Origin |
|-----------|------------------|-------------------|---------------|
| `reports_to` | `department` | `department` | `dept.parentId` |
| `owns` | `department` | `capability` | `cap.ownerDepartmentId` |
| `owns` | `department` | `workflow` | `wf.ownerDepartmentId` |
| `assigned_to` | `agent-archetype` | `role` | `archetype.roleId` |

### 4.2 Capability edges

| Edge Type | Valid Source Types | Valid Target Types | Domain Origin |
|-----------|------------------|-------------------|---------------|
| `contributes_to` | `role` | `capability` | `role.capabilityIds[]` |
| `has_skill` | `agent-archetype` | `skill` | `archetype.skillIds[]` |
| `compatible_with` | `skill` | `role` | `skill.compatibleRoleIds[]` |

### 4.3 Contract edges

| Edge Type | Valid Source Types | Valid Target Types | Domain Origin |
|-----------|------------------|-------------------|---------------|
| `provides` | `department`, `capability` | `contract` | `contract.providerId + providerType` |
| `consumes` | `department`, `capability` | `contract` | `contract.consumerId + consumerType` |
| `bound_by` | `workflow` | `contract` | `workflow.contractIds[]` |

### 4.4 Workflow edges

| Edge Type | Valid Source Types | Valid Target Types | Domain Origin |
|-----------|------------------|-------------------|---------------|
| `participates_in` | `role`, `department` | `workflow` | `workflow.participants[]` |
| `hands_off_to` | `workflow-stage` | `workflow-stage` | Implicit from `stages[].order` sequence |

### 4.5 Governance edges

| Edge Type | Valid Source Types | Valid Target Types | Domain Origin |
|-----------|------------------|-------------------|---------------|
| `governs` | `policy` | `department` | `policy.departmentId` (scope=department) |
| `governs` | `policy` | `company` | `policy.scope === 'global'` |

### 4.6 Cardinality

All edges are 1:1 instances (one edge per relationship). Multi-valued foreign keys (e.g., `capabilityIds[]`) produce one edge per element. There are no "multi-edges" with the same type between the same pair — if multiple relationships exist, they map to multiple distinct edges.

---

## 5. Semantic Zoom Levels

### 5.1 Level definitions

| Level | Name | Scope | Trigger |
|-------|------|-------|---------|
| L1 | Company Map | Entire project | Default view / zoom out fully |
| L2 | Department Map | Single department | Click/drilldown on department node |
| L3 | Workflow Map | Single workflow | Click/drilldown on workflow node |
| L4 | Detail View | Single entity | Select any leaf node |

### 5.2 Visibility rules per level

#### L1 — Company Map

| Visible | Node Types | Edge Types |
|---------|-----------|-----------|
| Always | `company`, `department` | `reports_to` |
| Layer: Capabilities | `capability` (as badges/counts on depts) | — |
| Layer: Governance | `policy` (global only, as overlay) | `governs` |

**Collapsed by default:** roles, agents, skills, capabilities, workflows, contracts, stages, assignments.

**Interaction:** Click department → drilldown to L2. Click workflow badge → drilldown to L3.

#### L2 — Department Map

| Visible | Node Types | Edge Types |
|---------|-----------|-----------|
| Always | `department` (context), `role`, `agent-archetype` | `assigned_to` |
| Layer: Capabilities | `capability`, `skill` | `owns`, `contributes_to`, `has_skill`, `compatible_with` |
| Layer: Workflows | `workflow` (owned) | `owns`, `participates_in` |
| Layer: Contracts | `contract` (where dept is party) | `provides`, `consumes`, `bound_by` |
| Layer: Governance | `policy` (dept scope) | `governs` |

**Context node:** The department being viewed is rendered as the container/background.

**Interaction:** Click workflow → drilldown to L3. Click any leaf → L4 inspector.

#### L3 — Workflow Map

| Visible | Node Types | Edge Types |
|---------|-----------|-----------|
| Always | `workflow` (context), `workflow-stage` | `hands_off_to` |
| Layer: Contracts | `contract` (bound) | `bound_by` |
| Layer: Organization | Participants (role/dept badges) | `participates_in` |
| Layer: Governance | `policy` (governing) | `governs` |

**Context node:** The workflow being viewed is the container.

**Interaction:** Click stage → L4 inspector. Click participant badge → navigate to dept/role.

#### L4 — Detail View

Not a canvas level. This is the **inspector panel** (right sidebar). Selecting any node at any level opens L4 in the inspector with full entity details, relationships, validations, and history.

### 5.3 Zoom transition behavior

- **Drilldown in:** animated transition, breadcrumb updates, canvas re-renders with new scope.
- **Drilldown out:** breadcrumb click or zoom-out gesture, returns to parent level.
- **Cross-reference navigation:** clicking a reference to an entity outside current scope navigates to that entity's natural scope (e.g., clicking a capability owned by another dept → drilldown into that dept at L2).
- **Breadcrumb:** always shows `Company > [Department] > [Workflow]` path.

---

## 6. Visual Layers

### 6.1 Layer definitions

| Layer ID | Label | Node Types Controlled | Edge Types Controlled | Default Active |
|----------|-------|----------------------|----------------------|----------------|
| `organization` | Organization | `company`, `department`, `role`, `agent-archetype`, `agent-assignment` | `reports_to`, `assigned_to` | Yes (always at L1) |
| `capabilities` | Capabilities | `capability`, `skill` | `owns` (dept→cap), `contributes_to`, `has_skill`, `compatible_with` | No |
| `workflows` | Workflows | `workflow`, `workflow-stage` | `owns` (dept→wf), `participates_in`, `hands_off_to` | No |
| `contracts` | Contracts | `contract` | `provides`, `consumes`, `bound_by` | No |
| `governance` | Governance | `policy` | `governs` | No |

### 6.2 Layer behavior rules

1. **Organization is always active at L1.** It cannot be toggled off at Company Map level.
2. **Layers are additive.** Enabling a layer adds its nodes/edges to the current view. Disabling removes them.
3. **Layer state persists per zoom level.** Enabling "Contracts" at L2 does not enable it at L1.
4. **Context nodes are always visible** regardless of layer state. The department node at L2 is always shown.
5. **Nodes may appear in multiple layers.** Department appears in Organization (as structural) and as context in Capabilities when it's an owner. The primary layer determines the node's default visibility; secondary layers add edges to/from it.
6. **Edge visibility follows the stricter node.** An edge is visible only if both its source and target nodes are visible.

### 6.3 Layer defaults per zoom level

| Level | Default Active Layers |
|-------|----------------------|
| L1 | Organization |
| L2 | Organization, Capabilities |
| L3 | Workflows |
| L4 | N/A (inspector) |

---

## 7. Inspector Contract

### 7.1 Inspector tabs per node type

| Node Type | Overview | Properties | Relations | Validations | History | Actions |
|-----------|----------|-----------|-----------|-------------|---------|---------|
| `company` | purpose, type, scope | principles[] | depts (contains), global policies | yes | audit | edit |
| `department` | name, mandate | description, parentId | roles, capabilities, workflows, contracts, policies, sub-depts | yes | audit | edit, add child |
| `role` | name, accountability | description, authority, deptId | capabilities (contributes_to), archetypes (assigned_to) | yes | audit | edit |
| `agent-archetype` | name, description | roleId, deptId, constraints | skills (has_skill), assignments, role (assigned_to) | yes | audit | edit |
| `agent-assignment` | name, status | archetypeId | archetype (instantiates) | yes | audit | edit, activate/deactivate |
| `capability` | name, description | ownerDeptId, inputs, outputs | roles (contributes_to), contracts (provides/consumes) | yes | audit | edit |
| `skill` | name, category | description, tags | roles (compatible_with), archetypes (has_skill) | yes | audit | edit |
| `workflow` | name, status | description, trigger, ownerDeptId | stages, participants, contracts (bound_by) | yes | audit | edit, add stage |
| `workflow-stage` | name, order | description | prev/next stage (hands_off_to) | no | no | edit |
| `contract` | name, type, status | description, acceptance criteria | provider, consumer, workflows (bound_by) | yes | audit | edit |
| `policy` | name, type | scope, condition, enforcement, status | governed entities | yes | audit | edit |

### 7.2 Inspector tabs for edges

| Tab | Content |
|-----|---------|
| Type | Edge type label and category |
| Source | Source node summary with link |
| Target | Target node summary with link |
| Properties | Edge-specific properties (e.g., contract terms for `provides`/`consumes`) |

### 7.3 Inspector behavior

1. **Single selection:** Clicking one node/edge opens it in the inspector.
2. **Multi-selection:** Selecting multiple nodes shows a summary (count by type, bulk actions).
3. **No selection:** Inspector shows canvas-level summary (node/edge counts by type, validation summary).
4. **Edits propagate:** Changing a property in the inspector triggers a domain mutation via the existing API and refreshes the graph projection.

---

## 8. Validation Overlay Rules

### 8.1 Node status mapping

The `NodeStatus` is derived from the existing `ValidationEngine` results:

| Node Status | Condition | Visual |
|------------|-----------|--------|
| `normal` | No validation issues | Default style |
| `warning` | Has warning-severity issues | Yellow border/badge |
| `error` | Has error-severity issues | Red border/badge |
| `dimmed` | Filtered out by layer/search but still shown as context | Reduced opacity |

### 8.2 Validation → node mapping

The existing `ValidationIssue.entity` and `ValidationIssue.entityId` fields map directly to node types and entity IDs:

| `ValidationIssue.entity` | Maps to Node Type |
|--------------------------|------------------|
| `companyModel` | `company` |
| `department` | `department` |
| `capability` | `capability` |
| `role` | `role` |
| `agentArchetype` | `agent-archetype` |
| `agentAssignment` | `agent-assignment` |
| `skill` | `skill` |
| `contract` | `contract` |
| `workflow` | `workflow` |
| `policy` | `policy` |

---

## 9. Planned TypeScript Types for shared-types

These types will be added to `packages/shared-types/src/index.ts` during VIS-003 (graph projection implementation). They are documented here as the contract.

```typescript
// --- Visual Grammar Types ---

// Node types
export type NodeType =
  | 'company'
  | 'department'
  | 'role'
  | 'agent-archetype'
  | 'agent-assignment'
  | 'capability'
  | 'skill'
  | 'workflow'
  | 'workflow-stage'
  | 'contract'
  | 'policy'

// Edge types
export type EdgeType =
  | 'reports_to'
  | 'owns'
  | 'assigned_to'
  | 'contributes_to'
  | 'has_skill'
  | 'compatible_with'
  | 'provides'
  | 'consumes'
  | 'bound_by'
  | 'participates_in'
  | 'hands_off_to'
  | 'governs'

// Edge categories (for grouping and styling)
export type EdgeCategory =
  | 'hierarchical'
  | 'ownership'
  | 'assignment'
  | 'capability'
  | 'contract'
  | 'workflow'
  | 'governance'

// Visual layers
export type LayerId =
  | 'organization'
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'governance'

// Semantic zoom levels
export type ZoomLevel = 'L1' | 'L2' | 'L3' | 'L4'

// Node status (validation overlay)
export type NodeStatus = 'normal' | 'warning' | 'error' | 'dimmed'

// Edge visual style
export type EdgeStyle = 'solid' | 'dashed' | 'dotted'

// Position on canvas
export interface CanvasPosition {
  x: number
  y: number
}

// A node in the visual graph
export interface VisualNodeDto {
  id: string
  nodeType: NodeType
  entityId: string
  label: string
  sublabel: string | null
  position: CanvasPosition | null  // null = auto-layout
  collapsed: boolean
  status: NodeStatus
  layerIds: LayerId[]
  parentId: string | null          // containment parent visual ID
}

// An edge in the visual graph
export interface VisualEdgeDto {
  id: string
  edgeType: EdgeType
  sourceId: string                 // visual node ID
  targetId: string                 // visual node ID
  label: string | null
  style: EdgeStyle
  layerIds: LayerId[]
}

// Complete graph projection for a scope
export interface VisualGraphDto {
  projectId: string
  scope: GraphScope
  zoomLevel: ZoomLevel
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
  activeLayers: LayerId[]
  breadcrumb: BreadcrumbEntry[]
}

// Scope of the graph projection
export interface GraphScope {
  level: ZoomLevel
  entityId: string | null          // null for L1 (company-wide)
  entityType: NodeType | null      // null for L1
}

// Breadcrumb entry for navigation
export interface BreadcrumbEntry {
  label: string
  nodeType: NodeType
  entityId: string
  zoomLevel: ZoomLevel
}

// Connection rule (for validation and edge-creation UI)
export interface ConnectionRule {
  edgeType: EdgeType
  sourceTypes: NodeType[]
  targetTypes: NodeType[]
  category: EdgeCategory
  style: EdgeStyle
}

// Layer definition
export interface LayerDefinition {
  id: LayerId
  label: string
  nodeTypes: NodeType[]
  edgeTypes: EdgeType[]
}
```

---

## 10. What This Spec Does NOT Cover

These items are explicitly deferred to later tasks:

| Deferred to | Topic |
|-------------|-------|
| VIS-003 | Graph projection implementation, endpoint design, mapping logic |
| VIS-004 | Shell layout (canvas viewport, sidebar, inspector panel dimensions) |
| VIS-005 | Canvas library choice, rendering, drag & drop implementation |
| VIS-008 | Edge creation/editing UI and bidirectional sync |
| VIS-011 | Animated zoom transitions, nested navigation UX details |
| VIS-013 | Layer persistence, saved views, filter UI |
| VIS-015 | Visual diff rendering between releases |
| VIS-016 | Chat scopes and data model |
| Future | `artifact` node type (domain entity does not yet exist) |
| Future | `runtime` layer (Epic 35) |

---

## 11. Open Decisions Captured

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Should containment be an explicit edge or structural grouping? | **Structural grouping.** Containment is layout, not a visible edge. |
| 2 | Should `agent-assignment` be a separate node or a badge on `agent-archetype`? | **Separate node** inside archetype containment, shown only at L2+ with Organization layer. |
| 3 | Should `workflow-stage` have its own visual ID namespace? | **Yes.** Pattern: `wf-stage:{workflowId}:{order}`. Stages are value objects but visually distinct nodes. |
| 4 | How to handle `policy` with `scope=global`? | Edge `governs` targets `company` node. At L1 shown as overlay if Governance layer active. |
| 5 | How to handle cross-department relationships at L1? | Show as thin cross-links between department nodes when the relevant layer is active (e.g., `provides`/`consumes` between departments via contracts). |
| 6 | Position storage: server or client? | **Server** (part of graph projection). Positions are per-node, per-scope. Null means auto-layout. |
| 7 | How to derive `hands_off_to` edges for stages? | From `stages[].order`: each stage connects to the next by order. Stage N → Stage N+1. |

---

## 12. Supersedes

This document supersedes `docs/07-lenguaje-visual-y-gramatica.md` which was an informal draft. The draft remains for reference but this spec is the binding contract.

---

## 13. Acceptance Criteria

- [ ] All 11 node types are formally defined with visual ID patterns
- [ ] All 12 edge types are formally defined with connection rules
- [ ] Connection rules matrix covers every existing domain relationship
- [ ] Semantic zoom levels L1–L4 have explicit visibility rules
- [ ] 5 visual layers are defined with node/edge membership
- [ ] Inspector contract specifies tabs per node type
- [ ] Validation overlay mapping is defined
- [ ] TypeScript type signatures are documented for VIS-003 implementation
- [ ] No new domain semantics introduced (visual-only concerns)
- [ ] Document reviewed and linked from task registry
