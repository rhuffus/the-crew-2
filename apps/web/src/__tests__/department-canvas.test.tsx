import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter } from './test-utils'
import type { VisualGraphDto } from '@the-crew/shared-types'

// Mock useVisualGraph hook
const mockUseVisualGraph = vi.fn()
vi.mock('@/hooks/use-visual-graph', () => ({
  useVisualGraph: (...args: unknown[]) => mockUseVisualGraph(...args),
}))

// Mock useValidations hook
vi.mock('@/hooks/use-validations', () => ({
  useValidations: () => ({ data: undefined, isLoading: false, error: null }),
}))

// Mock graph-filter
vi.mock('@/lib/graph-filter', () => ({
  filterGraph: (nodes: unknown[], edges: unknown[]) => ({ nodes, edges }),
}))

// Mock view-persistence
vi.mock('@/lib/view-persistence', () => ({
  loadViewState: () => null,
  saveViewState: () => {},
}))

// Mock React Flow since jsdom doesn't support canvas
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
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
    useNodesState: (init: unknown[]) => [init, vi.fn(), vi.fn()],
    useEdgesState: (init: unknown[]) => [init, vi.fn(), vi.fn()],
  }
})

const mockGraph: VisualGraphDto = {
  projectId: 'p1',
  scopeType: 'department',
  scope: { level: 'L2', entityId: 'd1', entityType: 'department' },
  zoomLevel: 'L2',
  nodes: [
    {
      id: 'dept:d1', nodeType: 'department', entityId: 'd1', label: 'Engineering',
      sublabel: 'Build stuff', position: null, collapsed: false, status: 'normal',
      layerIds: ['organization'], parentId: null,
    },
    {
      id: 'role:r1', nodeType: 'role', entityId: 'r1', label: 'Tech Lead',
      sublabel: 'Technical leadership', position: null, collapsed: false, status: 'normal',
      layerIds: ['organization'], parentId: 'dept:d1',
    },
    {
      id: 'cap:c1', nodeType: 'capability', entityId: 'c1', label: 'API Design',
      sublabel: 'REST API patterns', position: null, collapsed: false, status: 'normal',
      layerIds: ['capabilities'], parentId: 'dept:d1',
    },
  ],
  edges: [
    {
      id: 'owns1', edgeType: 'owns', sourceId: 'dept:d1',
      targetId: 'cap:c1', label: null, style: 'solid', layerIds: ['capabilities'],
    },
  ],
  activeLayers: ['organization', 'capabilities'],
  breadcrumb: [
    { label: 'Acme', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' },
    { label: 'Engineering', nodeType: 'department', entityId: 'd1', zoomLevel: 'L2' },
  ],
}

describe('Department Canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state at department route', async () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: true, error: null })

    const { findByTestId } = renderWithRouter('/projects/p1/departments/d1')

    const loading = await findByTestId('canvas-loading')
    expect(loading).toBeDefined()
  })

  it('should render error state when graph fetch fails', async () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') })

    const { findByText } = renderWithRouter('/projects/p1/departments/d1')

    const errorText = await findByText('Failed to load department graph')
    expect(errorText).toBeDefined()
  })

  it('should render React Flow with department graph nodes and edges', async () => {
    mockUseVisualGraph.mockReturnValue({ data: mockGraph, isLoading: false, error: null })

    const { findByTestId } = renderWithRouter('/projects/p1/departments/d1')

    const reactFlow = await findByTestId('react-flow')
    expect(reactFlow).toBeDefined()

    // 3 nodes: dept + role + capability
    const nodeCount = await findByTestId('node-count')
    expect(nodeCount.textContent).toBe('3')

    // 1 edge: owns
    const edgeCount = await findByTestId('edge-count')
    expect(edgeCount.textContent).toBe('1')
  })

  it('should call useVisualGraph with L2 and departmentId', async () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: true, error: null })

    const { findByTestId } = renderWithRouter('/projects/p1/departments/dept-abc')

    await findByTestId('canvas-loading')

    // Should be called with projectId='p1', level='L2', entityId='dept-abc'
    expect(mockUseVisualGraph).toHaveBeenCalled()
    const call = mockUseVisualGraph.mock.calls[0]!
    expect(call[0]).toBe('p1')
    expect(call[1]).toBe('department')
    expect(call[2]).toBe('dept-abc')
  })

  it('should render empty canvas when graph has no nodes', async () => {
    const emptyGraph: VisualGraphDto = {
      ...mockGraph,
      nodes: [],
      edges: [],
    }
    mockUseVisualGraph.mockReturnValue({ data: emptyGraph, isLoading: false, error: null })

    const { findByTestId } = renderWithRouter('/projects/p1/departments/d1')

    const nodeCount = await findByTestId('node-count')
    expect(nodeCount.textContent).toBe('0')

    const edgeCount = await findByTestId('edge-count')
    expect(edgeCount.textContent).toBe('0')
  })

  it('should render breadcrumb with backend labels', async () => {
    mockUseVisualGraph.mockReturnValue({ data: mockGraph, isLoading: false, error: null })

    const { findByText, findAllByText } = renderWithRouter('/projects/p1/departments/d1')

    // TopBar now uses store breadcrumb from graph response
    // The graph breadcrumb has entries: Acme (L1) → Engineering (L2)
    const acme = await findByText('Acme')
    expect(acme).toBeDefined()
    // "Engineering" appears in both breadcrumb and the entity tree, so use findAllByText
    const engMatches = await findAllByText('Engineering')
    expect(engMatches.length).toBeGreaterThanOrEqual(1)
  })

  it('should render the visual shell wrapper', async () => {
    mockUseVisualGraph.mockReturnValue({ data: undefined, isLoading: true, error: null })

    const { findByTestId } = renderWithRouter('/projects/p1/departments/d1')

    const topbar = await findByTestId('visual-topbar')
    expect(topbar).toBeDefined()
  })
})
