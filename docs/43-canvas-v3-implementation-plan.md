# Canvas v3 — Implementation Plan

> Produced by LCP-005. Authoritative reference for LCP-012 (canvas refactor) and all downstream visual tasks.
> Inputs: docs/33 (domain model), docs/34 (canvas v3 spec), docs/42 (product language), docs/41 (ADR), docs/35 (growth protocol), docs/36 (runtime spec).

---

## 1. Type System Changes

### 1.1 NodeType

```typescript
// OLD (12 values — to be deprecated)
type NodeType_OLD =
  | 'company' | 'department' | 'role' | 'agent-archetype' | 'agent-assignment'
  | 'capability' | 'skill'
  | 'workflow' | 'workflow-stage'
  | 'contract' | 'policy' | 'artifact'

// NEW (16 values)
type NodeType =
  // Organizational (always visible)
  | 'company'
  | 'department'
  | 'team'                   // NEW — UO type: team
  | 'coordinator-agent'      // NEW — replaces agent-archetype + agent-assignment for coordinators
  | 'specialist-agent'       // NEW — replaces agent-archetype + agent-assignment for specialists
  // Triggers & context
  | 'objective'              // NEW — strategic/operational goal
  | 'event-trigger'          // NEW — signal that starts workflows
  | 'external-source'        // NEW — external information source
  // Workflow
  | 'workflow'
  | 'workflow-stage'
  | 'handoff'                // NEW — explicit transfer point between stages
  // Governance & support
  | 'contract'
  | 'policy'
  | 'artifact'
  | 'decision'               // NEW — traceable decision record
  | 'proposal'               // NEW — organizational change proposal

// REMOVED: 'role', 'agent-archetype', 'agent-assignment', 'capability', 'skill'
// ADDED: 'team', 'coordinator-agent', 'specialist-agent', 'objective', 'event-trigger',
//         'external-source', 'handoff', 'decision', 'proposal'
```

### 1.2 EdgeType

```typescript
// OLD (14 values — to be deprecated)
type EdgeType_OLD =
  | 'reports_to' | 'owns' | 'assigned_to' | 'contributes_to' | 'has_skill'
  | 'compatible_with' | 'provides' | 'consumes' | 'bound_by' | 'participates_in'
  | 'hands_off_to' | 'governs' | 'produces_artifact' | 'consumes_artifact'

// NEW (20 values)
type EdgeType =
  // Structural (always visible, neutral style)
  | 'contains'               // NEW — UO→UO, UO→Agent (parent contains child)
  | 'belongs_to'             // NEW — child→parent (Agent→UO, UO→UO)
  | 'reports_to'             // PRESERVED — UO→UO reporting line
  // Responsibility
  | 'led_by'                 // NEW — UO→Agent (coordinator)
  | 'accountable_for'        // NEW — Agent→UO, Agent→Workflow
  | 'supervises'             // NEW — coordinator→specialist
  // Collaboration
  | 'requests_from'          // NEW — Agent/UO→Agent/UO
  | 'delegates_to'           // NEW — Agent→Agent
  | 'reviews'                // NEW — Agent→Artifact/Handoff
  | 'approves'               // NEW — Agent/User→Proposal/Decision
  | 'hands_off_to'           // PRESERVED — Stage→Stage, Agent→Agent
  | 'escalates_to'           // NEW — Agent→Agent
  // Flow
  | 'produces'               // REPLACES produces_artifact
  | 'consumes'               // REPLACES consumes_artifact
  | 'informs'                // NEW — general info flow
  | 'triggers'               // NEW — EventTrigger→Workflow, Objective→Workflow
  // Governance
  | 'governed_by'            // NEW — entity→Policy
  | 'constrained_by'         // NEW — entity→Policy/Contract (replaces bound_by)
  | 'proposed_by'            // NEW — Proposal→Agent
  | 'approved_by'            // NEW — Decision→User/Agent

// REMOVED: 'owns', 'assigned_to', 'contributes_to', 'has_skill', 'compatible_with',
//          'provides' (old), 'consumes' (old), 'bound_by', 'participates_in',
//          'governs', 'produces_artifact', 'consumes_artifact'
```

### 1.3 EdgeCategory

```typescript
// OLD (8 values)
type EdgeCategory_OLD =
  | 'hierarchical' | 'ownership' | 'assignment' | 'capability'
  | 'contract' | 'workflow' | 'governance' | 'artifact'

// NEW (5 values)
type EdgeCategory =
  | 'structural'       // contains, belongs_to, reports_to
  | 'responsibility'   // led_by, accountable_for, supervises
  | 'collaboration'    // requests_from, delegates_to, reviews, approves, hands_off_to, escalates_to
  | 'flow'             // produces, consumes, informs, triggers
  | 'governance'       // governed_by, constrained_by, proposed_by, approved_by
```

### 1.4 OverlayId (replaces LayerId)

```typescript
// OLD (7 values)
type LayerId_OLD =
  | 'organization' | 'capabilities' | 'workflows' | 'contracts'
  | 'governance' | 'artifacts' | 'operations'

// NEW (5 values)
type OverlayId =
  | 'organization'    // always active, not toggleable
  | 'work'            // workflows, handoffs, collaboration edges
  | 'deliverables'    // artifacts, produces/consumes edges
  | 'rules'           // contracts, policies, proposals, decisions, governance edges
  | 'live-status'     // runtime badges/decorators on existing nodes
```

### 1.5 ScopeType & ZoomLevel

```typescript
// OLD
type ScopeType_OLD = 'company' | 'department' | 'workflow' | 'workflow-stage'

// NEW
type ScopeType = 'company' | 'department' | 'team' | 'agent-detail'

// ZoomLevel unchanged: L1, L2, L3, L4
// L1 = company, L2 = department, L3 = team, L4 = agent-detail
```

---

## 2. Overlay System

