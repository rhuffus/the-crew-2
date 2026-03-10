import { describe, it, expect } from 'vitest'
import { AgentArchetype } from './agent-archetype'

describe('AgentArchetype', () => {
  const baseProps = {
    id: 'a1',
    projectId: 'p1',
    name: 'Code Reviewer',
    description: 'Reviews pull requests',
    roleId: 'r1',
    departmentId: 'd1',
  }

  it('should create an archetype with minimal props', () => {
    const archetype = AgentArchetype.create(baseProps)
    expect(archetype.id).toBe('a1')
    expect(archetype.projectId).toBe('p1')
    expect(archetype.name).toBe('Code Reviewer')
    expect(archetype.description).toBe('Reviews pull requests')
    expect(archetype.roleId).toBe('r1')
    expect(archetype.departmentId).toBe('d1')
    expect(archetype.skillIds).toEqual([])
    expect(archetype.constraints).toEqual({
      maxConcurrency: null,
      allowedDepartmentIds: [],
    })
    expect(archetype.createdAt).toBeInstanceOf(Date)
    expect(archetype.updatedAt).toBeInstanceOf(Date)
  })

  it('should create an archetype with all props', () => {
    const archetype = AgentArchetype.create({
      ...baseProps,
      skillIds: ['s1', 's2'],
      constraints: { maxConcurrency: 3, allowedDepartmentIds: ['d1', 'd2'] },
    })
    expect(archetype.skillIds).toEqual(['s1', 's2'])
    expect(archetype.constraints).toEqual({
      maxConcurrency: 3,
      allowedDepartmentIds: ['d1', 'd2'],
    })
  })

  it('should emit AgentArchetypeCreated event', () => {
    const archetype = AgentArchetype.create(baseProps)
    expect(archetype.domainEvents).toHaveLength(1)
    expect(archetype.domainEvents[0]!.eventType).toBe('AgentArchetypeCreated')
    expect(archetype.domainEvents[0]!.aggregateId).toBe('a1')
  })

  it('should reject empty name', () => {
    expect(() => AgentArchetype.create({ ...baseProps, name: '  ' })).toThrow(
      'Agent archetype name cannot be empty',
    )
  })

  it('should reject empty roleId', () => {
    expect(() => AgentArchetype.create({ ...baseProps, roleId: '  ' })).toThrow(
      'Agent archetype must have a role',
    )
  })

  it('should reject empty departmentId', () => {
    expect(() => AgentArchetype.create({ ...baseProps, departmentId: '  ' })).toThrow(
      'Agent archetype must belong to a department',
    )
  })

  it('should trim name', () => {
    const archetype = AgentArchetype.create({ ...baseProps, name: '  Reviewer  ' })
    expect(archetype.name).toBe('Reviewer')
  })

  it('should filter empty skill ids', () => {
    const archetype = AgentArchetype.create({ ...baseProps, skillIds: ['s1', '', 's2'] })
    expect(archetype.skillIds).toEqual(['s1', 's2'])
  })

  it('should return defensive copy of skillIds', () => {
    const archetype = AgentArchetype.create({ ...baseProps, skillIds: ['s1'] })
    const ids = archetype.skillIds
    ids.push('s99')
    expect(archetype.skillIds).toEqual(['s1'])
  })

  it('should return defensive copy of constraints', () => {
    const archetype = AgentArchetype.create({
      ...baseProps,
      constraints: { allowedDepartmentIds: ['d1'] },
    })
    const c = archetype.constraints
    c.allowedDepartmentIds.push('d99')
    expect(archetype.constraints.allowedDepartmentIds).toEqual(['d1'])
  })

  it('should update name and description', () => {
    const archetype = AgentArchetype.create(baseProps)
    archetype.update({ name: 'Senior Reviewer', description: 'Senior reviews' })
    expect(archetype.name).toBe('Senior Reviewer')
    expect(archetype.description).toBe('Senior reviews')
  })

  it('should update roleId', () => {
    const archetype = AgentArchetype.create(baseProps)
    archetype.update({ roleId: 'r2' })
    expect(archetype.roleId).toBe('r2')
  })

  it('should update departmentId', () => {
    const archetype = AgentArchetype.create(baseProps)
    archetype.update({ departmentId: 'd2' })
    expect(archetype.departmentId).toBe('d2')
  })

  it('should reject empty name on update', () => {
    const archetype = AgentArchetype.create(baseProps)
    expect(() => archetype.update({ name: '  ' })).toThrow(
      'Agent archetype name cannot be empty',
    )
  })

  it('should reject empty roleId on update', () => {
    const archetype = AgentArchetype.create(baseProps)
    expect(() => archetype.update({ roleId: '  ' })).toThrow(
      'Agent archetype must have a role',
    )
  })

  it('should reject empty departmentId on update', () => {
    const archetype = AgentArchetype.create(baseProps)
    expect(() => archetype.update({ departmentId: '  ' })).toThrow(
      'Agent archetype must belong to a department',
    )
  })

  it('should update skillIds', () => {
    const archetype = AgentArchetype.create({ ...baseProps, skillIds: ['s1'] })
    archetype.update({ skillIds: ['s2', 's3'] })
    expect(archetype.skillIds).toEqual(['s2', 's3'])
  })

  it('should update constraints partially', () => {
    const archetype = AgentArchetype.create({
      ...baseProps,
      constraints: { maxConcurrency: 3, allowedDepartmentIds: ['d1'] },
    })
    archetype.update({ constraints: { maxConcurrency: 5 } })
    expect(archetype.constraints.maxConcurrency).toBe(5)
    expect(archetype.constraints.allowedDepartmentIds).toEqual(['d1'])
  })

  it('should update constraints allowedDepartmentIds', () => {
    const archetype = AgentArchetype.create({
      ...baseProps,
      constraints: { maxConcurrency: 3, allowedDepartmentIds: ['d1'] },
    })
    archetype.update({ constraints: { allowedDepartmentIds: ['d2', 'd3'] } })
    expect(archetype.constraints.maxConcurrency).toBe(3)
    expect(archetype.constraints.allowedDepartmentIds).toEqual(['d2', 'd3'])
  })

  it('should preserve unchanged fields on update', () => {
    const archetype = AgentArchetype.create({
      ...baseProps,
      skillIds: ['s1'],
      constraints: { maxConcurrency: 2, allowedDepartmentIds: ['d1'] },
    })
    archetype.update({ name: 'Updated' })
    expect(archetype.roleId).toBe('r1')
    expect(archetype.departmentId).toBe('d1')
    expect(archetype.skillIds).toEqual(['s1'])
    expect(archetype.constraints.maxConcurrency).toBe(2)
  })

  it('should emit AgentArchetypeUpdated event on update', () => {
    const archetype = AgentArchetype.create(baseProps)
    archetype.update({ name: 'Updated' })
    expect(archetype.domainEvents).toHaveLength(2)
    expect(archetype.domainEvents[1]!.eventType).toBe('AgentArchetypeUpdated')
  })

  it('should reconstitute from props without events', () => {
    const now = new Date()
    const archetype = AgentArchetype.reconstitute('a1', {
      projectId: 'p1',
      name: 'Bot',
      description: '',
      roleId: 'r1',
      departmentId: 'd1',
      skillIds: ['s1'],
      constraints: { maxConcurrency: null, allowedDepartmentIds: [] },
      createdAt: now,
      updatedAt: now,
    })
    expect(archetype.name).toBe('Bot')
    expect(archetype.skillIds).toEqual(['s1'])
    expect(archetype.domainEvents).toHaveLength(0)
  })
})
