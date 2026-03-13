import type { NodeType, ScopeType, ZoomLevel } from '@the-crew/shared-types'
import i18n from '@/i18n/config'

export interface AddableEntity {
  nodeType: NodeType
  label: string
}

function getLabel(nodeType: NodeType): string {
  return i18n.t(`nodeType.${nodeType}`, { ns: 'entities', defaultValue: nodeType })
}

const L1_TYPES: NodeType[] = ['department', 'artifact']
const L2_TYPES: NodeType[] = [
  'role', 'capability', 'workflow', 'contract', 'policy',
  'skill', 'agent-archetype', 'agent-assignment', 'artifact',
]
const TEAM_TYPES: NodeType[] = [
  'coordinator-agent', 'specialist-agent', 'workflow', 'contract', 'policy', 'artifact',
]

function buildEntities(types: NodeType[]): AddableEntity[] {
  return types.map((t) => ({ nodeType: t, label: getLabel(t) }))
}

const SCOPE_TYPES: Record<ScopeType, NodeType[]> = {
  company: L1_TYPES,
  department: L2_TYPES,
  team: TEAM_TYPES,
  'agent-detail': [],
  workflow: [],
  'workflow-stage': [],
}

export function getAddableEntitiesByScope(scopeType: ScopeType): AddableEntity[] {
  return buildEntities(SCOPE_TYPES[scopeType] ?? [])
}

export function getAddableEntities(zoomLevel: ZoomLevel): AddableEntity[] {
  switch (zoomLevel) {
    case 'L1':
      return buildEntities(L1_TYPES)
    case 'L2':
      return buildEntities(L2_TYPES)
    default:
      return []
  }
}
