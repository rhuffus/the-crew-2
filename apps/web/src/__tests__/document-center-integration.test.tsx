import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import type { ProjectDocumentDto } from '@the-crew/shared-types'

// Mock MDXEditor — requires browser APIs not available in jsdom
vi.mock('@mdxeditor/editor', () => ({
  MDXEditor: React.forwardRef(({ markdown }: { markdown: string }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      getMarkdown: () => markdown,
      setMarkdown: () => {},
    }))
    return React.createElement('div', { 'data-testid': 'mdx-editor' }, markdown)
  }),
  headingsPlugin: () => ({}),
  listsPlugin: () => ({}),
  quotePlugin: () => ({}),
  thematicBreakPlugin: () => ({}),
  markdownShortcutPlugin: () => ({}),
  toolbarPlugin: () => ({}),
  BoldItalicUnderlineToggles: () => null,
  BlockTypeSelect: () => null,
  ListsToggle: () => null,
  UndoRedo: () => null,
}))
vi.mock('@mdxeditor/editor/style.css', () => ({}))

const mockDoc: ProjectDocumentDto = {
  id: 'doc-1',
  projectId: 'proj-1',
  slug: 'company-overview',
  title: 'Company Overview',
  bodyMarkdown: '# Overview\n\nContent here.',
  status: 'draft',
  linkedEntityIds: [],
  lastUpdatedBy: 'user',
  sourceType: 'user',
  createdAt: '2024-06-15T10:30:00Z',
  updatedAt: '2024-06-16T14:00:00Z',
}

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocument: () => ({
    data: mockDoc,
    isLoading: false,
  }),
  useProjectDocuments: () => ({ data: [mockDoc] }),
  useUpdateProjectDocument: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCreateProjectDocument: () => ({ mutate: vi.fn() }),
  useDeleteProjectDocument: () => ({ mutate: vi.fn() }),
}))

// Mock hooks used by Inspector
vi.mock('@/hooks/use-entity-detail', () => ({
  useEntityDetail: () => ({ data: null, isLoading: false }),
}))
vi.mock('@/hooks/use-permissions', () => ({
  usePermission: () => true,
}))
vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: () => ({ data: null }),
}))
vi.mock('@/lib/validation-mapping', () => ({
  groupIssuesByVisualNodeId: () => new Map(),
}))

// Stub sub-components that need external deps
vi.mock('@/components/visual-shell/canvas-viewport', () => ({
  CanvasViewport: () => React.createElement('div', { 'data-testid': 'canvas-viewport' }),
}))
// Inspector sub-components stubs (only the ones that would fail without context)
vi.mock('@/components/visual-shell/inspector/lock-indicator', () => ({
  LockIndicator: () => null,
}))
vi.mock('@/components/visual-shell/inspector/review-indicator', () => ({
  ReviewIndicator: () => null,
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: createQueryClient() }, children)
}

// Import components under test AFTER mocks
import { CenterPanel } from '@/components/visual-shell/center-panel'
import { Inspector } from '@/components/visual-shell/inspector/inspector'

describe('VSR-012: Document in CenterPanel + Inspector integration', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      projectId: 'proj-1',
      centerView: { type: 'canvas' },
      centerViewHistory: [],
      inspectorCollapsed: false,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      graphNodes: [],
      graphEdges: [],
      validationIssues: [],
      isDiffMode: false,
    })
  })

  describe('CenterPanel with document view', () => {
    it('renders DocumentEmbeddedView when centerView.type is document', async () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
      })
      render(React.createElement(CenterPanel), { wrapper: Wrapper })
      expect(screen.getByTestId('center-panel')).toBeDefined()
      await waitFor(() => {
        expect(screen.getByTestId('document-embedded-view')).toBeDefined()
      })
    })

    it('does not render canvas in document mode', async () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
      })
      render(React.createElement(CenterPanel), { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByTestId('document-embedded-view')).toBeDefined()
      })
      expect(screen.queryByTestId('canvas-viewport')).toBeNull()
    })

    it('renders canvas when centerView.type is canvas', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'canvas' },
      })
      render(React.createElement(CenterPanel), { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()
      expect(screen.queryByTestId('document-embedded-view')).toBeNull()
    })

    it('shows document title in embedded view', async () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
      })
      render(React.createElement(CenterPanel), { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByText('Company Overview')).toBeDefined()
      })
    })

    it('shows "No project selected" when projectId is null', () => {
      useVisualWorkspaceStore.setState({
        projectId: null,
        centerView: { type: 'document', documentId: 'doc-1' },
      })
      render(React.createElement(CenterPanel), { wrapper: Wrapper })
      expect(screen.getByText('No project selected')).toBeDefined()
    })
  })

  describe('Inspector with document center view', () => {
    it('renders DocumentInspectorPanel when centerView is document and no node selected', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      })
      render(React.createElement(Inspector), { wrapper: Wrapper })
      expect(screen.getByTestId('document-inspector-panel')).toBeDefined()
    })

    it('shows document title in inspector panel', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      })
      render(React.createElement(Inspector), { wrapper: Wrapper })
      expect(screen.getByText('Company Overview')).toBeDefined()
    })

    it('shows document slug in inspector panel', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      })
      render(React.createElement(Inspector), { wrapper: Wrapper })
      expect(screen.getByText('company-overview')).toBeDefined()
    })

    it('shows status badge in inspector panel', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      })
      render(React.createElement(Inspector), { wrapper: Wrapper })
      expect(screen.getByTestId('status-badge')).toBeDefined()
      expect(screen.getByTestId('status-badge').textContent).toBe('draft')
    })

    it('shows status transition actions', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'document', documentId: 'doc-1' },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      })
      render(React.createElement(Inspector), { wrapper: Wrapper })
      expect(screen.getByTestId('action-review')).toBeDefined()
    })

    it('shows CanvasSummary when centerView is canvas (default behavior)', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'canvas' },
        selectedNodeIds: [],
        selectedEdgeIds: [],
      })
      render(React.createElement(Inspector), { wrapper: Wrapper })
      expect(screen.queryByTestId('document-inspector-panel')).toBeNull()
      expect(screen.getByTestId('canvas-summary')).toBeDefined()
    })
  })

  describe('Store integration: openDocumentView triggers both panels', () => {
    it('openDocumentView sets centerView to document type', () => {
      useVisualWorkspaceStore.getState().openDocumentView('doc-1')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'document', documentId: 'doc-1' })
    })

    it('openCanvasView clears document view', () => {
      useVisualWorkspaceStore.getState().openDocumentView('doc-1')
      useVisualWorkspaceStore.getState().openCanvasView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
    })

    it('goBackCenterView returns to canvas from document', () => {
      useVisualWorkspaceStore.getState().openDocumentView('doc-1')
      useVisualWorkspaceStore.getState().goBackCenterView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
    })
  })
})
