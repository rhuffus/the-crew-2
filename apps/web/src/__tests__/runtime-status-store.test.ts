import { describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'

describe('RuntimeStatusStore', () => {
  beforeEach(() => {
    useRuntimeStatusStore.setState({
      connected: false,
      connectionError: null,
      nodeStatuses: new Map(),
      activeExecutions: [],
      recentEvents: [],
      summary: null,
      costSummary: null,
      _eventSource: null,
      _projectId: null,
    })
  })

  it('initializes with disconnected state', () => {
    const state = useRuntimeStatusStore.getState()
    expect(state.connected).toBe(false)
    expect(state.connectionError).toBeNull()
    expect(state.nodeStatuses.size).toBe(0)
    expect(state.activeExecutions).toEqual([])
    expect(state.recentEvents).toEqual([])
    expect(state.summary).toBeNull()
    expect(state.costSummary).toBeNull()
  })

  it('getNodeStatus returns null for unknown entity', () => {
    const state = useRuntimeStatusStore.getState()
    expect(state.getNodeStatus('unknown')).toBeNull()
  })

  it('getNodeStatus returns status when available', () => {
    const status = {
      entityId: 'a1',
      entityType: 'agent',
      state: 'active' as const,
      badges: [{ type: 'running' as const, label: '1 running', severity: 'info' as const }],
      lastEventAt: new Date().toISOString(),
    }
    useRuntimeStatusStore.setState({
      nodeStatuses: new Map([['a1', status]]),
    })
    const state = useRuntimeStatusStore.getState()
    expect(state.getNodeStatus('a1')).toEqual(status)
  })

  it('getExecutionsForEntity filters by workflowId or agentId', () => {
    useRuntimeStatusStore.setState({
      activeExecutions: [
        { id: 'e1', projectId: 'p1', executionType: 'agent-task', workflowId: null, agentId: 'a1', status: 'running', startedAt: null, completedAt: null, input: {}, output: null, errors: [], waitingFor: null, approvals: [], aiCost: 0, logSummary: '', createdAt: '', updatedAt: '' },
        { id: 'e2', projectId: 'p1', executionType: 'workflow-run', workflowId: 'wf1', agentId: null, status: 'running', startedAt: null, completedAt: null, input: {}, output: null, errors: [], waitingFor: null, approvals: [], aiCost: 0, logSummary: '', createdAt: '', updatedAt: '' },
      ],
    })
    const state = useRuntimeStatusStore.getState()
    expect(state.getExecutionsForEntity('a1')).toHaveLength(1)
    expect(state.getExecutionsForEntity('wf1')).toHaveLength(1)
    expect(state.getExecutionsForEntity('unknown')).toHaveLength(0)
  })

  it('getEventsForEntity filters by sourceEntityId or targetEntityId', () => {
    useRuntimeStatusStore.setState({
      recentEvents: [
        { id: 'ev1', projectId: 'p1', eventType: 'agent-activated', severity: 'info', title: 'A1', description: '', sourceEntityType: 'agent', sourceEntityId: 'a1', targetEntityType: null, targetEntityId: null, executionId: null, metadata: {}, occurredAt: '' },
        { id: 'ev2', projectId: 'p1', eventType: 'handoff-initiated', severity: 'info', title: 'H1', description: '', sourceEntityType: 'stage', sourceEntityId: 's1', targetEntityType: 'stage', targetEntityId: 'a1', executionId: null, metadata: {}, occurredAt: '' },
        { id: 'ev3', projectId: 'p1', eventType: 'agent-activated', severity: 'info', title: 'A2', description: '', sourceEntityType: 'agent', sourceEntityId: 'a2', targetEntityType: null, targetEntityId: null, executionId: null, metadata: {}, occurredAt: '' },
      ],
    })
    const state = useRuntimeStatusStore.getState()
    // a1 appears as source in ev1 and as target in ev2
    expect(state.getEventsForEntity('a1')).toHaveLength(2)
    expect(state.getEventsForEntity('a2')).toHaveLength(1)
  })

  it('disconnect clears all state', () => {
    useRuntimeStatusStore.setState({
      connected: true,
      nodeStatuses: new Map([['a1', { entityId: 'a1', entityType: 'agent', state: 'active', badges: [], lastEventAt: null }]]),
      activeExecutions: [{ id: 'e1' }] as never[],
      recentEvents: [{ id: 'ev1' }] as never[],
      summary: { activeExecutionCount: 1, blockedExecutionCount: 0, failedExecutionCount: 0, openIncidentCount: 0, pendingApprovalCount: 0, totalCostCurrentPeriod: 0 },
    })

    useRuntimeStatusStore.getState().disconnect()

    const state = useRuntimeStatusStore.getState()
    expect(state.connected).toBe(false)
    expect(state.nodeStatuses.size).toBe(0)
    expect(state.activeExecutions).toEqual([])
    expect(state.recentEvents).toEqual([])
    expect(state.summary).toBeNull()
  })
})
