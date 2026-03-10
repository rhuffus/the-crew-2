import { describe, it, expect } from 'vitest'
import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import { applyCollapse, getContainerNodeIds, enrichWithCollapseState } from '@/lib/collapse-filter'

function makeNode(
  id: string,
  nodeType: VisualNodeDto['nodeType'] = 'department',
  parentId: string | null = null,
): VisualNodeDto {
  return {
    id,
    nodeType,
    entityId: id.split(':')[1] ?? id,
    label: id,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId,
  }
}

function makeEdge(id: string, sourceId: string, targetId: string): VisualEdgeDto {
  return {
    id,
    edgeType: 'owns',
    sourceId,
    targetId,
    label: null,
    style: 'solid',
    layerIds: ['organization'],
  }
}

describe('getContainerNodeIds', () => {
  it('should return empty set for no nodes', () => {
    expect(getContainerNodeIds([])).toEqual(new Set())
  })

  it('should return parent IDs of nodes with parentId', () => {
    const nodes = [
      makeNode('company:c1', 'company'),
      makeNode('department:d1', 'department', 'company:c1'),
      makeNode('department:d2', 'department', 'company:c1'),
    ]
    const containers = getContainerNodeIds(nodes)
    expect(containers).toEqual(new Set(['company:c1']))
  })

  it('should return multiple parent IDs', () => {
    const nodes = [
      makeNode('company:c1', 'company'),
      makeNode('department:d1', 'department', 'company:c1'),
      makeNode('role:r1', 'role', 'department:d1'),
    ]
    const containers = getContainerNodeIds(nodes)
    expect(containers).toEqual(new Set(['company:c1', 'department:d1']))
  })

  it('should not include leaf nodes', () => {
    const nodes = [
      makeNode('department:d1', 'department'),
      makeNode('role:r1', 'role'),
    ]
    const containers = getContainerNodeIds(nodes)
    expect(containers).toEqual(new Set())
  })
})

describe('applyCollapse', () => {
  it('should return input unchanged when no collapsed IDs', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('e1', 'a', 'b')]
    const result = applyCollapse(nodes, edges, [])
    expect(result.nodes).toBe(nodes)
    expect(result.edges).toBe(edges)
    expect(result.hiddenCounts.size).toBe(0)
  })

  it('should remove direct children of collapsed container', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
      makeNode('role:r2', 'role', 'dept:d1'),
    ]
    const result = applyCollapse(nodes, [], ['dept:d1'])
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]!.id).toBe('dept:d1')
    expect(result.hiddenCounts.get('dept:d1')).toBe(2)
  })

  it('should remove grandchildren recursively', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
      makeNode('skill:s1', 'skill', 'role:r1'),
    ]
    const result = applyCollapse(nodes, [], ['dept:d1'])
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]!.id).toBe('dept:d1')
    expect(result.hiddenCounts.get('dept:d1')).toBe(2)
  })

  it('should not remove the collapsed container itself', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
    ]
    const result = applyCollapse(nodes, [], ['dept:d1'])
    expect(result.nodes.find((n) => n.id === 'dept:d1')).toBeDefined()
  })

  it('should remove edges to hidden nodes', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
      makeNode('cap:c1', 'capability'),
    ]
    const edges = [
      makeEdge('e1', 'dept:d1', 'role:r1'),
      makeEdge('e2', 'role:r1', 'cap:c1'),
      makeEdge('e3', 'dept:d1', 'cap:c1'),
    ]
    const result = applyCollapse(nodes, edges, ['dept:d1'])
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]!.id).toBe('e3')
  })

  it('should remove edges from hidden nodes', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
    ]
    const edges = [makeEdge('e1', 'role:r1', 'dept:d1')]
    const result = applyCollapse(nodes, edges, ['dept:d1'])
    expect(result.edges).toHaveLength(0)
  })

  it('should keep edges between visible nodes', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('dept:d2', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
    ]
    const edges = [makeEdge('e1', 'dept:d1', 'dept:d2')]
    const result = applyCollapse(nodes, edges, ['dept:d1'])
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]!.id).toBe('e1')
  })

  it('should handle multiple collapsed containers', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
      makeNode('dept:d2', 'department'),
      makeNode('role:r2', 'role', 'dept:d2'),
    ]
    const result = applyCollapse(nodes, [], ['dept:d1', 'dept:d2'])
    expect(result.nodes).toHaveLength(2)
    expect(result.hiddenCounts.get('dept:d1')).toBe(1)
    expect(result.hiddenCounts.get('dept:d2')).toBe(1)
  })

  it('should ignore collapsed IDs not in node set', () => {
    const nodes = [makeNode('dept:d1', 'department')]
    const result = applyCollapse(nodes, [], ['nonexistent'])
    expect(result.nodes).toHaveLength(1)
    expect(result.hiddenCounts.size).toBe(0)
  })

  it('should handle empty inputs', () => {
    const result = applyCollapse([], [], ['dept:d1'])
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
    expect(result.hiddenCounts.size).toBe(0)
  })

  it('should handle nested collapsed containers', () => {
    const nodes = [
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role', 'dept:d1'),
      makeNode('skill:s1', 'skill', 'role:r1'),
    ]
    // Both dept and role are collapsed
    const result = applyCollapse(nodes, [], ['dept:d1', 'role:r1'])
    expect(result.nodes).toHaveLength(1)
    // dept:d1 hides both role:r1 and skill:s1
    expect(result.hiddenCounts.get('dept:d1')).toBe(2)
    // role:r1 is already hidden by dept:d1, so its count is 0
    expect(result.hiddenCounts.has('role:r1')).toBe(false)
  })

  it('should return correct hidden count for container with no children', () => {
    const nodes = [makeNode('dept:d1', 'department')]
    const result = applyCollapse(nodes, [], ['dept:d1'])
    expect(result.nodes).toHaveLength(1)
    expect(result.hiddenCounts.has('dept:d1')).toBe(false)
  })
})

describe('enrichWithCollapseState', () => {
  it('should add isContainer, isCollapsed, hiddenChildCount to nodes', () => {
    const flowNodes = [
      { id: 'dept:d1', data: { label: 'Dept' } },
      { id: 'role:r1', data: { label: 'Role' } },
    ]
    const containerIds = new Set(['dept:d1'])
    const collapsedIds = ['dept:d1']
    const hiddenCounts = new Map([['dept:d1', 3]])

    const result = enrichWithCollapseState(flowNodes, containerIds, collapsedIds, hiddenCounts)
    const d0 = result[0]!.data as Record<string, unknown>
    const d1 = result[1]!.data as Record<string, unknown>
    expect(d0.isContainer).toBe(true)
    expect(d0.isCollapsed).toBe(true)
    expect(d0.hiddenChildCount).toBe(3)
    expect(d1.isContainer).toBe(false)
    expect(d1.isCollapsed).toBe(false)
    expect(d1.hiddenChildCount).toBe(0)
  })

  it('should handle empty inputs', () => {
    const result = enrichWithCollapseState([], new Set(), [], new Map())
    expect(result).toEqual([])
  })

  it('should mark container as not collapsed when not in collapsedIds', () => {
    const flowNodes = [{ id: 'dept:d1', data: { label: 'Dept' } }]
    const containerIds = new Set(['dept:d1'])
    const result = enrichWithCollapseState(flowNodes, containerIds, [], new Map())
    const d = result[0]!.data as Record<string, unknown>
    expect(d.isContainer).toBe(true)
    expect(d.isCollapsed).toBe(false)
    expect(d.hiddenChildCount).toBe(0)
  })
})
