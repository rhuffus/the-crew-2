import { describe, it, expect } from 'vitest'
import type { VisualGraphDto, VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import type { ValidationIssue } from '@the-crew/shared-types'
import {
  visualNodeToFlowNode,
  visualEdgeToFlowEdge,
  layoutWorkflowGraph,
  layoutDepartmentGraph,
  enrichWithValidationCounts,
  graphToFlow,
} from '../lib/graph-to-flow'

function makeNode(overrides: Partial<VisualNodeDto>): VisualNodeDto {
  return {
    id: 'test-node',
    nodeType: 'department',
    entityId: 'e1',
    label: 'Test',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

function makeEdge(overrides: Partial<VisualEdgeDto>): VisualEdgeDto {
  return {
    id: 'test-edge',
    edgeType: 'reports_to',
    sourceId: 'dept:d1',
    targetId: 'dept:d2',
    label: null,
    style: 'solid',
    layerIds: ['organization'],
    ...overrides,
  }
}

function makeGraph(overrides: Partial<VisualGraphDto>): VisualGraphDto {
  return {
    projectId: 'p1',
    scope: { level: 'L1', entityId: null, entityType: null },
    zoomLevel: 'L1',
    nodes: [],
    edges: [],
    activeLayers: ['organization'],
    breadcrumb: [],
    ...overrides,
  }
}

describe('visualNodeToFlowNode', () => {
  it('should convert VisualNodeDto to React Flow Node with given position', () => {
    const node = makeNode({ id: 'dept:d1', nodeType: 'department', label: 'Engineering' })
    const result = visualNodeToFlowNode(node, { x: 100, y: 200 })

    expect(result.id).toBe('dept:d1')
    expect(result.type).toBe('department')
    expect(result.position).toEqual({ x: 100, y: 200 })
    expect(result.data.label).toBe('Engineering')
    expect(result.data.nodeType).toBe('department')
  })

  it('should use node position when available instead of given position', () => {
    const node = makeNode({ position: { x: 50, y: 75 } })
    const result = visualNodeToFlowNode(node, { x: 999, y: 999 })

    expect(result.position).toEqual({ x: 50, y: 75 })
  })

  it('should include status and sublabel in data', () => {
    const node = makeNode({ status: 'error', sublabel: 'Sub' })
    const result = visualNodeToFlowNode(node, { x: 0, y: 0 })

    expect(result.data.status).toBe('error')
    expect(result.data.sublabel).toBe('Sub')
  })
})

describe('visualEdgeToFlowEdge', () => {
  it('should convert solid edge without dasharray', () => {
    const edge = makeEdge({ id: 'e1', style: 'solid' })
    const result = visualEdgeToFlowEdge(edge)

    expect(result.id).toBe('e1')
    expect(result.source).toBe('dept:d1')
    expect(result.target).toBe('dept:d2')
    expect(result.style).toBeUndefined()
  })

  it('should convert dashed edge with strokeDasharray', () => {
    const edge = makeEdge({ style: 'dashed' })
    const result = visualEdgeToFlowEdge(edge)

    expect(result.style).toEqual({ strokeDasharray: '8 4' })
  })

  it('should convert dotted edge with strokeDasharray', () => {
    const edge = makeEdge({ style: 'dotted' })
    const result = visualEdgeToFlowEdge(edge)

    expect(result.style).toEqual({ strokeDasharray: '2 4' })
  })

  it('should include label when present', () => {
    const edge = makeEdge({ label: 'Review' })
    const result = visualEdgeToFlowEdge(edge)

    expect(result.label).toBe('Review')
  })

  it('should set label to undefined when null', () => {
    const edge = makeEdge({ label: null })
    const result = visualEdgeToFlowEdge(edge)

    expect(result.label).toBeUndefined()
  })
})

describe('layoutWorkflowGraph', () => {
  it('should layout workflow stages horizontally', () => {
    const graph = makeGraph({
      zoomLevel: 'L3',
      scope: { level: 'L3', entityId: 'wf1', entityType: 'workflow' },
      nodes: [
        makeNode({ id: 'wf:wf1', nodeType: 'workflow', label: 'Deploy' }),
        makeNode({ id: 'wf-stage:wf1:1', nodeType: 'workflow-stage', label: 'Build', parentId: 'wf:wf1' }),
        makeNode({ id: 'wf-stage:wf1:2', nodeType: 'workflow-stage', label: 'Test', parentId: 'wf:wf1' }),
        makeNode({ id: 'wf-stage:wf1:3', nodeType: 'workflow-stage', label: 'Deploy', parentId: 'wf:wf1' }),
      ],
      edges: [
        makeEdge({ id: 'ho1', edgeType: 'hands_off_to', sourceId: 'wf-stage:wf1:1', targetId: 'wf-stage:wf1:2', style: 'solid', layerIds: ['workflows'] }),
        makeEdge({ id: 'ho2', edgeType: 'hands_off_to', sourceId: 'wf-stage:wf1:2', targetId: 'wf-stage:wf1:3', style: 'solid', layerIds: ['workflows'] }),
      ],
      activeLayers: ['workflows'],
    })

    const result = layoutWorkflowGraph(graph)

    expect(result.nodes).toHaveLength(4)
    expect(result.edges).toHaveLength(2)

    const stages = result.nodes.filter((n) => n.type === 'workflow-stage')
    expect(stages).toHaveLength(3)

    // Stages should have increasing x positions
    expect(stages[0]!.position.x).toBeLessThan(stages[1]!.position.x)
    expect(stages[1]!.position.x).toBeLessThan(stages[2]!.position.x)

    // All stages at the same y
    expect(stages[0]!.position.y).toBe(stages[1]!.position.y)
  })

  it('should layout participants above stages', () => {
    const graph = makeGraph({
      zoomLevel: 'L3',
      scope: { level: 'L3', entityId: 'wf1', entityType: 'workflow' },
      nodes: [
        makeNode({ id: 'wf:wf1', nodeType: 'workflow', label: 'WF' }),
        makeNode({ id: 'wf-stage:wf1:1', nodeType: 'workflow-stage', label: 'S1', parentId: 'wf:wf1' }),
        makeNode({ id: 'role:r1', nodeType: 'role', label: 'Dev' }),
      ],
      edges: [],
      activeLayers: ['workflows', 'organization'],
    })

    const result = layoutWorkflowGraph(graph)

    const stage = result.nodes.find((n) => n.type === 'workflow-stage')!
    const role = result.nodes.find((n) => n.type === 'role')!

    // Participant should be above stages
    expect(role.position.y).toBeLessThan(stage.position.y)
  })

  it('should layout contracts below stages', () => {
    const graph = makeGraph({
      zoomLevel: 'L3',
      scope: { level: 'L3', entityId: 'wf1', entityType: 'workflow' },
      nodes: [
        makeNode({ id: 'wf:wf1', nodeType: 'workflow', label: 'WF' }),
        makeNode({ id: 'wf-stage:wf1:1', nodeType: 'workflow-stage', label: 'S1', parentId: 'wf:wf1' }),
        makeNode({ id: 'contract:ct1', nodeType: 'contract', label: 'SLA' }),
      ],
      edges: [],
      activeLayers: ['workflows', 'contracts'],
    })

    const result = layoutWorkflowGraph(graph)

    const stage = result.nodes.find((n) => n.type === 'workflow-stage')!
    const contract = result.nodes.find((n) => n.type === 'contract')!

    // Contract should be below stages
    expect(contract.position.y).toBeGreaterThan(stage.position.y)
  })
})

describe('layoutDepartmentGraph', () => {
  it('should layout department as root with children below', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Engineering' }),
        makeNode({ id: 'role:r1', nodeType: 'role', entityId: 'r1', label: 'Tech Lead', parentId: 'dept:d1' }),
        makeNode({ id: 'cap:c1', nodeType: 'capability', entityId: 'c1', label: 'API Design', parentId: 'dept:d1' }),
      ],
      edges: [],
      activeLayers: ['organization', 'capabilities'],
    })

    const result = layoutDepartmentGraph(graph)

    expect(result.nodes).toHaveLength(3)

    const dept = result.nodes.find((n) => n.type === 'department')!
    const role = result.nodes.find((n) => n.type === 'role')!
    const cap = result.nodes.find((n) => n.type === 'capability')!

    // Department should be above children
    expect(dept.position.y).toBeLessThan(role.position.y)
    expect(dept.position.y).toBeLessThan(cap.position.y)

    // Children should be at the same depth
    expect(role.position.y).toBe(cap.position.y)
  })

  it('should place orphan nodes (contracts, policies, skills) below tree', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Eng' }),
        makeNode({ id: 'role:r1', nodeType: 'role', entityId: 'r1', label: 'Dev', parentId: 'dept:d1' }),
        makeNode({ id: 'contract:ct1', nodeType: 'contract', entityId: 'ct1', label: 'SLA', parentId: null }),
        makeNode({ id: 'skill:s1', nodeType: 'skill', entityId: 's1', label: 'Go', parentId: null }),
      ],
      edges: [],
      activeLayers: ['organization', 'capabilities', 'contracts'],
    })

    const result = layoutDepartmentGraph(graph)

    expect(result.nodes).toHaveLength(4)

    const role = result.nodes.find((n) => n.type === 'role')!
    const contract = result.nodes.find((n) => n.type === 'contract')!
    const skill = result.nodes.find((n) => n.type === 'skill')!

    // Orphans should be below tree nodes
    expect(contract.position.y).toBeGreaterThan(role.position.y)
    expect(skill.position.y).toBeGreaterThan(role.position.y)
  })

  it('should handle sub-departments as children', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Engineering' }),
        makeNode({ id: 'dept:d2', nodeType: 'department', entityId: 'd2', label: 'Backend', parentId: 'dept:d1' }),
        makeNode({ id: 'dept:d3', nodeType: 'department', entityId: 'd3', label: 'Frontend', parentId: 'dept:d1' }),
      ],
      edges: [
        makeEdge({ id: 'rt1', edgeType: 'reports_to', sourceId: 'dept:d2', targetId: 'dept:d1' }),
        makeEdge({ id: 'rt2', edgeType: 'reports_to', sourceId: 'dept:d3', targetId: 'dept:d1' }),
      ],
      activeLayers: ['organization'],
    })

    const result = layoutDepartmentGraph(graph)

    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)

    const root = result.nodes.find((n) => n.id === 'dept:d1')!
    const sub1 = result.nodes.find((n) => n.id === 'dept:d2')!
    const sub2 = result.nodes.find((n) => n.id === 'dept:d3')!

    // Root above sub-departments
    expect(root.position.y).toBeLessThan(sub1.position.y)
    expect(sub1.position.y).toBe(sub2.position.y)
  })

  it('should fall back to flat layout when scope dept node is missing', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'missing', entityType: 'department' },
      nodes: [
        makeNode({ id: 'role:r1', nodeType: 'role', entityId: 'r1', label: 'Dev' }),
        makeNode({ id: 'cap:c1', nodeType: 'capability', entityId: 'c1', label: 'Cap' }),
      ],
      edges: [],
    })

    const result = layoutDepartmentGraph(graph)

    expect(result.nodes).toHaveLength(2)
    // Flat layout — all at y=0
    expect(result.nodes[0]!.position.y).toBe(0)
    expect(result.nodes[1]!.position.y).toBe(0)
  })

  it('should handle deep hierarchy (dept → archetype → assignment)', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Eng' }),
        makeNode({ id: 'archetype:a1', nodeType: 'agent-archetype', entityId: 'a1', label: 'Worker', parentId: 'dept:d1' }),
        makeNode({ id: 'assignment:as1', nodeType: 'agent-assignment', entityId: 'as1', label: 'Bot-1', parentId: 'archetype:a1' }),
      ],
      edges: [],
      activeLayers: ['organization'],
    })

    const result = layoutDepartmentGraph(graph)

    expect(result.nodes).toHaveLength(3)

    const dept = result.nodes.find((n) => n.id === 'dept:d1')!
    const archetype = result.nodes.find((n) => n.id === 'archetype:a1')!
    const assignment = result.nodes.find((n) => n.id === 'assignment:as1')!

    // Depth ordering: dept < archetype < assignment
    expect(dept.position.y).toBeLessThan(archetype.position.y)
    expect(archetype.position.y).toBeLessThan(assignment.position.y)
  })

  it('should convert edges', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Eng' }),
        makeNode({ id: 'cap:c1', nodeType: 'capability', entityId: 'c1', label: 'API', parentId: 'dept:d1' }),
      ],
      edges: [
        makeEdge({ id: 'owns:dept:d1→cap:c1', edgeType: 'owns', sourceId: 'dept:d1', targetId: 'cap:c1', layerIds: ['capabilities'] }),
      ],
      activeLayers: ['organization', 'capabilities'],
    })

    const result = layoutDepartmentGraph(graph)

    expect(result.edges).toHaveLength(1)
    expect(result.edges[0]!.source).toBe('dept:d1')
    expect(result.edges[0]!.target).toBe('cap:c1')
  })
})

