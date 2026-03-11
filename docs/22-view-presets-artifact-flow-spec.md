# View Presets & Artifact Flow — Design Specification

> **Task:** CAV-012
> **Epic:** 40 — Visual Views, Layers & Artifact Flow
> **Mode:** plan
> **Status:** design complete

---

## Problem Statement

The canvas today shows the **same perspective** regardless of what the user is trying to understand. The only customization mechanism is toggling individual layers and manually filtering node types.

The Canvas Editor v2 spec (docs/18) calls for **7 named perspectives** (Organization, Capability, Workflow, Contract, Artifact Flow, Governance, Operations) — each providing a curated lens over the same underlying model. Additionally, **artifacts** (documents, deliverables, data outputs, decisions) are not yet part of the visual grammar. They are central to understanding how value flows through the company.

### What exists today

| Concept | Current state |
|---------|--------------|
| Layers | 5 layer definitions (organization, capabilities, workflows, contracts, governance) |
| Node type filter | Checkbox per type in FilterPanel |
| Status filter | Checkbox per validation status |
| Saved views | Project-level persistence of layer+filter state |
| Artifacts | No domain entity, no NodeType, no visual representation |

### What's missing

1. **View presets** — Named configurations that set layers, filters, and emphasis in a single click
2. **Artifact entity** — Domain aggregate with producer/consumer semantics
3. **Artifact visual grammar** — NodeType, EdgeTypes, LayerId, ConnectionRules
4. **Artifact layer** — Dedicated layer to show/hide artifact flow
5. **Preset-aware UI** — Toolbar/explorer preset selector

---

## Design Goals

1. **Preset = curated filter configuration, not a separate data model.** A preset activates specific layers, sets node type and edge type emphasis, and optionally applies a scope constraint. It does NOT load different data — the same graph projection serves all presets.
2. **Presets compose with scopes.** A preset works at any scope level (L1–L4). "Capability View" at L1 shows the company-wide capability map; at L2 it shows capabilities within one department.
3. **Presets are additive to manual filtering.** Activating a preset sets the baseline; the user can still toggle layers, add type filters, or search. Clearing all customizations returns to the preset baseline.
4. **Artifacts are first-class domain entities.** They follow the same aggregate → service → controller → module pattern as all other entities.
5. **No new backend endpoints for presets.** Presets are pure frontend concerns — they manipulate the same `activeLayers` and `nodeTypeFilter` state that already exists.

---

## Part 1: View Presets

### ViewPreset type

```typescript
// packages/shared-types/src/index.ts (or dedicated preset file)

export type ViewPresetId =
  | 'organization'
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'artifact-flow'
  | 'governance'
  | 'operations'

export interface ViewPresetDefinition {
  id: ViewPresetId
  label: string
  description: string
  icon: string                          // Lucide icon name
  layers: LayerId[]                     // layers to activate
  emphasisNodeTypes: NodeType[] | null  // if set, only these node types are shown
  emphasisEdgeTypes: EdgeType[] | null  // if set, only these edge types are shown
  availableAtScopes: ScopeType[]        // which scopes this preset makes sense for
  requiresLayer?: LayerId              // if the preset depends on a specific layer existing
}
```

### VIEW_PRESET_REGISTRY

