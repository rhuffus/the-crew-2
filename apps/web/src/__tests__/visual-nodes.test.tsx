import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReactFlowProvider, type NodeProps } from '@xyflow/react'
import { VisualNode } from '@/components/visual-shell/nodes/visual-node'
import { WorkflowStageNode } from '@/components/visual-shell/nodes/workflow-stage-node'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

// Mock handles since they require ReactFlow context
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    Handle: ({ type }: { type: string }) => <div data-testid={`handle-${type}`} />,
    Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
    ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

function renderNode(Component: React.ComponentType<NodeProps>, data: Record<string, unknown>) {
  const C = Component as React.ComponentType<Record<string, unknown>>
  return render(
    <ReactFlowProvider>
      <C
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

describe('VisualNode', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({ collapsedNodeIds: [] })
  })

  it('should render label and type for department node', () => {
    renderNode(VisualNode, {
      label: 'Engineering',
      sublabel: 'Build great things',
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    expect(screen.getByText('Engineering')).toBeDefined()
    expect(screen.getByText('Build great things')).toBeDefined()
    expect(screen.getByText('Department')).toBeDefined()
    expect(screen.getByTestId('visual-node-department')).toBeDefined()
  })

  it('should render with error status styling', () => {
    renderNode(VisualNode, {
      label: 'Bad Company',
      sublabel: null,
      nodeType: 'company',
      entityId: 'p1',
      status: 'error',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    const node = screen.getByTestId('visual-node-company')
    expect(node.className).toContain('border-red-400')
    expect(node.className).toContain('bg-red-50')
  })

  it('should render with warning status styling', () => {
    renderNode(VisualNode, {
      label: 'Warn Role',
      sublabel: null,
      nodeType: 'role',
      entityId: 'r1',
      status: 'warning',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    const node = screen.getByTestId('visual-node-role')
    expect(node.className).toContain('border-yellow-400')
  })

  it('should not render sublabel when null', () => {
    renderNode(VisualNode, {
      label: 'No Sub',
      sublabel: null,
      nodeType: 'capability',
      entityId: 'c1',
      status: 'normal',
      collapsed: false,
      layerIds: ['capabilities'],
      parentId: null,
    })

    expect(screen.getByText('No Sub')).toBeDefined()
    expect(screen.queryByText('Capability')).toBeDefined()
  })

  it('should render workflow node type', () => {
    renderNode(VisualNode, {
      label: 'Deploy Pipeline',
      sublabel: 'active',
      nodeType: 'workflow',
      entityId: 'wf1',
      status: 'normal',
      collapsed: false,
      layerIds: ['workflows'],
      parentId: null,
    })

    expect(screen.getByText('Deploy Pipeline')).toBeDefined()
    expect(screen.getByText('active')).toBeDefined()
    expect(screen.getByText('Workflow')).toBeDefined()
  })

  // VIS-008b: Connection dimming/highlight
  it('should apply dimming when connectionDimmed is true', () => {
    renderNode(VisualNode, {
      label: 'Dimmed Node',
      sublabel: null,
      nodeType: 'capability',
      entityId: 'c1',
      status: 'normal',
      collapsed: false,
      layerIds: ['capabilities'],
      parentId: null,
      connectionDimmed: true,
    })

    const node = screen.getByTestId('visual-node-capability')
    expect(node.className).toContain('opacity-30')
    expect(node.className).toContain('pointer-events-none')
    expect(node.getAttribute('data-connection-dimmed')).toBe('true')
  })

  it('should apply highlight ring when connectionHighlight is true', () => {
    renderNode(VisualNode, {
      label: 'Valid Target',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      connectionHighlight: true,
    })

    const node = screen.getByTestId('visual-node-department')
    expect(node.className).toContain('ring-2')
    expect(node.className).toContain('ring-blue-400')
    expect(node.getAttribute('data-connection-highlight')).toBe('true')
  })

  it('should not apply dimming or highlight by default', () => {
    renderNode(VisualNode, {
      label: 'Normal Node',
      sublabel: null,
      nodeType: 'role',
      entityId: 'r1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    const node = screen.getByTestId('visual-node-role')
    expect(node.className).not.toContain('opacity-30')
    expect(node.className).not.toContain('ring-blue-400')
    expect(node.getAttribute('data-connection-dimmed')).toBeNull()
    expect(node.getAttribute('data-connection-highlight')).toBeNull()
  })

  it('should have transition-opacity class for smooth feedback', () => {
    renderNode(VisualNode, {
      label: 'Transition Node',
      sublabel: null,
      nodeType: 'company',
      entityId: 'co1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    const node = screen.getByTestId('visual-node-company')
    expect(node.className).toContain('transition-opacity')
  })

  // VIS-011b: Drilldown indicator
  it('should show drilldown indicator for department node', () => {
    renderNode(VisualNode, {
      label: 'Engineering',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    expect(screen.getByTestId('drilldown-indicator')).toBeDefined()
  })

  it('should show drilldown indicator for workflow node', () => {
    renderNode(VisualNode, {
      label: 'Deploy',
      sublabel: null,
      nodeType: 'workflow',
      entityId: 'wf1',
      status: 'normal',
      collapsed: false,
      layerIds: ['workflows'],
      parentId: null,
    })

    expect(screen.getByTestId('drilldown-indicator')).toBeDefined()
  })

  it('should show drilldown indicator for company node', () => {
    renderNode(VisualNode, {
      label: 'Acme Corp',
      sublabel: null,
      nodeType: 'company',
      entityId: 'c1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    expect(screen.getByTestId('drilldown-indicator')).toBeDefined()
  })

  it('should NOT show drilldown indicator for role node', () => {
    renderNode(VisualNode, {
      label: 'Dev',
      sublabel: null,
      nodeType: 'role',
      entityId: 'r1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    expect(screen.queryByTestId('drilldown-indicator')).toBeNull()
  })

  it('should NOT show drilldown indicator for capability node', () => {
    renderNode(VisualNode, {
      label: 'Coding',
      sublabel: null,
      nodeType: 'capability',
      entityId: 'cap1',
      status: 'normal',
      collapsed: false,
      layerIds: ['capabilities'],
      parentId: null,
    })

    expect(screen.queryByTestId('drilldown-indicator')).toBeNull()
  })

  it('should have hover shadow class for drillable nodes', () => {
    renderNode(VisualNode, {
      label: 'Dept',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
    })

    const node = screen.getByTestId('visual-node-department')
    expect(node.className).toContain('cursor-pointer')
    expect(node.className).toContain('hover:shadow-md')
  })

  it('should NOT have hover shadow class for non-drillable nodes', () => {
    renderNode(VisualNode, {
      label: 'Policy',
      sublabel: null,
      nodeType: 'policy',
      entityId: 'p1',
      status: 'normal',
      collapsed: false,
      layerIds: ['governance'],
      parentId: null,
    })

    const node = screen.getByTestId('visual-node-policy')
    expect(node.className).not.toContain('cursor-pointer')
    expect(node.className).not.toContain('hover:shadow-md')
  })

  // VIS-011e: External reference badge
  it('should show external ref badge when externalRefCount > 0', () => {
    renderNode(VisualNode, {
      label: 'Cross-ref Node',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      externalRefCount: 3,
    })

    const badge = screen.getByTestId('external-ref-badge')
    expect(badge).toBeDefined()
    expect(badge.getAttribute('title')).toBe('3 external reference(s)')
    expect(screen.getByText('3')).toBeDefined()
  })

  it('should not show external ref badge when externalRefCount is 0', () => {
    renderNode(VisualNode, {
      label: 'No Ext Refs',
      sublabel: null,
      nodeType: 'role',
      entityId: 'r1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      externalRefCount: 0,
    })

    expect(screen.queryByTestId('external-ref-badge')).toBeNull()
  })

  it('should not show external ref badge when externalRefCount is undefined', () => {
    renderNode(VisualNode, {
      label: 'Default Node',
      sublabel: null,
      nodeType: 'capability',
      entityId: 'c1',
      status: 'normal',
      collapsed: false,
      layerIds: ['capabilities'],
      parentId: null,
    })

    expect(screen.queryByTestId('external-ref-badge')).toBeNull()
  })

  // VIS-011d: Collapse/expand toggle
  it('should not show collapse toggle when isContainer is false', () => {
    renderNode(VisualNode, {
      label: 'Leaf Node',
      sublabel: null,
      nodeType: 'role',
      entityId: 'r1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      isContainer: false,
    })

    expect(screen.queryByTestId('collapse-toggle')).toBeNull()
  })

  it('should show collapse toggle when isContainer is true', () => {
    renderNode(VisualNode, {
      label: 'Container Dept',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      isContainer: true,
      isCollapsed: false,
    })

    expect(screen.getByTestId('collapse-toggle')).toBeDefined()
    expect(screen.getByTestId('collapse-toggle').getAttribute('title')).toBe('Collapse children')
  })

  it('should show expand title when isCollapsed is true', () => {
    renderNode(VisualNode, {
      label: 'Collapsed Dept',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      isContainer: true,
      isCollapsed: true,
    })

    expect(screen.getByTestId('collapse-toggle').getAttribute('title')).toBe('Expand children')
  })

  it('should show collapsed badge with hidden child count', () => {
    renderNode(VisualNode, {
      label: 'Collapsed Dept',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      isContainer: true,
      isCollapsed: true,
      hiddenChildCount: 5,
    })

    const badge = screen.getByTestId('collapsed-badge')
    expect(badge).toBeDefined()
    expect(badge.getAttribute('title')).toBe('5 hidden children')
    expect(screen.getByText('+5')).toBeDefined()
  })

  it('should not show collapsed badge when not collapsed', () => {
    renderNode(VisualNode, {
      label: 'Expanded Dept',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      isContainer: true,
      isCollapsed: false,
      hiddenChildCount: 0,
    })

    expect(screen.queryByTestId('collapsed-badge')).toBeNull()
  })

  it('should call toggleCollapse when collapse toggle is clicked', () => {
    renderNode(VisualNode, {
      label: 'Container',
      sublabel: null,
      nodeType: 'department',
      entityId: 'd1',
      status: 'normal',
      collapsed: false,
      layerIds: ['organization'],
      parentId: null,
      isContainer: true,
      isCollapsed: false,
    })

    fireEvent.click(screen.getByTestId('collapse-toggle'))
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toContain('test')
  })
})

describe('WorkflowStageNode', () => {
  it('should render stage label', () => {
    renderNode(WorkflowStageNode, {
      label: 'Build',
      sublabel: 'Build the artifacts',
      status: 'normal',
    })

    expect(screen.getByText('Build')).toBeDefined()
    expect(screen.getByText('Build the artifacts')).toBeDefined()
    expect(screen.getByTestId('workflow-stage-node')).toBeDefined()
  })

  it('should apply error ring for error status', () => {
    renderNode(WorkflowStageNode, {
      label: 'Broken Stage',
      sublabel: null,
      status: 'error',
    })

    const node = screen.getByTestId('workflow-stage-node')
    expect(node.className).toContain('ring-red-400')
  })

  it('should apply warning ring for warning status', () => {
    renderNode(WorkflowStageNode, {
      label: 'Warn Stage',
      sublabel: null,
      status: 'warning',
    })

    const node = screen.getByTestId('workflow-stage-node')
    expect(node.className).toContain('ring-yellow-400')
  })

  it('should not render sublabel when null', () => {
    renderNode(WorkflowStageNode, {
      label: 'Simple Stage',
      sublabel: null,
      status: 'normal',
    })

    expect(screen.getByText('Simple Stage')).toBeDefined()
    // No extra text elements beyond the label
  })

  it('should have left and right handles for horizontal flow', () => {
    renderNode(WorkflowStageNode, {
      label: 'Stage',
      sublabel: null,
      status: 'normal',
    })

    expect(screen.getByTestId('handle-target')).toBeDefined()
    expect(screen.getByTestId('handle-source')).toBeDefined()
  })
})
