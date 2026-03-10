import { describe, it, expect } from 'vitest'
import type {
  VisualNodeDto,
  VisualEdgeDto,
  GraphScope,
  ZoomLevel,
  LayerId,
  BreadcrumbEntry,
} from '@the-crew/shared-types'
import { diffVisualGraphs } from './visual-diff'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(overrides: Partial<VisualNodeDto> & { id: string }): VisualNodeDto {
  return {
    nodeType: 'department',
    entityId: overrides.id,
    label: 'Default',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

function makeEdge(overrides: Partial<VisualEdgeDto> & { id: string }): VisualEdgeDto {
  return {
    edgeType: 'reports_to',
    sourceId: 'dept:a',
    targetId: 'dept:b',
    label: null,
    style: 'solid',
    layerIds: ['organization'],
    ...overrides,
  }
}

const DEFAULT_SCOPE: GraphScope = { level: 'L1', entityId: null, entityType: null }
const DEFAULT_ZOOM: ZoomLevel = 'L1'
const DEFAULT_LAYERS: LayerId[] = ['organization']
const DEFAULT_BREADCRUMB: BreadcrumbEntry[] = []
const PROJECT_ID = 'p1'

function diff(
  baseNodes: VisualNodeDto[],
  baseEdges: VisualEdgeDto[],
  compareNodes: VisualNodeDto[],
  compareEdges: VisualEdgeDto[],
) {
  return diffVisualGraphs(
    { nodes: baseNodes, edges: baseEdges },
    { nodes: compareNodes, edges: compareEdges },
    'rel-base',
    'rel-compare',
    DEFAULT_SCOPE,
    DEFAULT_ZOOM,
    DEFAULT_LAYERS,
    DEFAULT_BREADCRUMB,
    PROJECT_ID,
  )
}

// ===========================================================================
// 1. Empty graphs
// ===========================================================================

describe('diffVisualGraphs — empty graphs', () => {
  it('should return empty diff for two empty graphs', () => {
    const result = diff([], [], [], [])
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
    expect(result.summary).toEqual({
      nodesAdded: 0, nodesRemoved: 0, nodesModified: 0, nodesUnchanged: 0,
      edgesAdded: 0, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 0,
    })
  })

  it('should pass through metadata fields correctly', () => {
    const result = diff([], [], [], [])
    expect(result.projectId).toBe(PROJECT_ID)
    expect(result.baseReleaseId).toBe('rel-base')
    expect(result.compareReleaseId).toBe('rel-compare')
    expect(result.scope).toEqual(DEFAULT_SCOPE)
    expect(result.zoomLevel).toBe(DEFAULT_ZOOM)
    expect(result.activeLayers).toEqual(DEFAULT_LAYERS)
    expect(result.breadcrumb).toEqual(DEFAULT_BREADCRUMB)
  })
})

// ===========================================================================
// 2. Node diff — added
// ===========================================================================

describe('diffVisualGraphs — added nodes', () => {
  it('should mark node as added when only in compare', () => {
    const n = makeNode({ id: 'dept:a', label: 'Marketing' })
    const result = diff([], [], [n], [])
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]!.diffStatus).toBe('added')
    expect(result.nodes[0]!.label).toBe('Marketing')
    expect(result.summary.nodesAdded).toBe(1)
  })

  it('should not include changes field on added nodes', () => {
    const n = makeNode({ id: 'dept:a' })
    const result = diff([], [], [n], [])
    expect(result.nodes[0]!.changes).toBeUndefined()
  })

  it('should handle multiple added nodes', () => {
    const n1 = makeNode({ id: 'dept:a' })
    const n2 = makeNode({ id: 'dept:b' })
    const result = diff([], [], [n1, n2], [])
    expect(result.summary.nodesAdded).toBe(2)
    expect(result.nodes.every(n => n.diffStatus === 'added')).toBe(true)
  })
})

// ===========================================================================
// 3. Node diff — removed
// ===========================================================================

describe('diffVisualGraphs — removed nodes', () => {
  it('should mark node as removed when only in base', () => {
    const n = makeNode({ id: 'dept:a', label: 'Finance' })
    const result = diff([n], [], [], [])
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]!.diffStatus).toBe('removed')
    expect(result.nodes[0]!.label).toBe('Finance')
    expect(result.summary.nodesRemoved).toBe(1)
  })

  it('should preserve all base node properties on removed nodes', () => {
    const n = makeNode({ id: 'dept:a', sublabel: 'Sub', parentId: 'company:p1', layerIds: ['organization'] })
    const result = diff([n], [], [], [])
    expect(result.nodes[0]!.sublabel).toBe('Sub')
    expect(result.nodes[0]!.parentId).toBe('company:p1')
  })
})

