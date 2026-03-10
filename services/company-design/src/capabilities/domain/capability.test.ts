import { describe, it, expect } from 'vitest'
import { Capability } from './capability'

describe('Capability', () => {
  const baseProps = {
    id: 'c1',
    projectId: 'p1',
    name: 'User Onboarding',
    description: 'Onboard new users',
  }

  it('should create a capability', () => {
    const cap = Capability.create(baseProps)
    expect(cap.id).toBe('c1')
    expect(cap.projectId).toBe('p1')
    expect(cap.name).toBe('User Onboarding')
    expect(cap.ownerDepartmentId).toBeNull()
    expect(cap.inputs).toEqual([])
    expect(cap.outputs).toEqual([])
  })

  it('should emit CapabilityCreated event', () => {
    const cap = Capability.create(baseProps)
    expect(cap.domainEvents).toHaveLength(1)
    expect(cap.domainEvents[0]!.eventType).toBe('CapabilityCreated')
  })

  it('should reject empty name', () => {
    expect(() => Capability.create({ ...baseProps, name: '  ' })).toThrow(
      'Capability name cannot be empty',
    )
  })

  it('should create with owner department', () => {
    const cap = Capability.create({ ...baseProps, ownerDepartmentId: 'd1' })
    expect(cap.ownerDepartmentId).toBe('d1')
  })

  it('should create with inputs and outputs, filtering empty', () => {
    const cap = Capability.create({
      ...baseProps,
      inputs: ['User data', '', '  '],
      outputs: ['Account', 'Welcome email'],
    })
    expect(cap.inputs).toEqual(['User data'])
    expect(cap.outputs).toEqual(['Account', 'Welcome email'])
  })

  it('should update name and description', () => {
    const cap = Capability.create(baseProps)
    cap.update({ name: 'User Registration', description: 'Register users' })
    expect(cap.name).toBe('User Registration')
    expect(cap.description).toBe('Register users')
  })

  it('should reject empty name on update', () => {
    const cap = Capability.create(baseProps)
    expect(() => cap.update({ name: '' })).toThrow('Capability name cannot be empty')
  })

  it('should update owner department', () => {
    const cap = Capability.create(baseProps)
    cap.update({ ownerDepartmentId: 'd2' })
    expect(cap.ownerDepartmentId).toBe('d2')
  })

  it('should update inputs and outputs', () => {
    const cap = Capability.create(baseProps)
    cap.update({ inputs: ['Request'], outputs: ['Response'] })
    expect(cap.inputs).toEqual(['Request'])
    expect(cap.outputs).toEqual(['Response'])
  })

  it('should preserve unchanged fields', () => {
    const cap = Capability.create({
      ...baseProps,
      ownerDepartmentId: 'd1',
      inputs: ['A'],
    })
    cap.update({ outputs: ['B'] })
    expect(cap.ownerDepartmentId).toBe('d1')
    expect(cap.inputs).toEqual(['A'])
    expect(cap.outputs).toEqual(['B'])
  })

  it('should reconstitute from props', () => {
    const now = new Date()
    const cap = Capability.reconstitute('c1', {
      projectId: 'p1',
      name: 'Test',
      description: '',
      ownerDepartmentId: null,
      inputs: [],
      outputs: [],
      createdAt: now,
      updatedAt: now,
    })
    expect(cap.name).toBe('Test')
    expect(cap.domainEvents).toHaveLength(0)
  })

  it('should return defensive copies of inputs/outputs', () => {
    const cap = Capability.create({ ...baseProps, inputs: ['A'], outputs: ['B'] })
    expect(cap.inputs).not.toBe(cap.inputs)
    expect(cap.outputs).not.toBe(cap.outputs)
  })
})
