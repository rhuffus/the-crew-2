import type { VisualNodeDto, ValidationIssue, NodeStatus } from '@the-crew/shared-types'

const ENTITY_TO_PREFIX: Record<string, string> = {
  CompanyModel: 'company',
  Department: 'dept',
  Capability: 'cap',
  Role: 'role',
  AgentArchetype: 'archetype',
  AgentAssignment: 'assignment',
  Skill: 'skill',
  Contract: 'contract',
  Workflow: 'wf',
  Policy: 'policy',
}

function issueToVisualId(issue: ValidationIssue, projectId: string): string | null {
  const prefix = ENTITY_TO_PREFIX[issue.entity]
  if (!prefix) return null
  if (issue.entity === 'CompanyModel') return `company:${projectId}`
  if (!issue.entityId) return null
  return `${prefix}:${issue.entityId}`
}

export function applyValidationOverlay(
  nodes: VisualNodeDto[],
  issues: ValidationIssue[],
  projectId: string,
): VisualNodeDto[] {
  // Group issues by visual node ID
  const issuesByNode = new Map<string, ValidationIssue[]>()
  for (const issue of issues) {
    const visualId = issueToVisualId(issue, projectId)
    if (!visualId) continue
    const existing = issuesByNode.get(visualId) ?? []
    existing.push(issue)
    issuesByNode.set(visualId, existing)
  }

  return nodes.map((node) => {
    const nodeIssues = issuesByNode.get(node.id)
    if (!nodeIssues || nodeIssues.length === 0) return node

    const status: NodeStatus = nodeIssues.some((i) => i.severity === 'error')
      ? 'error'
      : 'warning'

    return { ...node, status }
  })
}