// ===========================================================================
// 4. Node diff — unchanged
// ===========================================================================

describe('diffVisualGraphs — unchanged nodes', () => {
  it('should mark identical nodes as unchanged', () => {
    const n = makeNode({ id: 'dept:a', label: 'HR', sublabel: 'People', parentId: 'company:p1' })
    const result = diff([n], [], [n], [])
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]!.diffStatus).toBe('unchanged')
    expect(result.summary.nodesUnchanged).toBe(1)
  })

  it('should not include changes field on unchanged nodes', () => {
    const n = makeNode({ id: 'dept:a' })
    const result = diff([n], [], [n], [])
    expect(result.nodes[0]!.changes).toBeUndefined()
  })

  it('should ignore non-compared fields (position, collapsed, status)', () => {
    const base = makeNode({ id: 'dept:a', status: 'normal', collapsed: false, position: { x: 0, y: 0 } })
    const compare = makeNode({ id: 'dept:a', status: 'error', collapsed: true, position: { x: 100, y: 200 } })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('unchanged')
  })
})

// ===========================================================================
// 5. Node diff — modified
// ===========================================================================

describe('diffVisualGraphs — modified nodes', () => {
  it('should mark node as modified when label changes', () => {
    const base = makeNode({ id: 'dept:a', label: 'Marketing' })
    const compare = makeNode({ id: 'dept:a', label: 'Growth Marketing' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes).toEqual({
      label: { before: 'Marketing', after: 'Growth Marketing' },
    })
    expect(result.summary.nodesModified).toBe(1)
  })

  it('should mark node as modified when sublabel changes', () => {
    const base = makeNode({ id: 'dept:a', sublabel: 'Drive growth' })
    const compare = makeNode({ id: 'dept:a', sublabel: 'Scale operations' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes).toEqual({
      sublabel: { before: 'Drive growth', after: 'Scale operations' },
    })
  })

  it('should mark node as modified when sublabel goes from null to value', () => {
    const base = makeNode({ id: 'dept:a', sublabel: null })
    const compare = makeNode({ id: 'dept:a', sublabel: 'New mandate' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes!['sublabel']).toEqual({ before: null, after: 'New mandate' })
  })

  it('should mark node as modified when parentId changes (re-parented)', () => {
    const base = makeNode({ id: 'dept:a', parentId: 'company:p1' })
    const compare = makeNode({ id: 'dept:a', parentId: 'dept:xyz' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes!['parentId']).toEqual({ before: 'company:p1', after: 'dept:xyz' })
  })

  it('should mark node as modified when layerIds change', () => {
    const base = makeNode({ id: 'dept:a', layerIds: ['organization'] })
    const compare = makeNode({ id: 'dept:a', layerIds: ['organization', 'capabilities'] })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes!['layerIds']).toEqual({
      before: ['organization'],
      after: ['organization', 'capabilities'],
    })
  })

  it('should detect nodeType change as modified (safety check)', () => {
    const base = makeNode({ id: 'dept:a', nodeType: 'department' })
    const compare = makeNode({ id: 'dept:a', nodeType: 'role' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes!['nodeType']).toEqual({ before: 'department', after: 'role' })
  })

  it('should include multiple changed fields in changes object', () => {
    const base = makeNode({ id: 'dept:a', label: 'A', sublabel: 'Old', parentId: 'company:p1' })
    const compare = makeNode({ id: 'dept:a', label: 'B', sublabel: 'New', parentId: 'dept:x' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(Object.keys(result.nodes[0]!.changes!)).toEqual(
      expect.arrayContaining(['label', 'sublabel', 'parentId']),
    )
    expect(Object.keys(result.nodes[0]!.changes!)).toHaveLength(3)
  })

  it('should use compare node data for modified node properties', () => {
    const base = makeNode({ id: 'dept:a', label: 'Old' })
    const compare = makeNode({ id: 'dept:a', label: 'New' })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.label).toBe('New')
  })
})

// ===========================================================================
// 6. Edge diff — added
// ===========================================================================

describe('diffVisualGraphs — added edges', () => {
  it('should mark edge as added when only in compare', () => {
    const e = makeEdge({ id: 'reports_to:dept:a→dept:b' })
    const result = diff([], [], [], [e])
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]!.diffStatus).toBe('added')
    expect(result.summary.edgesAdded).toBe(1)
  })
})

// ===========================================================================
// 7. Edge diff — removed
// ===========================================================================

describe('diffVisualGraphs — removed edges', () => {
  it('should mark edge as removed when only in base', () => {
    const e = makeEdge({ id: 'reports_to:dept:a→dept:b' })
    const result = diff([], [e], [], [])
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]!.diffStatus).toBe('removed')
    expect(result.summary.edgesRemoved).toBe(1)
  })
})

// ===========================================================================
// 8. Edge diff — unchanged
// ===========================================================================

describe('diffVisualGraphs — unchanged edges', () => {
  it('should mark identical edges as unchanged', () => {
    const e = makeEdge({ id: 'reports_to:dept:a→dept:b' })
    const result = diff([], [e], [], [e])
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]!.diffStatus).toBe('unchanged')
    expect(result.summary.edgesUnchanged).toBe(1)
  })
})

