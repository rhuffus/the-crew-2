import { describe, it, expect } from 'vitest'
import { Role } from './role'

describe('Role', () => {
  const baseProps = {
    id: 'r1',
    projectId: 'p1',
    name: 'Product Manager',
    description: 'Manages product lifecycle',
    departmentId: 'd1',
  }

  it('should create a role with minimal props', () => {
    const role = Role.create(baseProps)
    expect(role.id).toBe('r1')
    expect(role.projectId).toBe('p1')
    expect(role.name).toBe('Product Manager')
    expect(role.description).toBe('Manages product lifecycle')
    expect(role.departmentId).toBe('d1')
    expect(role.capabilityIds).toEqual([])
    expect(role.accountability).toBe('')
    expect(role.authority).toBe('')
    expect(role.createdAt).toBeInstanceOf(Date)
    expect(role.updatedAt).toBeInstanceOf(Date)
  })

  it('should create a role with all props', () => {
    const role = Role.create({
      ...baseProps,
      capabilityIds: ['c1', 'c2'],
      accountability: 'Owns product roadmap',
      authority: 'Can approve feature requests',
    })
    expect(role.capabilityIds).toEqual(['c1', 'c2'])
    expect(role.accountability).toBe('Owns product roadmap')
    expect(role.authority).toBe('Can approve feature requests')
  })

  it('should emit RoleCreated event', () => {
    const role = Role.create(baseProps)
    expect(role.domainEvents).toHaveLength(1)
    expect(role.domainEvents[0]!.eventType).toBe('RoleCreated')
    expect(role.domainEvents[0]!.aggregateId).toBe('r1')
  })

  it('should reject empty name', () => {
    expect(() => Role.create({ ...baseProps, name: '  ' })).toThrow(
      'Role name cannot be empty',
    )
  })

  it('should reject empty departmentId', () => {
    expect(() => Role.create({ ...baseProps, departmentId: '  ' })).toThrow(
      'Role must belong to a department',
    )
  })

  it('should trim name', () => {
    const role = Role.create({ ...baseProps, name: '  PM  ' })
    expect(role.name).toBe('PM')
  })

  it('should filter empty capability ids', () => {
    const role = Role.create({ ...baseProps, capabilityIds: ['c1', '', 'c2'] })
    expect(role.capabilityIds).toEqual(['c1', 'c2'])
  })

  it('should return defensive copy of capabilityIds', () => {
    const role = Role.create({ ...baseProps, capabilityIds: ['c1'] })
    const ids = role.capabilityIds
    ids.push('c99')
    expect(role.capabilityIds).toEqual(['c1'])
  })

  it('should update name and description', () => {
    const role = Role.create(baseProps)
    role.update({ name: 'Senior PM', description: 'Senior product manager' })
    expect(role.name).toBe('Senior PM')
    expect(role.description).toBe('Senior product manager')
  })

  it('should update departmentId', () => {
    const role = Role.create(baseProps)
    role.update({ departmentId: 'd2' })
    expect(role.departmentId).toBe('d2')
  })

  it('should reject empty name on update', () => {
    const role = Role.create(baseProps)
    expect(() => role.update({ name: '  ' })).toThrow('Role name cannot be empty')
  })

  it('should reject empty departmentId on update', () => {
    const role = Role.create(baseProps)
    expect(() => role.update({ departmentId: '  ' })).toThrow(
      'Role must belong to a department',
    )
  })

  it('should update capabilityIds', () => {
    const role = Role.create({ ...baseProps, capabilityIds: ['c1'] })
    role.update({ capabilityIds: ['c2', 'c3'] })
    expect(role.capabilityIds).toEqual(['c2', 'c3'])
  })

  it('should update accountability and authority', () => {
    const role = Role.create(baseProps)
    role.update({ accountability: 'Delivery', authority: 'Sign-off' })
    expect(role.accountability).toBe('Delivery')
    expect(role.authority).toBe('Sign-off')
  })

  it('should preserve unchanged fields on update', () => {
    const role = Role.create({
      ...baseProps,
      capabilityIds: ['c1'],
      accountability: 'Delivery',
      authority: 'Sign-off',
    })
    role.update({ name: 'Tech Lead' })
    expect(role.departmentId).toBe('d1')
    expect(role.capabilityIds).toEqual(['c1'])
    expect(role.accountability).toBe('Delivery')
    expect(role.authority).toBe('Sign-off')
  })

  it('should emit RoleUpdated event on update', () => {
    const role = Role.create(baseProps)
    role.update({ name: 'Updated' })
    expect(role.domainEvents).toHaveLength(2)
    expect(role.domainEvents[1]!.eventType).toBe('RoleUpdated')
  })

  it('should reconstitute from props without events', () => {
    const now = new Date()
    const role = Role.reconstitute('r1', {
      projectId: 'p1',
      name: 'PM',
      description: '',
      departmentId: 'd1',
      capabilityIds: ['c1'],
      accountability: 'Delivery',
      authority: 'Approve',
      createdAt: now,
      updatedAt: now,
    })
    expect(role.name).toBe('PM')
    expect(role.capabilityIds).toEqual(['c1'])
    expect(role.domainEvents).toHaveLength(0)
  })
})
