import { describe, it, expect } from 'vitest'
import { Policy } from './policy'
import type { PolicyScope, PolicyType, PolicyEnforcement, PolicyStatus } from './policy'

describe('Policy', () => {
  const globalProps = {
    id: 'pol1',
    projectId: 'p1',
    name: 'No unassigned roles',
    description: 'Every role must be assigned to a department',
    scope: 'global' as const,
    type: 'constraint' as const,
    condition: 'All roles must have a department assignment',
    enforcement: 'mandatory' as const,
  }

  const deptProps = {
    ...globalProps,
    id: 'pol2',
    name: 'Department approval gate',
    scope: 'department' as const,
    type: 'approval-gate' as const,
    departmentId: 'd1',
  }

  // --- Creation ---

  it('should create a global policy with default status active', () => {
    const policy = Policy.create(globalProps)
    expect(policy.id).toBe('pol1')
    expect(policy.projectId).toBe('p1')
    expect(policy.name).toBe('No unassigned roles')
    expect(policy.scope).toBe('global')
    expect(policy.departmentId).toBeNull()
    expect(policy.type).toBe('constraint')
    expect(policy.condition).toBe('All roles must have a department assignment')
    expect(policy.enforcement).toBe('mandatory')
    expect(policy.status).toBe('active')
  })

  it('should create a department-scoped policy', () => {
    const policy = Policy.create(deptProps)
    expect(policy.scope).toBe('department')
    expect(policy.departmentId).toBe('d1')
    expect(policy.type).toBe('approval-gate')
  })

  it('should emit PolicyCreated event', () => {
    const policy = Policy.create(globalProps)
    expect(policy.domainEvents).toHaveLength(1)
    expect(policy.domainEvents[0]!.eventType).toBe('PolicyCreated')
  })

  it('should reject empty name', () => {
    expect(() => Policy.create({ ...globalProps, name: '  ' })).toThrow(
      'Policy name cannot be empty',
    )
  })

  it('should reject empty condition', () => {
    expect(() => Policy.create({ ...globalProps, condition: '  ' })).toThrow(
      'Policy condition cannot be empty',
    )
  })

  it('should reject invalid scope', () => {
    expect(() =>
      Policy.create({ ...globalProps, scope: 'team' as PolicyScope }),
    ).toThrow('Invalid policy scope: team')
  })

  it('should reject invalid type', () => {
    expect(() =>
      Policy.create({ ...globalProps, type: 'guideline' as PolicyType }),
    ).toThrow('Invalid policy type: guideline')
  })

  it('should reject invalid enforcement', () => {
    expect(() =>
      Policy.create({ ...globalProps, enforcement: 'optional' as PolicyEnforcement }),
    ).toThrow('Invalid policy enforcement: optional')
  })

  it('should reject department scope without departmentId', () => {
    expect(() =>
      Policy.create({ ...globalProps, scope: 'department' }),
    ).toThrow('Department ID is required for department-scoped policies')
  })

  it('should reject global scope with departmentId', () => {
    expect(() =>
      Policy.create({ ...globalProps, departmentId: 'd1' }),
    ).toThrow('Department ID must not be set for global policies')
  })

  it('should create all valid types', () => {
    for (const type of ['approval-gate', 'constraint', 'rule'] as const) {
      const policy = Policy.create({ ...globalProps, type })
      expect(policy.type).toBe(type)
    }
  })

  it('should create all valid enforcements', () => {
    for (const enforcement of ['mandatory', 'advisory'] as const) {
      const policy = Policy.create({ ...globalProps, enforcement })
      expect(policy.enforcement).toBe(enforcement)
    }
  })

  it('should trim name and condition on create', () => {
    const policy = Policy.create({ ...globalProps, name: '  Trimmed  ', condition: '  Cond  ' })
    expect(policy.name).toBe('Trimmed')
    expect(policy.condition).toBe('Cond')
  })

  // --- Update ---

  it('should update name and description', () => {
    const policy = Policy.create(globalProps)
    policy.update({ name: 'New Name', description: 'New desc' })
    expect(policy.name).toBe('New Name')
    expect(policy.description).toBe('New desc')
  })

  it('should reject empty name on update', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ name: '' })).toThrow('Policy name cannot be empty')
  })

  it('should update type', () => {
    const policy = Policy.create(globalProps)
    policy.update({ type: 'rule' })
    expect(policy.type).toBe('rule')
  })

  it('should reject invalid type on update', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ type: 'bad' as PolicyType })).toThrow('Invalid policy type: bad')
  })

  it('should update enforcement', () => {
    const policy = Policy.create(globalProps)
    policy.update({ enforcement: 'advisory' })
    expect(policy.enforcement).toBe('advisory')
  })

  it('should reject invalid enforcement on update', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ enforcement: 'x' as PolicyEnforcement })).toThrow(
      'Invalid policy enforcement: x',
    )
  })

  it('should update condition', () => {
    const policy = Policy.create(globalProps)
    policy.update({ condition: 'New condition' })
    expect(policy.condition).toBe('New condition')
  })

  it('should reject empty condition on update', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ condition: '  ' })).toThrow('Policy condition cannot be empty')
  })

  it('should update status', () => {
    const policy = Policy.create(globalProps)
    policy.update({ status: 'inactive' })
    expect(policy.status).toBe('inactive')
  })

  it('should reject invalid status on update', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ status: 'deleted' as PolicyStatus })).toThrow(
      'Invalid policy status: deleted',
    )
  })

  it('should change scope from global to department', () => {
    const policy = Policy.create(globalProps)
    policy.update({ scope: 'department', departmentId: 'd1' })
    expect(policy.scope).toBe('department')
    expect(policy.departmentId).toBe('d1')
  })

  it('should change scope from department to global', () => {
    const policy = Policy.create(deptProps)
    policy.update({ scope: 'global', departmentId: null })
    expect(policy.scope).toBe('global')
    expect(policy.departmentId).toBeNull()
  })

  it('should reject changing to department scope without departmentId', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ scope: 'department' })).toThrow(
      'Department ID is required for department-scoped policies',
    )
  })

  it('should reject changing to global scope while keeping departmentId', () => {
    const policy = Policy.create(deptProps)
    expect(() => policy.update({ scope: 'global' })).toThrow(
      'Department ID must not be set for global policies',
    )
  })

  it('should reject invalid scope on update', () => {
    const policy = Policy.create(globalProps)
    expect(() => policy.update({ scope: 'team' as PolicyScope })).toThrow(
      'Invalid policy scope: team',
    )
  })

  it('should preserve unchanged fields on update', () => {
    const policy = Policy.create(globalProps)
    policy.update({ name: 'Updated' })
    expect(policy.scope).toBe('global')
    expect(policy.type).toBe('constraint')
    expect(policy.enforcement).toBe('mandatory')
    expect(policy.condition).toBe('All roles must have a department assignment')
  })

  it('should emit PolicyUpdated event', () => {
    const policy = Policy.create(globalProps)
    policy.clearEvents()
    policy.update({ name: 'Changed' })
    expect(policy.domainEvents).toHaveLength(1)
    expect(policy.domainEvents[0]!.eventType).toBe('PolicyUpdated')
  })

  it('should trim name and condition on update', () => {
    const policy = Policy.create(globalProps)
    policy.update({ name: '  Updated  ', condition: '  Cond  ' })
    expect(policy.name).toBe('Updated')
    expect(policy.condition).toBe('Cond')
  })

  // --- Reconstitute ---

  it('should reconstitute from props', () => {
    const now = new Date()
    const policy = Policy.reconstitute('pol1', {
      projectId: 'p1',
      name: 'Test',
      description: '',
      scope: 'global',
      departmentId: null,
      type: 'rule',
      condition: 'Some condition',
      enforcement: 'advisory',
      status: 'inactive',
      createdAt: now,
      updatedAt: now,
    })
    expect(policy.name).toBe('Test')
    expect(policy.status).toBe('inactive')
    expect(policy.domainEvents).toHaveLength(0)
  })
})
