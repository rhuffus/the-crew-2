import { describe, it, expect } from 'vitest'
import type { VisualNodeDto, VisualEdgeDto, LayerId } from '@the-crew/shared-types'
import {
  filterNodesByLayers,
  filterEdgesByLayers,
  filterNodesByType,
  filterNodesByStatus,
  filterGraph,
} from '@/lib/graph-filter'

function makeNode(
  id: string,
  opts: Partial<VisualNodeDto> = {},
): VisualNodeDto {
  return {
    id,
    nodeType: 'department',
    entityId: id,
    label: id,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...opts,
  }
}

function makeEdge(
  id: string,
  sourceId: string,
  targetId: string,
  opts: Partial<VisualEdgeDto> = {},
): VisualEdgeDto {
  return {
    id,
    edgeType: 'reports_to',
    sourceId,
    targetId,
    label: null,
    style: 'solid',
    layerIds: ['organization'],
    ...opts,
  }
}

describe('filterNodesByLayers', () => {
  it('should return nodes whose layerIds intersect activeLayers', () => {
    const nodes = [
      makeNode('n1', { layerIds: ['organization'] }),
      makeNode('n2', { layerIds: ['capabilities'] }),
      makeNode('n3', { layerIds: ['organization', 'capabilities'] }),
    ]
    const result = filterNodesByLayers(nodes, ['organization'])
    expect(result.map((n) => n.id)).toEqual(['n1', 'n3'])
  })

  it('should return empty for empty activeLayers', () => {
    const nodes = [makeNode('n1')]
    expect(filterNodesByLayers(nodes, [])).toEqual([])
  })

  it('should return all nodes when all layers active', () => {
    const nodes = [
      makeNode('n1', { layerIds: ['organization'] }),
      makeNode('n2', { layerIds: ['capabilities'] }),
    ]
    const result = filterNodesByLayers(nodes, ['organization', 'capabilities'])
    expect(result).toHaveLength(2)
  })

  it('should handle nodes with multiple layers', () => {
    const nodes = [
      makeNode('n1', { layerIds: ['workflows', 'contracts'] }),
    ]
    const result = filterNodesByLayers(nodes, ['contracts'])
    expect(result).toHaveLength(1)
  })
})

describe('filterEdgesByLayers', () => {
  it('should return edges where both endpoints visible and layer matches', () => {
    const edges = [
      makeEdge('e1', 'n1', 'n2', { layerIds: ['organization'] }),
      makeEdge('e2', 'n1', 'n3', { layerIds: ['capabilities'] }),
    ]
    const visible = new Set(['n1', 'n2'])
    const result = filterEdgesByLayers(edges, ['organization'], visible)
    expect(result.map((e) => e.id)).toEqual(['e1'])
  })

  it('should exclude edges with invisible source', () => {
    const edges = [makeEdge('e1', 'n1', 'n2')]
    const visible = new Set(['n2'])
    expect(filterEdgesByLayers(edges, ['organization'], visible)).toEqual([])
  })

  it('should exclude edges with invisible target', () => {
    const edges = [makeEdge('e1', 'n1', 'n2')]
    const visible = new Set(['n1'])
    expect(filterEdgesByLayers(edges, ['organization'], visible)).toEqual([])
  })

  it('should exclude edges whose layer is not active', () => {
    const edges = [makeEdge('e1', 'n1', 'n2', { layerIds: ['governance'] })]
    const visible = new Set(['n1', 'n2'])
    expect(filterEdgesByLayers(edges, ['organization'], visible)).toEqual([])
  })

  it('should return empty for empty activeLayers', () => {
    const edges = [makeEdge('e1', 'n1', 'n2')]
    expect(filterEdgesByLayers(edges, [], new Set(['n1', 'n2']))).toEqual([])
  })
})

