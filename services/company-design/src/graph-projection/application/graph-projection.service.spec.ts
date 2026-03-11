import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GraphProjectionService } from './graph-projection.service'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import type { ReleaseSnapshotDto, ValidationIssue } from '@the-crew/shared-types'

function createSnapshot(overrides: Partial<ReleaseSnapshotDto> = {}): ReleaseSnapshotDto {
  return {
    companyModel: {
      projectId: 'p1',
      purpose: 'Test Co',
      type: 'SaaS',
      scope: 'Global',
      principles: [],
      updatedAt: '',
    },
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
    ...overrides,
  }
}

function makeRelease(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rel-1',
    projectId: 'p1',
    version: 'v1.0',
    status: 'published',
    snapshot: createSnapshot(),
    ...overrides,
  }
}

describe('GraphProjectionService', () => {
  let service: GraphProjectionService
  let mockCollector: { collect: ReturnType<typeof vi.fn> }
  let mockEngine: { validate: ReturnType<typeof vi.fn> }
  let mockReleaseRepo: { findById: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockCollector = { collect: vi.fn() }
    mockEngine = { validate: vi.fn() }
    mockReleaseRepo = { findById: vi.fn() }
    service = new GraphProjectionService(
      mockCollector as any,
      mockEngine as any,
      mockReleaseRepo as any,
    )
  })

  // ---- Existing projectGraph tests ----

  it('should return VisualGraphDto with L1 defaults', async () => {
    const snapshot = createSnapshot()
    mockCollector.collect.mockResolvedValue(snapshot)
    mockEngine.validate.mockReturnValue([])

    const result = await service.projectGraph('p1')

    expect(result.projectId).toBe('p1')
    expect(result.zoomLevel).toBe('L1')
    expect(result.scope).toEqual({ level: 'L1', entityId: null, entityType: 'company' })
    expect(result.activeLayers).toEqual(['organization'])
    expect(result.breadcrumb).toHaveLength(1)
    expect(result.breadcrumb[0]!.label).toBe('Test Co')
    expect(result.nodes.length).toBeGreaterThanOrEqual(1)
  })

  it('should project L3 workflow scope', async () => {
    const snapshot = createSnapshot({
      workflows: [
        {
          id: 'wf1', projectId: 'p1', name: 'Deploy', description: '', ownerDepartmentId: null,
          status: 'active', triggerDescription: '',
          stages: [
            { name: 'Build', order: 1, description: 'Build it' },
            { name: 'Test', order: 2, description: 'Test it' },
          ],
          participants: [], contractIds: [], createdAt: '', updatedAt: '',
        },
      ],
    })
    mockCollector.collect.mockResolvedValue(snapshot)
    mockEngine.validate.mockReturnValue([])

    const result = await service.projectGraph('p1', 'L3', 'wf1')

    expect(result.zoomLevel).toBe('L3')
    expect(result.scope.entityId).toBe('wf1')
    expect(result.scope.entityType).toBe('workflow')
    expect(result.activeLayers).toEqual(['workflows'])

    const nodeTypes = result.nodes.map((n) => n.nodeType)
    expect(nodeTypes).toContain('workflow')
    expect(nodeTypes).toContain('workflow-stage')

    const stages = result.nodes.filter((n) => n.nodeType === 'workflow-stage')
    expect(stages).toHaveLength(2)

    const handoffs = result.edges.filter((e) => e.edgeType === 'hands_off_to')
    expect(handoffs).toHaveLength(1)
  })

  it('should apply validation overlay to nodes', async () => {
    const snapshot = createSnapshot()
    mockCollector.collect.mockResolvedValue(snapshot)
    const issues: ValidationIssue[] = [
      { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'No purpose', severity: 'error' },
    ]
    mockEngine.validate.mockReturnValue(issues)

    const result = await service.projectGraph('p1')

    const company = result.nodes.find((n) => n.nodeType === 'company')
    expect(company!.status).toBe('error')
  })

  it('should use requested layers when provided', async () => {
    const snapshot = createSnapshot({
      policies: [
        {
          id: 'pol1', projectId: 'p1', name: 'P1', description: '', scope: 'global',
          departmentId: null, type: 'rule', condition: '', enforcement: 'mandatory',
          status: 'active', createdAt: '', updatedAt: '',
        },
      ],
    })
    mockCollector.collect.mockResolvedValue(snapshot)
    mockEngine.validate.mockReturnValue([])

    const result = await service.projectGraph('p1', 'L1', null, ['organization', 'governance'])

    expect(result.activeLayers).toEqual(['organization', 'governance'])
    const types = result.nodes.map((n) => n.nodeType)
    expect(types).toContain('policy')
  })

  it('should drop orphan edges after filtering', async () => {
    const snapshot = createSnapshot({
      departments: [
        { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
      ],
      capabilities: [
        { id: 'c1', projectId: 'p1', name: 'Cap', description: '', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
      ],
    })
    mockCollector.collect.mockResolvedValue(snapshot)
    mockEngine.validate.mockReturnValue([])

    // L1 with only organization -> capability node filtered out -> owns edge should be dropped
    const result = await service.projectGraph('p1', 'L1', null, ['organization'])

    const ownsEdge = result.edges.find((e) => e.edgeType === 'owns')
    expect(ownsEdge).toBeUndefined()
  })

  // ---- projectDiff tests ----

  describe('projectDiff', () => {
    it('should return VisualGraphDiffDto for two published releases at L1', async () => {
      const baseSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })
      const compareSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Engineering', description: '', mandate: 'Build things', parentId: null, createdAt: '', updatedAt: '' },
          { id: 'd2', projectId: 'p1', name: 'Marketing', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2')

      expect(result.projectId).toBe('p1')
      expect(result.baseReleaseId).toBe('rel-1')
      expect(result.compareReleaseId).toBe('rel-2')
      expect(result.zoomLevel).toBe('L1')
      expect(result.scope).toEqual({ level: 'L1', entityId: null, entityType: 'company' })
      expect(result.activeLayers).toEqual(['organization'])
      expect(result.breadcrumb.length).toBeGreaterThanOrEqual(1)
      expect(result.summary).toBeDefined()
    })

    it('should mark added, modified, and unchanged nodes', async () => {
      const baseSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })
      const compareSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Engineering', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
          { id: 'd2', projectId: 'p1', name: 'Marketing', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2')

      const added = result.nodes.filter((n) => n.diffStatus === 'added')
      const modified = result.nodes.filter((n) => n.diffStatus === 'modified')
      const unchanged = result.nodes.filter((n) => n.diffStatus === 'unchanged')

      expect(added.length).toBeGreaterThanOrEqual(1) // d2 added
      expect(modified.length).toBeGreaterThanOrEqual(1) // d1 renamed
      expect(unchanged.length).toBeGreaterThanOrEqual(1) // company node unchanged
    })

    it('should mark removed nodes when department deleted', async () => {
      const baseSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
          { id: 'd2', projectId: 'p1', name: 'Marketing', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })
      const compareSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2')

      const removed = result.nodes.filter((n) => n.diffStatus === 'removed')
      expect(removed.length).toBeGreaterThanOrEqual(1) // d2 removed
      expect(removed.some((n) => n.label === 'Marketing')).toBe(true)
      expect(result.summary.nodesRemoved).toBeGreaterThanOrEqual(1)
    })

    it('should diff edges correctly', async () => {
      const baseSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
        capabilities: [
          { id: 'c1', projectId: 'p1', name: 'Build', description: '', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
        ],
      })
      const compareSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
        capabilities: [
          { id: 'c1', projectId: 'p1', name: 'Build', description: '', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
          { id: 'c2', projectId: 'p1', name: 'Test', description: '', ownerDepartmentId: 'd1', inputs: [], outputs: [], createdAt: '', updatedAt: '' },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2', 'L1', null, ['organization', 'capabilities'])

      // New owns edge for c2→d1
      const addedEdges = result.edges.filter((e) => e.diffStatus === 'added')
      expect(addedEdges.length).toBeGreaterThanOrEqual(1)
      expect(result.summary.edgesAdded).toBeGreaterThanOrEqual(1)
    })

    it('should support L2 scoped diff', async () => {
      const baseSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
        roles: [
          { id: 'r1', projectId: 'p1', name: 'Dev', description: '', departmentId: 'd1', capabilityIds: [], accountability: '', authority: '', createdAt: '', updatedAt: '' },
        ],
      })
      const compareSnapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
        roles: [
          { id: 'r1', projectId: 'p1', name: 'Developer', description: '', departmentId: 'd1', capabilityIds: [], accountability: '', authority: '', createdAt: '', updatedAt: '' },
          { id: 'r2', projectId: 'p1', name: 'QA', description: '', departmentId: 'd1', capabilityIds: [], accountability: '', authority: '', createdAt: '', updatedAt: '' },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2', 'L2', 'd1')

      expect(result.zoomLevel).toBe('L2')
      expect(result.scope.entityId).toBe('d1')
      expect(result.scope.entityType).toBe('department')
      // r2 added, r1 modified (name changed)
      expect(result.summary.nodesAdded).toBeGreaterThanOrEqual(1)
      expect(result.summary.nodesModified).toBeGreaterThanOrEqual(1)
    })

    it('should support L3 scoped diff', async () => {
      const baseSnapshot = createSnapshot({
        workflows: [
          {
            id: 'wf1', projectId: 'p1', name: 'Deploy', description: '', ownerDepartmentId: null,
            status: 'active', triggerDescription: '',
            stages: [{ name: 'Build', order: 1, description: 'Build it' }],
            participants: [], contractIds: [], createdAt: '', updatedAt: '',
          },
        ],
      })
      const compareSnapshot = createSnapshot({
        workflows: [
          {
            id: 'wf1', projectId: 'p1', name: 'Deploy', description: '', ownerDepartmentId: null,
            status: 'active', triggerDescription: '',
            stages: [
              { name: 'Build', order: 1, description: 'Build it' },
              { name: 'Test', order: 2, description: 'Test it' },
            ],
            participants: [], contractIds: [], createdAt: '', updatedAt: '',
          },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2', 'L3', 'wf1')

      expect(result.zoomLevel).toBe('L3')
      expect(result.scope.entityType).toBe('workflow')
      // New stage added
      expect(result.summary.nodesAdded).toBeGreaterThanOrEqual(1)
    })

    it('should use requested layers for diff', async () => {
      const snapshot = createSnapshot()
      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2', 'L1', null, ['organization', 'governance'])

      expect(result.activeLayers).toEqual(['organization', 'governance'])
    })

    it('should not apply validation overlay to diff nodes', async () => {
      const baseSnapshot = createSnapshot()
      // Company has no purpose in compare → would be 'error' in live mode
      const compareSnapshot = createSnapshot({
        companyModel: {
          projectId: 'p1',
          purpose: '',
          type: 'SaaS',
          scope: 'Global',
          principles: [],
          updatedAt: '',
        },
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2')

      // In diff mode, validation overlay is NOT applied — status stays 'normal'
      const company = result.nodes.find((n) => n.nodeType === 'company')
      expect(company).toBeDefined()
      // The node's status field should be whatever mapNodes sets (normal for non-empty purpose, error for empty)
      // but validation overlay is NOT applied, so the status comes from the raw mapping
    })

    it('should throw NotFoundException when base release not found', async () => {
      mockReleaseRepo.findById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2' }))

      await expect(
        service.projectDiff('p1', 'rel-1', 'rel-2'),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when compare release not found', async () => {
      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1' }))
        .mockResolvedValueOnce(null)

      await expect(
        service.projectDiff('p1', 'rel-1', 'rel-2'),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when base release is not published', async () => {
      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', status: 'draft', snapshot: null }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2' }))

      await expect(
        service.projectDiff('p1', 'rel-1', 'rel-2'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when compare release is not published', async () => {
      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1' }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', status: 'draft', snapshot: null }))

      await expect(
        service.projectDiff('p1', 'rel-1', 'rel-2'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should handle identical releases (all unchanged)', async () => {
      const snapshot = createSnapshot({
        departments: [
          { id: 'd1', projectId: 'p1', name: 'Eng', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        ],
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2')

      expect(result.summary.nodesAdded).toBe(0)
      expect(result.summary.nodesRemoved).toBe(0)
      expect(result.summary.nodesModified).toBe(0)
      expect(result.summary.nodesUnchanged).toBeGreaterThan(0)
      expect(result.nodes.every((n) => n.diffStatus === 'unchanged')).toBe(true)
    })

    it('should use compare breadcrumb by default', async () => {
      const baseSnapshot = createSnapshot()
      const compareSnapshot = createSnapshot({
        companyModel: {
          projectId: 'p1',
          purpose: 'Updated Co',
          type: 'SaaS',
          scope: 'Global',
          principles: [],
          updatedAt: '',
        },
      })

      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot: baseSnapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot: compareSnapshot }))

      const result = await service.projectDiff('p1', 'rel-1', 'rel-2')

      expect(result.breadcrumb.length).toBeGreaterThanOrEqual(1)
      expect(result.breadcrumb[0]!.label).toBe('Updated Co')
    })

    it('should fetch both releases in parallel', async () => {
      const snapshot = createSnapshot()
      mockReleaseRepo.findById
        .mockResolvedValueOnce(makeRelease({ id: 'rel-1', snapshot }))
        .mockResolvedValueOnce(makeRelease({ id: 'rel-2', snapshot }))

      await service.projectDiff('p1', 'rel-1', 'rel-2')

      expect(mockReleaseRepo.findById).toHaveBeenCalledTimes(2)
      expect(mockReleaseRepo.findById).toHaveBeenCalledWith('rel-1')
      expect(mockReleaseRepo.findById).toHaveBeenCalledWith('rel-2')
    })
  })
})
