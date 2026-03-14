import { describe, it, expect } from 'vitest'
import { ProjectDocument } from './project-document'

describe('ProjectDocument', () => {
  const validProps = {
    id: 'doc-1',
    projectId: 'p1',
    slug: '00-company-overview',
    title: 'Company Overview',
  }

  describe('create', () => {
    it('should create with required fields and defaults', () => {
      const doc = ProjectDocument.create(validProps)
      expect(doc.id).toBe('doc-1')
      expect(doc.projectId).toBe('p1')
      expect(doc.slug).toBe('00-company-overview')
      expect(doc.title).toBe('Company Overview')
      expect(doc.bodyMarkdown).toBe('')
      expect(doc.status).toBe('draft')
      expect(doc.linkedEntityIds).toEqual([])
      expect(doc.lastUpdatedBy).toBe('system')
      expect(doc.sourceType).toBe('system')
      expect(doc.createdAt).toBeInstanceOf(Date)
      expect(doc.updatedAt).toBeInstanceOf(Date)
    })

    it('should create with all optional fields', () => {
      const doc = ProjectDocument.create({
        ...validProps,
        bodyMarkdown: '# Overview\nContent here',
        status: 'review',
        linkedEntityIds: ['entity-1', 'entity-2'],
        lastUpdatedBy: 'user-1',
        sourceType: 'user',
      })
      expect(doc.bodyMarkdown).toBe('# Overview\nContent here')
      expect(doc.status).toBe('review')
      expect(doc.linkedEntityIds).toEqual(['entity-1', 'entity-2'])
      expect(doc.lastUpdatedBy).toBe('user-1')
      expect(doc.sourceType).toBe('user')
    })

    it('should emit ProjectDocumentCreated event', () => {
      const doc = ProjectDocument.create(validProps)
      expect(doc.domainEvents).toHaveLength(1)
      expect(doc.domainEvents[0]!.eventType).toBe('ProjectDocumentCreated')
      expect(doc.domainEvents[0]!.aggregateId).toBe('doc-1')
      expect(doc.domainEvents[0]!.payload).toEqual({
        projectId: 'p1',
        slug: '00-company-overview',
        title: 'Company Overview',
      })
    })

    it('should throw on empty title', () => {
      expect(() => ProjectDocument.create({ ...validProps, title: '' }))
        .toThrow('ProjectDocument title cannot be empty')
    })

    it('should throw on whitespace-only title', () => {
      expect(() => ProjectDocument.create({ ...validProps, title: '   ' }))
        .toThrow('ProjectDocument title cannot be empty')
    })

    it('should throw on empty slug', () => {
      expect(() => ProjectDocument.create({ ...validProps, slug: '' }))
        .toThrow('ProjectDocument slug cannot be empty')
    })

    it('should trim title and slug', () => {
      const doc = ProjectDocument.create({
        ...validProps,
        title: '  My Doc  ',
        slug: '  my-doc  ',
      })
      expect(doc.title).toBe('My Doc')
      expect(doc.slug).toBe('my-doc')
    })

    it('should return defensive copy of linkedEntityIds', () => {
      const ids = ['a', 'b']
      const doc = ProjectDocument.create({ ...validProps, linkedEntityIds: ids })
      const returned = doc.linkedEntityIds
      returned.push('c')
      expect(doc.linkedEntityIds).toEqual(['a', 'b'])
    })
  })

  describe('update', () => {
    it('should update title', () => {
      const doc = ProjectDocument.create(validProps)
      doc.clearEvents()
      doc.update({ title: 'Updated Title' })
      expect(doc.title).toBe('Updated Title')
    })

    it('should update bodyMarkdown', () => {
      const doc = ProjectDocument.create(validProps)
      doc.update({ bodyMarkdown: '# New content' })
      expect(doc.bodyMarkdown).toBe('# New content')
    })

    it('should update status', () => {
      const doc = ProjectDocument.create(validProps)
      doc.update({ status: 'approved' })
      expect(doc.status).toBe('approved')
    })

    it('should update linkedEntityIds', () => {
      const doc = ProjectDocument.create(validProps)
      doc.update({ linkedEntityIds: ['x', 'y'] })
      expect(doc.linkedEntityIds).toEqual(['x', 'y'])
    })

    it('should update lastUpdatedBy and sourceType', () => {
      const doc = ProjectDocument.create(validProps)
      doc.update({ lastUpdatedBy: 'agent-ceo', sourceType: 'agent' })
      expect(doc.lastUpdatedBy).toBe('agent-ceo')
      expect(doc.sourceType).toBe('agent')
    })

    it('should emit ProjectDocumentUpdated event', () => {
      const doc = ProjectDocument.create(validProps)
      doc.clearEvents()
      doc.update({ title: 'New Title' })
      expect(doc.domainEvents).toHaveLength(1)
      expect(doc.domainEvents[0]!.eventType).toBe('ProjectDocumentUpdated')
    })

    it('should throw on empty title update', () => {
      const doc = ProjectDocument.create(validProps)
      expect(() => doc.update({ title: '' }))
        .toThrow('ProjectDocument title cannot be empty')
    })

    it('should update updatedAt timestamp', () => {
      const doc = ProjectDocument.create(validProps)
      const before = doc.updatedAt
      doc.update({ title: 'Changed' })
      expect(doc.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })
  })

  describe('reconstitute', () => {
    it('should load from stored props without events', () => {
      const now = new Date()
      const doc = ProjectDocument.reconstitute('doc-1', {
        projectId: 'p1',
        slug: '00-company-overview',
        title: 'Company Overview',
        bodyMarkdown: '# Content',
        status: 'approved',
        linkedEntityIds: ['e1'],
        lastUpdatedBy: 'user-1',
        sourceType: 'user',
        createdAt: now,
        updatedAt: now,
      })
      expect(doc.id).toBe('doc-1')
      expect(doc.title).toBe('Company Overview')
      expect(doc.status).toBe('approved')
      expect(doc.domainEvents).toHaveLength(0)
    })
  })
})
