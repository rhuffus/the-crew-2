import type { NodeType, ScopeType, ZoomLevel } from '@the-crew/shared-types'

export interface AddableEntity {
  nodeType: NodeType
  label: string
}

const L1_ADDABLE: AddableEntity[] = [
  { nodeType: 'department', label: 'Department' },
  { nodeType: 'artifact', label: 'Artifact' },
]

const L2_ADDABLE: AddableEntity[] = [
  { nodeType: 'role', label: 'Role' },
  { nodeType: 'capability', label: 'Capability' },
  { nodeType: 'workflow', label: 'Workflow' },
  { nodeType: 'contract', label: 'Contract' },
  { nodeType: 'policy', label: 'Policy' },
  { nodeType: 'skill', label: 'Skill' },
  { nodeType: 'agent-archetype', label: 'Agent Archetype' },
  { nodeType: 'agent-assignment', label: 'Agent Assignment' },
  { nodeType: 'artifact', label: 'Artifact' },
]

const SCOPE_ADDABLE: Record<ScopeType, AddableEntity[]> = {
  company: L1_ADDABLE,
  department: L2_ADDABLE,
  workflow: [],
  'workflow-stage': [],
}

export function getAddableEntitiesByScope(scopeType: ScopeType): AddableEntity[] {
  return SCOPE_ADDABLE[scopeType] ?? []
}

export function getAddableEntities(zoomLevel: ZoomLevel): AddableEntity[] {
  switch (zoomLevel) {
    case 'L1':
      return L1_ADDABLE
    case 'L2':
      return L2_ADDABLE
    default:
      return []
  }
}
