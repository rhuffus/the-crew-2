import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ValidationIssue } from '@the-crew/shared-types'
import { VisualNode } from '@/components/visual-shell/nodes/visual-node'
import { WorkflowStageNode } from '@/components/visual-shell/nodes/workflow-stage-node'
import { Inspector } from '@/components/visual-shell/inspector/inspector'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { CanvasToolbar } from '@/components/visual-shell/canvas-toolbar'
import {
  allMockNodes,
  allMockEdges,
} from './fixtures/visual-graph'

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    Handle: ({ type }: { type: string }) => <div data-testid={`handle-${type}`} />,
    Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

function renderNode(Component: React.ComponentType<any>, data: Record<string, unknown>) {
  return render(
    <ReactFlowProvider>
      <Component
        id="test"
        data={data}
        type="test"
        positionAbsoluteX={0}
        positionAbsoluteY={0}
        isConnectable={true}
        zIndex={0}
        xPos={0}
        yPos={0}
        dragging={false}
        selected={false}
        sourcePosition="bottom"
        targetPosition="top"
      />
    </ReactFlowProvider>,
  )
}

describe('VisualNode validation badge', () => {
  it('should show error badge for error status', () => {
    renderNode(VisualNode, {
      label: 'Bad Node',
      sublabel: null,
      nodeType: 'company',
      entityId: 'p1',
      status: 'error',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      validationCount: 3,
    })
    expect(screen.getByTestId('validation-badge-error')).toBeDefined()
    expect(screen.getByTestId('validation-badge-error').getAttribute('title')).toBe('3 error(s)')
  })

  it('should show warning badge for warning status', () => {
    renderNode(VisualNode, {
      label: 'Warn Node',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'warning',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      validationCount: 2,
    })
    expect(screen.getByTestId('validation-badge-warning')).toBeDefined()
    expect(screen.getByTestId('validation-badge-warning').getAttribute('title')).toBe('2 warning(s)')
  })

  it('should not show badge for normal status', () => {
    renderNode(VisualNode, {
      label: 'OK Node',
      sublabel: null,
      nodeType: 'role',
      entityId: 'r1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })
    expect(screen.queryByTestId('validation-badge-error')).toBeNull()
    expect(screen.queryByTestId('validation-badge-warning')).toBeNull()
  })

  it('should show default title without validationCount', () => {
    renderNode(VisualNode, {
      label: 'Err Node',
      sublabel: null,
      nodeType: 'company',
      entityId: 'p1',
      status: 'error',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })
    expect(screen.getByTestId('validation-badge-error').getAttribute('title')).toBe('Validation error')
  })
})

describe('WorkflowStageNode validation badge', () => {
  it('should show error badge for error status', () => {
    renderNode(WorkflowStageNode, {
      label: 'Bad Stage',
      sublabel: null,
      status: 'error',
      validationCount: 1,
    })
    expect(screen.getByTestId('validation-badge-error')).toBeDefined()
  })

  it('should show warning badge for warning status', () => {
    renderNode(WorkflowStageNode, {
      label: 'Warn Stage',
      sublabel: null,
      status: 'warning',
    })
    expect(screen.getByTestId('validation-badge-warning')).toBeDefined()
  })

  it('should not show badge for normal status', () => {
    renderNode(WorkflowStageNode, {
      label: 'OK Stage',
      sublabel: null,
      status: 'normal',
    })
    expect(screen.queryByTestId('validation-badge-error')).toBeNull()
    expect(screen.queryByTestId('validation-badge-warning')).toBeNull()
  })
})

describe('Inspector validation issues', () => {
  const mockIssues: ValidationIssue[] = [
    { entity: 'Contract', entityId: 'ct1', field: 'provider', message: 'Missing provider', severity: 'error' },
    { entity: 'Contract', entityId: 'ct1', field: null, message: 'No consumer defined', severity: 'warning' },
  ]

  function renderInspector(props: Parameters<typeof Inspector>[0] = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
      <QueryClientProvider client={queryClient}>
        <Inspector {...props} />
      </QueryClientProvider>,
    )
  }

  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      inspectorCollapsed: false,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      validationIssues: [],
      projectId: null,
      showValidationOverlay: true,
    })
  })

  it('should show validation issues in validation tab for selected node', async () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['contract:ct1'],
      validationIssues: mockIssues,
      projectId: 'proj-1',
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    // Editable nodes now default to edit tab; click validation tab
    await userEvent.click(screen.getByTestId('tab-validation'))
    expect(screen.getByTestId('validation-tab')).toBeInTheDocument()
    expect(screen.getByText('Missing provider')).toBeInTheDocument()
    expect(screen.getByText('No consumer defined')).toBeInTheDocument()
  })

  it('should show no validation issues message when no issues for selected node', async () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:abc'],
      validationIssues: mockIssues,
      projectId: 'proj-1',
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    await userEvent.click(screen.getByTestId('tab-validation'))
    expect(screen.getByText('No validation issues')).toBeInTheDocument()
  })

  it('should show no validation issues without projectId', async () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['contract:ct1'],
      validationIssues: mockIssues,
      projectId: null,
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    // Without projectId, nodeValidationIssues is empty
    await userEvent.click(screen.getByTestId('tab-validation'))
    expect(screen.getByText('No validation issues')).toBeInTheDocument()
  })
})

describe('Canvas toolbar validation toggle', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      showValidationOverlay: true,
    })
  })

  it('should render validation overlay toggle button', () => {
    render(<CanvasToolbar />)
    expect(screen.getByTestId('toolbar-toggle-validation-overlay')).toBeInTheDocument()
  })

  it('should toggle validation overlay on click', async () => {
    render(<CanvasToolbar />)
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
    await userEvent.click(screen.getByTestId('toolbar-toggle-validation-overlay'))
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(false)
  })

  it('should show active styling when overlay is on', () => {
    render(<CanvasToolbar />)
    const btn = screen.getByTestId('toolbar-toggle-validation-overlay')
    expect(btn.className).toContain('bg-primary/10')
  })

  it('should show inactive styling when overlay is off', () => {
    useVisualWorkspaceStore.setState({ showValidationOverlay: false })
    render(<CanvasToolbar />)
    const btn = screen.getByTestId('toolbar-toggle-validation-overlay')
    expect(btn.className).not.toContain('bg-primary/10')
  })
})

describe('Store validation state', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      validationIssues: [],
      showValidationOverlay: true,
      projectId: null,
    })
  })

  it('should set validation issues', () => {
    const issues: ValidationIssue[] = [
      { entity: 'Department', entityId: 'd1', field: null, message: 'Test', severity: 'error' },
    ]
    useVisualWorkspaceStore.getState().setValidationIssues(issues)
    expect(useVisualWorkspaceStore.getState().validationIssues).toHaveLength(1)
  })

  it('should toggle validation overlay', () => {
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
    useVisualWorkspaceStore.getState().toggleValidationOverlay()
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(false)
    useVisualWorkspaceStore.getState().toggleValidationOverlay()
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
  })

  it('should set project ID', () => {
    useVisualWorkspaceStore.getState().setProjectId('proj-42')
    expect(useVisualWorkspaceStore.getState().projectId).toBe('proj-42')
  })

  it('should default showValidationOverlay to true', () => {
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
  })
})
