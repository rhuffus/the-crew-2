import { describe, it, expect } from 'vitest'
import type { ValidationIssue } from '@the-crew/shared-types'
import { issueToVisualNodeId, groupIssuesByVisualNodeId } from '@/lib/validation-mapping'

describe('issueToVisualNodeId', () => {
  const projectId = 'proj-1'

  it('should map CompanyModel to company:projectId', () => {
    const issue: ValidationIssue = {
      entity: 'CompanyModel',
      entityId: null,
      field: 'purpose',
      message: 'Missing purpose',
      severity: 'error',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('company:proj-1')
  })

  it('should map Department to dept:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Department',
      entityId: 'abc',
      field: 'mandate',
      message: 'Missing mandate',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('dept:abc')
  })

  it('should map Capability to cap:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Capability',
      entityId: 'c1',
      field: null,
      message: 'Missing owner',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('cap:c1')
  })

  it('should map Role to role:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Role',
      entityId: 'r1',
      field: null,
      message: 'Issue',
      severity: 'error',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('role:r1')
  })

  it('should map AgentArchetype to archetype:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'AgentArchetype',
      entityId: 'a1',
      field: null,
      message: 'Issue',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('archetype:a1')
  })

  it('should map AgentAssignment to assignment:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'AgentAssignment',
      entityId: 'aa1',
      field: null,
      message: 'Issue',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('assignment:aa1')
  })

  it('should map Skill to skill:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Skill',
      entityId: 's1',
      field: null,
      message: 'Issue',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('skill:s1')
  })

  it('should map Contract to contract:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Contract',
      entityId: 'ct1',
      field: null,
      message: 'Issue',
      severity: 'error',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('contract:ct1')
  })

  it('should map Workflow to wf:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Workflow',
      entityId: 'wf1',
      field: null,
      message: 'Issue',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('wf:wf1')
  })

  it('should map Policy to policy:entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Policy',
      entityId: 'p1',
      field: null,
      message: 'Issue',
      severity: 'warning',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBe('policy:p1')
  })

  it('should return null for unknown entity', () => {
    const issue: ValidationIssue = {
      entity: 'Unknown',
      entityId: 'x1',
      field: null,
      message: 'Issue',
      severity: 'error',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBeNull()
  })

  it('should return null for non-CompanyModel entity without entityId', () => {
    const issue: ValidationIssue = {
      entity: 'Department',
      entityId: null,
      field: null,
      message: 'Issue',
      severity: 'error',
    }
    expect(issueToVisualNodeId(issue, projectId)).toBeNull()
  })
})

describe('groupIssuesByVisualNodeId', () => {
  const projectId = 'proj-1'

  it('should group issues by visual node ID', () => {
    const issues: ValidationIssue[] = [
      { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'Missing mandate', severity: 'warning' },
      { entity: 'Department', entityId: 'd1', field: 'name', message: 'Name too short', severity: 'error' },
      { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'Missing purpose', severity: 'error' },
    ]

    const result = groupIssuesByVisualNodeId(issues, projectId)
    expect(result.size).toBe(2)
    expect(result.get('dept:d1')).toHaveLength(2)
    expect(result.get('company:proj-1')).toHaveLength(1)
  })

  it('should skip issues with unknown entities', () => {
    const issues: ValidationIssue[] = [
      { entity: 'Unknown', entityId: 'x1', field: null, message: 'Ignored', severity: 'error' },
      { entity: 'Role', entityId: 'r1', field: null, message: 'Valid', severity: 'warning' },
    ]

    const result = groupIssuesByVisualNodeId(issues, projectId)
    expect(result.size).toBe(1)
    expect(result.get('role:r1')).toHaveLength(1)
  })

  it('should return empty map for empty issues', () => {
    const result = groupIssuesByVisualNodeId([], projectId)
    expect(result.size).toBe(0)
  })
})