### 2.1 OVERLAY_DEFINITIONS (replaces LAYER_DEFINITIONS)

```typescript
const OVERLAY_DEFINITIONS: Record<OverlayId, OverlayDefinition> = {
  organization: {
    id: 'organization',
    label: 'Organization',
    description: 'Company structure: units, agents, hierarchy',
    alwaysActive: true,
    nodeTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent'],
    edgeTypes: ['contains', 'belongs_to', 'reports_to', 'led_by', 'accountable_for', 'supervises'],
  },
  work: {
    id: 'work',
    label: 'Work',
    description: 'Workflows, collaboration, handoffs',
    alwaysActive: false,
    nodeTypes: ['workflow', 'workflow-stage', 'handoff', 'objective', 'event-trigger', 'external-source'],
    edgeTypes: ['requests_from', 'delegates_to', 'reviews', 'approves', 'hands_off_to', 'escalates_to', 'triggers', 'informs'],
  },
  deliverables: {
    id: 'deliverables',
    label: 'Deliverables',
    description: 'Artifacts, documents, outputs',
    alwaysActive: false,
    nodeTypes: ['artifact'],
    edgeTypes: ['produces', 'consumes'],
  },
  rules: {
    id: 'rules',
    label: 'Rules',
    description: 'Contracts, policies, governance',
    alwaysActive: false,
    nodeTypes: ['contract', 'policy', 'proposal', 'decision'],
    edgeTypes: ['governed_by', 'constrained_by', 'proposed_by', 'approved_by'],
  },
  'live-status': {
    id: 'live-status',
    label: 'Live Status',
    description: 'Runtime activity, errors, queue state',
    alwaysActive: false,
    nodeTypes: [],  // no new nodes — decorators/badges on existing nodes
    edgeTypes: [],
  },
}
```

### 2.2 OverlayDefinition type

```typescript
interface OverlayDefinition {
  id: OverlayId
  label: string
  description: string
  alwaysActive: boolean
  nodeTypes: NodeType[]
  edgeTypes: EdgeType[]
}
```

### 2.3 DEFAULT_OVERLAYS_PER_LEVEL (replaces DEFAULT_LAYERS_PER_LEVEL)

```typescript
const DEFAULT_OVERLAYS_PER_LEVEL: Record<ZoomLevel, OverlayId[]> = {
  L1: ['organization'],
  L2: ['organization', 'work'],
  L3: ['organization', 'work'],
  L4: ['organization', 'work', 'deliverables'],
}
```

### 2.4 Overlay filtering logic

The filter pipeline remains the same structure but uses overlays:

```
filterNodesByOverlays(nodes, activeOverlays, OVERLAY_DEFINITIONS)
  → node visible if its nodeType belongs to any active overlay's nodeTypes

filterEdgesByOverlays(edges, visibleNodeIds, activeOverlays, OVERLAY_DEFINITIONS)
  → edge visible if both endpoints visible AND its edgeType belongs to any active overlay
```

Organization overlay nodes are always visible since the overlay is always active.

---

## 3. Connection Rules

### 3.1 CONNECTION_RULES

```typescript
const CONNECTION_RULES: ConnectionRule[] = [
  // Structural
  { edgeType: 'contains',       sourceTypes: ['company', 'department', 'team'], targetTypes: ['department', 'team', 'coordinator-agent', 'specialist-agent'], category: 'structural' },
  { edgeType: 'belongs_to',     sourceTypes: ['department', 'team', 'coordinator-agent', 'specialist-agent'], targetTypes: ['company', 'department', 'team'], category: 'structural' },
  { edgeType: 'reports_to',     sourceTypes: ['department', 'team'], targetTypes: ['company', 'department'], category: 'structural' },

  // Responsibility
  { edgeType: 'led_by',          sourceTypes: ['company', 'department', 'team'], targetTypes: ['coordinator-agent'], category: 'responsibility' },
  { edgeType: 'accountable_for', sourceTypes: ['coordinator-agent'], targetTypes: ['company', 'department', 'team', 'workflow'], category: 'responsibility' },
  { edgeType: 'supervises',      sourceTypes: ['coordinator-agent'], targetTypes: ['specialist-agent', 'coordinator-agent'], category: 'responsibility' },

  // Collaboration
  { edgeType: 'requests_from',   sourceTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team'], targetTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team'], category: 'collaboration' },
  { edgeType: 'delegates_to',    sourceTypes: ['coordinator-agent', 'specialist-agent'], targetTypes: ['coordinator-agent', 'specialist-agent'], category: 'collaboration' },
  { edgeType: 'reviews',         sourceTypes: ['coordinator-agent', 'specialist-agent'], targetTypes: ['artifact', 'handoff'], category: 'collaboration' },
  { edgeType: 'approves',        sourceTypes: ['coordinator-agent'], targetTypes: ['proposal', 'decision'], category: 'collaboration' },
  { edgeType: 'hands_off_to',    sourceTypes: ['workflow-stage', 'coordinator-agent', 'specialist-agent'], targetTypes: ['workflow-stage', 'coordinator-agent', 'specialist-agent'], category: 'collaboration' },
  { edgeType: 'escalates_to',    sourceTypes: ['coordinator-agent', 'specialist-agent'], targetTypes: ['coordinator-agent'], category: 'collaboration' },

  // Flow
  { edgeType: 'produces',  sourceTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team', 'workflow-stage'], targetTypes: ['artifact'], category: 'flow' },
  { edgeType: 'consumes',  sourceTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team', 'workflow-stage'], targetTypes: ['artifact'], category: 'flow' },
  { edgeType: 'informs',   sourceTypes: ['coordinator-agent', 'specialist-agent', 'external-source', 'event-trigger'], targetTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team'], category: 'flow' },
  { edgeType: 'triggers',  sourceTypes: ['event-trigger', 'objective', 'external-source'], targetTypes: ['workflow'], category: 'flow' },

  // Governance
  { edgeType: 'governed_by',    sourceTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent', 'workflow', 'handoff', 'artifact'], targetTypes: ['policy'], category: 'governance' },
  { edgeType: 'constrained_by', sourceTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent', 'workflow', 'handoff'], targetTypes: ['policy', 'contract'], category: 'governance' },
  { edgeType: 'proposed_by',    sourceTypes: ['proposal'], targetTypes: ['coordinator-agent', 'specialist-agent'], category: 'governance' },
  { edgeType: 'approved_by',    sourceTypes: ['decision', 'proposal'], targetTypes: ['coordinator-agent'], category: 'governance' },
]
```

