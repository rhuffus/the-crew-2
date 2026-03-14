import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectDocumentsController } from './project-documents.controller'
import { ProjectDocumentService } from './application/project-document.service'
import { InMemoryProjectDocumentRepository } from './infra/in-memory-project-document.repository'

describe('ProjectDocumentsController', () => {
  let controller: ProjectDocumentsController

  beforeEach(() => {
    const repo = new InMemoryProjectDocumentRepository()
    const service = new ProjectDocumentService(repo)
    controller = new ProjectDocumentsController(service)
  })

  it('should list empty', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', { slug: 'overview', title: 'Overview' })
    const list = await controller.list('p1')
    expect(list).toHaveLength(1)
    expect(list[0]!.title).toBe('Overview')
  })

  it('should get by id', async () => {
    const created = await controller.create('p1', { slug: 'doc-1', title: 'Doc' })
    const fetched = await controller.get(created.id)
    expect(fetched.title).toBe('Doc')
  })

  it('should get by slug', async () => {
    await controller.create('p1', { slug: '00-overview', title: 'Overview' })
    const fetched = await controller.getBySlug('p1', '00-overview')
    expect(fetched.title).toBe('Overview')
  })

  it('should update', async () => {
    const created = await controller.create('p1', { slug: 'doc-1', title: 'Doc' })
    const updated = await controller.update(created.id, { title: 'Updated' })
    expect(updated.title).toBe('Updated')
  })

  it('should delete', async () => {
    const created = await controller.create('p1', { slug: 'doc-1', title: 'Doc' })
    await controller.remove(created.id)
    expect(await controller.list('p1')).toEqual([])
  })
})
