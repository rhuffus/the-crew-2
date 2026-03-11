import { describe, it, expect, vi } from 'vitest'
import { renderWithRouter } from './test-utils'

// Mock useVisualGraph hook
vi.mock('@/hooks/use-visual-graph', () => ({
  useVisualGraph: () => ({
    data: undefined,
    isLoading: true,
    error: null,
  }),
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
    ReactFlow: () => <div data-testid="react-flow" />,
    Background: () => null,
    Controls: () => null,
    MiniMap: () => null,
    BackgroundVariant: { Dots: 'dots' },
    useNodesState: (init: unknown[]) => [init, vi.fn(), vi.fn()],
    useEdgesState: (init: unknown[]) => [init, vi.fn(), vi.fn()],
  }
})

describe('Department route', () => {
  it('should render department canvas page at /projects/p1/departments/d1', async () => {
    const { findByTestId } = await renderWithRouter('/projects/p1/departments/d1')

    const loading = await findByTestId('canvas-loading')
    expect(loading).toBeDefined()
  })

  it('should render loading text for department graph', async () => {
    const { findByText } = await renderWithRouter('/projects/p1/departments/dept-abc')

    const text = await findByText('Loading graph...')
    expect(text).toBeDefined()
  })
})