describe('graphToFlow', () => {
  it('should use layoutWorkflowGraph for L3 scope', () => {
    const graph = makeGraph({
      zoomLevel: 'L3',
      scope: { level: 'L3', entityId: 'wf1', entityType: 'workflow' },
      nodes: [
        makeNode({ id: 'wf:wf1', nodeType: 'workflow', label: 'WF' }),
      ],
      edges: [],
    })

    const result = graphToFlow(graph)

    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0]!.type).toBe('workflow')
  })

  it('should use layoutDepartmentGraph for L2 scope', () => {
    const graph = makeGraph({
      zoomLevel: 'L2',
      scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
      nodes: [
        makeNode({ id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Eng' }),
        makeNode({ id: 'role:r1', nodeType: 'role', entityId: 'r1', label: 'Dev', parentId: 'dept:d1' }),
      ],
      edges: [],
    })

    const result = graphToFlow(graph)

    expect(result.nodes).toHaveLength(2)

    const dept = result.nodes.find((n) => n.type === 'department')!
    const role = result.nodes.find((n) => n.type === 'role')!

    // Department should be above role (BFS tree layout)
    expect(dept.position.y).toBeLessThan(role.position.y)
  })

  it('should use layoutOrgGraph for L1 scope', () => {
    const graph = makeGraph({
      zoomLevel: 'L1',
      nodes: [
        makeNode({ id: 'company:p1', nodeType: 'company', label: 'Co' }),
        makeNode({ id: 'dept:d1', nodeType: 'department', label: 'Eng' }),
      ],
      edges: [],
    })

    const result = graphToFlow(graph)

    expect(result.nodes).toHaveLength(2)

    const company = result.nodes.find((n) => n.type === 'company')!
    const dept = result.nodes.find((n) => n.type === 'department')!

    // Company should be above department
    expect(company.position.y).toBeLessThan(dept.position.y)
  })
})

