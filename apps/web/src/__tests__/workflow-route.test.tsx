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

describe('Workflow route', () => {
  it('should render workflow canvas page at /projects/p1/workflows/wf1', async () => {
    const { findByTestId } = await renderWithRouter('/projects/p1/workflows/wf1')

    const loading = await findByTestId('workflow-canvas-loading')
    expect(loading).toBeDefined()
  })
})
