import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { BreadcrumbEntry } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

// Mock tanstack router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; [k: string]: unknown }) => (
    <a href={to} data-testid={rest['data-testid'] as string}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}))

// Mock project provider
const mockUseCurrentProject = vi.fn().mockReturnValue({
  projectId: 'p1',
  projectName: 'Test Project',
  projectSlug: 'test-project',
})
vi.mock('@/providers/project-provider', () => ({
  useCurrentProject: (...args: unknown[]) => mockUseCurrentProject(...args),
}))

// Mock language store to avoid localStorage access during module load
vi.mock('@/stores/language-store', () => ({
  useLanguageStore: vi.fn(() => ({
    language: 'en',
    setLanguage: vi.fn(),
  })),
}))

// Mock useProjectDocument for center view indicator
const mockUseProjectDocument = vi.fn().mockReturnValue({ data: undefined, isLoading: false })
vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocument: (...args: unknown[]) => mockUseProjectDocument(...args),
}))

import { TopBar } from '@/components/visual-shell/top-bar'

function resetStore() {
  useVisualWorkspaceStore.setState({
    currentView: 'org',
    zoomLevel: 'L1',
    scopeEntityId: null,
    projectId: 'p1',
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
    centerView: { type: 'canvas' },
    centerViewHistory: [],
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
    mockUseCurrentProject.mockReturnValue({
      projectId: 'p1',
      projectName: 'Test Project',
      projectSlug: 'test-project',
    })
    mockUseProjectDocument.mockReturnValue({ data: undefined, isLoading: false })
  })

  it('should render the TheCrew link', () => {
    render(<TopBar />)
    expect(screen.getByText('TheCrew')).toBeDefined()
  })

  it('should show project name as first breadcrumb', () => {
    render(<TopBar />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })

  it('should show translated Company label at L1 scope', () => {
    useVisualWorkspaceStore.setState({
      breadcrumb: [{ label: 'Verticaler', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' }],
      zoomLevel: 'L1',
    })
    render(<TopBar />)
    // L1 entry label is replaced by translated "Company", not the company name
    expect(screen.getByText('Company')).toBeDefined()
    // The company name should NOT appear as a separate breadcrumb entry
    expect(screen.queryAllByText('Verticaler')).toHaveLength(0)
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

  it('should render breadcrumb entries from store (L1 filtered out)', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L2' })
    render(<TopBar />)
    // L1 entry is filtered out (project name already covers it)
    expect(screen.queryByText('Organization')).toBeNull()
    expect(screen.getByText('Engineering')).toBeDefined()
  })

  it('should render last breadcrumb as non-clickable text', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L2' })
    render(<TopBar />)
    // Engineering is the only visible entry (L1 filtered), so it's the last = non-clickable
    const engineering = screen.getByText('Engineering')
    expect(engineering.tagName).toBe('SPAN')
    expect(engineering.className).toContain('font-medium')
  })

  it('should render non-last breadcrumb entries as links', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
      { label: 'CI/CD Pipeline', nodeType: 'workflow', entityId: 'wf-1', zoomLevel: 'L3' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L3' })
    render(<TopBar />)
    // L1 filtered out; Engineering (L2) is non-last → link; CI/CD (L3) is last → span
    const eng = screen.getByText('Engineering')
    expect(eng.tagName).toBe('A')
    const pipeline = screen.getByText('CI/CD Pipeline')
    expect(pipeline.tagName).toBe('SPAN')
  })

  it('should show three-level breadcrumb for workflow (L1 filtered)', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
      { label: 'CI/CD Pipeline', nodeType: 'workflow', entityId: 'wf-1', zoomLevel: 'L3' },
    ]
    useVisualWorkspaceStore.setState({ breadcrumb: entries, zoomLevel: 'L3' })
    render(<TopBar />)
    // L1 "Organization" is filtered out
    expect(screen.queryByText('Organization')).toBeNull()
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

  it('should render Company label when breadcrumb is empty at L1', () => {
    useVisualWorkspaceStore.setState({ breadcrumb: [], zoomLevel: 'L1' })
    render(<TopBar />)
    // Should show TheCrew → Test Project → Company
    expect(screen.getByText('TheCrew')).toBeDefined()
    expect(screen.getByText('Test Project')).toBeDefined()
    expect(screen.getByText('Company')).toBeDefined()
  })

  it('should throw when rendered outside ProjectProvider', () => {
    mockUseCurrentProject.mockImplementation(() => {
      throw new Error('useCurrentProject must be used within a ProjectProvider')
    })
    expect(() => render(<TopBar />)).toThrow('useCurrentProject must be used within a ProjectProvider')
  })

  // VSR-015: Center view indicator
  describe('center view indicator (VSR-015)', () => {
    it('should show canvas indicator by default', () => {
      render(<TopBar />)
      const indicator = screen.getByTestId('center-view-indicator')
      expect(indicator.textContent).toBe('Canvas')
    })

    it('should show Chat label for generic chat view', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: 't-1' },
      })
      render(<TopBar />)
      const indicator = screen.getByTestId('center-view-indicator')
      expect(indicator.textContent).toBe('Chat')
    })

    it('should show Agent Chat label for agent chat view', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
      })
      render(<TopBar />)
      const indicator = screen.getByTestId('center-view-indicator')
      expect(indicator.textContent).toBe('Agent Chat')
    })

    it('should show document title when document data is loaded', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
      })
      mockUseProjectDocument.mockReturnValue({
        data: { id: 'doc-1', title: 'Company Vision' },
        isLoading: false,
      })
      render(<TopBar />)
      const indicator = screen.getByTestId('center-view-indicator')
      expect(indicator.textContent).toBe('Company Vision')
    })

    it('should show fallback Document label when document is loading', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
      })
      mockUseProjectDocument.mockReturnValue({ data: undefined, isLoading: true })
      render(<TopBar />)
      const indicator = screen.getByTestId('center-view-indicator')
      expect(indicator.textContent).toBe('Document')
    })

    it('should call useProjectDocument with correct projectId and documentId', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-42' },
      })
      render(<TopBar />)
      expect(mockUseProjectDocument).toHaveBeenCalledWith('p1', 'doc-42')
    })

    it('should call useProjectDocument with empty id when not on document view', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'canvas' },
      })
      render(<TopBar />)
      expect(mockUseProjectDocument).toHaveBeenCalledWith('p1', '')
    })
  })

  // VSR-016: Back button
  describe('center view back button (VSR-016)', () => {
    it('should not show back button when history is empty', () => {
      useVisualWorkspaceStore.setState({ centerViewHistory: [] })
      render(<TopBar />)
      expect(screen.queryByTestId('center-view-back-button')).toBeNull()
    })

    it('should show back button when history has entries', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
        centerViewHistory: [{ type: 'canvas' }],
      })
      render(<TopBar />)
      expect(screen.getByTestId('center-view-back-button')).toBeDefined()
    })

    it('should call goBackCenterView on click', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
        centerViewHistory: [{ type: 'canvas' }],
      })
      render(<TopBar />)
      fireEvent.click(screen.getByTestId('center-view-back-button'))
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
      expect(state.centerViewHistory).toEqual([])
    })

    it('should hide back button after navigating back to empty history', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
        centerViewHistory: [{ type: 'canvas' }],
      })
      const { rerender } = render(<TopBar />)
      fireEvent.click(screen.getByTestId('center-view-back-button'))
      rerender(<TopBar />)
      expect(screen.queryByTestId('center-view-back-button')).toBeNull()
    })

    it('should navigate back through multiple history entries', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
        centerViewHistory: [
          { type: 'canvas' },
          { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
        ],
      })
      render(<TopBar />)
      fireEvent.click(screen.getByTestId('center-view-back-button'))
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: null, agentId: 'ceo-agent-1' })
      expect(state.centerViewHistory).toEqual([{ type: 'canvas' }])
    })

    it('should have accessible aria-label', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' },
        centerViewHistory: [{ type: 'canvas' }],
      })
      render(<TopBar />)
      const button = screen.getByTestId('center-view-back-button')
      expect(button.getAttribute('aria-label')).toBe('Back')
    })
  })
})