describe('enrichWithValidationCounts', () => {
  it('should add validationCount to nodes with matching issues', () => {
    const flowGraph = graphToFlow(
      makeGraph({
        nodes: [
          makeNode({ id: 'company:p1', nodeType: 'company', label: 'Co' }),
          makeNode({ id: 'dept:d1', nodeType: 'department', label: 'Eng' }),
        ],
      }),
    )

    const issues: ValidationIssue[] = [
      { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'Missing purpose', severity: 'error' },
      { entity: 'Department', entityId: 'd1', field: 'mandate', message: 'Missing mandate', severity: 'warning' },
      { entity: 'Department', entityId: 'd1', field: null, message: 'No owner', severity: 'warning' },
    ]

    const result = enrichWithValidationCounts(flowGraph, issues, 'p1')

    const company = result.nodes.find((n) => n.id === 'company:p1')!
    const dept = result.nodes.find((n) => n.id === 'dept:d1')!

    expect(company.data.validationCount).toBe(1)
    expect(dept.data.validationCount).toBe(2)
  })

  it('should not modify nodes without issues', () => {
    const flowGraph = graphToFlow(
      makeGraph({
        nodes: [
          makeNode({ id: 'company:p1', nodeType: 'company', label: 'Co' }),
          makeNode({ id: 'dept:d1', nodeType: 'department', label: 'Eng' }),
        ],
      }),
    )

    const issues: ValidationIssue[] = [
      { entity: 'CompanyModel', entityId: null, field: 'purpose', message: 'Missing purpose', severity: 'error' },
    ]

    const result = enrichWithValidationCounts(flowGraph, issues, 'p1')

    const dept = result.nodes.find((n) => n.id === 'dept:d1')!
    expect(dept.data.validationCount).toBeUndefined()
  })

  it('should return same graph when no issues', () => {
    const flowGraph = graphToFlow(
      makeGraph({
        nodes: [makeNode({ id: 'company:p1', nodeType: 'company', label: 'Co' })],
      }),
    )

    const result = enrichWithValidationCounts(flowGraph, [], 'p1')
    expect(result).toBe(flowGraph) // Same reference (no copy needed)
  })
})