```typescript
export const VIEW_PRESET_REGISTRY: Record<ViewPresetId, ViewPresetDefinition> = {
  organization: {
    id: 'organization',
    label: 'Organization',
    description: 'Company structure: departments, roles, agents',
    icon: 'Building2',
    layers: ['organization'],
    emphasisNodeTypes: ['company', 'department', 'role', 'agent-archetype', 'agent-assignment'],
    emphasisEdgeTypes: ['reports_to', 'assigned_to'],
    availableAtScopes: ['company', 'department'],
  },

  capabilities: {
    id: 'capabilities',
    label: 'Capabilities',
    description: 'Capabilities, skills, ownership, and contribution',
    icon: 'Puzzle',
    layers: ['organization', 'capabilities'],
    emphasisNodeTypes: ['department', 'capability', 'skill', 'role'],
    emphasisEdgeTypes: ['owns', 'contributes_to', 'has_skill', 'compatible_with'],
    availableAtScopes: ['company', 'department'],
  },

  workflows: {
    id: 'workflows',
    label: 'Workflows',
    description: 'Processes, stages, participants, and handoffs',
    icon: 'Workflow',
    layers: ['organization', 'workflows'],
    emphasisNodeTypes: ['workflow', 'workflow-stage', 'department', 'role'],
    emphasisEdgeTypes: ['owns', 'participates_in', 'hands_off_to'],
    availableAtScopes: ['company', 'department', 'workflow', 'workflow-stage'],
  },

  contracts: {
    id: 'contracts',
    label: 'Contracts',
    description: 'Agreements, providers, consumers, and bindings',
    icon: 'FileSignature',
    layers: ['organization', 'capabilities', 'contracts'],
    emphasisNodeTypes: ['department', 'capability', 'contract', 'workflow'],
    emphasisEdgeTypes: ['provides', 'consumes', 'bound_by'],
    availableAtScopes: ['company', 'department', 'workflow'],
  },

  'artifact-flow': {
    id: 'artifact-flow',
    label: 'Artifact Flow',
    description: 'Documents, deliverables, and data flowing through the company',
    icon: 'FileBox',
    layers: ['artifacts', 'workflows'],
    emphasisNodeTypes: ['artifact', 'workflow', 'workflow-stage', 'department', 'capability'],
    emphasisEdgeTypes: ['produces_artifact', 'consumes_artifact', 'transforms_into'],
    availableAtScopes: ['company', 'department', 'workflow', 'workflow-stage'],
    requiresLayer: 'artifacts',
  },

  governance: {
    id: 'governance',
    label: 'Governance',
    description: 'Policies, rules, constraints, and approval gates',
    icon: 'Shield',
    layers: ['organization', 'governance'],
    emphasisNodeTypes: ['policy', 'department', 'company'],
    emphasisEdgeTypes: ['governs'],
    availableAtScopes: ['company', 'department'],
  },

  operations: {
    id: 'operations',
    label: 'Operations',
    description: 'Runtime state, incidents, and live activity (future)',
    icon: 'Activity',
    layers: ['workflows', 'contracts'],
    emphasisNodeTypes: null,   // shows all — operations overlay adds runtime decorations
    emphasisEdgeTypes: null,
    availableAtScopes: ['company', 'department', 'workflow'],
  },
}
```

### How presets work at runtime

A preset does **not** replace the current scope or navigate anywhere. It modifies the **filter state** of the current scope view:

```
User clicks "Capabilities" preset
  → store.setActiveLayers(['organization', 'capabilities'])
  → store.setNodeTypeFilter(['department', 'capability', 'skill', 'role'])
  → store.setActivePreset('capabilities')
```

The resulting filtering chain is unchanged from today:
```
API fetch (full graph for scope) → filterGraph(layers, nodeTypeFilter, statusFilter) → graphToFlow → render
```

### Store changes

```typescript
// visual-workspace-store.ts — new state

activePreset: ViewPresetId | null           // which preset is active, null = custom/none

setActivePreset(presetId: ViewPresetId): void
clearActivePreset(): void
```

**`setActivePreset(presetId)`** implementation:
1. Look up `VIEW_PRESET_REGISTRY[presetId]`
2. Check `availableAtScopes` includes `currentScope.scopeType` — if not, no-op
3. Set `activeLayers` to preset's `layers`
4. Set `nodeTypeFilter` to preset's `emphasisNodeTypes`
5. Set `activePreset` to `presetId`

**`clearActivePreset()`** — resets to scope defaults:
1. Set `activeLayers` to `SCOPE_REGISTRY[currentScope.scopeType].defaultLayers`
2. Set `nodeTypeFilter` to `null`
3. Set `activePreset` to `null`

**Auto-clear:** When the user manually toggles a layer or changes nodeTypeFilter, `activePreset` is set to `null` (indicating custom configuration). This way the preset indicator deactivates when the user deviates.

### Preset in setScope

When `setScope()` is called (scope change / navigation), `activePreset` is reset to `null`. The scope's default layers take over. This is correct — entering a department drilldown should show the department's default view, not carry forward a preset from L1.

