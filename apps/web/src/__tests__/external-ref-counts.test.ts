import { describe, it, expect } from 'vitest'
import type { VisualEdgeDto } from '@the-crew/shared-types'
import type { Node } from '@xyflow/react'
import { enrichWithExternalRefCounts } from '@/lib/graph-to-flow'

function makeFlowNode(id: string): Node {
  return {
    id,
    position: { x: 0, y: 0 },
    data: { nodeType: 'department', label: id },
  }
}

function makeEdge(sourceId: string, targetId: string, edgeType = 'owns'): VisualEdgeDto {
  return {
    id: `${edgeType}:${sourceId}→${targetId}`,
    edgeType: edgeType as VisualEdgeDto['edgeType'],
    sourceId,
    targetId,
    label: null,
    style: 'solid',
    layerIds: ['organization'],
  }
}

describe('enrichWithExternalRefCounts', () => {
  it('returns graph unchanged when no edges', () => {
    const graph = { nodes: [makeFlowNode('dept:a')], edges: [] }
    const result = enrichWithExternalRefCounts(graph, [], new Set(['dept:a']))
    expect(result).toBe(graph)
  })

  it('returns graph unchanged when all edges are internal', () => {
    const graph = {
      nodes: [makeFlowNode('dept:a'), makeFlowNode('dept:b')],
      edges: [],
    }
    const allEdges = [makeEdge('dept:a', 'dept:b')]
    const result = enrichWithExternalRefCounts(graph, allEdges, new Set(['dept:a', 'dept:b']))
    expect(result).toBe(graph)
  })

  it('counts source-side external refs', () => {
    const graph = {
      nodes: [makeFlowNode('dept:a')],
      edges: [],
    }
    const allEdges = [makeEdge('dept:a', 'dept:external')]
    const result = enrichWithExternalRefCounts(graph, allEdges, new Set(['dept:a']))
    const node = result.nodes[0]!
    expect(node.data.externalRefCount).toBe(1)
  })

  it('counts target-side external refs', () => {
    const graph = {
      nodes: [makeFlowNode('dept:b')],
      edges: [],
    }
    const allEdges = [makeEdge('dept:external', 'dept:b')]
    const result = enrichWithExternalRefCounts(graph, allEdges, new Set(['dept:b']))
    const node = result.nodes[0]!
    expect(node.data.externalRefCount).toBe(1)
  })

  it('accumulates multiple external refs on same node', () => {
    const graph = {
      nodes: [makeFlowNode('dept:a')],
      edges: [],
    }
    const allEdges = [
      makeEdge('dept:a', 'dept:ext1'),
      makeEdge('dept:ext2', 'dept:a', 'consumes'),
      makeEdge('dept:a', 'dept:ext3', 'provides'),
    ]
    const result = enrichWithExternalRefCounts(graph, allEdges, new Set(['dept:a']))
    const node = result.nodes[0]!
    expect(node.data.externalRefCount).toBe(3)
  })

  it('does not count edges where both endpoints are external', () => {
    const graph = {
      nodes: [makeFlowNode('dept:a')],
      edges: [],
    }
    const allEdges = [makeEdge('dept:ext1', 'dept:ext2')]
    const result = enrichWithExternalRefCounts(graph, allEdges, new Set(['dept:a']))
    expect(result).toBe(graph) // unchanged — no counts
  })

  it('does not set externalRefCount on nodes with no external refs', () => {
    const graph = {
      nodes: [makeFlowNode('dept:a'), makeFlowNode('dept:b')],
      edges: [],
    }
    const allEdges = [makeEdge('dept:a', 'dept:external')]
    const result = enrichWithExternalRefCounts(graph, allEdges, new Set(['dept:a', 'dept:b']))
    const nodeB = result.nodes.find((n) => n.id === 'dept:b')!
    expect(nodeB.data.externalRefCount).toBeUndefined()
  })
})