### 3.2 Non-creatable edges

```typescript
// Edges that are auto-generated, not manually drawn
const NON_CREATABLE_EDGES: Set<EdgeType> = new Set([
  'contains',       // derived from parent-child UO/agent relationships
  'belongs_to',     // inverse of contains, derived
  'proposed_by',    // set when proposal is created
  'approved_by',    // set when decision/proposal is approved
])
```

---

## 4. Node Rendering

### 4.1 Node visual categories and icons

```typescript
const NODE_CATEGORY_MAP: Record<NodeType, NodeCategory> = {
  'company':            'organization',
  'department':         'organization',
  'team':               'organization',
  'coordinator-agent':  'agents',
  'specialist-agent':   'agents',
  'objective':          'triggers',
  'event-trigger':      'triggers',
  'external-source':    'triggers',
  'workflow':           'workflow',
  'workflow-stage':     'workflow',
  'handoff':            'workflow',
  'contract':           'support',
  'policy':             'support',
  'artifact':           'support',
  'decision':           'support',
  'proposal':           'support',
}

type NodeCategory = 'organization' | 'agents' | 'triggers' | 'workflow' | 'support'

const NODE_CATEGORY_LABELS: Record<NodeCategory, string> = {
  organization: 'Organization',
  agents:       'Agents',
  triggers:     'Triggers & Context',
  workflow:     'Workflow',
  support:      'Support',
}

const NODE_CATEGORY_ORDER: NodeCategory[] = [
  'organization', 'agents', 'triggers', 'workflow', 'support',
]
```

### 4.2 Node icons (Lucide)

```typescript
const NODE_TYPE_ICONS: Record<NodeType, LucideIcon> = {
  'company':            Building2,
  'department':         Users,
  'team':               UsersRound,
  'coordinator-agent':  BrainCircuit,
  'specialist-agent':   Bot,
  'objective':          Target,
  'event-trigger':      Zap,
  'external-source':    Globe,
  'workflow':           Workflow,
  'workflow-stage':     GitBranch,
  'handoff':            ArrowRightLeft,
  'contract':           FileText,
  'policy':             Shield,
  'artifact':           Package,
  'decision':           Gavel,
  'proposal':           MessageSquarePlus,
}
```

### 4.3 Node labels

```typescript
const NODE_TYPE_LABELS: Record<NodeType, string> = {
  'company':            'Company',
  'department':         'Department',
  'team':               'Team',
  'coordinator-agent':  'Coordinator Agent',
  'specialist-agent':   'Specialist Agent',
  'objective':          'Objective',
  'event-trigger':      'Event Trigger',
  'external-source':    'External Source',
  'workflow':           'Workflow',
  'workflow-stage':     'Stage',
  'handoff':            'Handoff',
  'contract':           'Contract',
  'policy':             'Policy',
  'artifact':           'Artifact',
  'decision':           'Decision',
  'proposal':           'Proposal',
}
```

### 4.4 Node visual rendering rules

#### Container nodes (can contain children)

| NodeType | Container? | Children |
|----------|-----------|----------|
| company | yes | departments, coordinator-agent (CEO) |
| department | yes | teams, coordinator-agent (executive) |
| team | yes | specialist-agents, coordinator-agent (lead) |

Container nodes render as rounded rectangles with:
- Header bar with icon + name + type badge
- Collapsible body showing child count when collapsed
- Status indicator (colored left border or badge)
- Validation count badge (if overlay active)
- Operations badge (if live-status overlay active)

#### Agent nodes

| NodeType | Visual | Notes |
|----------|--------|-------|
| coordinator-agent | Rounded rect, accent border (blue-600) | Shows role subtitle (CEO, VP, Lead). Badge: crown icon for CEO |
| specialist-agent | Rounded rect, neutral border (slate-400) | Shows role subtitle. Smaller than coordinator |

Agent nodes render:
- Icon + name
- Role as subtitle
- Status badge (active/inactive/proposed)
- Skills count as secondary info
- Runtime badge when live-status overlay is active

#### Trigger/context nodes

| NodeType | Visual | Notes |
|----------|--------|-------|
| objective | Diamond shape or rounded rect with Target icon | Priority badge (critical=red, high=orange, medium=yellow, low=slate) |
| event-trigger | Hexagonal badge or rounded rect with Zap icon | Active/inactive indicator |
| external-source | Rounded rect with Globe icon | Category badge |

These nodes are only visible when the **Work** overlay is active.

#### Workflow nodes

| NodeType | Visual | Notes |
|----------|--------|-------|
| workflow | Rounded rect, wide, workflow color | Shows type badge (strategic/operational/etc.) |
| workflow-stage | Rounded rect, compact, ordered horizontally in workflow detail | Order number badge |
| handoff | Small diamond or pill between stages | Trigger type indicator (auto/manual/conditional) |

Workflow nodes are only visible when the **Work** overlay is active.

#### Support nodes

