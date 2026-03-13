import type { NodeType } from '@the-crew/shared-types'

const NODE_TYPE_PREFIX: Record<string, string> = {
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
  artifact: 'artifact',
  // v3 node types (LCP-012)
  team: 'team',
  'coordinator-agent': 'coord',
  'specialist-agent': 'spec',
  objective: 'obj',
  'event-trigger': 'evt',
  'external-source': 'ext',
  handoff: 'handoff',
  decision: 'decision',
  proposal: 'proposal',
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