**Exception:** If the user explicitly re-selects a preset after navigating, it applies at the new scope.

### Edge type filtering (new capability)

Today, the graph filter system filters by **layers** (which implicitly filter edges) and **node types**. Presets introduce the concept of **edge type emphasis**.

When `emphasisEdgeTypes` is set on a preset:
- Edges not in the emphasis list are rendered with reduced opacity (dimmed), not hidden
- This provides context without clutter
- The filter function signature remains the same; edge emphasis is applied in `graphToFlow` at render time, not at the filter level

```typescript
// In graph-to-flow.ts, when converting edges:

export function visualEdgeToFlowEdge(
  edge: VisualEdgeDto,
  emphasisEdgeTypes?: EdgeType[] | null,
): Edge {
  const isDimmed = emphasisEdgeTypes && !emphasisEdgeTypes.includes(edge.edgeType)
  // ... existing conversion ...
  // Add opacity: isDimmed ? 0.2 : 1.0 to edge style
}
```

### UI: Preset Selector

**Location:** Canvas toolbar, positioned between mode selector and zoom controls.

**Design:**
- A row of small icon buttons, one per available preset (filtered by current scope)
- Active preset has highlighted/active state
- Clicking active preset deactivates it (returns to defaults)
- Tooltip shows preset label + description
- Operations preset shows a "Coming soon" badge until CAV-019

**Alternative (compact):** A dropdown/popover with preset list + description. Better for small screens.

**Recommendation:** Start with the popover approach (similar to existing palette buttons). Migrate to icon row if toolbar space allows.

```typescript
// canvas-toolbar.tsx additions

<PresetSelector
  currentScope={currentScope.scopeType}
  activePreset={activePreset}
  onSelectPreset={setActivePreset}
  onClearPreset={clearActivePreset}
/>
```

### UI: Explorer integration

The Layers tab in Explorer should show which preset is active and allow returning to defaults:
- When a preset is active, show a "Preset: Capabilities" badge at the top of the Layers tab
- "Reset to defaults" button clears the preset

### Saved Views integration

`ViewStateDto` already includes `activeLayers` and `nodeTypeFilter`. Adding `activePreset` allows saved views to capture the preset:

```typescript
export interface ViewStateDto {
  activeLayers: LayerId[]
  nodeTypeFilter: NodeType[] | null
  statusFilter: NodeStatus[] | null
  activePreset?: ViewPresetId | null    // NEW — which preset was active when saved
}
```

When loading a saved view with `activePreset`, the system applies the preset (which may override layers/filters from the saved view if the preset definition has changed since saving). If no `activePreset`, the explicit layers/filters are used as before.

---

## Part 2: Artifact Domain Model

### Artifact entity

An artifact represents a **document, deliverable, data output, or decision** that flows through the company's processes.

```typescript
// packages/shared-types/src/index.ts

export type ArtifactType =
  | 'document'         // PRD, spec, report, manual
  | 'data'             // dataset, feed, export
  | 'deliverable'      // finished product, release
  | 'decision'         // ADR, policy decision
  | 'template'         // reusable template/form

export type ArtifactStatus = 'draft' | 'active' | 'archived'

export interface ArtifactDto {
  id: string
  projectId: string
  name: string
  description: string
  type: ArtifactType
  status: ArtifactStatus
  producerId: string | null          // department or capability that produces it
  producerType: PartyType | null     // 'department' | 'capability'
  consumerIds: string[]              // departments or capabilities that consume it
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateArtifactDto {
  name: string
  description: string
  type: ArtifactType
  producerId?: string | null
  producerType?: PartyType | null
  consumerIds?: string[]
  tags?: string[]
}

export interface UpdateArtifactDto {
  name?: string
  description?: string
  type?: ArtifactType
  status?: ArtifactStatus
  producerId?: string | null
  producerType?: PartyType | null
  consumerIds?: string[]
  tags?: string[]
}
```

### Design decisions for artifacts

