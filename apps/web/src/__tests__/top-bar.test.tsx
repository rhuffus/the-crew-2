import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { BreadcrumbEntry } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

// Mock tanstack router
const mockUseParams = vi.fn().mockReturnValue({ projectId: 'proj-1' })
vi.mock('@tanstack/react-router', () => ({
  useParams: (...args: unknown[]) => mockUseParams(...args),
  Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; [k: string]: unknown }) => (
    <a href={to} data-testid={rest['data-testid'] as string}>{children}</a>
  ),
}))

import { TopBar } from '@/components/visual-shell/top-bar'

function resetStore() {
  useVisualWorkspaceStore.setState({
    currentView: 'org',
    zoomLevel: 'L1',
    scopeEntityId: null,
    projectId: 'proj-1',
    breadcrumb: [],
    navigationStack: [],
    transitionDirection: null,
    transitionTargetId: null,
    selectedNodeIds: [],
    selectedEdgeIds: [],
    graphNodes: [],
    focusNodeId: null,
    explorerCollapsed: false,
    inspectorCollapsed: false,
    chatDockOpen: false,
    activeLayers: ['organization'],
    nodeTypeFilter: null,
    statusFilter: null,
    validationIssues: [],
    showValidationOverlay: true,
  })
}

describe('TopBar', () => {
  beforeEach(() => {
    resetStore()
    mockUseParams.mockReturnValue({ projectId: 'proj-1' })
  })

  it('should render the TheCrew link', () => {
    render(<TopBar />)
    expect(screen.getByText('TheCrew')).toBeDefined()
  })

  it('should show project ID as first breadcrumb', () => {
    render(<TopBar />)
    expect(screen.getByText('proj-1')).toBeDefined()
  })

  it('should show zoom level badge', () => {
    render(<TopBar />)
    const badge = screen.getByTestId('zoom-level-badge')
    expect(badge.textContent).toBe('L1')
  })

  it('should show L2 badge when zoom level is L2', () => {
    useVisualWorkspaceStore.setState({ zoomLevel: 'L2' })
    render(<TopBar />)
    expect(screen.getByTestId('zoom-level-badge').textContent).toBe('L2')
  })

  it('should show L3 badge when zoom level is L3', () => {
    useVisualWorkspaceStore.setState({ zoomLevel: 'L3' })
    render(<TopBar />)
    expect(screen.getByTestId('zoom-level-badge').textContent).toBe('L3')
  })

  it('should render breadcrumb entries from store', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L2' })
    render(<TopBar />)
    expect(screen.getByText('Organization')).toBeDefined()
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should render last breadcrumb as non-clickable text', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L2' })
    render(<TopBar />)
    // Last entry should be a span, not a link
    const engineering = screen.getByText('Engineering')
    expect(engineering.tagName).toBe('SPAN')
    expect(engineering.className).toContain('font-medium')
  })

  it('should render non-last breadcrumb entries as links', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L2' })
    render(<TopBar />)
    const org = screen.getByText('Organization')
    expect(org.tagName).toBe('A')
  })

  it('should show three-level breadcrumb for workflow', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
      { label: 'CI/CD Pipeline', nodeType: 'workflow', entityId: 'wf-1', zoomLevel: 'L3' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L3' })
    render(<TopBar />)
    expect(screen.getByText('Organization')).toBeDefined()
    expect(screen.getByText('Engineering')).toBeDefined()
    expect(screen.getByText('CI/CD Pipeline')).toBeDefined()
  })

  it('should render Draft badge', () => {
    render(<TopBar />)
    expect(screen.getByText('Draft')).toBeDefined()
  })

  it('should render Visual/Admin toggle', () => {
    render(<TopBar />)
    expect(screen.getByText('Visual')).toBeDefined()
    expect(screen.getByText('Admin')).toBeDefined()
  })

  it('should render empty breadcrumb when no entries', () => {
    useVisualWorkspaceStore.setState({ breadcrumb: [] })
    render(<TopBar />)
    // Should still show TheCrew and project ID, but no additional breadcrumbs
    expect(screen.getByText('TheCrew')).toBeDefined()
    expect(screen.getByText('proj-1')).toBeDefined()
  })

  it('should handle missing projectId gracefully', () => {
    mockUseParams.mockReturnValue({})
    render(<TopBar />)
    expect(screen.getByText('TheCrew')).toBeDefined()
  })
})
