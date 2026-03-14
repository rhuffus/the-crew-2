import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { VisualGraphDto } from '@the-crew/shared-types'

// Mock useVisualGraph hook
const mockUseVisualGraph = vi.fn()
vi.mock('@/hooks/use-visual-graph', () => ({
  useVisualGraph: (...args: unknown[]) => mockUseVisualGraph(...args),
}))

// Mock zustand store
vi.mock('@/stores/visual-workspace-store', () => {
  const state: Record<string, unknown> = {
    selectNodes: vi.fn(),
    selectEdges: vi.fn(),
    clearSelection: vi.fn(),
    activeLayers: ['workflows'] as string[],
    explorerCollapsed: false,
    inspectorCollapsed: false,
    currentView: 'workflow' as const,
    zoomLevel: 'L3' as const,
    scopeEntityId: 'wf1',
    selectedNodeIds: [] as string[],
    selectedEdgeIds: [] as string[],
    setView: vi.fn(),
    toggleExplorer: vi.fn(),
    toggleInspector: vi.fn(),
    toggleLayer: vi.fn(),
    setActiveLayers: vi.fn(),
    resetToDefaults: vi.fn(),
    showValidationOverlay: true,
    toggleValidationOverlay: vi.fn(),
    nodeTypeFilter: null,
    statusFilter: null,
    clearFilters: vi.fn(),
    collapsedNodeIds: [] as string[],
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    graphNodes: [],
    graphEdges: [],
    setGraphNodes: vi.fn(),
    setGraphEdges: vi.fn(),
    focusNodeId: null,
    clearFocus: vi.fn(),
    pendingConnection: null,
    edgeTypePicker: null,
    metadataInput: null,
    deleteConfirm: null,
    validationIssues: [],
    projectId: null,
    activePreset: null,
    setActivePreset: vi.fn(),
    clearActivePreset: vi.fn(),
    currentScope: { scopeType: 'workflow', entityId: 'wf1', zoomLevel: 'L3' },
    isDiffMode: false,
    preselectedEdgeType: null,
    toggleKeyboardHelp: vi.fn(),
    transitionDirection: null,
    clearTransition: vi.fn(),
    showContextMenu: vi.fn(),
    dismissContextMenu: vi.fn(),
    contextMenu: null,
  }
  const storeFn = (selector?: (s: Record<string, unknown>) => unknown) => {
    if (selector) return selector(state)
    return state
  }
  storeFn.getState = () => state
  return {
    useVisualWorkspaceStore: storeFn,
  }
})

// Must mock React Flow since jsdom doesn't support canvas
vi.mock('@xyflow/react', () => {
  const actual = vi.importActual('@xyflow/react')
  return {
    ...actual,
    ReactFlow: ({ nodes, edges }: { nodes: unknown[]; edges: unknown[] }) => (
      <div data-testid="react-flow">
        <span data-testid="node-count">{(nodes as unknown[]).length}</span>
        <span data-testid="edge-count">{(edges as unknown[]).length}</span>
      </div>
    ),
    Background: () => null,
    Controls: () => null,
    MiniMap: () => null,
    BackgroundVariant: { Dots: 'dots' },
  }
})

import { WorkflowCanvas } from '@/components/visual-shell/workflow-canvas'

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockGraph: VisualGraphDto = {
  projectId: 'p1',
  scopeType: 'workflow',
  scope: { level: 'L3', entityId: 'wf1', entityType: 'workflow' },
  zoomLevel: 'L3',
  nodes: [
    {
      id: 'wf:wf1', nodeType: 'workflow', entityId: 'wf1', label: 'Deploy',
      sublabel: 'active', position: null, collapsed: false, status: 'normal',
      layerIds: ['workflows'], parentId: null,
    },
    {
      id: 'wf-stage:wf1:1', nodeType: 'workflow-stage', entityId: 'wf1:Build', label: 'Build',
      sublabel: 'Build it', position: null, collapsed: false, status: 'normal',
      layerIds: ['workflows'], parentId: 'wf:wf1',
    },
    {
      id: 'wf-stage:wf1:2', nodeType: 'workflow-stage', entityId: 'wf1:Test', label: 'Test',
      sublabel: 'Test it', position: null, collapsed: false, status: 'normal',
      layerIds: ['workflows'], parentId: 'wf:wf1',
    },
  ],
  edges: [
    {
      id: 'ho1', edgeType: 'hands_off_to', sourceId: 'wf-stage:wf1:1',
      targetId: 'wf-stage:wf1:2', label: null, style: 'solid', layerIds: ['workflows'],
    },
  ],
  activeLayers: ['workflows'],
  breadcrumb: [
    { label: 'Co', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' },
    { label: 'Deploy', nodeType: 'workflow', entityId: 'wf1', zoomLevel: 'L3' },
  ],
}

describe('WorkflowCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: true, error: null })

    render(
      <Wrapper>
        <WorkflowCanvas projectId="p1" workflowId="wf1" />
      </Wrapper>,
    )

    expect(screen.getByTestId('workflow-canvas-loading')).toBeDefined()
    expect(screen.getByText('Loading workflow...')).toBeDefined()
  })

  it('should show error state', () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') })

    render(
      <Wrapper>
        <WorkflowCanvas projectId="p1" workflowId="wf1" />
      </Wrapper>,
    )

    expect(screen.getByTestId('workflow-canvas-error')).toBeDefined()
  })

  it('should render React Flow with graph data when loaded', () => {
    mockUseVisualGraph.mockReturnValue({ data: mockGraph, isLoading: false, error: null })

    render(
      <Wrapper>
        <WorkflowCanvas projectId="p1" workflowId="wf1" />
      </Wrapper>,
    )

    expect(screen.getByTestId('workflow-canvas')).toBeDefined()
    expect(screen.getByTestId('react-flow')).toBeDefined()
    // 3 nodes: workflow + 2 stages
    expect(screen.getByTestId('node-count').textContent).toBe('3')
    // 1 edge: hands_off_to
    expect(screen.getByTestId('edge-count').textContent).toBe('1')
  })

  it('should call useVisualGraph with L3, workflowId and active layers', () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: true, error: null })

    render(
      <Wrapper>
        <WorkflowCanvas projectId="p1" workflowId="wf1" />
      </Wrapper>,
    )

    expect(mockUseVisualGraph).toHaveBeenCalledWith('p1', 'workflow', 'wf1')
  })

  it('should render empty canvas when graph has no nodes', () => {
    const emptyGraph: VisualGraphDto = {
      ...mockGraph,
      nodes: [],
      edges: [],
    }
    mockUseVisualGraph.mockReturnValue({ data: emptyGraph, isLoading: false, error: null })

    render(
      <Wrapper>
        <WorkflowCanvas projectId="p1" workflowId="wf1" />
      </Wrapper>,
    )

    expect(screen.getByTestId('node-count').textContent).toBe('0')
    expect(screen.getByTestId('edge-count').textContent).toBe('0')
  })
})