| NodeType | Visual | Notes |
|----------|--------|-------|
| contract | Small rounded rect, FileText icon | Type badge (SLA/DataContract/etc.), status dot |
| policy | Small rounded rect, Shield icon | Enforcement badge (mandatory=red, advisory=amber) |
| artifact | Small rounded rect, Package icon | Type badge, status dot |
| decision | Small rounded rect, Gavel icon | Status badge (proposed/approved/rejected) |
| proposal | Small rounded rect, MessageSquarePlus icon | Status badge with color (draft=gray, proposed=blue, approved=green, rejected=red) |

Support nodes visibility depends on which overlay is active:
- **Deliverables** → artifact
- **Rules** → contract, policy, proposal, decision

### 4.5 Node status colors

```typescript
// Applied as left border or background tint
const NODE_STATUS_COLORS = {
  normal:   'border-slate-300 bg-white',
  active:   'border-green-500 bg-green-50',
  warning:  'border-yellow-500 bg-yellow-50',
  error:    'border-red-500 bg-red-50',
  dimmed:   'border-slate-200 bg-slate-50 opacity-60',
  proposed: 'border-blue-400 bg-blue-50 border-dashed',
  retired:  'border-slate-300 bg-slate-100 opacity-40 line-through',
}
```

Proposed entities (UoStatus='proposed', AgentStatus='proposed', ProposalStatus='draft'|'proposed') use dashed borders to visually distinguish them from active structure.

---

## 5. Edge Rendering

### 5.1 Edge visual styles by category

```typescript
const EDGE_CATEGORY_STYLES: Record<EdgeCategory, EdgeStyle> = {
  structural: {
    stroke: 'slate-400',
    strokeWidth: 2,
    strokeDasharray: 'none',       // solid
    animated: false,
    markerEnd: 'arrowclosed',
    zIndex: 0,                     // background
  },
  responsibility: {
    stroke: 'blue-500',
    strokeWidth: 1.5,
    strokeDasharray: 'none',
    animated: false,
    markerEnd: 'arrowclosed',
    zIndex: 1,
  },
  collaboration: {
    stroke: 'amber-500',
    strokeWidth: 1.5,
    strokeDasharray: '8 4',        // dashed
    animated: false,
    markerEnd: 'arrowclosed',
    zIndex: 2,
  },
  flow: {
    stroke: 'emerald-500',
    strokeWidth: 1.5,
    strokeDasharray: '4 2',        // dotted
    animated: false,
    markerEnd: 'arrowclosed',
    zIndex: 2,
  },
  governance: {
    stroke: 'purple-400',
    strokeWidth: 1,
    strokeDasharray: '4 4',        // dashed, thinner
    animated: false,
    markerEnd: 'arrowclosed',
    zIndex: 1,
  },
}
```

### 5.2 Edge labels

```typescript
const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  'contains':        'Contains',
  'belongs_to':      'Belongs to',
  'reports_to':      'Reports to',
  'led_by':          'Led by',
  'accountable_for': 'Accountable for',
  'supervises':      'Supervises',
  'requests_from':   'Requests from',
  'delegates_to':    'Delegates to',
  'reviews':         'Reviews',
  'approves':        'Approves',
  'hands_off_to':    'Hands off to',
  'escalates_to':    'Escalates to',
  'produces':        'Produces',
  'consumes':        'Consumes',
  'informs':         'Informs',
  'triggers':        'Triggers',
  'governed_by':     'Governed by',
  'constrained_by':  'Constrained by',
  'proposed_by':     'Proposed by',
  'approved_by':     'Approved by',
}

const EDGE_CATEGORY_LABELS: Record<EdgeCategory, string> = {
  structural:     'Structural',
  responsibility: 'Responsibility',
  collaboration:  'Collaboration',
  flow:           'Flow',
  governance:     'Governance',
}
```

### 5.3 Edge-to-category mapping

```typescript
const EDGE_TO_CATEGORY: Record<EdgeType, EdgeCategory> = {
  'contains':        'structural',
  'belongs_to':      'structural',
  'reports_to':      'structural',
  'led_by':          'responsibility',
  'accountable_for': 'responsibility',
  'supervises':      'responsibility',
  'requests_from':   'collaboration',
  'delegates_to':    'collaboration',
  'reviews':         'collaboration',
  'approves':        'collaboration',
  'hands_off_to':    'collaboration',
  'escalates_to':    'collaboration',
  'produces':        'flow',
  'consumes':        'flow',
  'informs':         'flow',
  'triggers':        'flow',
  'governed_by':     'governance',
  'constrained_by':  'governance',
  'proposed_by':     'governance',
  'approved_by':     'governance',
}
```

---

## 6. Scope & Navigation Model

### 6.1 SCOPE_REGISTRY

```typescript
const SCOPE_REGISTRY: Record<ScopeType, ScopeDefinition> = {
  company: {
    scopeType: 'company',
    zoomLevel: 'L1',
    label: 'Company',
    requiresEntityId: false,
    defaultOverlays: ['organization'],
    drillableChildScopes: ['department'],
    visibleNodeTypes: {
      organization: ['company', 'department', 'coordinator-agent'],
      work: ['workflow', 'objective'],
      deliverables: [],  // too high-level for artifacts
      rules: ['proposal', 'decision'],
      'live-status': [],
    },
  },
  department: {
    scopeType: 'department',
    zoomLevel: 'L2',
    label: 'Department',
    requiresEntityId: true,
    defaultOverlays: ['organization', 'work'],
    drillableChildScopes: ['department', 'team'],
    visibleNodeTypes: {
      organization: ['department', 'team', 'coordinator-agent', 'specialist-agent'],
      work: ['workflow', 'workflow-stage', 'handoff', 'objective', 'event-trigger', 'external-source'],
      deliverables: ['artifact'],
      rules: ['contract', 'policy', 'proposal', 'decision'],
      'live-status': [],
    },
  },
  team: {
    scopeType: 'team',
    zoomLevel: 'L3',
    label: 'Team',
    requiresEntityId: true,
    defaultOverlays: ['organization', 'work'],
    drillableChildScopes: ['agent-detail'],
    visibleNodeTypes: {
      organization: ['team', 'coordinator-agent', 'specialist-agent'],
      work: ['workflow', 'workflow-stage', 'handoff', 'objective', 'event-trigger'],
      deliverables: ['artifact'],
      rules: ['contract', 'policy', 'proposal', 'decision'],
      'live-status': [],
    },
  },
  'agent-detail': {
    scopeType: 'agent-detail',
    zoomLevel: 'L4',
    label: 'Agent Detail',
    requiresEntityId: true,
    defaultOverlays: ['organization', 'work', 'deliverables'],
    drillableChildScopes: [],
    visibleNodeTypes: {
      organization: ['coordinator-agent', 'specialist-agent'],
      work: ['workflow', 'workflow-stage', 'handoff', 'objective', 'event-trigger'],
      deliverables: ['artifact'],
      rules: ['contract', 'policy', 'decision'],
      'live-status': [],
    },
  },
}
```

