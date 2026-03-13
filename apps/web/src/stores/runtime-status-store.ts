import { create } from 'zustand'
import type {
  NodeRuntimeStatusDto,
  RuntimeExecutionDto,
  RuntimeEventDto,
  CostSummaryDto,
  RuntimeSummaryDto,
} from '@the-crew/shared-types'
import { runtimeApi } from '@/lib/runtime-api'

const MAX_RECENT_EVENTS = 500

export interface RuntimeStatusState {
  // Connection
  connected: boolean
  connectionError: string | null

  // Per-node status (used by canvas badges)
  nodeStatuses: Map<string, NodeRuntimeStatusDto>

  // Active executions (used by operations panel + inspector)
  activeExecutions: RuntimeExecutionDto[]

  // Recent events (used by timeline panel)
  recentEvents: RuntimeEventDto[]

  // Summary
  summary: RuntimeSummaryDto | null

  // Cost
  costSummary: CostSummaryDto | null

  // Internal
  _eventSource: EventSource | null
  _projectId: string | null

  // Actions
  connect: (projectId: string, scope?: string, entityId?: string) => void
  disconnect: () => void
  loadInitialState: (projectId: string) => Promise<void>
  getNodeStatus: (entityId: string) => NodeRuntimeStatusDto | null
  getExecutionsForEntity: (entityId: string) => RuntimeExecutionDto[]
  getEventsForEntity: (entityId: string) => RuntimeEventDto[]
}

export const useRuntimeStatusStore = create<RuntimeStatusState>((set, get) => ({
  connected: false,
  connectionError: null,
  nodeStatuses: new Map(),
  activeExecutions: [],
  recentEvents: [],
  summary: null,
  costSummary: null,
  _eventSource: null,
  _projectId: null,

  connect(projectId, scope, entityId) {
    const state = get()
    if (state._eventSource) {
      state._eventSource.close()
    }

    const url = runtimeApi.getStreamUrl(projectId, scope, entityId)
    const es = new EventSource(url)

    es.onopen = () => {
      set({ connected: true, connectionError: null })
    }

    es.onmessage = (msg) => {
      try {
        const event: RuntimeEventDto = JSON.parse(msg.data)
        set((s) => {
          const events = [event, ...s.recentEvents].slice(0, MAX_RECENT_EVENTS)
          return { recentEvents: events }
        })
      } catch {
        // ignore malformed messages
      }
    }

    es.onerror = () => {
      set({ connectionError: 'Connection lost. Reconnecting...' })
    }

    set({ _eventSource: es, _projectId: projectId, connected: false })

    // Also fetch initial state via REST
    get().loadInitialState(projectId)
  },

  disconnect() {
    const state = get()
    if (state._eventSource) {
      state._eventSource.close()
    }
    set({
      _eventSource: null,
      _projectId: null,
      connected: false,
      connectionError: null,
      nodeStatuses: new Map(),
      activeExecutions: [],
      recentEvents: [],
      summary: null,
      costSummary: null,
    })
  },

  async loadInitialState(projectId) {
    try {
      const [statusResponse, executions, costSummary] = await Promise.all([
        runtimeApi.getStatus(projectId),
        runtimeApi.listExecutions(projectId),
        runtimeApi.getCostSummary(projectId),
      ])

      const statusMap = new Map<string, NodeRuntimeStatusDto>()
      for (const ns of statusResponse.nodeStatuses) {
        statusMap.set(ns.entityId, ns)
      }

      const activeExecutions = executions.filter(
        e => e.status === 'pending' || e.status === 'running' || e.status === 'waiting' || e.status === 'blocked',
      )

      set({
        nodeStatuses: statusMap,
        activeExecutions,
        summary: statusResponse.summary,
        costSummary,
      })
    } catch {
      // Initial load may fail if runtime is empty — that's fine
    }
  },

  getNodeStatus(entityId) {
    return get().nodeStatuses.get(entityId) ?? null
  },

  getExecutionsForEntity(entityId) {
    return get().activeExecutions.filter(
      e => e.workflowId === entityId || e.agentId === entityId,
    )
  },

  getEventsForEntity(entityId) {
    return get().recentEvents.filter(
      e => e.sourceEntityId === entityId || e.targetEntityId === entityId,
    )
  },
}))
