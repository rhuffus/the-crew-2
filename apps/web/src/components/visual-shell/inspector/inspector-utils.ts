import type { NodeType, EdgeType, VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import i18n from '@/i18n/config'

export interface ParsedVisualId {
  nodeType: NodeType
  entityId: string
}

const VISUAL_ID_PREFIX_MAP: Record<string, NodeType> = {
  company: 'company',
  dept: 'department',
  role: 'role',
  archetype: 'agent-archetype',
  assignment: 'agent-assignment',
  cap: 'capability',
  skill: 'skill',
  wf: 'workflow',
  'wf-stage': 'workflow-stage',
  contract: 'contract',
  policy: 'policy',
}

export function parseVisualId(visualId: string): ParsedVisualId | null {
  // Handle wf-stage first (has hyphenated prefix)
  if (visualId.startsWith('wf-stage:')) {
    const rest = visualId.slice('wf-stage:'.length)
    return { nodeType: 'workflow-stage', entityId: rest }
  }

  const colonIdx = visualId.indexOf(':')
  if (colonIdx === -1) return null

  const prefix = visualId.slice(0, colonIdx)
  const entityId = visualId.slice(colonIdx + 1)

  const nodeType = VISUAL_ID_PREFIX_MAP[prefix]
  if (!nodeType) return null

  return { nodeType, entityId }
}

export interface SelectionSummary {
  type: 'none' | 'single-node' | 'single-edge' | 'multi'
  count: number
  countByType: Record<string, number>
}

export function getSelectionSummary(
  selectedNodeIds: string[],
  selectedEdgeIds: string[],
): SelectionSummary {
  const totalCount = selectedNodeIds.length + selectedEdgeIds.length

  if (totalCount === 0) {
    return { type: 'none', count: 0, countByType: {} }
  }

  if (selectedNodeIds.length === 1 && selectedEdgeIds.length === 0) {
    const parsed = parseVisualId(selectedNodeIds[0]!)
    const typeName = parsed?.nodeType ?? 'unknown'
    return { type: 'single-node', count: 1, countByType: { [typeName]: 1 } }
  }

  if (selectedEdgeIds.length === 1 && selectedNodeIds.length === 0) {
    return { type: 'single-edge', count: 1, countByType: { edge: 1 } }
  }

  const countByType: Record<string, number> = {}
  for (const id of selectedNodeIds) {
    const parsed = parseVisualId(id)
    const key = parsed?.nodeType ?? 'unknown'
    countByType[key] = (countByType[key] ?? 0) + 1
  }
  if (selectedEdgeIds.length > 0) {
    countByType['edge'] = selectedEdgeIds.length
  }

  return { type: 'multi', count: totalCount, countByType }
}

export function findNodeInGraph(
  visualId: string,
  nodes: VisualNodeDto[],
): VisualNodeDto | undefined {
  return nodes.find((n) => n.id === visualId)
}

export function findEdgeInGraph(
  visualId: string,
  edges: VisualEdgeDto[],
): VisualEdgeDto | undefined {
  return edges.find((e) => e.id === visualId)
}

export function getRelatedEdges(
  nodeId: string,
  edges: VisualEdgeDto[],
): VisualEdgeDto[] {
  return edges.filter((e) => e.sourceId === nodeId || e.targetId === nodeId)
}

export function getEdgeTypeLabel(edgeType: EdgeType): string {
  return i18n.t(`edgeType.${edgeType}`, { ns: 'entities', defaultValue: edgeType })
}

export function getNodeTypeLabel(nodeType: NodeType): string {
  return i18n.t(`nodeType.${nodeType}`, { ns: 'entities', defaultValue: nodeType })
}
