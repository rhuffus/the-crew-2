import type { NodeType, EdgeType, EdgeCategory, ZoomLevel, ConnectionRule } from '@the-crew/shared-types'

// --- Node palette types ---

export type NodeCategory = 'organization' | 'capabilities' | 'workflows' | 'contracts' | 'artifacts' | 'governance'

export interface NodePaletteItem {
  nodeType: NodeType
  label: string
  description: string
  category: NodeCategory
}

export interface PaletteGroup<T> {
  category: string
  label: string
  items: T[]
}

// --- Relationship palette types ---

export interface RelationshipPaletteItem {
  edgeType: EdgeType
  label: string
  sourceTypes: NodeType[]
  targetTypes: NodeType[]
  category: EdgeCategory
  style: string
}

// --- Static maps ---

const NODE_CATEGORY_MAP: Record<string, NodeCategory> = {
  company: 'organization',
  department: 'organization',
  role: 'organization',
  'agent-archetype': 'organization',
  'agent-assignment': 'organization',
  capability: 'capabilities',
  skill: 'capabilities',
  workflow: 'workflows',
  'workflow-stage': 'workflows',
  contract: 'contracts',
  policy: 'governance',
  artifact: 'artifacts',
}

const NODE_CATEGORY_LABELS: Record<NodeCategory, string> = {
  organization: 'Organization',
  capabilities: 'Capabilities',
  workflows: 'Workflows',
  contracts: 'Contracts',
  artifacts: 'Artifacts',
  governance: 'Governance',
}

const NODE_CATEGORY_ORDER: NodeCategory[] = [
  'organization',
  'capabilities',
  'workflows',
  'contracts',
  'artifacts',
  'governance',
]

const NODE_DESCRIPTIONS: Record<string, string> = {
  department: 'Organizational unit with mandate and ownership',
  role: 'Named accountability with authority and capabilities',
  'agent-archetype': 'AI agent template bound to a role',
  'agent-assignment': 'Active instance of an agent archetype',
  capability: 'Business capability owned by a department',
  skill: 'Skill or competency that roles can require',
  workflow: 'Business process with stages and participants',
  contract: 'Agreement between provider and consumer',
  policy: 'Governance rule, constraint, or approval gate',
  artifact: 'Document, deliverable, or data output flowing through the company',
}

const NODE_LABELS: Record<string, string> = {
  department: 'Department',
  role: 'Role',
  'agent-archetype': 'Agent Archetype',
  'agent-assignment': 'Agent Assignment',
  capability: 'Capability',
  skill: 'Skill',
  workflow: 'Workflow',
  contract: 'Contract',
  policy: 'Policy',
  artifact: 'Artifact',
}

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  reports_to: 'Reports To',
  owns: 'Owns',
  assigned_to: 'Assigned To',
  contributes_to: 'Contributes To',
  has_skill: 'Has Skill',
  compatible_with: 'Compatible With',
  provides: 'Provides',
  consumes: 'Consumes',
  bound_by: 'Bound By',
  participates_in: 'Participates In',
  hands_off_to: 'Hands Off To',
  governs: 'Governs',
  produces_artifact: 'Produces',
  consumes_artifact: 'Consumes',
}

const EDGE_CATEGORY_LABELS: Record<EdgeCategory, string> = {
  hierarchical: 'Hierarchical',
  ownership: 'Ownership',
  assignment: 'Assignment',
  capability: 'Capability',
  contract: 'Contract',
  workflow: 'Workflow',
  governance: 'Governance',
  artifact: 'Artifact',
}

const EDGE_CATEGORY_ORDER: EdgeCategory[] = [
  'hierarchical',
  'ownership',
  'assignment',
  'capability',
  'contract',
  'workflow',
  'artifact',
  'governance',
]

const NON_CREATABLE_EDGES: ReadonlySet<EdgeType> = new Set(['hands_off_to'])

// --- Addable node types by zoom level ---

