import { describe, it, expect } from 'vitest'
import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import {
  parseVisualId,
  getSelectionSummary,
  findNodeInGraph,
  findEdgeInGraph,
  getRelatedEdges,
  getEdgeTypeLabel,
  getNodeTypeLabel,
} from '@/components/visual-shell/inspector/inspector-utils'

describe('parseVisualId', () => {
  it('should parse company visual ID', () => {
    expect(parseVisualId('company:proj-1')).toEqual({
      nodeType: 'company',
      entityId: 'proj-1',
    })
  })

  it('should parse department visual ID', () => {
    expect(parseVisualId('dept:abc')).toEqual({
      nodeType: 'department',
      entityId: 'abc',
    })
  })

  it('should parse role visual ID', () => {
    expect(parseVisualId('role:r1')).toEqual({
      nodeType: 'role',
      entityId: 'r1',
    })
  })

  it('should parse agent-archetype visual ID', () => {
    expect(parseVisualId('archetype:a1')).toEqual({
      nodeType: 'agent-archetype',
      entityId: 'a1',
    })
  })

  it('should parse agent-assignment visual ID', () => {
    expect(parseVisualId('assignment:as1')).toEqual({
      nodeType: 'agent-assignment',
      entityId: 'as1',
    })
  })

  it('should parse capability visual ID', () => {
    expect(parseVisualId('cap:c1')).toEqual({
      nodeType: 'capability',
      entityId: 'c1',
    })
  })

  it('should parse skill visual ID', () => {
    expect(parseVisualId('skill:s1')).toEqual({
      nodeType: 'skill',
      entityId: 's1',
    })
  })

  it('should parse workflow visual ID', () => {
    expect(parseVisualId('wf:w1')).toEqual({
      nodeType: 'workflow',
      entityId: 'w1',
    })
  })

  it('should parse workflow-stage visual ID', () => {
    expect(parseVisualId('wf-stage:w1:0')).toEqual({
      nodeType: 'workflow-stage',
      entityId: 'w1:0',
    })
  })

  it('should parse contract visual ID', () => {
    expect(parseVisualId('contract:ct1')).toEqual({
      nodeType: 'contract',
      entityId: 'ct1',
    })
  })

  it('should parse policy visual ID', () => {
    expect(parseVisualId('policy:p1')).toEqual({
      nodeType: 'policy',
      entityId: 'p1',
    })
  })

  it('should return null for unknown prefix', () => {
    expect(parseVisualId('unknown:x')).toBeNull()
  })

  it('should return null for string without colon', () => {
    expect(parseVisualId('nocolon')).toBeNull()
  })
})

describe('getSelectionSummary', () => {
  it('should return none when nothing selected', () => {
    const result = getSelectionSummary([], [])
    expect(result).toEqual({ type: 'none', count: 0, countByType: {} })
  })

  it('should return single-node for one node selected', () => {
    const result = getSelectionSummary(['dept:abc'], [])
    expect(result).toEqual({
      type: 'single-node',
      count: 1,
      countByType: { department: 1 },
    })
  })

  it('should return single-edge for one edge selected', () => {
    const result = getSelectionSummary([], ['reports_to:dept:a→dept:b'])
    expect(result).toEqual({
      type: 'single-edge',
      count: 1,
      countByType: { edge: 1 },
    })
  })

  it('should return multi for multiple nodes', () => {
    const result = getSelectionSummary(['dept:a', 'dept:b', 'role:r1'], [])
    expect(result).toEqual({
      type: 'multi',
      count: 3,
      countByType: { department: 2, role: 1 },
    })
  })

  it('should return multi for nodes and edges combined', () => {
    const result = getSelectionSummary(['dept:a'], ['e1'])
    expect(result).toEqual({
      type: 'multi',
      count: 2,
      countByType: { department: 1, edge: 1 },
    })
  })

  it('should handle unknown visual ID prefixes as unknown', () => {
    const result = getSelectionSummary(['bad-id'], [])
    expect(result).toEqual({
      type: 'single-node',
      count: 1,
      countByType: { unknown: 1 },
    })
  })
})

const testNode: VisualNodeDto = {
  id: 'dept:abc',
  nodeType: 'department',
  entityId: 'abc',
  label: 'Marketing',
  sublabel: 'Drive growth',
  position: null,
  collapsed: false,
  status: 'normal',
  layerIds: ['organization'],
  parentId: 'company:proj-1',
}

const testEdge: VisualEdgeDto = {
  id: 'reports_to:dept:abc→dept:xyz',
  edgeType: 'reports_to',
  sourceId: 'dept:abc',
  targetId: 'dept:xyz',
  label: null,
  style: 'solid',
  layerIds: ['organization'],
}

describe('findNodeInGraph', () => {
  it('should find a node by visual ID', () => {
    expect(findNodeInGraph('dept:abc', [testNode])).toBe(testNode)
  })

  it('should return undefined for missing node', () => {
    expect(findNodeInGraph('dept:missing', [testNode])).toBeUndefined()
  })
})

describe('findEdgeInGraph', () => {
  it('should find an edge by visual ID', () => {
    expect(findEdgeInGraph('reports_to:dept:abc→dept:xyz', [testEdge])).toBe(testEdge)
  })

  it('should return undefined for missing edge', () => {
    expect(findEdgeInGraph('missing', [testEdge])).toBeUndefined()
  })
})

describe('getRelatedEdges', () => {
  it('should find edges where node is source', () => {
    const result = getRelatedEdges('dept:abc', [testEdge])
    expect(result).toEqual([testEdge])
  })

  it('should find edges where node is target', () => {
    const result = getRelatedEdges('dept:xyz', [testEdge])
    expect(result).toEqual([testEdge])
  })

  it('should return empty for unrelated node', () => {
    const result = getRelatedEdges('dept:other', [testEdge])
    expect(result).toEqual([])
  })
})

describe('getEdgeTypeLabel', () => {
  it('should return human-readable label for reports_to', () => {
    expect(getEdgeTypeLabel('reports_to')).toBe('Reports To')
  })

  it('should return human-readable label for assigned_to', () => {
    expect(getEdgeTypeLabel('assigned_to')).toBe('Assigned To')
  })

  it('should return human-readable label for governs', () => {
    expect(getEdgeTypeLabel('governs')).toBe('Governs')
  })
})

describe('getNodeTypeLabel', () => {
  it('should return human-readable label for department', () => {
    expect(getNodeTypeLabel('department')).toBe('Department')
  })

  it('should return human-readable label for agent-archetype', () => {
    expect(getNodeTypeLabel('agent-archetype')).toBe('Agent Archetype')
  })

  it('should return human-readable label for workflow-stage', () => {
    expect(getNodeTypeLabel('workflow-stage')).toBe('Workflow Stage')
  })
})