### 6.2 Navigation routes

| Scope | Route | Notes |
|-------|-------|-------|
| company | `/projects/$projectId/org` | Preserved |
| department | `/projects/$projectId/departments/$departmentId` | Preserved |
| team | `/projects/$projectId/teams/$teamId` | NEW |
| agent-detail | `/projects/$projectId/agents/$agentId` | NEW |

Workflows are no longer a navigation scope — they appear within department or team scope as overlay nodes. Workflow detail is shown in the inspector panel or as an expanded view within the current scope.

### 6.3 Drill-in / drill-out behavior

| From | Drill into | Trigger |
|------|-----------|---------|
| L1 (company) | L2 (department) | Double-click department node |
| L2 (department) | L2 (sub-department) | Double-click nested department |
| L2 (department) | L3 (team) | Double-click team node |
| L3 (team) | L4 (agent-detail) | Double-click agent node |
| Any level | Back | Escape key, breadcrumb click, back button |

Transition animation: preserved from current implementation (zoom + fade).

### 6.4 Breadcrumb format

```
Company > Department Name > Team Name > Agent Name
```

Each segment is clickable for navigation.

---

## 7. Toolbar Redesign

### 7.1 Layout

```
[Mode: Select|Pan|Connect|Add] [Zoom: -|fit|+] [Layout] | [Overlays: toggles] | [Design|Live] | [More ▾]
```

### 7.2 Mode selector

Preserved from v2:
- Select (V)
- Pan (H)
- Connect (C)
- Add Node (N)
- Add Edge (E)

### 7.3 Creation actions (node palette)

Organized by category, available per zoom level:

| Level | Creatable node types |
|-------|---------------------|
| L1 (company) | department, coordinator-agent, objective, workflow, external-source |
| L2 (department) | department (sub), team, coordinator-agent, specialist-agent, objective, event-trigger, workflow, external-source, contract, policy, artifact |
| L3 (team) | specialist-agent, coordinator-agent, objective, event-trigger, workflow, contract, artifact |
| L4 (agent-detail) | (no creation — detail view only) |

Priority order in palette:
1. Department / Team (organizational structure first)
2. Coordinator Agent / Specialist Agent
3. Objective / Event Trigger / External Source
4. Workflow
5. Contract / Policy / Artifact (secondary section)

### 7.4 Overlay toggles

Inline toggle buttons in toolbar:

```
Overlays: [Work] [Deliverables] [Rules] [Live Status]
```

- Organization is always active (not shown as toggle — implicit).
- Active overlays are highlighted (filled button style).
- Inactive overlays are outline/ghost style.
- Clicking toggles on/off.

### 7.5 Mode toggle (Design / Live)

```
[Design Mode] | [Live Mode]
```

- **Design Mode** (default): full editing capabilities.
- **Live Mode**: activates live-status overlay, disables creation/editing, shows runtime badges, timeline, activity indicators.
- Switching to Live Mode auto-activates the `live-status` overlay.
- Switching back to Design Mode deactivates `live-status` (unless user manually re-enables).

### 7.6 View presets

```typescript
const VIEW_PRESET_REGISTRY: Record<string, ViewPreset> = {
  organization: {
    id: 'organization',
    label: 'Organization',
    description: 'Company structure: units, agents, hierarchy',
    overlays: ['organization'],
    emphasisEdgeTypes: ['contains', 'belongs_to', 'reports_to', 'led_by', 'supervises'],
  },
  work: {
    id: 'work',
    label: 'Work',
    description: 'Workflows, collaboration, handoffs',
    overlays: ['organization', 'work'],
    emphasisEdgeTypes: ['requests_from', 'delegates_to', 'hands_off_to', 'reviews', 'triggers'],
  },
  deliverables: {
    id: 'deliverables',
    label: 'Deliverables',
    description: 'Artifacts, documents, outputs',
    overlays: ['organization', 'deliverables'],
    emphasisEdgeTypes: ['produces', 'consumes'],
  },
  rules: {
    id: 'rules',
    label: 'Rules',
    description: 'Contracts, policies, governance',
    overlays: ['organization', 'rules'],
    emphasisEdgeTypes: ['governed_by', 'constrained_by', 'approved_by'],
  },
  'live-status': {
    id: 'live-status',
    label: 'Live Status',
    description: 'Runtime activity, errors, queue state',
    overlays: ['organization', 'live-status'],
    emphasisEdgeTypes: [],
  },
}
```

---

## 8. Inspector Panel (Right Panel)

### 8.1 Node inspector tabs

When a node is selected, the inspector shows these tabs:

| Tab | Content | Available for |
|-----|---------|--------------|
| Overview | Identity, type, status, purpose, description | All nodes |
| Edit | Form fields for the entity | All editable nodes (Design Mode) |
| Properties | Detailed properties view (skills, budget, key results...) | Agents, objectives, contracts |
| Relations | Incoming/outgoing edges grouped by category | All nodes |
| Workflow | Workflows this entity participates in, stages, handoffs | UOs, agents |
| Governance | Policies, contracts, proposals, decisions affecting this entity | All nodes |
| Runtime | Recent runs, last I/O, avg duration, errors, cost, approvals | Agents, workflows (Live Mode) |
| Validation | Validation issues for this node | All nodes |
| Comments | Comments thread | All nodes |

Tab visibility is context-dependent:
- **Runtime** tab only appears in Live Mode or when live-status overlay is active.
- **Workflow** tab appears when Work overlay is active.
- **Governance** tab appears when Rules overlay is active.

### 8.2 Inspector for organizational nodes (company, department, team)

```
Overview:
  - Name, type badge (Company/Department/Team)
  - Status (active/proposed/retired)
  - Mandate
  - Purpose
  - Coordinator (link to agent)
  - Functions list
  - Parent UO (link)
  - Children count (departments, teams, agents)

Edit:
  - Name, description, mandate, purpose
  - Functions (tag list)
  - Coordinator assignment (dropdown)
  - Status

Relations:
  - Structural: parent, children, reporting lines
  - Responsibility: coordinator, accountable agents
  - Collaboration: requesting/delegating edges

Workflow:
  - Owned workflows (list with status)
  - Participating workflows

Governance:
  - Active contracts (provider/consumer)
  - Applicable policies
  - Pending proposals (count + list)
  - Recent decisions

Runtime (Live Mode):
  - Overall status (idle/active/blocked/error)
  - Active runs count
  - Queue depth
  - Recent incidents
  - Budget consumption
```

### 8.3 Inspector for agent nodes (coordinator-agent, specialist-agent)

```
Overview:
  - Name, type badge (Coordinator/Specialist)
  - Role
  - Status (active/inactive/proposed)
  - Owning UO (link)
  - Skills (tag list)
  - Inputs / Outputs

Edit:
  - Name, description, role
  - Skills editor (add/remove)
  - Inputs / Outputs (string lists)
  - Responsibilities
  - Budget config
  - Context window
  - System prompt ref

Properties:
  - Budget details
  - Context window size
  - System prompt reference

Relations:
  - Supervised by (coordinator)
  - Supervises (if coordinator)
  - Delegates to / receives from
  - Reviews / approves

Workflow:
  - Participates in (workflow list)
  - Owns stages (list)

Runtime (Live Mode):
  - Current status (idle/active/waiting/blocked)
  - Active tasks
  - Recent runs (list)
  - Last input/output
  - Average duration
  - Error count
  - AI cost (accumulated)
  - Pending approvals
```

### 8.4 Inspector for workflow nodes

```
Overview:
  - Name, type badge (strategic/operational/etc.)
  - Status (draft/active/archived)
  - Owner UO (link)
  - Stage count
  - Participant count
  - Definition of done
  - Linked objectives

Edit:
  - Name, description, type
  - Trigger description
  - Definition of done
  - Metrics
  - Escalation rules

Properties:
  - Stages (ordered list)
  - Handoffs (list with source→target)
  - Participants
  - Metrics definitions
  - Escalation rules

Relations:
  - Owner UO
  - Participants (agents, UOs)
  - Contracts governing this workflow
  - Artifacts produced/consumed
  - Objectives served
  - Triggers

Runtime (Live Mode):
  - Active runs (count + list)
  - Current stage per run
  - Blocked handoffs
  - SLA status
  - Recent completions
  - Average run time
```

### 8.5 Inspector for edge selection

When an edge is selected:

```
Overview:
  - Edge type label
  - Category
  - Source → Target (with links)

Properties (for handoff edges):
  - Trigger type (auto/manual/conditional)
  - Condition
  - Governing contract (link)
  - Input artifact types
  - Expected output artifact types
  - Definition of done
  - Validations
  - SLA
  - Escalation rules

Runtime (Live Mode, for handoff edges):
  - Current status
  - Last execution
  - Average duration
  - Error count
```

### 8.6 Inspector for support nodes

**Proposal:**
```
Overview:
  - Title, type, status badge (color-coded)
  - Proposed by (agent link)
  - Motivation
  - Problem detected
  - Expected benefit
  - Estimated cost
  - Required approval level
  - Reviewed by / Approved by

Edit:
  - Title, description, motivation
  - Status transitions (propose → review → approve/reject)
```

**Decision:**
```
Overview:
  - Title, status
  - Rationale
  - Proposed by (agent link)
  - Approved by (user)
  - Linked objective
  - Linked proposal
  - Impacted artifacts/workflows
```

**Contract, Policy, Artifact:** preserved from v2 inspector, adapted to new party types (UO/agent instead of department/capability).

---

## 9. Explorer Panel (Left Panel)

### 9.1 Tab structure

| Tab | Purpose | Changes from v2 |
|-----|---------|-----------------|
| Tree | Organizational hierarchy tree | Updated for UO + agent model |
| Overlays | Toggle overlays | Replaces "Layers" tab |
| Filters | Node type + status filters | Updated node types |
| Views | Saved view management | Updated preset list (7→5) |
| Validation | Validation issues | Preserved |
| Chat | Chat threads | Preserved |
| Operations | Operations summary | Preserved |

### 9.2 Overlays tab

```
Overlays
☑ Organization (locked — always on)
☐ Work
☐ Deliverables
☐ Rules
☐ Live Status
```

- Organization checkbox is visually locked (lock icon, non-interactive).
- Other overlays are standard toggles.
- Each overlay shows a count of visible nodes it would add.

### 9.3 Tree tab

Hierarchical tree reflecting organizational structure:

```
▼ Company Name
  ├── 👑 CEO (coordinator)
  ├── ▼ Department A
  │   ├── 🧠 VP A (coordinator)
  │   ├── ▼ Team A1
  │   │   ├── 🧠 Lead A1 (coordinator)
  │   │   ├── 🤖 Specialist 1
  │   │   └── 🤖 Specialist 2
  │   └── ▼ Team A2
  │       └── ...
  └── ▼ Department B
      └── ...
```

Double-clicking a tree node navigates (drills) to that scope.

---

## 10. Live Mode Specifics

### 10.1 Node badges in Live Mode

When `live-status` overlay is active, existing nodes receive decorators:

| Badge | Meaning | Visual |
|-------|---------|--------|
| Running | Agent/workflow actively executing | Green pulse dot |
| Waiting | Waiting for input/approval/handoff | Amber pulse dot |
| Blocked | Blocked by error or dependency | Red static dot |
| Error | Error in last execution | Red exclamation badge |
| Queue | Items queued for processing | Number badge (queue depth) |
| Cost | AI cost alert threshold reached | Dollar sign badge (amber/red) |

### 10.2 Edge animation in Live Mode

- Active handoff edges: animated dash pattern (flowing direction indicator)
- Blocked handoff edges: red pulsing
- Completed handoff edges: brief green flash then return to normal

### 10.3 Design Mode → Live Mode transition

1. User clicks "Live Mode" toggle
2. `live-status` overlay activates
3. Creation/editing controls are disabled (toolbar grayed except view controls)
4. Runtime badges appear on nodes
5. Inspector shows Runtime tab by default for selected nodes
6. Timeline/activity panel can appear in explorer Operations tab

---

## 11. Graph Projection Changes (Backend)

### 11.1 node-mapper.ts changes

The node mapper must be rewritten to map new domain entities to visual nodes:

| Domain entity | NodeType | ParentId logic |
|--------------|----------|---------------|
| ProjectSeed | `company` | null (root) |
| OrganizationalUnit (type: company) | `company` | null |
| OrganizationalUnit (type: department) | `department` | parentUoId |
| OrganizationalUnit (type: team) | `team` | parentUoId (must be department) |
| Agent (type: coordinator) | `coordinator-agent` | uoId |
| Agent (type: specialist) | `specialist-agent` | uoId |
| Objective | `objective` | ownerUoId or null |
| EventTrigger | `event-trigger` | null (positioned by layout) |
| ExternalSource | `external-source` | null |
| Workflow | `workflow` | ownerUoId or null |
| WorkflowStage | `workflow-stage` | workflowId |
| Handoff | `handoff` | workflowId (positioned between stages) |
| Contract | `contract` | null (connected by edges) |
| Policy | `policy` | null |
| Artifact | `artifact` | null |
| Decision | `decision` | null |
| Proposal | `proposal` | null |

Overlay assignment per node:

```typescript
function getNodeOverlay(nodeType: NodeType): OverlayId {
  switch (nodeType) {
    case 'company':
    case 'department':
    case 'team':
    case 'coordinator-agent':
    case 'specialist-agent':
      return 'organization'
    case 'workflow':
    case 'workflow-stage':
    case 'handoff':
    case 'objective':
    case 'event-trigger':
    case 'external-source':
      return 'work'
    case 'artifact':
      return 'deliverables'
    case 'contract':
    case 'policy':
    case 'proposal':
    case 'decision':
      return 'rules'
  }
}
```

### 11.2 edge-extractor.ts changes

Edges are extracted from domain relationships:

| Source | Relationship | Target | EdgeType |
|--------|-------------|--------|----------|
| UO (parent) | has child | UO (child) | `contains` |
| UO (child) | has parent | UO (parent) | `belongs_to` |
| UO | has coordinator | Agent | `led_by` |
| Agent | assigned to | UO | `belongs_to` |
| Agent (coordinator) | supervises | Agent (specialist) | `supervises` |
| UO | reports to | UO | `reports_to` |
| Agent | accountable for | UO/Workflow | `accountable_for` |
| Workflow.participants (agent) | participates | Workflow | `requests_from` or inferred |
| WorkflowStage (i) | handoff to | WorkflowStage (i+1) | `hands_off_to` |
| Agent/UO | produces | Artifact | `produces` |
| Agent/UO | consumes | Artifact | `consumes` |
| EventTrigger | targets | Workflow | `triggers` |
| Objective | linked to | Workflow | `triggers` |
| Entity | governed by | Policy | `governed_by` |
| Entity | constrained by | Contract/Policy | `constrained_by` |
| Proposal | proposed by | Agent | `proposed_by` |
| Decision | approved by | Agent/User | `approved_by` |

### 11.3 scope-filter.ts changes

| Scope | What is included |
|-------|-----------------|
| company | All departments, CEO agent, strategic workflows, top objectives. Filtered by overlay |
| department | Target department + child teams + coordinators/specialists + area workflows + related contracts/policies |
| team | Target team + lead + specialists + team workflows + handoffs with other teams |
| agent-detail | Target agent + connected workflows + produced/consumed artifacts + governing policies/contracts + recent decisions |

### 11.4 breadcrumb-builder.ts changes

```typescript
function buildBreadcrumb(scopeType: ScopeType, entityId: string | null, snapshot: SnapshotData): BreadcrumbEntry[] {
  // company → [Company]
  // department → [Company, Department]
  // team → [Company, Department, Team]
  // agent-detail → [Company, Department, Team, Agent] or [Company, Department, Agent]
}
```

---

## 12. Layout Algorithm Changes

### 12.1 Organization layout (L1, L2)

BFS tree layout preserved, adapted for new hierarchy:

```
Company (root)
├── CEO (coordinator) — positioned right of company header
├── Department A — row 1
│   ├── Executive A — right of department header
│   ├── Team A1 — nested row
│   └── Team A2 — nested row
└── Department B — row 2
    └── ...
```

Overlays nodes (workflows, objectives, etc.) positioned in a secondary area:
- Right side for workflows
- Top-right for objectives
- Bottom for contracts/policies