| Decision | Rationale |
|----------|-----------|
| `producerId` + `producerType` (single) | An artifact has one authoritative producer. Multiple consumers. Mirrors `contract.providerId` pattern. |
| `consumerIds` (string array) | Simple ID list. The producer/consumer type is resolved at relation time via edge type. Each consumer creates a `consumes_artifact` edge. |
| No `schema` or `qualityCriteria` in v1 | Keep the entity lean. These can be added as fields later without structural change. |
| No `version` tracking in v1 | Version is a future concern (artifact history). The entity has `status` for lifecycle. |
| `PartyType` reuse | Same `'department' | 'capability'` used for contracts. Producer/consumer can be either. |
| Tags for flexible categorization | Tags allow cross-cutting concerns without rigid taxonomies. |

### Backend: Artifact aggregate

Follows the established pattern:

```
services/company-design/src/artifacts/
├── domain/
│   ├── artifact.ts              # Artifact aggregate (extends AggregateRoot)
│   └── artifact.repository.ts   # Repository interface + Symbol token
├── application/
│   ├── artifact.service.ts      # CRUD service (with optional AuditService injection)
│   ├── artifact.controller.ts   # REST controller (GET/POST/PATCH/DELETE /projects/:projectId/artifacts)
│   └── artifact.mapper.ts       # Domain ↔ DTO mapper
├── infrastructure/
│   └── in-memory-artifact.repository.ts
└── artifacts.module.ts
```

### Integration with existing systems

| System | Change |
|--------|--------|
| **SnapshotCollector** | Add `artifacts: ArtifactDto[]` to `ReleaseSnapshotDto` |
| **ValidationEngine** | Add rules: artifact→producer ref, artifact→consumer refs |
| **SnapshotDiffer** | Add `'artifact'` to `DiffEntityType` |
| **AuditService** | Auto-record on artifact CRUD (via existing @Optional() pattern) |
| **Gateway BFF** | `CompanyDesignClient` + `ArtifactsController` proxy |

---

## Part 3: Artifact Visual Grammar

### New NodeType

```typescript
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
  | 'artifact'           // NEW
```

### New EdgeTypes

```typescript
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
  | 'produces_artifact'   // NEW: department/capability → artifact
  | 'consumes_artifact'   // NEW: artifact → department/capability
```

**Why not reuse `provides`/`consumes`?** Those are contract-specific (department/capability → contract). Artifact edges connect different entity types (department/capability → artifact → department/capability) and carry different semantics. Separate edge types prevent ambiguity in the ConnectionRule system and make presets/filtering precise.

**Why not `transforms_into`?** `transforms_into` (artifact → artifact) is a valid future edge type for chains like "raw data → report → dashboard". Deferred from v1 — it requires artifact-to-artifact connections that are not yet in the domain model. Can be added to ConnectionRules when needed without structural change.

### New EdgeCategory

No new category needed. `produces_artifact` and `consumes_artifact` fit the existing `'contract'` category semantically — they represent value exchange. However, for preset clarity, a dedicated category is cleaner:

```typescript
export type EdgeCategory =
  | 'hierarchical'
  | 'ownership'
  | 'assignment'
  | 'capability'
  | 'contract'
  | 'workflow'
  | 'governance'
  | 'artifact'           // NEW
```

### New LayerId

```typescript
export type LayerId =
  | 'organization'
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'governance'
  | 'artifacts'          // NEW
```

### New ConnectionRules

```typescript
// Added to CONNECTION_RULES[]

{ edgeType: 'produces_artifact', sourceTypes: ['department', 'capability'], targetTypes: ['artifact'], category: 'artifact', style: 'solid' },
{ edgeType: 'consumes_artifact', sourceTypes: ['department', 'capability'], targetTypes: ['artifact'], category: 'artifact', style: 'dashed' },
```

**Direction convention:**
- `produces_artifact`: source (producer) → target (artifact)
- `consumes_artifact`: source (consumer) → target (artifact)

Both go **toward** the artifact. This makes the artifact the "hub" in the graph, matching the visual metaphor of a document sitting between producer and consumers. The edge labels ("produces" / "consumes") clarify the role.

### New LAYER_DEFINITIONS entry

