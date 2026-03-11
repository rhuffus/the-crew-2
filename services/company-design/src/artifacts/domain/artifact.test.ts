import { describe, it, expect } from 'vitest'
import { Artifact } from './artifact'

describe('Artifact', () => {
  const validProps = {
    id: 'a1',
    projectId: 'p1',
    name: 'API Spec',
    description: 'API specification document',
    type: 'document' as const,
  }

  describe('create', () => {
    it('should create an artifact with required fields', () => {
      const artifact = Artifact.create(validProps)
      expect(artifact.id).toBe('a1')
      expect(artifact.projectId).toBe('p1')
      expect(artifact.name).toBe('API Spec')
      expect(artifact.description).toBe('API specification document')
      expect(artifact.type).toBe('document')
      expect(artifact.status).toBe('draft')
      expect(artifact.producerId).toBeNull()
      expect(artifact.producerType).toBeNull()
      expect(artifact.consumerIds).toEqual([])
      expect(artifact.tags).toEqual([])
    })

    it('should create with optional fields', () => {
      const artifact = Artifact.create({
        ...validProps,
        producerId: 'd1',
        producerType: 'department',
        consumerIds: ['d2', 'd3'],
        tags: ['api', 'spec'],
      })
      expect(artifact.producerId).toBe('d1')
      expect(artifact.producerType).toBe('department')
      expect(artifact.consumerIds).toEqual(['d2', 'd3'])
      expect(artifact.tags).toEqual(['api', 'spec'])
    })

    it('should trim the name', () => {
      const artifact = Artifact.create({ ...validProps, name: '  API Spec  ' })
      expect(artifact.name).toBe('API Spec')
    })

    it('should throw on empty name', () => {
      expect(() => Artifact.create({ ...validProps, name: '' })).toThrow('Artifact name cannot be empty')
    })

    it('should throw on whitespace-only name', () => {
      expect(() => Artifact.create({ ...validProps, name: '   ' })).toThrow('Artifact name cannot be empty')
    })

    it('should filter empty strings from consumerIds', () => {
      const artifact = Artifact.create({ ...validProps, consumerIds: ['d1', '', 'd2'] })
      expect(artifact.consumerIds).toEqual(['d1', 'd2'])
    })

    it('should filter empty strings from tags', () => {
      const artifact = Artifact.create({ ...validProps, tags: ['valid', '', 'also-valid'] })
      expect(artifact.tags).toEqual(['valid', 'also-valid'])
    })

    it('should emit ArtifactCreated event', () => {
      const artifact = Artifact.create(validProps)
      const events = artifact.domainEvents
      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('ArtifactCreated')
      expect(events[0]!.aggregateId).toBe('a1')
    })

    it('should set createdAt and updatedAt', () => {
      const artifact = Artifact.create(validProps)
      expect(artifact.createdAt).toBeInstanceOf(Date)
      expect(artifact.updatedAt).toBeInstanceOf(Date)
    })

    it('should default status to draft', () => {
      const artifact = Artifact.create(validProps)
      expect(artifact.status).toBe('draft')
    })

    it('should accept all artifact types', () => {
      const types = ['document', 'data', 'deliverable', 'decision', 'template'] as const
      for (const type of types) {
        const artifact = Artifact.create({ ...validProps, id: `a-${type}`, type })
        expect(artifact.type).toBe(type)
      }
    })
  })

  describe('reconstitute', () => {
    it('should reconstitute from stored props', () => {
      const now = new Date()
      const artifact = Artifact.reconstitute('a1', {
        projectId: 'p1',
        name: 'Report',
        description: 'Monthly report',
        type: 'deliverable',
        status: 'active',
        producerId: 'd1',
        producerType: 'department',
        consumerIds: ['d2'],
        tags: ['monthly'],
        createdAt: now,
        updatedAt: now,
      })
      expect(artifact.id).toBe('a1')
      expect(artifact.name).toBe('Report')
      expect(artifact.status).toBe('active')
      expect(artifact.producerId).toBe('d1')
      expect(artifact.domainEvents).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update name', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ name: 'Updated Name' })
      expect(artifact.name).toBe('Updated Name')
    })

    it('should update description', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ description: 'New description' })
      expect(artifact.description).toBe('New description')
    })

    it('should update type', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ type: 'data' })
      expect(artifact.type).toBe('data')
    })

    it('should update status', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ status: 'active' })
      expect(artifact.status).toBe('active')
    })

    it('should update producerId and producerType', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ producerId: 'c1', producerType: 'capability' })
      expect(artifact.producerId).toBe('c1')
      expect(artifact.producerType).toBe('capability')
    })

    it('should set producerId to null', () => {
      const artifact = Artifact.create({ ...validProps, producerId: 'd1', producerType: 'department' })
      artifact.update({ producerId: null, producerType: null })
      expect(artifact.producerId).toBeNull()
      expect(artifact.producerType).toBeNull()
    })

    it('should update consumerIds', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ consumerIds: ['d1', 'd2'] })
      expect(artifact.consumerIds).toEqual(['d1', 'd2'])
    })

    it('should update tags', () => {
      const artifact = Artifact.create(validProps)
      artifact.update({ tags: ['new-tag'] })
      expect(artifact.tags).toEqual(['new-tag'])
    })

    it('should throw on empty name update', () => {
      const artifact = Artifact.create(validProps)
      expect(() => artifact.update({ name: '' })).toThrow('Artifact name cannot be empty')
    })

    it('should emit ArtifactUpdated event', () => {
      const artifact = Artifact.create(validProps)
      artifact.clearEvents()
      artifact.update({ name: 'Updated' })
      const events = artifact.domainEvents
      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('ArtifactUpdated')
    })

    it('should update the updatedAt timestamp', () => {
      const artifact = Artifact.create(validProps)
      const originalUpdatedAt = artifact.updatedAt
      artifact.update({ name: 'Updated' })
      expect(artifact.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
    })

    it('should not change fields that are not provided', () => {
      const artifact = Artifact.create({ ...validProps, tags: ['t1'] })
      artifact.update({ name: 'New Name' })
      expect(artifact.description).toBe('API specification document')
      expect(artifact.type).toBe('document')
      expect(artifact.tags).toEqual(['t1'])
    })
  })

  describe('defensive copies', () => {
    it('should return a copy of consumerIds', () => {
      const artifact = Artifact.create({ ...validProps, consumerIds: ['d1'] })
      const ids = artifact.consumerIds
      ids.push('d2')
      expect(artifact.consumerIds).toEqual(['d1'])
    })

    it('should return a copy of tags', () => {
      const artifact = Artifact.create({ ...validProps, tags: ['a'] })
      const tags = artifact.tags
      tags.push('b')
      expect(artifact.tags).toEqual(['a'])
    })
  })
})
