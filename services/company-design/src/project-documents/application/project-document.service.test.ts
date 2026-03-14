import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectDocumentService } from './project-document.service'
import { InMemoryProjectDocumentRepository } from '../infra/in-memory-project-document.repository'

describe('ProjectDocumentService', () => {
  let service: ProjectDocumentService

  beforeEach(() => {
    const repo = new InMemoryProjectDocumentRepository()
    service = new ProjectDocumentService(repo)
  })

  it('should create a document', async () => {
    const result = await service.create('p1', {
      slug: '00-company-overview',
      title: 'Company Overview',
    })
    expect(result.slug).toBe('00-company-overview')
    expect(result.title).toBe('Company Overview')
    expect(result.status).toBe('draft')
    expect(result.sourceType).toBe('system')
    expect(result.id).toBeDefined()
  })

  it('should create with all optional fields', async () => {
    const result = await service.create('p1', {
      slug: '01-mission',
      title: 'Mission & Vision',
      bodyMarkdown: '# Mission\nBuild great things',
      status: 'review',
      linkedEntityIds: ['e1'],
      lastUpdatedBy: 'user-1',
      sourceType: 'user',
    })
    expect(result.bodyMarkdown).toBe('# Mission\nBuild great things')
    expect(result.status).toBe('review')
    expect(result.linkedEntityIds).toEqual(['e1'])
    expect(result.lastUpdatedBy).toBe('user-1')
    expect(result.sourceType).toBe('user')
  })

  it('should reject duplicate slugs within same project', async () => {
    await service.create('p1', { slug: 'overview', title: 'Overview' })
    await expect(service.create('p1', { slug: 'overview', title: 'Another' }))
      .rejects.toThrow("ProjectDocument with slug 'overview' already exists")
  })

  it('should allow same slug in different projects', async () => {
    await service.create('p1', { slug: 'overview', title: 'Overview P1' })
    const p2 = await service.create('p2', { slug: 'overview', title: 'Overview P2' })
    expect(p2.projectId).toBe('p2')
  })

  it('should list by project', async () => {
    await service.create('p1', { slug: 'doc-a', title: 'A' })
    await service.create('p1', { slug: 'doc-b', title: 'B' })
    await service.create('p2', { slug: 'doc-c', title: 'C' })
    expect(await service.list('p1')).toHaveLength(2)
    expect(await service.list('p2')).toHaveLength(1)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', { slug: 'doc-1', title: 'Doc 1' })
    const fetched = await service.get(created.id)
    expect(fetched.title).toBe('Doc 1')
  })

  it('should get by slug', async () => {
    await service.create('p1', { slug: '00-overview', title: 'Overview' })
    const fetched = await service.getBySlug('p1', '00-overview')
    expect(fetched.title).toBe('Overview')
  })

  it('should throw on get not found', async () => {
    await expect(service.get('nonexistent'))
      .rejects.toThrow('ProjectDocument nonexistent not found')
  })

  it('should throw on getBySlug not found', async () => {
    await expect(service.getBySlug('p1', 'missing'))
      .rejects.toThrow("ProjectDocument with slug 'missing' not found")
  })

  it('should update document', async () => {
    const created = await service.create('p1', { slug: 'doc-1', title: 'Doc 1' })
    const updated = await service.update(created.id, {
      title: 'Updated Title',
      bodyMarkdown: '# Updated',
      status: 'approved',
    })
    expect(updated.title).toBe('Updated Title')
    expect(updated.bodyMarkdown).toBe('# Updated')
    expect(updated.status).toBe('approved')
  })

  it('should throw on update not found', async () => {
    await expect(service.update('nonexistent', { title: 'X' }))
      .rejects.toThrow('ProjectDocument nonexistent not found')
  })

  it('should remove document', async () => {
    const created = await service.create('p1', { slug: 'doc-1', title: 'Doc 1' })
    await service.remove(created.id)
    await expect(service.get(created.id))
      .rejects.toThrow('ProjectDocument')
  })

  it('should throw on remove not found', async () => {
    await expect(service.remove('nonexistent'))
      .rejects.toThrow('ProjectDocument nonexistent not found')
  })
})
