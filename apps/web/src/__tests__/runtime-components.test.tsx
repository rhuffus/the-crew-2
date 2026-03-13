import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RuntimeBadges } from '@/components/visual-shell/runtime-badges'
import { TimelinePanel } from '@/components/visual-shell/explorer/timeline-panel'
import { RuntimeTab } from '@/components/visual-shell/inspector/runtime-tab'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('RuntimeBadges', () => {
  it('renders nothing when no badges', () => {
    const { container } = render(<RuntimeBadges badges={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders badges with correct test ids', () => {
    render(
      <RuntimeBadges
        badges={[
          { type: 'running', label: '2 running', severity: 'info' },
          { type: 'error', label: '1 failed', severity: 'error' },
        ]}
      />,
    )
    expect(screen.getByTestId('runtime-badges')).toBeInTheDocument()
    expect(screen.getByTestId('runtime-badge-running')).toHaveTextContent('2 running')
    expect(screen.getByTestId('runtime-badge-error')).toHaveTextContent('1 failed')
  })

  it('renders cost badge', () => {
    render(
      <RuntimeBadges badges={[{ type: 'cost', label: '$12.40', severity: 'warning' }]} />,
    )
    expect(screen.getByTestId('runtime-badge-cost')).toHaveTextContent('$12.40')
  })
})

describe('TimelinePanel', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ designMode: 'design' })
    useRuntimeStatusStore.setState({
      connected: false,
      connectionError: null,
      recentEvents: [],
    })
  })

  it('shows message when not in live mode', () => {
    render(<TimelinePanel />)
    expect(screen.getByTestId('timeline-panel')).toHaveTextContent('Switch to Live mode')
  })

  it('shows connection indicator in live mode', () => {
    useVisualWorkspaceStore.setState({ designMode: 'live' })
    render(<TimelinePanel />)
    expect(screen.getByTestId('timeline-connection-indicator')).toBeInTheDocument()
  })

  it('shows empty state when no events', () => {
    useVisualWorkspaceStore.setState({ designMode: 'live' })
    render(<TimelinePanel />)
    expect(screen.getByTestId('timeline-panel')).toHaveTextContent('No events yet')
  })

  it('renders events when available', () => {
    useVisualWorkspaceStore.setState({ designMode: 'live' })
    useRuntimeStatusStore.setState({
      connected: true,
      recentEvents: [
        {
          id: 'ev1',
          projectId: 'p1',
          eventType: 'agent-activated',
          severity: 'info',
          title: 'Agent started',
          description: 'Agent a1 activated',
          sourceEntityType: 'agent',
          sourceEntityId: 'a1',
          targetEntityType: null,
          targetEntityId: null,
          executionId: null,
          metadata: {},
          occurredAt: new Date().toISOString(),
        },
      ],
    })
    render(<TimelinePanel />)
    expect(screen.getByTestId('timeline-events-list')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-event-ev1')).toHaveTextContent('Agent started')
  })
})

describe('RuntimeTab', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ designMode: 'design' })
    useRuntimeStatusStore.setState({
      nodeStatuses: new Map(),
      activeExecutions: [],
      recentEvents: [],
    })
  })

  it('shows message when not in live mode', () => {
    render(<RuntimeTab entityId="a1" nodeType="coordinator-agent" projectId="p1" />)
    expect(screen.getByTestId('runtime-tab')).toHaveTextContent('Switch to Live mode')
  })

  it('shows idle state when in live mode with no data', () => {
    useVisualWorkspaceStore.setState({ designMode: 'live' })
    render(<RuntimeTab entityId="a1" nodeType="coordinator-agent" projectId="p1" />)
    expect(screen.getByTestId('runtime-state-badge')).toHaveTextContent('Idle')
  })

  it('shows active state with badges when node has runtime data', () => {
    useVisualWorkspaceStore.setState({ designMode: 'live' })
    useRuntimeStatusStore.setState({
      nodeStatuses: new Map([
        ['a1', {
          entityId: 'a1',
          entityType: 'agent',
          state: 'active',
          badges: [{ type: 'running', label: '1 running', severity: 'info' }],
          lastEventAt: new Date().toISOString(),
        }],
      ]),
      activeExecutions: [
        {
          id: 'e1',
          projectId: 'p1',
          executionType: 'agent-task',
          workflowId: null,
          agentId: 'a1',
          status: 'running',
          startedAt: new Date().toISOString(),
          completedAt: null,
          input: {},
          output: null,
          errors: [],
          waitingFor: null,
          approvals: [],
          aiCost: 2.5,
          logSummary: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })

    render(<RuntimeTab entityId="a1" nodeType="coordinator-agent" projectId="p1" />)
    expect(screen.getByTestId('runtime-state-badge')).toHaveTextContent('Active')
    expect(screen.getByTestId('runtime-badges')).toBeInTheDocument()
    expect(screen.getByTestId('execution-row')).toBeInTheDocument()
  })
})