describe('filterNodesByType', () => {
  it('should return all when filter is null', () => {
    const nodes = [makeNode('n1'), makeNode('n2', { nodeType: 'role' })]
    expect(filterNodesByType(nodes, null)).toHaveLength(2)
  })

  it('should return all when filter is empty array', () => {
    const nodes = [makeNode('n1')]
    expect(filterNodesByType(nodes, [])).toHaveLength(1)
  })

  it('should filter by specific type', () => {
    const nodes = [
      makeNode('n1', { nodeType: 'department' }),
      makeNode('n2', { nodeType: 'role' }),
      makeNode('n3', { nodeType: 'capability' }),
    ]
    const result = filterNodesByType(nodes, ['role'])
    expect(result.map((n) => n.id)).toEqual(['n2'])
  })

  it('should filter by multiple types', () => {
    const nodes = [
      makeNode('n1', { nodeType: 'department' }),
      makeNode('n2', { nodeType: 'role' }),
      makeNode('n3', { nodeType: 'capability' }),
    ]
    const result = filterNodesByType(nodes, ['role', 'capability'])
    expect(result.map((n) => n.id)).toEqual(['n2', 'n3'])
  })
})

describe('filterNodesByStatus', () => {
  it('should return all when filter is null', () => {
    const nodes = [makeNode('n1'), makeNode('n2', { status: 'error' })]
    expect(filterNodesByStatus(nodes, null)).toHaveLength(2)
  })

  it('should filter by status', () => {
    const nodes = [
      makeNode('n1', { status: 'normal' }),
      makeNode('n2', { status: 'warning' }),
      makeNode('n3', { status: 'error' }),
    ]
    const result = filterNodesByStatus(nodes, ['error'])
    expect(result.map((n) => n.id)).toEqual(['n3'])
  })

  it('should filter by multiple statuses', () => {
    const nodes = [
      makeNode('n1', { status: 'normal' }),
      makeNode('n2', { status: 'warning' }),
      makeNode('n3', { status: 'error' }),
    ]
    const result = filterNodesByStatus(nodes, ['warning', 'error'])
    expect(result.map((n) => n.id)).toEqual(['n2', 'n3'])
  })
})

describe('filterGraph (composite)', () => {
  it('should apply layers, type, and status filters together', () => {
    const nodes = [
      makeNode('n1', { nodeType: 'department', status: 'normal', layerIds: ['organization'] }),
      makeNode('n2', { nodeType: 'capability', status: 'error', layerIds: ['capabilities'] }),
      makeNode('n3', { nodeType: 'role', status: 'normal', layerIds: ['organization'] }),
      makeNode('n4', { nodeType: 'policy', status: 'warning', layerIds: ['governance'] }),
    ]
    const edges = [
      makeEdge('e1', 'n1', 'n3', { layerIds: ['organization'] }),
      makeEdge('e2', 'n2', 'n4', { layerIds: ['governance'] }),
    ]
    const result = filterGraph(nodes, edges, {
      activeLayers: ['organization'] as LayerId[],
      nodeTypeFilter: ['department', 'role'],
      statusFilter: ['normal'],
    })
    expect(result.nodes.map((n) => n.id)).toEqual(['n1', 'n3'])
    expect(result.edges.map((e) => e.id)).toEqual(['e1'])
  })

  it('should return everything with no active filters (except layers)', () => {
    const nodes = [
      makeNode('n1', { layerIds: ['organization'] }),
      makeNode('n2', { layerIds: ['organization'] }),
    ]
    const edges = [makeEdge('e1', 'n1', 'n2')]
    const result = filterGraph(nodes, edges, {
      activeLayers: ['organization'] as LayerId[],
    })
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })

  it('should prune edges when filtering removes one endpoint', () => {
    const nodes = [
      makeNode('n1', { nodeType: 'department', layerIds: ['organization'] }),
      makeNode('n2', { nodeType: 'role', layerIds: ['organization'] }),
    ]
    const edges = [makeEdge('e1', 'n1', 'n2')]
    const result = filterGraph(nodes, edges, {
      activeLayers: ['organization'] as LayerId[],
      nodeTypeFilter: ['department'],
    })
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(0)
  })
})
