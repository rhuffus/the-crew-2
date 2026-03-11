import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Node, Edge } from '@xyflow/react'
import type { OperationsStatusDto, EntityOperationStatusDto } from '@the-crew/shared-types'
import { enrichWithOperationsBadges, formatRelativeTime } from '@/lib/operations-enrichment'

function makeNode(id: string, data: Record<string, unknown> = {}): Node {
  return { id, position: { x: 0, y: 0 }, data, type: 'visual-node' }
}

function makeEdge(id: string, source: string, target: string, edgeType?: string): Edge {
  return { id, source, target, data: { edgeType }, style: {} }
}

function makeEntityStatus(
  visualNodeId: string,
  overrides: Partial<EntityOperationStatusDto> = {},
): EntityOperationStatusDto {
  return {
    entityId: visualNodeId,
    entityType: 'department',
    visualNodeId,
    operationStatus: 'idle',
    activeRunCount: 0,
    incidentCount: 0,
    queueDepth: 0,
    complianceStatus: null,
    badges: [],
    ...overrides,
  }
}

function makeOpsStatus(
  entities: EntityOperationStatusDto[],
): OperationsStatusDto {
  return {
    projectId: 'p1',
    scopeType: 'company',
    entityId: null,
    entities,
    summary: {
      totalActiveRuns: 0,
      totalBlockedStages: 0,
      totalFailedRuns: 0,
      totalOpenIncidents: 0,
      totalComplianceViolations: 0,
    },
    fetchedAt: new Date().toISOString(),
  }
}

describe('enrichWithOperationsBadges', () => {
  it('adds operation data to matching nodes', () => {
    const nodes = [makeNode('dept:d1'), makeNode('dept:d2')]
    const edges: Edge[] = []
    const status = makeOpsStatus([
      makeEntityStatus('dept:d1', {
        operationStatus: 'running',
        activeRunCount: 3,
        incidentCount: 1,
        badges: [{ type: 'active-run', label: '3 runs', severity: 'info' }],
      }),
    ])

    const result = enrichWithOperationsBadges({ nodes, edges }, status)

    expect(result.nodes[0]!.data.operationStatus).toBe('running')
    expect(result.nodes[0]!.data.activeRunCount).toBe(3)
    expect(result.nodes[0]!.data.incidentCount).toBe(1)
    expect(result.nodes[0]!.data.operationBadges).toHaveLength(1)
  })

  it('leaves unmatched nodes unchanged', () => {
    const nodes = [makeNode('dept:d1', { label: 'Engineering' })]
    const edges: Edge[] = []
    const status = makeOpsStatus([
      makeEntityStatus('dept:other', { operationStatus: 'running' }),
    ])

    const result = enrichWithOperationsBadges({ nodes, edges }, status)

    expect(result.nodes[0]!.data.operationStatus).toBeUndefined()
    expect(result.nodes[0]!.data.label).toBe('Engineering')
  })

  it('handles empty operations status', () => {
    const nodes = [makeNode('dept:d1')]
    const edges = [makeEdge('e1', 'dept:d1', 'dept:d2', 'hands_off_to')]
    const status = makeOpsStatus([])

    const result = enrichWithOperationsBadges({ nodes, edges }, status)

    expect(result.nodes[0]).toEqual(nodes[0])
    expect(result.edges[0]).toEqual(edges[0])
  })

  it('animates hands_off_to edge when source is running', () => {
    const nodes = [makeNode('dept:d1'), makeNode('dept:d2')]
    const edges = [makeEdge('e1', 'dept:d1', 'dept:d2', 'hands_off_to')]
    const status = makeOpsStatus([
      makeEntityStatus('dept:d1', { operationStatus: 'running' }),
    ])

    const result = enrichWithOperationsBadges({ nodes, edges }, status)

    expect(result.edges[0]!.animated).toBe(true)
    expect(result.edges[0]!.style).toEqual(
      expect.objectContaining({ stroke: '#3b82f6' }),
    )
  })

  it('colors bound_by edge by compliance status (compliant=green, violated=red)', () => {
    const nodes = [makeNode('wf:w1'), makeNode('contract:c1')]
    const compliantEdges = [makeEdge('e1', 'wf:w1', 'contract:c1', 'bound_by')]
    const compliantStatus = makeOpsStatus([
      makeEntityStatus('contract:c1', { complianceStatus: 'compliant' }),
    ])
    const compliantResult = enrichWithOperationsBadges(
      { nodes, edges: compliantEdges },
      compliantStatus,
    )
    expect(compliantResult.edges[0]!.style).toEqual(
      expect.objectContaining({ stroke: '#16a34a' }),
    )

    const violatedEdges = [makeEdge('e2', 'wf:w1', 'contract:c1', 'bound_by')]
    const violatedStatus = makeOpsStatus([
      makeEntityStatus('contract:c1', { complianceStatus: 'violated' }),
    ])
    const violatedResult = enrichWithOperationsBadges(
      { nodes, edges: violatedEdges },
      violatedStatus,
    )
    expect(violatedResult.edges[0]!.style).toEqual(
      expect.objectContaining({ stroke: '#dc2626' }),
    )
  })

  it('animates participates_in when target is running', () => {
    const nodes = [makeNode('role:r1'), makeNode('wf:w1')]
    const edges = [makeEdge('e1', 'role:r1', 'wf:w1', 'participates_in')]
    const status = makeOpsStatus([
      makeEntityStatus('wf:w1', { operationStatus: 'running' }),
    ])

    const result = enrichWithOperationsBadges({ nodes, edges }, status)

    expect(result.edges[0]!.animated).toBe(true)
    expect(result.edges[0]!.style).toEqual(
      expect.objectContaining({ stroke: '#3b82f6' }),
    )
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns seconds, minutes, hours', () => {
    // 30 seconds ago
    expect(formatRelativeTime('2026-03-10T11:59:30Z')).toBe('30s ago')

    // 5 minutes ago
    expect(formatRelativeTime('2026-03-10T11:55:00Z')).toBe('5m ago')

    // 3 hours ago
    expect(formatRelativeTime('2026-03-10T09:00:00Z')).toBe('3h ago')
  })
})
