import type { ValidationIssue } from '@the-crew/shared-types'

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

export function issueToVisualNodeId(issue: ValidationIssue, projectId: string): string | null {
  const prefix = ENTITY_TO_PREFIX[issue.entity]
  if (!prefix) return null
  if (issue.entity === 'CompanyModel') return `company:${projectId}`
  if (!issue.entityId) return null
  return `${prefix}:${issue.entityId}`
}

export function groupIssuesByVisualNodeId(
  issues: ValidationIssue[],
  projectId: string,
): Map<string, ValidationIssue[]> {
  const map = new Map<string, ValidationIssue[]>()
  for (const issue of issues) {
    const visualId = issueToVisualNodeId(issue, projectId)
    if (!visualId) continue
    const existing = map.get(visualId) ?? []
    existing.push(issue)
    map.set(visualId, existing)
  }
  return map
}