### 12.2 Team layout (L3)

Focused layout for team scope:

```
Team (header)
├── Lead (coordinator) — top center
├── Specialists — horizontal row below lead
├── Workflows — right side
└── Handoffs — between workflow stages
```

### 12.3 Agent detail layout (L4)

Single agent centered with connected entities around it:

```
         [Objectives]
              |
[Inputs] → [Agent] → [Outputs/Artifacts]
              |
     [Workflows/Stages]
              |
       [Contracts/Policies]
```

---

## 13. Store Changes

### 13.1 visual-workspace-store.ts

Key renames and type changes:

| Old | New | Type change |
|-----|-----|-------------|
| `activeLayers: Set<LayerId>` | `activeOverlays: Set<OverlayId>` | LayerId → OverlayId |
| `toggleLayer(id)` | `toggleOverlay(id)` | Prevents toggling 'organization' |
| `activePreset` | `activePreset` | Updated preset IDs |
| `currentScope.scopeType` | `currentScope.scopeType` | New ScopeType values |

New state:
```typescript
canvasMode: 'design' | 'live'  // NEW — top-level mode
```

### 13.2 toggleOverlay implementation

```typescript
toggleOverlay: (id: OverlayId) => {
  if (id === 'organization') return  // cannot toggle organization
  set((state) => {
    const next = new Set(state.activeOverlays)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    return { activeOverlays: next }
  })
}
```

### 13.3 setCanvasMode implementation

```typescript
setCanvasMode: (mode: 'design' | 'live') => {
  set((state) => {
    const next = new Set(state.activeOverlays)
    if (mode === 'live') {
      next.add('live-status')
    } else {
      next.delete('live-status')
    }
    return { canvasMode: mode, activeOverlays: next }
  })
}
```

---

## 14. Validation Rule Adaptations

The validation engine must be extended for new entity types:

| Rule | Applies to | Overlay |
|------|-----------|---------|
| UO must have coordinator | department, team | organization |
| Agent must belong to UO | all agents | organization |
| Company has exactly one company-type UO | project | organization |
| Workflow must have owner UO | workflow | work |
| Workflow stages must be ordered | workflow | work |
| Handoff must reference valid stages | handoff | work |
| Contract must have valid provider + consumer | contract | rules |
| Policy scope must match target type | policy | rules |
| Proposal must have proposer agent | proposal | rules |
| Objective should have owner | objective | work |

---

## 15. Migration Sequence

### Phase 1: Types (LCP-011)

1. Add new types alongside old in `packages/shared-types/src/index.ts`:
   - `NodeType` (new values coexist with old)
   - `EdgeType` (new values coexist with old)
   - `EdgeCategory` (new values)
   - `OverlayId` + `OVERLAY_DEFINITIONS` (alongside LayerId)
   - `DEFAULT_OVERLAYS_PER_LEVEL`
   - New `CONNECTION_RULES`
   - New `VIEW_PRESET_REGISTRY`
   - `ScopeType` updated values
   - `SCOPE_REGISTRY` updated
2. Deprecation markers on old types (`@deprecated` JSDoc)
3. Bridge aliases: `LayerId = OverlayId` (temporary)

### Phase 2: Canvas refactor (LCP-012)

1. Rename store: `activeLayers` → `activeOverlays`
2. Rename explorer tab: "Layers" → "Overlays"
3. Update toolbar: overlay toggles, mode toggle, preset selector
4. Update palette-data.ts: new icons, labels, categories
5. Update graph-filter.ts: overlay-based filtering
6. Update node components: new visual rendering per node type
7. Update edge rendering: new styles per category
8. Add new routes: `/teams/$teamId`, `/agents/$agentId`
9. Update scope navigation for new ScopeType values

### Phase 3: Backend mapping (LCP-012 or separate task)

1. Rewrite node-mapper.ts for new entity types
2. Rewrite edge-extractor.ts for new relationship model
3. Update scope-filter.ts for new scopes
4. Update breadcrumb-builder.ts
5. Extend validation rules

### Phase 4: Cleanup (future task)

1. Remove deprecated `LayerId`, `LAYER_DEFINITIONS`
2. Remove old `NodeType` values
3. Remove old `EdgeType` values
4. Remove old `EdgeCategory` values
5. Remove old `ScopeType` values
6. Remove bridge aliases

---

## 16. Acceptance Criteria

- [ ] All 16 node types have icon, label, category, and rendering spec.
- [ ] All 20 edge types have label, category, visual style, and connection rules.
- [ ] 5 overlays defined with explicit node/edge membership.
- [ ] Organization overlay is always active and not toggleable.
- [ ] 4 scope types (company, department, team, agent-detail) with drill paths.
- [ ] Toolbar spec covers: modes, zoom, overlays, Design/Live toggle, presets, creation palette.
- [ ] Inspector tabs defined per node category.
- [ ] Live Mode behavior specified: badges, animations, disabled editing.
- [ ] Connection rules cover all valid source→target→edgeType combinations.
- [ ] Backend mapping changes documented: node-mapper, edge-extractor, scope-filter.
- [ ] Migration sequence defined with clear phases.
- [ ] No contradiction with docs/33 (domain model), docs/42 (product language), or docs/41 (ADR).

---

## 17. Cross-Reference

| Downstream task | What it uses from this document |
|----------------|-------------------------------|
| LCP-011 | §1 type definitions, §2 overlay definitions, §3 connection rules (bridge types) |
| LCP-012 | All sections — this is the primary implementation reference |
| LCP-008 | §10 Live Mode specifics, §8.3/8.4 runtime inspector tabs |
| LCP-010 | §7 toolbar labels, §9 explorer overlay tab, §4-5 palette labels |
| LCP-015 | §10 Live Mode, §4.5 runtime badges, edge animations |