// ===========================================================================
// 9. Edge diff — modified
// ===========================================================================

describe('diffVisualGraphs — modified edges', () => {
  it('should mark edge as modified when label changes', () => {
    const base = makeEdge({ id: 'owns:dept:a→cap:b', label: null })
    const compare = makeEdge({ id: 'owns:dept:a→cap:b', label: 'Primary' })
    const result = diff([], [base], [], [compare])
    expect(result.edges[0]!.diffStatus).toBe('modified')
    expect(result.summary.edgesModified).toBe(1)
  })

  it('should mark edge as modified when style changes', () => {
    const base = makeEdge({ id: 'owns:dept:a→cap:b', style: 'solid' })
    const compare = makeEdge({ id: 'owns:dept:a→cap:b', style: 'dashed' })
    const result = diff([], [base], [], [compare])
    expect(result.edges[0]!.diffStatus).toBe('modified')
  })
})

// ===========================================================================
// 10. Mixed scenarios
// ===========================================================================

describe('diffVisualGraphs — mixed scenarios', () => {
  it('should handle a mix of added, removed, modified, and unchanged nodes', () => {
    const unchanged = makeNode({ id: 'dept:a', label: 'Stable' })
    const modBase = makeNode({ id: 'dept:b', label: 'Old' })
    const modCompare = makeNode({ id: 'dept:b', label: 'New' })
    const removed = makeNode({ id: 'dept:c', label: 'Gone' })
    const added = makeNode({ id: 'dept:d', label: 'Fresh' })

    const result = diff(
      [unchanged, modBase, removed], [],
      [unchanged, modCompare, added], [],
    )

    expect(result.summary.nodesUnchanged).toBe(1)
    expect(result.summary.nodesModified).toBe(1)
    expect(result.summary.nodesRemoved).toBe(1)
    expect(result.summary.nodesAdded).toBe(1)
    expect(result.nodes).toHaveLength(4)
  })

  it('should handle a mix of added, removed, and unchanged edges', () => {
    const unchanged = makeEdge({ id: 'reports_to:dept:a→dept:b' })
    const removed = makeEdge({ id: 'reports_to:dept:c→dept:d' })
    const added = makeEdge({ id: 'reports_to:dept:e→dept:f' })

    const result = diff(
      [], [unchanged, removed],
      [], [unchanged, added],
    )

    expect(result.summary.edgesUnchanged).toBe(1)
    expect(result.summary.edgesRemoved).toBe(1)
    expect(result.summary.edgesAdded).toBe(1)
    expect(result.edges).toHaveLength(3)
  })

  it('should independently diff nodes and edges', () => {
    const node = makeNode({ id: 'dept:a' })
    const edge = makeEdge({ id: 'reports_to:dept:a→dept:b' })

    const result = diff([node], [edge], [], [])
    expect(result.summary.nodesRemoved).toBe(1)
    expect(result.summary.edgesRemoved).toBe(1)
    expect(result.summary.nodesAdded).toBe(0)
    expect(result.summary.edgesAdded).toBe(0)
  })
})

// ===========================================================================
// 11. Summary computation
// ===========================================================================

describe('diffVisualGraphs — summary', () => {
  it('should compute correct summary counts for a complex diff', () => {
    const baseNodes = [
      makeNode({ id: 'dept:a' }),          // unchanged
      makeNode({ id: 'dept:b', label: 'X' }), // modified
      makeNode({ id: 'dept:c' }),          // removed
    ]
    const compareNodes = [
      makeNode({ id: 'dept:a' }),          // unchanged
      makeNode({ id: 'dept:b', label: 'Y' }), // modified
      makeNode({ id: 'dept:d' }),          // added
      makeNode({ id: 'dept:e' }),          // added
    ]
    const baseEdges = [
      makeEdge({ id: 'e1' }),
      makeEdge({ id: 'e2' }),
    ]
    const compareEdges = [
      makeEdge({ id: 'e1' }),
      makeEdge({ id: 'e3' }),
    ]

    const result = diff(baseNodes, baseEdges, compareNodes, compareEdges)

    expect(result.summary).toEqual({
      nodesAdded: 2,
      nodesRemoved: 1,
      nodesModified: 1,
      nodesUnchanged: 1,
      edgesAdded: 1,
      edgesRemoved: 1,
      edgesModified: 0,
      edgesUnchanged: 1,
    })
  })
})

