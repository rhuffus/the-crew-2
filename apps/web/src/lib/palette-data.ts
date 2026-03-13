import type { NodeType, EdgeType, EdgeCategory, ZoomLevel, ConnectionRule } from '@the-crew/shared-types'
import i18n from '@/i18n/config'

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

const NODE_CATEGORY_ORDER: NodeCategory[] = [
  'organization',
  'capabilities',
  'workflows',
  'contracts',
  'artifacts',
  'governance',
]

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

// --- i18n helper functions ---

function getNodeLabel(nodeType: string): string {
  return i18n.t(`nodeType.${nodeType}`, { ns: 'entities', defaultValue: nodeType })
}

function getNodeDescription(nodeType: string): string {
  return i18n.t(`nodeDescription.${nodeType}`, { ns: 'entities', defaultValue: '' })
}

function getNodeCategoryLabel(category: NodeCategory): string {
  return i18n.t(`nodeCategory.${category}`, { ns: 'entities', defaultValue: category })
}

export function getEdgeTypeLabel(edgeType: EdgeType): string {
  return i18n.t(`edgeType.${edgeType}`, { ns: 'entities', defaultValue: edgeType })
}

export function getEdgeCategoryLabel(category: EdgeCategory): string {
  return i18n.t(`edgeCategory.${category}`, { ns: 'entities', defaultValue: category })
}

// Re-export EDGE_TYPE_LABELS as a getter for backward compatibility in components
// that destructure it. Returns a Proxy that resolves labels via i18n at access time.
export const EDGE_TYPE_LABELS: Record<EdgeType, string> = new Proxy({} as Record<EdgeType, string>, {
  get(_target, prop: string) {
    return i18n.t(`edgeType.${prop}`, { ns: 'entities', defaultValue: prop })
  },
})

// --- Node palette functions ---

export function getNodePaletteItems(zoomLevel: ZoomLevel): NodePaletteItem[] {
  const types = zoomLevel === 'L1' ? L1_ADDABLE_TYPES : zoomLevel === 'L2' ? L2_ADDABLE_TYPES : []
  return types.map((nodeType) => ({
    nodeType,
    label: getNodeLabel(nodeType),
    description: getNodeDescription(nodeType),
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
      label: getNodeCategoryLabel(cat),
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
        label: getEdgeTypeLabel(r.edgeType),
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
      label: getEdgeCategoryLabel(cat),
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
  return types.map((t) => getNodeLabel(t)).join(', ')
}
