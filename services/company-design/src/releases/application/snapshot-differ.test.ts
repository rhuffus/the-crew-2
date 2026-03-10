import { describe, it, expect } from 'vitest'
import { SnapshotDiffer } from './snapshot-differ'
import type { ReleaseSnapshotDto } from '@the-crew/shared-types'

function emptySnapshot(): ReleaseSnapshotDto {
  return {
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
  }
}

describe('SnapshotDiffer', () => {
  const differ = new SnapshotDiffer()

  it('should return no changes for identical snapshots', () => {
    const snapshot = emptySnapshot()
    const result = differ.diff(snapshot, snapshot)
    expect(result.changes).toEqual([])
    expect(result.summary).toEqual({ added: 0, removed: 0, modified: 0 })
  })

  it('should detect added company model', () => {
    const base = emptySnapshot()
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      companyModel: { projectId: 'p1', purpose: 'Build tools', type: 'SaaS', scope: 'Global', principles: ['speed'], updatedAt: '2026-01-01T00:00:00Z' },
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('added')
    expect(result.changes[0]!.entityType).toBe('companyModel')
    expect(result.changes[0]!.entityName).toBe('Company Model')
    expect(result.summary.added).toBe(1)
  })

  it('should detect removed company model', () => {
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      companyModel: { projectId: 'p1', purpose: 'Build', type: 'SaaS', scope: '', principles: [], updatedAt: '2026-01-01T00:00:00Z' },
    }
    const compare = emptySnapshot()

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('removed')
    expect(result.changes[0]!.entityType).toBe('companyModel')
    expect(result.summary.removed).toBe(1)
  })

  it('should detect modified company model', () => {
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      companyModel: { projectId: 'p1', purpose: 'Old purpose', type: 'SaaS', scope: '', principles: [], updatedAt: '2026-01-01T00:00:00Z' },
    }
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      companyModel: { projectId: 'p1', purpose: 'New purpose', type: 'SaaS', scope: '', principles: [], updatedAt: '2026-02-01T00:00:00Z' },
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('modified')
    expect(result.changes[0]!.entityType).toBe('companyModel')
    expect(result.summary.modified).toBe(1)
  })

  it('should ignore updatedAt differences in company model', () => {
    const model = { projectId: 'p1', purpose: 'Same', type: 'SaaS', scope: '', principles: [] }
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      companyModel: { ...model, updatedAt: '2026-01-01T00:00:00Z' },
    }
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      companyModel: { ...model, updatedAt: '2026-06-01T00:00:00Z' },
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(0)
  })

  it('should detect added departments', () => {
    const base = emptySnapshot()
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Engineering', description: 'Eng', mandate: 'Build', parentId: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('added')
    expect(result.changes[0]!.entityType).toBe('department')
    expect(result.changes[0]!.entityName).toBe('Engineering')
    expect(result.changes[0]!.entityId).toBe('d1')
  })

  it('should detect removed capabilities', () => {
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Data Processing', description: 'Process data', ownerDepartmentId: null, inputs: [], outputs: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }
    const compare = emptySnapshot()

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('removed')
    expect(result.changes[0]!.entityType).toBe('capability')
    expect(result.changes[0]!.entityName).toBe('Data Processing')
  })

  it('should detect modified contracts', () => {
    const contract = {
      id: 'ct1',
      projectId: 'p1',
      name: 'SLA Contract',
      type: 'SLA' as const,
      status: 'draft' as const,
      providerId: 'd1',
      providerType: 'department' as const,
      consumerId: 'd2',
      consumerType: 'department' as const,
      acceptanceCriteria: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      contracts: [{ ...contract, description: 'Old description' }],
    }
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      contracts: [{ ...contract, description: 'New description' }],
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('modified')
    expect(result.changes[0]!.entityType).toBe('contract')
    expect(result.changes[0]!.before).toHaveProperty('description', 'Old description')
    expect(result.changes[0]!.after).toHaveProperty('description', 'New description')
  })

  it('should ignore createdAt and updatedAt in entity comparison', () => {
    const dept = { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: 'Build', parentId: null }
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      departments: [{ ...dept, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }],
    }
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      departments: [{ ...dept, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' }],
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(0)
  })

  it('should detect changes across multiple entity types', () => {
    const base: ReleaseSnapshotDto = {
      companyModel: { projectId: 'p1', purpose: 'Old', type: 'SaaS', scope: '', principles: [], updatedAt: '2026-01-01T00:00:00Z' },
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: 'Build', parentId: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
      capabilities: [],
      roles: [],
      agentArchetypes: [],
      agentAssignments: [],
      skills: [],
      contracts: [],
      workflows: [],
      policies: [
        { id: 'pol1', projectId: 'p1', name: 'Policy A', description: '', scope: 'global', departmentId: null, type: 'rule', condition: 'always', enforcement: 'mandatory', status: 'active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }
    const compare: ReleaseSnapshotDto = {
      companyModel: { projectId: 'p1', purpose: 'New', type: 'SaaS', scope: '', principles: [], updatedAt: '2026-02-01T00:00:00Z' },
      departments: [],
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'New Cap', description: '', ownerDepartmentId: null, inputs: [], outputs: [], createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
      ],
      roles: [],
      agentArchetypes: [],
      agentAssignments: [],
      skills: [],
      contracts: [],
      workflows: [],
      policies: [
        { id: 'pol1', projectId: 'p1', name: 'Policy A', description: '', scope: 'global', departmentId: null, type: 'rule', condition: 'always', enforcement: 'mandatory', status: 'active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }

    const result = differ.diff(base, compare)
    expect(result.summary.modified).toBe(1) // companyModel
    expect(result.summary.removed).toBe(1)  // department d1
    expect(result.summary.added).toBe(1)    // capability c1
    expect(result.changes).toHaveLength(3)
  })

  it('should handle arrays comparison for modified entities', () => {
    const base: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: null, inputs: ['a'], outputs: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: null, inputs: ['a', 'b'], outputs: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.changeType).toBe('modified')
  })

  it('should not detect changes when both company models are null', () => {
    const result = differ.diff(emptySnapshot(), emptySnapshot())
    expect(result.changes).toHaveLength(0)
  })

  it('should detect workflow changes', () => {
    const base = emptySnapshot()
    const compare: ReleaseSnapshotDto = {
      ...emptySnapshot(),
      workflows: [
        { id: 'w1', projectId: 'p1', name: 'Onboarding', description: '', ownerDepartmentId: null, status: 'draft', triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    }

    const result = differ.diff(base, compare)
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0]!.entityType).toBe('workflow')
    expect(result.changes[0]!.entityName).toBe('Onboarding')
  })
})