// ===========================================================================
// 12. Scope and metadata pass-through
// ===========================================================================

describe('diffVisualGraphs — scope parameters', () => {
  it('should pass through L2 scope with entityId', () => {
    const scope: GraphScope = { level: 'L2', entityId: 'dept-abc', entityType: 'department' }
    const layers: LayerId[] = ['organization', 'capabilities']
    const breadcrumb: BreadcrumbEntry[] = [
      { label: 'Company', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' },
      { label: 'Marketing', nodeType: 'department', entityId: 'dept-abc', zoomLevel: 'L2' },
    ]

    const result = diffVisualGraphs(
      { nodes: [], edges: [] },
      { nodes: [], edges: [] },
      'rel-1', 'rel-2',
      scope, 'L2', layers, breadcrumb, 'proj-1',
    )

    expect(result.scope).toEqual(scope)
    expect(result.zoomLevel).toBe('L2')
    expect(result.activeLayers).toEqual(layers)
    expect(result.breadcrumb).toEqual(breadcrumb)
    expect(result.projectId).toBe('proj-1')
  })

  it('should pass through L3 scope for workflow diff', () => {
    const scope: GraphScope = { level: 'L3', entityId: 'wf-xyz', entityType: 'workflow' }
    const result = diffVisualGraphs(
      { nodes: [], edges: [] },
      { nodes: [], edges: [] },
      'r1', 'r2', scope, 'L3', ['workflows'], [], 'p1',
    )
    expect(result.scope.level).toBe('L3')
    expect(result.scope.entityId).toBe('wf-xyz')
  })
})

// ===========================================================================
// 13. Edge cases
// ===========================================================================

describe('diffVisualGraphs — edge cases', () => {
  it('should handle all nodes added (empty base)', () => {
    const nodes = [makeNode({ id: 'dept:a' }), makeNode({ id: 'dept:b' })]
    const result = diff([], [], nodes, [])
    expect(result.summary.nodesAdded).toBe(2)
    expect(result.summary.nodesRemoved).toBe(0)
    expect(result.nodes.every(n => n.diffStatus === 'added')).toBe(true)
  })

  it('should handle all nodes removed (empty compare)', () => {
    const nodes = [makeNode({ id: 'dept:a' }), makeNode({ id: 'dept:b' })]
    const result = diff(nodes, [], [], [])
    expect(result.summary.nodesRemoved).toBe(2)
    expect(result.summary.nodesAdded).toBe(0)
    expect(result.nodes.every(n => n.diffStatus === 'removed')).toBe(true)
  })

  it('should handle identical large graphs with no changes', () => {
    const nodes = Array.from({ length: 20 }, (_, i) => makeNode({ id: `dept:${i}` }))
    const edges = Array.from({ length: 10 }, (_, i) =>
      makeEdge({ id: `e:${i}`, sourceId: `dept:${i}`, targetId: `dept:${i + 1}` }),
    )
    const result = diff(nodes, edges, nodes, edges)
    expect(result.summary.nodesUnchanged).toBe(20)
    expect(result.summary.edgesUnchanged).toBe(10)
    expect(result.summary.nodesAdded).toBe(0)
    expect(result.summary.nodesRemoved).toBe(0)
    expect(result.summary.nodesModified).toBe(0)
  })

  it('should treat equal layerIds arrays as unchanged', () => {
    const base = makeNode({ id: 'dept:a', layerIds: ['organization', 'capabilities'] })
    const compare = makeNode({ id: 'dept:a', layerIds: ['organization', 'capabilities'] })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('unchanged')
  })

  it('should treat different-order layerIds as modified', () => {
    const base = makeNode({ id: 'dept:a', layerIds: ['organization', 'capabilities'] })
    const compare = makeNode({ id: 'dept:a', layerIds: ['capabilities', 'organization'] })
    const result = diff([base], [], [compare], [])
    expect(result.nodes[0]!.diffStatus).toBe('modified')
    expect(result.nodes[0]!.changes!['layerIds']).toBeDefined()
  })
})
