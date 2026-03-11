import { describe, it, expect } from 'vitest'
import type {
  VisualNodeDiffDto,
  VisualEdgeDiffDto,
  VisualGraphDiffDto,
} from '@the-crew/shared-types'
import {
  diffNodeToFlowNode,
  diffEdgeToFlowEdge,
  layoutDiffGraph,
} from '../lib/graph-to-flow'

function makeDiffNode(overrides: Partial<VisualNodeDiffDto>): VisualNodeDiffDto {
  return {
    id: 'dept:d1',
    nodeType: 'department',
    entityId: 'd1',
    label: 'Engineering',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    diffStatus: 'unchanged',
    ...overrides,
  }
}

function makeDiffEdge(overrides: Partial<VisualEdgeDiffDto>): VisualEdgeDiffDto {
  return {
    id: 'reports_to:dept:d1→dept:d2',
    edgeType: 'reports_to',
    sourceId: 'dept:d1',
    targetId: 'dept:d2',
    label: null,
    style: 'solid',
    layerIds: ['organization'],
    diffStatus: 'unchanged',
    ...overrides,
  }
}

function makeDiffGraph(overrides: Partial<VisualGraphDiffDto>): VisualGraphDiffDto {
  return {
    projectId: 'p1',
    scopeType: 'company',
    scope: { level: 'L1', entityId: null, entityType: null },
    zoomLevel: 'L1',
    baseReleaseId: 'rel-1',
    compareReleaseId: 'rel-2',
    nodes: [],
    edges: [],
    activeLayers: ['organization'],
    breadcrumb: [],
    summary: {
      nodesAdded: 0,
      nodesRemoved: 0,
      nodesModified: 0,
      nodesUnchanged: 0,
      edgesAdded: 0,
      edgesRemoved: 0,
      edgesModified: 0,
      edgesUnchanged: 0,
    },
    ...overrides,
  }
}

describe('diffNodeToFlowNode', () => {
  it('should include diffStatus and diffBadge in data for added node', () => {
    const node = makeDiffNode({ diffStatus: 'added' })
    const result = diffNodeToFlowNode(node, { x: 0, y: 0 })

    expect(result.data.diffStatus).toBe('added')
    expect(result.data.diffBadge).toBe('+')
    expect(result.data.diffBorderClass).toContain('green-500')
    expect(result.data.diffBgClass).toContain('green-50')
  })

  it('should set removed node with dashed border and opacity', () => {
    const node = makeDiffNode({ diffStatus: 'removed' })
    const result = diffNodeToFlowNode(node, { x: 0, y: 0 })

    expect(result.data.diffStatus).toBe('removed')
    expect(result.data.diffBadge).toBe('−')
    expect(result.data.diffBorderClass).toContain('red-500')
    expect(result.data.diffBorderClass).toContain('border-dashed')
    expect(result.data.diffOpacityClass).toContain('opacity-70')
  })

  it('should set modified node with amber styling', () => {
    const node = makeDiffNode({ diffStatus: 'modified' })
    const result = diffNodeToFlowNode(node, { x: 0, y: 0 })

    expect(result.data.diffStatus).toBe('modified')
    expect(result.data.diffBadge).toBe('~')
    expect(result.data.diffBorderClass).toContain('amber-500')
    expect(result.data.diffBgClass).toContain('amber-50')
  })

  it('should set unchanged node with dimmed styling and no badge', () => {
    const node = makeDiffNode({ diffStatus: 'unchanged' })
    const result = diffNodeToFlowNode(node, { x: 0, y: 0 })

    expect(result.data.diffStatus).toBe('unchanged')
    expect(result.data.diffBadge).toBeNull()
    expect(result.data.diffBorderClass).toContain('gray-200')
    expect(result.data.diffOpacityClass).toContain('opacity-50')
  })

  it('should pass through changes field for modified nodes', () => {
    const changes = { sublabel: { before: 'Old', after: 'New' } }
    const node = makeDiffNode({ diffStatus: 'modified', changes })
    const result = diffNodeToFlowNode(node, { x: 0, y: 0 })

    expect(result.data.changes).toEqual(changes)
  })

  it('should use node position when available', () => {
    const node = makeDiffNode({ position: { x: 50, y: 75 } })
    const result = diffNodeToFlowNode(node, { x: 999, y: 999 })

    expect(result.position).toEqual({ x: 50, y: 75 })
  })

  it('should use given position when node has no position', () => {
    const node = makeDiffNode({ position: null })
    const result = diffNodeToFlowNode(node, { x: 100, y: 200 })

    expect(result.position).toEqual({ x: 100, y: 200 })
  })
})

describe('diffEdgeToFlowEdge', () => {
  it('should render added edge with green color and label prefix', () => {
    const edge = makeDiffEdge({ diffStatus: 'added', edgeType: 'owns' })
    const result = diffEdgeToFlowEdge(edge)

    expect(result.style!.stroke).toBe('#22c55e')
    expect(result.style!.opacity).toBe(1.0)
    expect(result.label).toBe('+ owns')
    expect(result.data!.diffStatus).toBe('added')
  })

  it('should render removed edge with red dashed style and reduced opacity', () => {
    const edge = makeDiffEdge({ diffStatus: 'removed' })
    const result = diffEdgeToFlowEdge(edge)

    expect(result.style!.stroke).toBe('#ef4444')
    expect(result.style!.opacity).toBe(0.5)
    expect(result.style!.strokeDasharray).toBe('8 4')
    expect(result.label).toContain('−')
  })

  it('should render modified edge with amber color', () => {
    const edge = makeDiffEdge({ diffStatus: 'modified' })
    const result = diffEdgeToFlowEdge(edge)

    expect(result.style!.stroke).toBe('#f59e0b')
    expect(result.style!.opacity).toBe(1.0)
    expect(result.label).toContain('~')
  })

  it('should render unchanged edge with gray and low opacity, no label', () => {
    const edge = makeDiffEdge({ diffStatus: 'unchanged' })
    const result = diffEdgeToFlowEdge(edge)

    expect(result.style!.stroke).toBe('#d1d5db')
    expect(result.style!.opacity).toBe(0.3)
    expect(result.label).toBeUndefined()
  })

  it('should set source and target from edge DTO', () => {
    const edge = makeDiffEdge({ sourceId: 'dept:a', targetId: 'dept:b' })
    const result = diffEdgeToFlowEdge(edge)

    expect(result.source).toBe('dept:a')
    expect(result.target).toBe('dept:b')
  })
})