```typescript
{
  id: 'artifacts',
  label: 'Artifacts',
  nodeTypes: ['artifact'],
  edgeTypes: ['produces_artifact', 'consumes_artifact'],
},
```

### Node mapper integration

The `node-mapper.ts` already maps all entities in the snapshot to VisualNodeDto. Adding artifact:

```typescript
// In mapNodesToVisual():
for (const artifact of snapshot.artifacts ?? []) {
  nodes.push({
    id: `artifact:${artifact.id}`,
    nodeType: 'artifact',
    entityId: artifact.id,
    label: artifact.name,
    sublabel: artifact.type,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['artifacts'],
    parentId: artifact.producerId
      ? `${artifact.producerType === 'department' ? 'dept' : 'cap'}:${artifact.producerId}`
      : null,
  })
}
```

### Edge extractor integration

```typescript
// In extractEdges():
for (const artifact of snapshot.artifacts ?? []) {
  if (artifact.producerId) {
    const sourcePrefix = artifact.producerType === 'department' ? 'dept' : 'cap'
    edges.push({
      id: `produces_artifact:${sourcePrefix}:${artifact.producerId}:artifact:${artifact.id}`,
      edgeType: 'produces_artifact',
      sourceId: `${sourcePrefix}:${artifact.producerId}`,
      targetId: `artifact:${artifact.id}`,
      label: 'produces',
      style: 'solid',
      layerIds: ['artifacts'],
    })
  }

  for (const consumerId of artifact.consumerIds ?? []) {
    // Consumer type resolution: check if consumerId is a department or capability
    // In v1, resolve from snapshot data
    const isDept = snapshot.departments.some(d => d.id === consumerId)
    const prefix = isDept ? 'dept' : 'cap'
    edges.push({
      id: `consumes_artifact:${prefix}:${consumerId}:artifact:${artifact.id}`,
      edgeType: 'consumes_artifact',
      sourceId: `${prefix}:${consumerId}`,
      targetId: `artifact:${artifact.id}`,
      label: 'consumes',
      style: 'dashed',
      layerIds: ['artifacts'],
    })
  }
}
```

### Scope filter integration

Artifacts appear in existing scope filters based on their producer:

| Scope | Artifacts shown |
|-------|----------------|
| Company (L1) | All artifacts (when `artifacts` layer active) |
| Department (L2) | Artifacts produced by the department or its capabilities |
| Workflow (L3) | Artifacts produced/consumed by workflow participants (future: linked to stages) |
| Workflow-stage (L4) | Artifacts directly related to the stage (future) |

The scope filter functions need minor additions:
- `filterDepartmentScope`: include artifact nodes where `producerId === deptId` or producer capability is owned by dept
- `filterWorkflowScope`: include artifact nodes where producer/consumer is a workflow participant

### Palette integration

```typescript
// palette-data.ts additions

// NODE_CATEGORY_MAP
'artifact': 'artifacts',    // NEW category

// NODE_CATEGORY_LABELS — add:
'artifacts': 'Artifacts',

// NODE_CATEGORY_ORDER — insert before 'governance':
['organization', 'capabilities', 'workflows', 'contracts', 'artifacts', 'governance']

// NODE_DESCRIPTIONS
'artifact': 'Document, deliverable, or data output flowing through the company',

// NODE_LABELS
'artifact': 'Artifact',

// EDGE_TYPE_LABELS
'produces_artifact': 'Produces',
'consumes_artifact': 'Consumes',
```

### Addable entities

```typescript
// addable-entities.ts
// Artifacts are addable at L1 and L2:
const L1_ADDABLE: AddableEntity[] = [
  { nodeType: 'department', label: 'Department' },
  { nodeType: 'artifact', label: 'Artifact' },     // NEW
]

const L2_ADDABLE: AddableEntity[] = [
  // ... existing ...
  { nodeType: 'artifact', label: 'Artifact' },     // NEW
]
```

### Entity form schema

```typescript
// entity-form-schemas.ts — add artifact form
{
  entityType: 'artifact',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'description', type: 'textarea', label: 'Description', required: true },
    { name: 'type', type: 'select', label: 'Type', options: ['document', 'data', 'deliverable', 'decision', 'template'], required: true },
    { name: 'producerId', type: 'party-select', label: 'Producer', required: false },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
}
```

