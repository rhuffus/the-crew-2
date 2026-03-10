import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VisualGraphController } from './visual-graph.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  getVisualGraph: vi.fn(),
  getVisualGraphDiff: vi.fn(),
}

describe('VisualGraphController (gateway)', () => {
  let controller: VisualGraphController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new VisualGraphController(mockClient as unknown as CompanyDesignClient)
  })

  it('should get visual graph for a project', async () => {
    const graph = {
      projectId: 'p1',
      scope: { level: 'company', entityId: null },
      zoomLevel: 'company',
      nodes: [],
      edges: [],
      activeLayers: ['structure'],
      breadcrumb: [{ label: 'Company', level: 'company', entityId: null }],
    }
    mockClient.getVisualGraph.mockResolvedValue(graph)

    const response = await controller.getVisualGraph('p1')

    expect(response).toEqual(graph)
    expect(mockClient.getVisualGraph).toHaveBeenCalledWith('p1', undefined, undefined, undefined)
  })

  it('should pass level query param', async () => {
    mockClient.getVisualGraph.mockResolvedValue({ projectId: 'p1', nodes: [], edges: [] })

    await controller.getVisualGraph('p1', 'department')

    expect(mockClient.getVisualGraph).toHaveBeenCalledWith('p1', 'department', undefined, undefined)
  })

  it('should pass level and entityId query params', async () => {
    mockClient.getVisualGraph.mockResolvedValue({ projectId: 'p1', nodes: [], edges: [] })

    await controller.getVisualGraph('p1', 'department', 'd1')

    expect(mockClient.getVisualGraph).toHaveBeenCalledWith('p1', 'department', 'd1', undefined)
  })

  it('should pass all query params', async () => {
    mockClient.getVisualGraph.mockResolvedValue({ projectId: 'p1', nodes: [], edges: [] })

    await controller.getVisualGraph('p1', 'department', 'd1', 'structure,governance')

    expect(mockClient.getVisualGraph).toHaveBeenCalledWith('p1', 'department', 'd1', 'structure,governance')
  })

  it('should return graph with nodes and edges', async () => {
    const graph = {
      projectId: 'p1',
      scope: { level: 'department', entityId: 'd1' },
      zoomLevel: 'department',
      nodes: [
        { id: 'n1', type: 'department', label: 'Engineering', entityId: 'd1', position: { x: 0, y: 0 }, data: {} },
      ],
      edges: [
        { id: 'e1', type: 'contains', source: 'n1', target: 'n2', data: {} },
      ],
      activeLayers: ['structure', 'governance'],
      breadcrumb: [
        { label: 'Company', level: 'company', entityId: null },
        { label: 'Engineering', level: 'department', entityId: 'd1' },
      ],
    }
    mockClient.getVisualGraph.mockResolvedValue(graph)

    const response = await controller.getVisualGraph('p1', 'department', 'd1')

    expect(response).toEqual(graph)
    expect(response.nodes).toHaveLength(1)
    expect(response.edges).toHaveLength(1)
  })

  // --- Visual Diff tests ---

  it('should get visual diff with base and compare release IDs', async () => {
    const diff = {
      projectId: 'p1',
      scope: { level: 'company', entityId: null, entityType: null },
      zoomLevel: 'L1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
      nodes: [],
      edges: [],
      activeLayers: ['structure'],
      breadcrumb: [],
      summary: {
        nodesAdded: 0, nodesRemoved: 0, nodesModified: 0, nodesUnchanged: 0,
        edgesAdded: 0, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 0,
      },
    }
    mockClient.getVisualGraphDiff.mockResolvedValue(diff)

    const response = await controller.getVisualDiff('p1', 'rel-1', 'rel-2')

    expect(response).toEqual(diff)
    expect(mockClient.getVisualGraphDiff).toHaveBeenCalledWith(
      'p1', 'rel-1', 'rel-2', undefined, undefined, undefined,
    )
  })

  it('should pass level and entityId to visual diff', async () => {
    mockClient.getVisualGraphDiff.mockResolvedValue({ projectId: 'p1', nodes: [], edges: [] })

    await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L2', 'dept-1')

    expect(mockClient.getVisualGraphDiff).toHaveBeenCalledWith(
      'p1', 'rel-1', 'rel-2', 'L2', 'dept-1', undefined,
    )
  })

  it('should pass all query params to visual diff', async () => {
    mockClient.getVisualGraphDiff.mockResolvedValue({ projectId: 'p1', nodes: [], edges: [] })

    await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L3', 'wf-1', 'workflows,contracts')

    expect(mockClient.getVisualGraphDiff).toHaveBeenCalledWith(
      'p1', 'rel-1', 'rel-2', 'L3', 'wf-1', 'workflows,contracts',
    )
  })

  it('should return diff with nodes, edges and summary', async () => {
    const diff = {
      projectId: 'p1',
      scope: { level: 'company', entityId: null, entityType: null },
      zoomLevel: 'L1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
      nodes: [
        { id: 'dept:d1', nodeType: 'department', label: 'Engineering', diffStatus: 'added' },
        { id: 'dept:d2', nodeType: 'department', label: 'Marketing', diffStatus: 'removed' },
      ],
      edges: [
        { id: 'contains:company:p1→dept:d1', edgeType: 'contains', diffStatus: 'added' },
      ],
      activeLayers: ['structure'],
      breadcrumb: [{ label: 'Company', level: 'company', entityId: null }],
      summary: {
        nodesAdded: 1, nodesRemoved: 1, nodesModified: 0, nodesUnchanged: 0,
        edgesAdded: 1, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 0,
      },
    }
    mockClient.getVisualGraphDiff.mockResolvedValue(diff)

    const response = await controller.getVisualDiff('p1', 'rel-1', 'rel-2')

    expect(response).toEqual(diff)
    expect(response.nodes).toHaveLength(2)
    expect(response.edges).toHaveLength(1)
    expect(response.summary.nodesAdded).toBe(1)
    expect(response.summary.nodesRemoved).toBe(1)
  })

  it('should return diff with modified nodes including changes', async () => {
    const diff = {
      projectId: 'p1',
      scope: { level: 'company', entityId: null, entityType: null },
      zoomLevel: 'L1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
      nodes: [
        {
          id: 'dept:d1',
          nodeType: 'department',
          label: 'Engineering',
          diffStatus: 'modified',
          changes: { sublabel: { before: 'Old mandate', after: 'New mandate' } },
        },
      ],
      edges: [],
      activeLayers: ['structure'],
      breadcrumb: [],
      summary: {
        nodesAdded: 0, nodesRemoved: 0, nodesModified: 1, nodesUnchanged: 0,
        edgesAdded: 0, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 0,
      },
    }
    mockClient.getVisualGraphDiff.mockResolvedValue(diff)

    const response = await controller.getVisualDiff('p1', 'rel-1', 'rel-2')

    const node = response.nodes[0]!
    expect(node.diffStatus).toBe('modified')
    expect(node.changes).toEqual({
      sublabel: { before: 'Old mandate', after: 'New mandate' },
    })
  })
})