describe('layoutDiffGraph', () => {
  it('should layout compare nodes with standard algorithm', () => {
    const diff = makeDiffGraph({
      nodes: [
        makeDiffNode({ id: 'company:p1', nodeType: 'company', diffStatus: 'unchanged' }),
        makeDiffNode({ id: 'dept:d1', nodeType: 'department', diffStatus: 'modified', parentId: 'company:p1' }),
        makeDiffNode({ id: 'dept:d2', nodeType: 'department', diffStatus: 'added', parentId: 'company:p1' }),
      ],
      edges: [],
    })

    const result = layoutDiffGraph(diff)

    expect(result.nodes).toHaveLength(3)
    // All nodes should have diff data
    expect(result.nodes.every((n) => n.data.diffStatus)).toBe(true)
  })

  it('should place removed nodes at the bottom or near their former parent', () => {
    const diff = makeDiffGraph({
      nodes: [
        makeDiffNode({ id: 'company:p1', nodeType: 'company', diffStatus: 'unchanged' }),
        makeDiffNode({ id: 'dept:d1', nodeType: 'department', diffStatus: 'unchanged', parentId: 'company:p1' }),
        makeDiffNode({ id: 'dept:removed', nodeType: 'department', diffStatus: 'removed', parentId: 'company:p1' }),
      ],
      edges: [],
    })

    const result = layoutDiffGraph(diff)

    expect(result.nodes).toHaveLength(3)
    const removedNode = result.nodes.find((n) => n.id === 'dept:removed')!
    expect(removedNode.data.diffStatus).toBe('removed')
    // Removed node should be positioned (not at origin since parent exists)
    expect(removedNode.position).toBeDefined()
  })

  it('should handle diff with only removed nodes', () => {
    const diff = makeDiffGraph({
      nodes: [
        makeDiffNode({ id: 'dept:r1', nodeType: 'department', diffStatus: 'removed' }),
        makeDiffNode({ id: 'dept:r2', nodeType: 'department', diffStatus: 'removed' }),
      ],
      edges: [],
    })

    const result = layoutDiffGraph(diff)

    expect(result.nodes).toHaveLength(2)
    expect(result.nodes.every((n) => n.data.diffStatus === 'removed')).toBe(true)
  })

  it('should convert diff edges with diff styling', () => {
    const diff = makeDiffGraph({
      nodes: [
        makeDiffNode({ id: 'dept:d1', nodeType: 'department', diffStatus: 'unchanged' }),
        makeDiffNode({ id: 'dept:d2', nodeType: 'department', diffStatus: 'unchanged' }),
      ],
      edges: [
        makeDiffEdge({ id: 'e1', diffStatus: 'added', sourceId: 'dept:d1', targetId: 'dept:d2' }),
        makeDiffEdge({ id: 'e2', diffStatus: 'removed', sourceId: 'dept:d1', targetId: 'dept:d2' }),
      ],
    })

    const result = layoutDiffGraph(diff)

    expect(result.edges).toHaveLength(2)
    expect(result.edges[0]!.style!.stroke).toBe('#22c55e')
    expect(result.edges[1]!.style!.stroke).toBe('#ef4444')
  })

  it('should handle empty diff graph', () => {
    const diff = makeDiffGraph({ nodes: [], edges: [] })
    const result = layoutDiffGraph(diff)

    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it('should use L2 layout for department-scoped diff', () => {
    const diff = makeDiffGraph({
      scopeType: 'department',
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeDiffNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', diffStatus: 'unchanged' }),
        makeDiffNode({ id: 'role:r1', nodeType: 'role', entityId: 'r1', diffStatus: 'added', parentId: 'dept:d1' }),
      ],
      edges: [],
    })

    const result = layoutDiffGraph(diff)

    expect(result.nodes).toHaveLength(2)
    const dept = result.nodes.find((n) => n.id === 'dept:d1')!
    const role = result.nodes.find((n) => n.id === 'role:r1')!
    expect(dept.position.y).toBeLessThan(role.position.y)
  })

  it('should use L3 layout for workflow-scoped diff', () => {
    const diff = makeDiffGraph({
      zoomLevel: 'L3',
      scope: { level: 'L3', entityId: 'wf1', entityType: 'workflow' },
      nodes: [
        makeDiffNode({ id: 'wf:wf1', nodeType: 'workflow', entityId: 'wf1', diffStatus: 'unchanged' }),
        makeDiffNode({ id: 'wf-stage:wf1:1', nodeType: 'workflow-stage', label: 'Build', parentId: 'wf:wf1', diffStatus: 'modified' }),
      ],
      edges: [],
    })

    const result = layoutDiffGraph(diff)

    expect(result.nodes).toHaveLength(2)
  })
})
