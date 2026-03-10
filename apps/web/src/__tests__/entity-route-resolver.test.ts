import { describe, it, expect } from 'vitest'
import {
  resolveEntityRoute,
  buildVisualId,
  isScopeType,
  extractDeptIdFromParent,
} from '@/lib/entity-route-resolver'

describe('resolveEntityRoute', () => {
  const projectId = 'proj-1'

  it('resolves company to org route', () => {
    const result = resolveEntityRoute(projectId, 'company', projectId)
    expect(result).toEqual({
      path: '/projects/proj-1/org',
      focusNodeId: null,
    })
  })

  it('resolves department to L2 route (direct navigation)', () => {
    const result = resolveEntityRoute(projectId, 'department', 'dept-123')
    expect(result).toEqual({
      path: '/projects/proj-1/departments/dept-123',
      focusNodeId: null,
    })
  })

  it('resolves workflow to L3 route (direct navigation)', () => {
    const result = resolveEntityRoute(projectId, 'workflow', 'wf-456')
    expect(result).toEqual({
      path: '/projects/proj-1/workflows/wf-456',
      focusNodeId: null,
    })
  })

  it('resolves role with parent dept to L2 of dept + focusNodeId', () => {
    const result = resolveEntityRoute(projectId, 'role', 'role-1', 'dept-abc')
    expect(result).toEqual({
      path: '/projects/proj-1/departments/dept-abc',
      focusNodeId: 'role:role-1',
    })
  })

  it('resolves capability with parent dept to L2 + focus', () => {
    const result = resolveEntityRoute(projectId, 'capability', 'cap-1', 'dept-abc')
    expect(result).toEqual({
      path: '/projects/proj-1/departments/dept-abc',
      focusNodeId: 'cap:cap-1',
    })
  })

  it('resolves agent-archetype with parent dept to L2 + focus', () => {
    const result = resolveEntityRoute(projectId, 'agent-archetype', 'arch-1', 'dept-abc')
    expect(result).toEqual({
      path: '/projects/proj-1/departments/dept-abc',
      focusNodeId: 'archetype:arch-1',
    })
  })

  it('resolves agent-assignment with parent dept to L2 + focus', () => {
    const result = resolveEntityRoute(projectId, 'agent-assignment', 'asn-1', 'dept-abc')
    expect(result).toEqual({
      path: '/projects/proj-1/departments/dept-abc',
      focusNodeId: 'assignment:asn-1',
    })
  })

  it('resolves skill with parent dept to L2 + focus', () => {
    const result = resolveEntityRoute(projectId, 'skill', 'skill-1', 'dept-abc')
    expect(result).toEqual({
      path: '/projects/proj-1/departments/dept-abc',
      focusNodeId: 'skill:skill-1',
    })
  })

  it('resolves role without parent dept to org L1 + focus', () => {
    const result = resolveEntityRoute(projectId, 'role', 'role-1')
    expect(result).toEqual({
      path: '/projects/proj-1/org',
      focusNodeId: 'role:role-1',
    })
  })

  it('resolves contract to org L1 + focus (no parent dept)', () => {
    const result = resolveEntityRoute(projectId, 'contract', 'ct-1')
    expect(result).toEqual({
      path: '/projects/proj-1/org',
      focusNodeId: 'contract:ct-1',
    })
  })

  it('resolves policy to org L1 + focus', () => {
    const result = resolveEntityRoute(projectId, 'policy', 'pol-1')
    expect(result).toEqual({
      path: '/projects/proj-1/org',
      focusNodeId: 'policy:pol-1',
    })
  })

  it('resolves workflow-stage to org L1 + focus', () => {
    const result = resolveEntityRoute(projectId, 'workflow-stage', 'stg-1')
    expect(result).toEqual({
      path: '/projects/proj-1/org',
      focusNodeId: 'wf-stage:stg-1',
    })
  })
})

describe('buildVisualId', () => {
  it('builds company visual ID', () => {
    expect(buildVisualId('company', 'proj-1')).toBe('company:proj-1')
  })

  it('builds department visual ID', () => {
    expect(buildVisualId('department', 'abc')).toBe('dept:abc')
  })

  it('builds role visual ID', () => {
    expect(buildVisualId('role', 'r1')).toBe('role:r1')
  })

  it('builds workflow-stage visual ID', () => {
    expect(buildVisualId('workflow-stage', 's1')).toBe('wf-stage:s1')
  })
})

describe('isScopeType', () => {
  it('returns true for department', () => {
    expect(isScopeType('department')).toBe(true)
  })

  it('returns true for workflow', () => {
    expect(isScopeType('workflow')).toBe(true)
  })

  it('returns false for role', () => {
    expect(isScopeType('role')).toBe(false)
  })

  it('returns false for company', () => {
    expect(isScopeType('company')).toBe(false)
  })
})

describe('extractDeptIdFromParent', () => {
  it('extracts dept id from dept: prefix', () => {
    expect(extractDeptIdFromParent('dept:abc')).toBe('abc')
  })

  it('returns null for company parent', () => {
    expect(extractDeptIdFromParent('company:proj-1')).toBeNull()
  })

  it('returns null for null parent', () => {
    expect(extractDeptIdFromParent(null)).toBeNull()
  })

  it('returns null for archetype parent', () => {
    expect(extractDeptIdFromParent('archetype:arch-1')).toBeNull()
  })
})
