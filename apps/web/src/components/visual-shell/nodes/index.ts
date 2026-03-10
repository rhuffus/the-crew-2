import type { NodeTypes } from '@xyflow/react'
import { VisualNode } from './visual-node'
import { WorkflowStageNode } from './workflow-stage-node'

export const visualNodeTypes: NodeTypes = {
  company: VisualNode,
  department: VisualNode,
  role: VisualNode,
  'agent-archetype': VisualNode,
  'agent-assignment': VisualNode,
  capability: VisualNode,
  skill: VisualNode,
  workflow: VisualNode,
  'workflow-stage': WorkflowStageNode,
  contract: VisualNode,
  policy: VisualNode,
}

export { VisualNode } from './visual-node'
export { WorkflowStageNode } from './workflow-stage-node'