### Entity edit schema

```typescript
// entity-edit-schemas.ts — add artifact edit
{
  entityType: 'artifact',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'type', type: 'select', label: 'Type', options: [...] },
    { name: 'status', type: 'status-select', label: 'Status', options: ['draft', 'active', 'archived'] },
    { name: 'producerId', type: 'party-select', label: 'Producer' },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
}
```

### Inspector: artifact node

The inspector already supports all node types via the edit form engine (CAV-007). Adding the artifact schema automatically gives full edit capability. The Relations tab will show `produces_artifact` and `consumes_artifact` edges.

### VisualNode rendering

The existing `VisualNode` component renders all NodeTypes with a type-specific icon and color. Add:

```typescript
// In VisualNode icon/color mappings:
artifact: { icon: FileBox, color: 'bg-purple-50 border-purple-300 text-purple-800' }
```

---

## Part 4: Preset UX Flows

### Flow 1: User activates a preset

1. User clicks "Capabilities" in the preset selector (toolbar popover)
2. Store: `setActivePreset('capabilities')`
3. `activeLayers` → `['organization', 'capabilities']`
4. `nodeTypeFilter` → `['department', 'capability', 'skill', 'role']`
5. `activePreset` → `'capabilities'`
6. Canvas re-renders with filtered graph (client-side, no refetch)
7. Toolbar shows "Capabilities" as active preset
8. Explorer Layers tab shows preset badge

### Flow 2: User customizes after preset

1. User activates "Capabilities" preset
2. User toggles off "organization" layer in Explorer
3. Store: `toggleLayer('organization')` → sets `activePreset` to `null`
4. Toolbar preset indicator deactivates (showing "Custom")
5. Canvas now shows only capabilities/skills without departments

### Flow 3: User saves a view with preset

1. User activates "Contracts" preset
2. User opens SavedViewsPanel, clicks "Save current view"
3. Saved view captures: `{ activeLayers, nodeTypeFilter, statusFilter, activePreset: 'contracts' }`
4. Later, loading this view restores the preset state

### Flow 4: User navigates with preset active

1. User is at L1 with "Capabilities" preset active
2. User drills into a department
3. `setScope('department', deptId)` resets `activePreset` to `null`
4. Department shows its default layers (organization + capabilities)
5. If user wants capabilities view in department, they reactivate the preset

### Flow 5: Artifact creation from canvas

1. User clicks "Add Node" in toolbar → selects "Artifact" from palette
2. `EntityFormDialog` opens with artifact form schema
3. User fills name, type, optional producer
4. API creates artifact → graph re-fetches → new artifact node appears
5. Artifact is auto-focused after creation

### Flow 6: Artifact flow view

1. User activates "Artifact Flow" preset at L1
2. `activeLayers` → `['artifacts', 'workflows']`
3. Canvas shows departments, workflows, and artifacts with produces/consumes edges
4. Clear visual flow: producer → artifact → consumer
5. Artifacts without producers/consumers appear as orphans (helpful for discovery)

---

## Part 5: Operations Preset (Placeholder)

The "Operations" preset is defined in the registry but has no real runtime data behind it until Epic 43 (CAV-018/CAV-019). In CAV-013, it should:

- Appear in the preset selector with a "Coming soon" badge
- Be selectable (it activates workflows + contracts layers — useful baseline)
- Not promise runtime overlays that don't exist yet

The preset definition is designed to be extended: when operations overlay is implemented, the preset will also toggle the overlay on/activate an operations-specific visual mode.

---

## Part 6: Default Layers Update

With the `artifacts` layer added, the scope defaults should be updated:

```typescript
// SCOPE_REGISTRY updates (in shared-types)

company: {
  defaultLayers: ['organization'],           // unchanged — artifacts opt-in via preset
},
department: {
  defaultLayers: ['organization', 'capabilities'],  // unchanged
},
workflow: {
  defaultLayers: ['workflows'],              // unchanged
},
'workflow-stage': {
  defaultLayers: ['workflows'],              // unchanged
},
```