const L1_ADDABLE_TYPES: NodeType[] = ['department', 'artifact']
const L2_ADDABLE_TYPES: NodeType[] = [
  'role', 'capability', 'workflow', 'contract', 'policy',
  'skill', 'agent-archetype', 'agent-assignment', 'artifact',
]

// --- Node palette functions ---

export function getNodePaletteItems(zoomLevel: ZoomLevel): NodePaletteItem[] {
  const types = zoomLevel === 'L1' ? L1_ADDABLE_TYPES : zoomLevel === 'L2' ? L2_ADDABLE_TYPES : []
  return types.map((nodeType) => ({
    nodeType,
    label: NODE_LABELS[nodeType] ?? nodeType,
    description: NODE_DESCRIPTIONS[nodeType] ?? '',
    category: NODE_CATEGORY_MAP[nodeType] ?? 'organization',
  }))
}

export function getGroupedNodePaletteItems(zoomLevel: ZoomLevel): PaletteGroup<NodePaletteItem>[] {
  const items = getNodePaletteItems(zoomLevel)
  const groups = new Map<NodeCategory, NodePaletteItem[]>()

  for (const item of items) {
    const list = groups.get(item.category) ?? []
    list.push(item)
    groups.set(item.category, list)
  }

  return NODE_CATEGORY_ORDER
    .filter((cat) => groups.has(cat))
    .map((cat) => ({
      category: cat,
      label: NODE_CATEGORY_LABELS[cat],
      items: groups.get(cat)!,
    }))
}

export function filterNodePaletteItems(items: NodePaletteItem[], query: string): NodePaletteItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q),
  )
}

// --- Relationship palette functions ---

export function getCreatableRelationships(rules: ConnectionRule[]): RelationshipPaletteItem[] {
  const byEdgeType = new Map<EdgeType, RelationshipPaletteItem>()

  for (const r of rules) {
    if (NON_CREATABLE_EDGES.has(r.edgeType)) continue

    const existing = byEdgeType.get(r.edgeType)
    if (existing) {
      // Merge source/target types from multiple rules for the same edge type
      const sourceSet = new Set([...existing.sourceTypes, ...r.sourceTypes])
      const targetSet = new Set([...existing.targetTypes, ...r.targetTypes])
      existing.sourceTypes = [...sourceSet]
      existing.targetTypes = [...targetSet]
    } else {
      byEdgeType.set(r.edgeType, {
        edgeType: r.edgeType,
        label: EDGE_TYPE_LABELS[r.edgeType] ?? r.edgeType,
        sourceTypes: [...r.sourceTypes],
        targetTypes: [...r.targetTypes],
        category: r.category,
        style: r.style,
      })
    }
  }

  return [...byEdgeType.values()]
}

export function getGroupedRelationships(rules: ConnectionRule[]): PaletteGroup<RelationshipPaletteItem>[] {
  const items = getCreatableRelationships(rules)
  const groups = new Map<EdgeCategory, RelationshipPaletteItem[]>()

  for (const item of items) {
    const list = groups.get(item.category) ?? []
    list.push(item)
    groups.set(item.category, list)
  }

  return EDGE_CATEGORY_ORDER
    .filter((cat) => groups.has(cat))
    .map((cat) => ({
      category: cat,
      label: EDGE_CATEGORY_LABELS[cat],
      items: groups.get(cat)!,
    }))
}

export function filterRelationshipItems(items: RelationshipPaletteItem[], query: string): RelationshipPaletteItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.sourceTypes.some((t) => t.toLowerCase().includes(q)) ||
      item.targetTypes.some((t) => t.toLowerCase().includes(q)),
  )
}

export function formatTypeList(types: NodeType[]): string {
  return types.map((t) => NODE_LABELS[t] ?? t).join(', ')
}

export function getEdgeCategoryLabel(category: EdgeCategory): string {
  return EDGE_CATEGORY_LABELS[category] ?? category
}
