import { describe, it, expect } from 'vitest'
import { Project } from './project'

describe('Project', () => {
  it('should create a project', () => {
    const project = Project.create({ id: '1', name: 'Acme Corp', description: 'A test company' })
    expect(project.id).toBe('1')
    expect(project.name).toBe('Acme Corp')
    expect(project.description).toBe('A test company')
    expect(project.status).toBe('active')
    expect(project.createdAt).toBeInstanceOf(Date)
    expect(project.updatedAt).toBeInstanceOf(Date)
  })

  it('should emit ProjectCreated event', () => {
    const project = Project.create({ id: '1', name: 'Acme', description: '' })
    expect(project.domainEvents).toHaveLength(1)
    expect(project.domainEvents[0]!.eventType).toBe('ProjectCreated')
  })

  it('should reject empty name', () => {
    expect(() => Project.create({ id: '1', name: '', description: '' })).toThrow(
      'Project name cannot be empty',
    )
    expect(() => Project.create({ id: '1', name: '   ', description: '' })).toThrow(
      'Project name cannot be empty',
    )
  })

  it('should trim the name', () => {
    const project = Project.create({ id: '1', name: '  Acme  ', description: '' })
    expect(project.name).toBe('Acme')
  })

  it('should update metadata', () => {
    const project = Project.create({ id: '1', name: 'Acme', description: 'old' })
    project.clearEvents()
    project.updateMetadata({ name: 'New Name', description: 'new' })
    expect(project.name).toBe('New Name')
    expect(project.description).toBe('new')
    expect(project.domainEvents).toHaveLength(1)
    expect(project.domainEvents[0]!.eventType).toBe('ProjectUpdated')
  })

  it('should reject empty name on update', () => {
    const project = Project.create({ id: '1', name: 'Acme', description: '' })
    expect(() => project.updateMetadata({ name: '' })).toThrow('Project name cannot be empty')
  })

  it('should allow partial metadata update', () => {
    const project = Project.create({ id: '1', name: 'Acme', description: 'old' })
    project.updateMetadata({ description: 'new' })
    expect(project.name).toBe('Acme')
    expect(project.description).toBe('new')
  })

  it('should archive', () => {
    const project = Project.create({ id: '1', name: 'Acme', description: '' })
    project.clearEvents()
    project.archive()
    expect(project.status).toBe('archived')
    expect(project.domainEvents).toHaveLength(1)
    expect(project.domainEvents[0]!.eventType).toBe('ProjectArchived')
  })

  it('should reconstitute from stored data', () => {
    const now = new Date()
    const project = Project.reconstitute('1', {
      name: 'Acme',
      description: 'desc',
      status: 'archived',
      createdAt: now,
      updatedAt: now,
    })
    expect(project.id).toBe('1')
    expect(project.name).toBe('Acme')
    expect(project.status).toBe('archived')
    expect(project.domainEvents).toHaveLength(0)
  })
})