Artifacts are NOT in any scope's default layers. They appear when:
- The user activates the "Artifact Flow" preset
- The user manually enables the "artifacts" layer
- The user loads a saved view that includes the artifacts layer

This prevents visual noise for users who don't need artifact flow.

---

## Part 7: Relationship Mutation for Artifacts

The existing `useRelationshipMutation` hook and `relationship-mutations.ts` resolver need extensions:

### resolveEdgeCreation — new cases

```typescript
case 'produces_artifact':
  // PATCH /artifacts/:artifactId with producerId + producerType
  return { method: 'PATCH', entityType: 'artifact', entityId: targetEntityId, body: { producerId: sourceEntityId, producerType: inferPartyType(sourceNodeType) } }

case 'consumes_artifact':
  // PATCH /artifacts/:artifactId — add consumerId to consumerIds array
  return { method: 'PATCH', entityType: 'artifact', entityId: targetEntityId, body: { consumerIds: [...currentConsumerIds, sourceEntityId] }, requiresCurrentData: true }
```

### resolveEdgeDeletion — new cases

```typescript
case 'produces_artifact':
  // PATCH /artifacts/:artifactId with producerId: null
  return { method: 'PATCH', entityType: 'artifact', entityId: targetEntityId, body: { producerId: null, producerType: null } }

case 'consumes_artifact':
  // PATCH /artifacts/:artifactId — remove consumerId from consumerIds array
  return { method: 'PATCH', entityType: 'artifact', entityId: targetEntityId, body: { consumerIds: currentConsumerIds.filter(id => id !== sourceEntityId) }, requiresCurrentData: true }
```

### Connection validator

```typescript
// connection-validator.ts — new rules are automatically picked up from CONNECTION_RULES
// No code change needed — the validator reads CONNECTION_RULES dynamically
```

---

## Implementation Slices for CAV-013

### CAV-013a: Shared Types — Artifact + Preset types (~10 tests)
**Scope:** `packages/shared-types/src/index.ts`
- Add `ArtifactType`, `ArtifactStatus`, `ArtifactDto`, `CreateArtifactDto`, `UpdateArtifactDto`
- Add `'artifact'` to `NodeType`
- Add `'produces_artifact'`, `'consumes_artifact'` to `EdgeType`
- Add `'artifact'` to `EdgeCategory`
- Add `'artifacts'` to `LayerId`
- Add new entries to `CONNECTION_RULES` and `LAYER_DEFINITIONS`
- Add `ViewPresetId`, `ViewPresetDefinition`, `VIEW_PRESET_REGISTRY`
- Add `activePreset` to `ViewStateDto`
- Add `'artifact'` to `DiffEntityType`
- Add `artifacts: ArtifactDto[]` to `ReleaseSnapshotDto`

### CAV-013b: Backend — Artifact domain + CRUD (~50 tests)
**Scope:** `services/company-design/src/artifacts/`
- Artifact aggregate (AggregateRoot), repository interface, InMemoryArtifactRepository
- ArtifactService (CRUD with AuditService injection)
- ArtifactController (GET/POST/PATCH/DELETE `/projects/:projectId/artifacts`)
- ArtifactMapper
- ArtifactsModule registered in AppModule
- SnapshotCollector: add `artifacts` collection
- ValidationEngine: artifact→producer ref, artifact→consumer refs
- SnapshotDiffer: add `'artifact'` entity type

### CAV-013c: Backend — Graph projection artifact integration (~20 tests)
**Scope:** `services/company-design/src/graph-projection/mapping/`
- `node-mapper.ts`: map artifacts to VisualNodeDto
- `edge-extractor.ts`: extract `produces_artifact` and `consumes_artifact` edges
- `scope-filter.ts`: include artifacts in department/workflow scope filters when `artifacts` layer active
- Tests for each mapping function with artifact data

### CAV-013d: Gateway BFF — Artifact proxy (~5 tests)
**Scope:** `apps/api-gateway/src/company-model/`
- CompanyDesignClient: 5 methods (list, get, create, update, delete)
- ArtifactsController proxy
- CompanyModelModule updated

