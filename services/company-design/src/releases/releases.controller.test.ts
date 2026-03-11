import { describe, it, expect, beforeEach } from 'vitest'
import { ReleasesController } from './releases.controller'
import { ReleaseService } from './application/release.service'
import { SnapshotCollector } from './application/snapshot-collector'
import { ValidationEngine } from '../validations/application/validation-engine'
import { SnapshotDiffer } from './application/snapshot-differ'
import { InMemoryReleaseRepository } from './infra/in-memory-release.repository'
import type { ReleaseSnapshotDto } from '@the-crew/shared-types'

const baseDto = {
  version: 'v1.0.0',
  notes: 'Initial release',
}

const validSnapshot: ReleaseSnapshotDto = {
  companyModel: { projectId: 'p1', purpose: 'Test', type: 'SaaS', scope: 'Global', principles: [], updatedAt: '2026-01-01T00:00:00Z' },
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

function createMockSnapshotCollector(): SnapshotCollector {
  return { collect: async () => validSnapshot } as unknown as SnapshotCollector
}

describe('ReleasesController', () => {
  let controller: ReleasesController

  beforeEach(() => {
    const repo = new InMemoryReleaseRepository()
    const snapshotCollector = createMockSnapshotCollector()
    const engine = new ValidationEngine()
    const service = new ReleaseService(repo, snapshotCollector, engine, new SnapshotDiffer())
    controller = new ReleasesController(service)
  })

  it('should list empty releases', async () => {
    expect(await controller.list('p1')).toEqual([])
  })

  it('should create and list', async () => {
    await controller.create('p1', baseDto)
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.version).toBe('v1.0.0')
  })

  it('should get a release', async () => {
    const created = await controller.create('p1', baseDto)
    const found = await controller.get(created.id)
    expect(found.version).toBe('v1.0.0')
  })

  it('should update a release', async () => {
    const created = await controller.create('p1', baseDto)
    const updated = await controller.update(created.id, { version: 'v1.1.0' })
    expect(updated.version).toBe('v1.1.0')
  })

  it('should publish a release with snapshot', async () => {
    const created = await controller.create('p1', baseDto)
    const published = await controller.publish(created.id)
    expect(published.status).toBe('published')
    expect(published.snapshot).toEqual(validSnapshot)
  })

  it('should delete a draft release', async () => {
    const created = await controller.create('p1', baseDto)
    await controller.remove(created.id)
    expect(await controller.list('p1')).toHaveLength(0)
  })

  it('should diff two published releases', async () => {
    const r1 = await controller.create('p1', baseDto)
    await controller.publish(r1.id)
    const r2 = await controller.create('p1', { version: 'v2.0' })
    await controller.publish(r2.id)
    const diff = await controller.diff(r1.id, r2.id)
    expect(diff.baseVersion).toBe('v1.0.0')
    expect(diff.compareVersion).toBe('v2.0')
    expect(diff.summary).toBeDefined()
    expect(diff.changes).toBeDefined()
  })
})
