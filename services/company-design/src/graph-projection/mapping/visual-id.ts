import type { NodeType } from '@the-crew/shared-types'

const NODE_TYPE_PREFIX: Record<NodeType, string> = {
  company: 'company',
  department: 'dept',
  role: 'role',
  'agent-archetype': 'archetype',
  'agent-assignment': 'assignment',
  capability: 'cap',
  skill: 'skill',
  workflow: 'wf',
  'workflow-stage': 'wf-stage',
  contract: 'contract',
  policy: 'policy',
}

export function visualNodeId(nodeType: NodeType, entityId: string): string {
  return `${NODE_TYPE_PREFIX[nodeType]}:${entityId}`
}

export function workflowStageId(workflowId: string, order: number): string {
  return `wf-stage:${workflowId}:${order}`
}

export function visualEdgeId(
  edgeType: string,
  sourceVisualId: string,
  targetVisualId: string,
): string {
  return `${edgeType}:${sourceVisualId}\u2192${targetVisualId}`
}
