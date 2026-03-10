import { describe, it, expect } from 'vitest'
import { AgentAssignment } from './agent-assignment'

describe('AgentAssignment', () => {
  const baseProps = {
    id: 'as1',
    projectId: 'p1',
    archetypeId: 'a1',
    name: 'Primary Code Reviewer',
  }

  it('should create an assignment with default active status', () => {
    const assignment = AgentAssignment.create(baseProps)
    expect(assignment.id).toBe('as1')
    expect(assignment.projectId).toBe('p1')
    expect(assignment.archetypeId).toBe('a1')
    expect(assignment.name).toBe('Primary Code Reviewer')
    expect(assignment.status).toBe('active')
    expect(assignment.createdAt).toBeInstanceOf(Date)
    expect(assignment.updatedAt).toBeInstanceOf(Date)
  })

  it('should emit AgentAssignmentCreated event', () => {
    const assignment = AgentAssignment.create(baseProps)
    expect(assignment.domainEvents).toHaveLength(1)
    expect(assignment.domainEvents[0]!.eventType).toBe('AgentAssignmentCreated')
    expect(assignment.domainEvents[0]!.aggregateId).toBe('as1')
  })

  it('should reject empty name', () => {
    expect(() => AgentAssignment.create({ ...baseProps, name: '  ' })).toThrow(
      'Agent assignment name cannot be empty',
    )
  })

  it('should reject empty archetypeId', () => {
    expect(() => AgentAssignment.create({ ...baseProps, archetypeId: '  ' })).toThrow(
      'Agent assignment must reference an archetype',
    )
  })

  it('should trim name', () => {
    const assignment = AgentAssignment.create({ ...baseProps, name: '  Reviewer  ' })
    expect(assignment.name).toBe('Reviewer')
  })

  it('should update name', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.update({ name: 'Secondary Reviewer' })
    expect(assignment.name).toBe('Secondary Reviewer')
  })

  it('should update status', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.update({ status: 'inactive' })
    expect(assignment.status).toBe('inactive')
  })

  it('should reject empty name on update', () => {
    const assignment = AgentAssignment.create(baseProps)
    expect(() => assignment.update({ name: '  ' })).toThrow(
      'Agent assignment name cannot be empty',
    )
  })

  it('should emit AgentAssignmentUpdated event on update', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.update({ name: 'Updated' })
    expect(assignment.domainEvents).toHaveLength(2)
    expect(assignment.domainEvents[1]!.eventType).toBe('AgentAssignmentUpdated')
  })

  it('should deactivate an active assignment', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.deactivate()
    expect(assignment.status).toBe('inactive')
    expect(assignment.domainEvents).toHaveLength(2)
    expect(assignment.domainEvents[1]!.eventType).toBe('AgentAssignmentDeactivated')
  })

  it('should throw when deactivating an already inactive assignment', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.deactivate()
    expect(() => assignment.deactivate()).toThrow('Agent assignment is already inactive')
  })

  it('should activate an inactive assignment', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.deactivate()
    assignment.activate()
    expect(assignment.status).toBe('active')
    expect(assignment.domainEvents[2]!.eventType).toBe('AgentAssignmentActivated')
  })

  it('should throw when activating an already active assignment', () => {
    const assignment = AgentAssignment.create(baseProps)
    expect(() => assignment.activate()).toThrow('Agent assignment is already active')
  })

  it('should preserve unchanged fields on update', () => {
    const assignment = AgentAssignment.create(baseProps)
    assignment.update({ name: 'Updated' })
    expect(assignment.archetypeId).toBe('a1')
    expect(assignment.status).toBe('active')
  })

  it('should reconstitute from props without events', () => {
    const now = new Date()
    const assignment = AgentAssignment.reconstitute('as1', {
      projectId: 'p1',
      archetypeId: 'a1',
      name: 'Bot',
      status: 'inactive',
      createdAt: now,
      updatedAt: now,
    })
    expect(assignment.name).toBe('Bot')
    expect(assignment.status).toBe('inactive')
    expect(assignment.domainEvents).toHaveLength(0)
  })
})
