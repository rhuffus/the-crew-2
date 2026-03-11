import { describe, it, expect, beforeEach } from 'vitest'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ReleaseService } from './release.service'
import { SnapshotCollector } from './snapshot-collector'
import { ValidationEngine } from '../../validations/application/validation-engine'
import { SnapshotDiffer } from './snapshot-differ'
import { InMemoryReleaseRepository } from '../infra/in-memory-release.repository'
import type { ReleaseSnapshotDto } from '@the-crew/shared-types'

const baseDto = {
  version: 'v1.0.0',
  notes: 'Initial release',
}

const validSnapshot: ReleaseSnapshotDto = {
  companyModel: { projectId: 'p1', purpose: 'Test purpose', type: 'SaaS', scope: 'Global', principles: [], updatedAt: '2026-01-01T00:00:00Z' },
  departments: [{ id: 'd1', projectId: 'p1', name: 'Engineering', description: 'Eng', mandate: 'Build things', parentId: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
  capabilities: [],
  roles: [],
  agentArchetypes: [],
  agentAssignments: [],
  skills: [],
  contracts: [],
  workflows: [],
  policies: [],
  artifacts: [],
}

const invalidSnapshot: ReleaseSnapshotDto = {
  companyModel: null,
  departments: [],
  capabilities: [],
  roles: [],
  agentArchetypes: [],
  agentAssignments: [],
  skills: [],
  contracts: [],
  workflows: [],
  policies: [],
  artifacts: [],
}

function createMockSnapshotCollector(snapshot: ReleaseSnapshotDto): SnapshotCollector {
  return { collect: async () => snapshot } as unknown as SnapshotCollector
}

describe('ReleaseService', () => {
  let service: ReleaseService
  let snapshotCollector: SnapshotCollector

  beforeEach(() => {
    const repo = new InMemoryReleaseRepository()
    snapshotCollector = createMockSnapshotCollector(validSnapshot)
    const engine = new ValidationEngine()
    const differ = new SnapshotDiffer()
    service = new ReleaseService(repo, snapshotCollector, engine, differ)
  })

  it('should list empty releases', async () => {
    expect(await service.list('p1')).toEqual([])
  })

  it('should create a draft release', async () => {
    const result = await service.create('p1', baseDto)
    expect(result.version).toBe('v1.0.0')
    expect(result.projectId).toBe('p1')
    expect(result.status).toBe('draft')
    expect(result.notes).toBe('Initial release')
    expect(result.snapshot).toBeNull()
    expect(result.validationIssues).toEqual([])
    expect(result.publishedAt).toBeNull()
  })

  it('should create with default empty notes', async () => {
    const result = await service.create('p1', { version: 'v1.0' })
    expect(result.notes).toBe('')
  })

  it('should list by project', async () => {
    await service.create('p1', baseDto)
    await service.create('p1', { version: 'v2.0' })
    await service.create('p2', { version: 'v1.0' })
    expect(await service.list('p1')).toHaveLength(2)
  })

  it('should get by id', async () => {
    const created = await service.create('p1', baseDto)
    const found = await service.get(created.id)
    expect(found.version).toBe('v1.0.0')
  })

  it('should throw on get unknown', async () => {
    await expect(service.get('x')).rejects.toThrow(NotFoundException)
  })

  it('should update a draft release', async () => {
    const created = await service.create('p1', baseDto)
    const updated = await service.update(created.id, {
      version: 'v1.1.0',
      notes: 'Updated notes',
    })
    expect(updated.version).toBe('v1.1.0')
    expect(updated.notes).toBe('Updated notes')
  })

  it('should throw on update unknown', async () => {
    await expect(service.update('x', { version: 'v2' })).rejects.toThrow(NotFoundException)
  })

  it('should publish a release with snapshot', async () => {
    const created = await service.create('p1', baseDto)
    const published = await service.publish(created.id)
    expect(published.status).toBe('published')
    expect(published.publishedAt).toBeTruthy()
    expect(published.snapshot).toEqual(validSnapshot)
    expect(published.validationIssues).toEqual([])
  })

  it('should reject publish when validation has errors', async () => {
    const repo = new InMemoryReleaseRepository()
    const invalidCollector = createMockSnapshotCollector(invalidSnapshot)
    const engine = new ValidationEngine()
    const svc = new ReleaseService(repo, invalidCollector, engine, new SnapshotDiffer())

    const created = await svc.create('p1', baseDto)
    await expect(svc.publish(created.id)).rejects.toThrow(BadRequestException)
  })

  it('should publish with warnings but include them in result', async () => {
    const snapshotWithWarnings: ReleaseSnapshotDto = {
      ...validSnapshot,
      capabilities: [{ id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: null, inputs: [], outputs: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
    }
    const repo = new InMemoryReleaseRepository()
    const collector = createMockSnapshotCollector(snapshotWithWarnings)
    const engine = new ValidationEngine()
    const svc = new ReleaseService(repo, collector, engine, new SnapshotDiffer())

    const created = await svc.create('p1', baseDto)
    const published = await svc.publish(created.id)
    expect(published.status).toBe('published')
    expect(published.validationIssues).toHaveLength(1)
    expect(published.validationIssues[0]!.severity).toBe('warning')
  })

  it('should throw on publish unknown', async () => {
    await expect(service.publish('x')).rejects.toThrow(NotFoundException)
  })

  it('should remove a draft release', async () => {
    const created = await service.create('p1', baseDto)
    await service.remove(created.id)
    await expect(service.get(created.id)).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove unknown', async () => {
    await expect(service.remove('x')).rejects.toThrow(NotFoundException)
  })

  it('should throw on remove published release', async () => {
    const created = await service.create('p1', baseDto)
    await service.publish(created.id)
    await expect(service.remove(created.id)).rejects.toThrow(
      'Cannot delete a published release',
    )
  })

  describe('diff', () => {
    it('should diff two published releases', async () => {
      const r1 = await service.create('p1', { version: 'v1.0' })
      await service.publish(r1.id)

      snapshotCollector.collect = async () => ({
        ...validSnapshot,
        departments: [
          ...validSnapshot.departments,
          { id: 'd2', projectId: 'p1', name: 'Sales', description: '', mandate: 'Sell', parentId: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
        ],
      })
      const r2 = await service.create('p1', { version: 'v2.0' })
      await service.publish(r2.id)

      const diff = await service.diff(r1.id, r2.id)
      expect(diff.baseVersion).toBe('v1.0')
      expect(diff.compareVersion).toBe('v2.0')
      expect(diff.summary.added).toBe(1)
      expect(diff.changes[0]!.entityName).toBe('Sales')
    })

    it('should throw if base release not found', async () => {
      await expect(service.diff('x', 'y')).rejects.toThrow(NotFoundException)
    })

    it('should throw if compare release not found', async () => {
      const r1 = await service.create('p1', { version: 'v1.0' })
      await service.publish(r1.id)
      await expect(service.diff(r1.id, 'y')).rejects.toThrow(NotFoundException)
    })

    it('should throw if base release is not published', async () => {
      const r1 = await service.create('p1', { version: 'v1.0' })
      const r2 = await service.create('p1', { version: 'v2.0' })
      await service.publish(r2.id)
      await expect(service.diff(r1.id, r2.id)).rejects.toThrow(BadRequestException)
    })

    it('should throw if compare release is not published', async () => {
      const r1 = await service.create('p1', { version: 'v1.0' })
      await service.publish(r1.id)
      const r2 = await service.create('p1', { version: 'v2.0' })
      await expect(service.diff(r1.id, r2.id)).rejects.toThrow(BadRequestException)
    })
  })
})