### CAV-013e: Frontend — Artifact API + hooks (~10 tests)
**Scope:** `apps/web/src/api/`, `apps/web/src/hooks/`
- `artifacts.ts` API client (list, get, create, update, delete)
- `useArtifacts`, `useCreateArtifact`, `useUpdateArtifact`, `useDeleteArtifact` hooks

### CAV-013f: Frontend — Artifact visual integration (~25 tests)
**Scope:** `apps/web/src/lib/`, `apps/web/src/components/`
- `palette-data.ts`: add artifact node + artifact edges
- `addable-entities.ts`: add artifact to L1/L2 addable
- `entity-form-schemas.ts`: add artifact form schema
- `entity-edit-schemas.ts`: add artifact edit schema
- `graph-to-flow.ts`: artifact node rendering (icon, color, layout participation)
- `relationship-mutations.ts`: add `produces_artifact`/`consumes_artifact` cases
- VisualNode: artifact icon + color
- EDGE_TYPE_LABELS: add new labels

### CAV-013g: Frontend — View preset system (~30 tests)
**Scope:** `apps/web/src/stores/`, `apps/web/src/components/visual-shell/`
- Store: `activePreset`, `setActivePreset()`, `clearActivePreset()`
- Auto-clear preset on manual layer/filter change
- `PresetSelector` component (popover with preset list, active state, scope-aware)
- Toolbar integration
- Explorer Layers tab: preset badge
- SavedViewsPanel: capture/restore `activePreset`
- `view-persistence.ts`: include `activePreset` in auto-save/restore

### CAV-013h: Frontend — Artifact flow route integration (~15 tests)
**Scope:** `apps/web/src/routes/`
- Routes (org, dept, workflow): include `artifacts` layer in filterGraph when active
- Entity detail hook: support artifact entity type
- useEntityMutation: support artifact CRUD
- useRelationshipMutation: produces_artifact/consumes_artifact cases

**Estimated total: ~165 tests across 8 slices.**

---

## Acceptance Criteria (Checklist E + F in docs/19)

After CAV-013 implementation:

### Bloque E — Perspectivas completas
- [ ] Exists organization view preset (activates org layer, filters to org nodes)
- [ ] Exists capabilities view preset
- [ ] Exists workflows view preset
- [ ] Exists contracts view preset
- [ ] Exists artifact flow view preset
- [ ] Exists governance view preset
- [ ] Exists operations view preset (placeholder with coming-soon badge)

### Bloque F — Artifacts
- [ ] Artifact is a first-class node type in the visual grammar
- [ ] Artifacts can be created, edited, and navigated from canvas/inspector
- [ ] Producer → artifact → consumer flow is visible

### Additional
- [ ] Presets compose correctly with manual layer/filter changes
- [ ] Preset is cleared on scope navigation
- [ ] Saved views can capture and restore presets
- [ ] Artifact CRUD works end-to-end (domain → gateway → frontend)
- [ ] Artifact appears in release snapshots and diffs

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Presets are pure frontend filter configurations | No new backend endpoints. The graph projection already returns full data per scope; presets just filter client-side. |
| No `transforms_into` edge in v1 | Artifact-to-artifact chains are a future concern. Adding it now would require artifact parentId which overcomplicates the model. |
| `consumerIds` as flat array, not typed pairs | Simplicity. Consumer type can be inferred from entity lookup. Typed pairs can be added later if needed. |
| Separate `produces_artifact`/`consumes_artifact` from `provides`/`consumes` | Different semantic context (artifacts vs contracts). Distinct edge types enable precise preset filtering and clear ConnectionRules. |
| Artifacts not in default layers | Prevents visual noise. Users opt in via preset or manual layer toggle. |
| `activePreset` auto-clears on manual filter change | UX clarity — the user always knows whether they're in a preset or custom configuration. |
| Operations preset is a placeholder | Defined in registry for UI consistency, but no runtime data until CAV-019. |
| 8 implementation slices for CAV-013 | Matches established pattern of incremental, testable slices. Backend-first, then frontend integration. |
