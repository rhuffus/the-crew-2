import { describe, it, expect } from 'vitest'
import { Release } from './release'
import type { ReleaseSnapshotDto, ValidationIssue } from '@the-crew/shared-types'

const emptySnapshot: ReleaseSnapshotDto = {
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
}

describe('Release', () => {
  const baseProps = {
    id: 'r1',
    projectId: 'p1',
    version: 'v1.0.0',
    notes: 'Initial release',
  }

  // --- Creation ---

  it('should create a draft release', () => {
    const release = Release.create(baseProps)
    expect(release.id).toBe('r1')
    expect(release.projectId).toBe('p1')
    expect(release.version).toBe('v1.0.0')
    expect(release.status).toBe('draft')
    expect(release.notes).toBe('Initial release')
    expect(release.snapshot).toBeNull()
    expect(release.validationIssues).toEqual([])
    expect(release.publishedAt).toBeNull()
  })

  it('should create with empty notes by default', () => {
    const release = Release.create({ id: 'r2', projectId: 'p1', version: 'v1.0' })
    expect(release.notes).toBe('')
  })

  it('should emit ReleaseCreated event', () => {
    const release = Release.create(baseProps)
    expect(release.domainEvents).toHaveLength(1)
    expect(release.domainEvents[0]!.eventType).toBe('ReleaseCreated')
  })

  it('should reject empty version', () => {
    expect(() => Release.create({ ...baseProps, version: '  ' })).toThrow(
      'Release version cannot be empty',
    )
  })

  it('should trim version and notes', () => {
    const release = Release.create({ ...baseProps, version: '  v2.0  ', notes: '  Trimmed  ' })
    expect(release.version).toBe('v2.0')
    expect(release.notes).toBe('Trimmed')
  })

  // --- Update ---

  it('should update version', () => {
    const release = Release.create(baseProps)
    release.update({ version: 'v2.0.0' })
    expect(release.version).toBe('v2.0.0')
  })

  it('should update notes', () => {
    const release = Release.create(baseProps)
    release.update({ notes: 'Updated notes' })
    expect(release.notes).toBe('Updated notes')
  })

  it('should reject empty version on update', () => {
    const release = Release.create(baseProps)
    expect(() => release.update({ version: '  ' })).toThrow(
      'Release version cannot be empty',
    )
  })

  it('should trim version and notes on update', () => {
    const release = Release.create(baseProps)
    release.update({ version: '  v3.0  ', notes: '  Updated  ' })
    expect(release.version).toBe('v3.0')
    expect(release.notes).toBe('Updated')
  })

  it('should emit ReleaseUpdated event', () => {
    const release = Release.create(baseProps)
    release.clearEvents()
    release.update({ version: 'v2.0' })
    expect(release.domainEvents).toHaveLength(1)
    expect(release.domainEvents[0]!.eventType).toBe('ReleaseUpdated')
  })

  it('should reject update on published release', () => {
    const release = Release.create(baseProps)
    release.publish(emptySnapshot, [])
    expect(() => release.update({ version: 'v2.0' })).toThrow(
      'Cannot update a published release',
    )
  })

  it('should preserve unchanged fields on update', () => {
    const release = Release.create(baseProps)
    release.update({ notes: 'New notes' })
    expect(release.version).toBe('v1.0.0')
  })

  // --- Publish ---

  it('should publish a draft release with snapshot', () => {
    const release = Release.create(baseProps)
    release.publish(emptySnapshot, [])
    expect(release.status).toBe('published')
    expect(release.publishedAt).toBeInstanceOf(Date)
    expect(release.snapshot).toBe(emptySnapshot)
    expect(release.validationIssues).toEqual([])
  })

  it('should publish with warnings', () => {
    const release = Release.create(baseProps)
    const warnings: ValidationIssue[] = [
      { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'No mandate', severity: 'warning' },
    ]
    release.publish(emptySnapshot, warnings)
    expect(release.status).toBe('published')
    expect(release.validationIssues).toEqual(warnings)
  })

  it('should reject publish with validation errors', () => {
    const release = Release.create(baseProps)
    const errors: ValidationIssue[] = [
      { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
    ]
    expect(() => release.publish(emptySnapshot, errors)).toThrow(
      'Cannot publish release with 1 validation error(s)',
    )
    expect(release.status).toBe('draft')
  })

  it('should emit ReleasePublished event', () => {
    const release = Release.create(baseProps)
    release.clearEvents()
    release.publish(emptySnapshot, [])
    expect(release.domainEvents).toHaveLength(1)
    expect(release.domainEvents[0]!.eventType).toBe('ReleasePublished')
  })

  it('should reject publishing an already published release', () => {
    const release = Release.create(baseProps)
    release.publish(emptySnapshot, [])
    expect(() => release.publish(emptySnapshot, [])).toThrow('Release is already published')
  })

  // --- Reconstitute ---

  it('should reconstitute from props', () => {
    const now = new Date()
    const release = Release.reconstitute('r1', {
      projectId: 'p1',
      version: 'v1.0.0',
      status: 'published',
      notes: 'First release',
      snapshot: emptySnapshot,
      validationIssues: [],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    })
    expect(release.version).toBe('v1.0.0')
    expect(release.status).toBe('published')
    expect(release.snapshot).toBe(emptySnapshot)
    expect(release.publishedAt).toBe(now)
    expect(release.domainEvents).toHaveLength(0)
  })
})
