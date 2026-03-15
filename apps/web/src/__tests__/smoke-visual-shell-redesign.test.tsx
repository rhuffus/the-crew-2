/**
 * VSR-019 — Smoke test: Visual Shell Redesign (Epics 69-72)
 *
 * Validates the full e2e flow of the redesigned visual shell:
 *   1. Create project → CEO chat opens as center view
 *   2. Chat renders in center with ChatInspectorPanel in inspector
 *   3. Document opens as center view with DocumentInspectorPanel
 *   4. Back button navigates to previous center view
 *   5. Keyboard shortcuts switch between center views
 *   6. Center view indicator in TopBar reflects active view
 *   7. Inspector adapts to each center view type
 *
 * Uses mocked hooks and components (no backend required).
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import type { CenterView } from '@/stores/visual-workspace-store'
import type { ProjectDocumentDto } from '@the-crew/shared-types'

// ---------------------------------------------------------------------------
// Mocks — resizable panels
// ---------------------------------------------------------------------------
vi.mock('react-resizable-panels', () => ({
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Separator: () => <div />,
}))

// ---------------------------------------------------------------------------
// Mocks — router
// ---------------------------------------------------------------------------
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useParams: () => ({ projectSlug: 'smoke-vsr' }),
}))

// ---------------------------------------------------------------------------
// Mocks — project provider
// ---------------------------------------------------------------------------
vi.mock('@/providers/project-provider', () => ({
  useCurrentProject: () => ({
    projectId: 'proj-smoke',
    projectName: 'SmokeVSR Co',
    projectSlug: 'smoke-vsr',
  }),
}))

// ---------------------------------------------------------------------------
// Mocks — language store
// ---------------------------------------------------------------------------
vi.mock('@/stores/language-store', () => ({
  useLanguageStore: vi.fn(() => ({ language: 'en', setLanguage: vi.fn() })),
}))

// ---------------------------------------------------------------------------
// Mocks — document hooks
// ---------------------------------------------------------------------------
const mockDoc: ProjectDocumentDto = {
  id: 'doc-smoke-1',
  projectId: 'proj-smoke',
  slug: 'company-vision',
  title: 'Company Vision',
  bodyMarkdown: '# Vision\n\nSmoke test content.',
  status: 'draft',
  linkedEntityIds: [],
  lastUpdatedBy: 'user',
  sourceType: 'agent',
  createdAt: '2026-03-14T10:00:00Z',
  updatedAt: '2026-03-14T10:05:00Z',
}

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocument: vi.fn(() => ({
    data: mockDoc,
    isLoading: false,
  })),
  useProjectDocuments: vi.fn(() => ({ data: [mockDoc] })),
  useUpdateProjectDocument: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateProjectDocument: vi.fn(() => ({ mutate: vi.fn() })),
  useDeleteProjectDocument: vi.fn(() => ({ mutate: vi.fn() })),
}))

// ---------------------------------------------------------------------------
// Mocks — bootstrap & conversation hooks
// ---------------------------------------------------------------------------
vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: vi.fn(() => ({
    data: { maturityPhase: 'growth' },
  })),
  useBootstrapProject: vi.fn(() => ({ mutate: vi.fn() })),
}))

vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: vi.fn(() => ({
    data: { status: 'collecting-context', threadId: 't-smoke' },
    isError: false,
  })),
  useStartBootstrapConversation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useSendBootstrapMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useProposeGrowth: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useApproveGrowthProposal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRejectGrowthProposal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

// ---------------------------------------------------------------------------
// Mocks — chat hooks
// ---------------------------------------------------------------------------
vi.mock('@/hooks/use-chat', () => ({
  useChatThread: vi.fn(() => ({ data: { id: 't-smoke', messageCount: 1 } })),
  useChatMessages: vi.fn(() => ({
    data: [
      {
        id: 'msg-1',
        threadId: 't-smoke',
        role: 'assistant',
        content: 'Welcome to SmokeVSR Co!',
        entityRefs: [],
        actions: [],
        createdAt: '2026-03-14T10:00:00Z',
      },
    ],
    isLoading: false,
  })),
  useSendMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useChatThreads: vi.fn(() => ({ data: [], isLoading: false })),
}))

// ---------------------------------------------------------------------------
// Mocks — other hooks
// ---------------------------------------------------------------------------
vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(() => true),
}))

vi.mock('@/hooks/use-entity-detail', () => ({
  useEntityDetail: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('@/hooks/use-before-unload', () => ({
  useBeforeUnload: () => {},
}))

vi.mock('@/lib/validation-mapping', () => ({
  groupIssuesByVisualNodeId: vi.fn(() => new Map()),
}))

vi.mock('@/stores/proposals-store', () => ({
  useProposalsStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({ proposals: [] }),
  ),
}))

vi.mock('@/stores/runtime-status-store', () => ({
  useRuntimeStatusStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({ summary: null, costSummary: null, connected: false }),
  ),
}))

vi.mock('@/hooks/use-lcp-agents', () => ({
  useLcpAgent: vi.fn(() => ({ data: null, isLoading: false })),
  useLcpAgents: vi.fn(() => ({ data: [], isLoading: false })),
}))

// ---------------------------------------------------------------------------
// Mocks — heavy components stubbed for speed
// ---------------------------------------------------------------------------
vi.mock('@/components/visual-shell/canvas-viewport', () => ({
  CanvasViewport: () => <div data-testid="canvas-viewport">Canvas</div>,
}))

vi.mock('@/components/visual-shell/chat-dock/chat-full-view', () => ({
  ChatFullView: () => <div data-testid="chat-full-view">Chat Center</div>,
}))

vi.mock('@/components/documents/document-embedded-view', () => ({
  DocumentEmbeddedView: ({ documentId }: { documentId: string }) => (
    <div data-testid="document-embedded-view">Doc: {documentId}</div>
  ),
}))

vi.mock('@/components/visual-shell/inspector/lock-indicator', () => ({
  LockIndicator: () => null,
}))

vi.mock('@/components/visual-shell/inspector/review-indicator', () => ({
  ReviewIndicator: () => null,
}))

// ---------------------------------------------------------------------------
// Imports under test (after mocks)
// ---------------------------------------------------------------------------
import { VisualShell } from '@/components/visual-shell/visual-shell'
import { CenterPanel } from '@/components/visual-shell/center-panel'
import { Inspector } from '@/components/visual-shell/inspector/inspector'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      {children}
    </QueryClientProvider>
  )
}

function resetStore(overrides?: Partial<{ centerView: CenterView; centerViewHistory: CenterView[] }>) {
  useVisualWorkspaceStore.setState({
    projectId: 'proj-smoke',
    currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
    currentView: 'org',
    zoomLevel: 'L1',
    scopeEntityId: null,
    breadcrumb: [],
    navigationStack: [],
    transitionDirection: null,
    transitionTargetId: null,
    selectedNodeIds: [],
    selectedEdgeIds: [],
    graphNodes: [],
    graphEdges: [],
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
    isDiffMode: false,
    ...overrides,
  })
}

function pressKey(key: string, modifiers: { metaKey?: boolean; ctrlKey?: boolean } = {}) {
  fireEvent.keyDown(document, {
    key,
    metaKey: modifiers.metaKey ?? false,
    ctrlKey: modifiers.ctrlKey ?? false,
  })
}

// ===========================================================================
// TESTS
// ===========================================================================

describe('VSR-019: Visual Shell Redesign Smoke Tests', () => {
  beforeEach(() => {
    resetStore()
  })

  // -----------------------------------------------------------------------
  // 1. Center view transitions (store level)
  // -----------------------------------------------------------------------
  describe('Store: center view lifecycle', () => {
    it('starts on canvas by default', () => {
      expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
    })

    it('openChatView transitions to CEO chat', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: null, agentId: 'ceo-agent-1' })
    })

    it('openDocumentView transitions to document', () => {
      useVisualWorkspaceStore.getState().openDocumentView('doc-smoke-1')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'document', documentId: 'doc-smoke-1' })
    })

    it('openCanvasView returns to canvas from any view', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      useVisualWorkspaceStore.getState().openCanvasView()
      expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
    })

    it('goBackCenterView pops history correctly', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      useVisualWorkspaceStore.getState().openDocumentView('doc-smoke-1')
      // history: [canvas, chat] — current: document
      useVisualWorkspaceStore.getState().goBackCenterView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView.type).toBe('chat')
    })

    it('full round-trip: canvas → chat → document → back → back → canvas', () => {
      const { getState } = useVisualWorkspaceStore
      getState().openChatView(null, 'ceo-agent-1')
      getState().openDocumentView('doc-smoke-1')
      expect(getState().centerView.type).toBe('document')

      getState().goBackCenterView()
      expect(getState().centerView.type).toBe('chat')

      getState().goBackCenterView()
      expect(getState().centerView.type).toBe('canvas')
    })

    it('history stays within max limit', () => {
      const { getState } = useVisualWorkspaceStore
      for (let i = 0; i < 25; i++) {
        getState().openChatView(`thread-${i}`)
      }
      expect(getState().centerViewHistory.length).toBeLessThanOrEqual(20)
    })
  })

  // -----------------------------------------------------------------------
  // 2. CenterPanel renders correct content
  // -----------------------------------------------------------------------
  describe('CenterPanel renders per centerView type', () => {
    it('renders canvas-viewport for canvas view', () => {
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()
      expect(screen.queryByTestId('chat-full-view')).toBeNull()
      expect(screen.queryByTestId('document-embedded-view')).toBeNull()
    })

    it('renders chat-full-view for chat view', () => {
      resetStore({ centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' } })
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('chat-full-view')).toBeDefined()
      expect(screen.queryByTestId('canvas-viewport')).toBeNull()
    })

    it('renders document-embedded-view for document view', async () => {
      resetStore({ centerView: { type: 'document', documentId: 'doc-smoke-1' } })
      render(<CenterPanel />, { wrapper: Wrapper })
      await waitFor(() => {
        expect(screen.getByTestId('document-embedded-view')).toBeDefined()
      })
      expect(screen.queryByTestId('canvas-viewport')).toBeNull()
    })

    it('re-renders when store transitions canvas → chat → document', async () => {
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()

      act(() => {
        useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      })
      expect(screen.getByTestId('chat-full-view')).toBeDefined()

      act(() => {
        useVisualWorkspaceStore.getState().openDocumentView('doc-smoke-1')
      })
      await waitFor(() => {
        expect(screen.getByTestId('document-embedded-view')).toBeDefined()
      })
    })
  })

  // -----------------------------------------------------------------------
  // 3. Inspector adapts to center view
  // -----------------------------------------------------------------------
  describe('Inspector adapts to center view type', () => {
    it('shows CanvasSummary when center is canvas', () => {
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-summary')).toBeDefined()
      expect(screen.queryByTestId('chat-inspector-panel')).toBeNull()
      expect(screen.queryByTestId('document-inspector-panel')).toBeNull()
    })

    it('shows AgentChatInspectorPanel when center is chat with agentId', () => {
      resetStore({ centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' } })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('agent-chat-inspector-panel')).toBeDefined()
      expect(screen.queryByTestId('canvas-summary')).toBeNull()
      expect(screen.queryByTestId('document-inspector-panel')).toBeNull()
    })

    it('shows DocumentInspectorPanel when center is document', () => {
      resetStore({ centerView: { type: 'document', documentId: 'doc-smoke-1' } })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('document-inspector-panel')).toBeDefined()
      expect(screen.queryByTestId('canvas-summary')).toBeNull()
      expect(screen.queryByTestId('agent-chat-inspector-panel')).toBeNull()
    })

    it('Inspector transitions reactively with store changes', () => {
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-summary')).toBeDefined()

      act(() => {
        useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      })
      expect(screen.getByTestId('agent-chat-inspector-panel')).toBeDefined()

      act(() => {
        useVisualWorkspaceStore.getState().openDocumentView('doc-smoke-1')
      })
      expect(screen.getByTestId('document-inspector-panel')).toBeDefined()

      act(() => {
        useVisualWorkspaceStore.getState().openCanvasView()
      })
      expect(screen.getByTestId('canvas-summary')).toBeDefined()
    })
  })

  // -----------------------------------------------------------------------
  // 4. TopBar: center view indicator + back button
  // -----------------------------------------------------------------------
  describe('TopBar: center view indicator and back button', () => {
    it('shows Canvas indicator on default view', () => {
      render(<VisualShell />, { wrapper: Wrapper })
      expect(screen.getByTestId('center-view-indicator')).toBeDefined()
    })

    it('back button hidden when history is empty', () => {
      render(<VisualShell />, { wrapper: Wrapper })
      expect(screen.queryByTestId('center-view-back-button')).toBeNull()
    })

    it('back button appears after navigating to chat', () => {
      render(<VisualShell />, { wrapper: Wrapper })

      act(() => {
        useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      })
      expect(screen.getByTestId('center-view-back-button')).toBeDefined()
    })

    it('back button navigates back through history', () => {
      render(<VisualShell />, { wrapper: Wrapper })

      act(() => {
        useVisualWorkspaceStore.getState().openChatView(null, 'ceo-agent-1')
      })
      act(() => {
        useVisualWorkspaceStore.getState().openDocumentView('doc-smoke-1')
      })

      // Click back — should go to chat
      fireEvent.click(screen.getByTestId('center-view-back-button'))
      expect(useVisualWorkspaceStore.getState().centerView.type).toBe('chat')

      // Click back again — should go to canvas
      fireEvent.click(screen.getByTestId('center-view-back-button'))
      expect(useVisualWorkspaceStore.getState().centerView.type).toBe('canvas')

      // Back button should disappear
      expect(screen.queryByTestId('center-view-back-button')).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // 5. Keyboard shortcuts (Cmd+1/2/3)
  // -----------------------------------------------------------------------
  describe('Keyboard shortcuts switch center views', () => {
    it('Cmd+1 switches to canvas from chat', () => {
      resetStore({ centerView: { type: 'chat', threadId: null, agentId: 'ceo-agent-1' } })
      render(<VisualShell />, { wrapper: Wrapper })
      pressKey('1', { metaKey: true })
      expect(useVisualWorkspaceStore.getState().centerView.type).toBe('canvas')
    })

    it('Cmd+2 switches to chat from canvas', () => {
      render(<VisualShell />, { wrapper: Wrapper })
      pressKey('2', { metaKey: true })
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView.type).toBe('chat')
    })

    it('Cmd+3 navigates to last document in history', () => {
      resetStore({
        centerView: { type: 'canvas' },
        centerViewHistory: [
          { type: 'document', documentId: 'doc-smoke-1' },
        ],
      })
      render(<VisualShell />, { wrapper: Wrapper })
      pressKey('3', { metaKey: true })
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView.type).toBe('document')
      if (state.centerView.type === 'document') {
        expect(state.centerView.documentId).toBe('doc-smoke-1')
      }
    })
  })

  // -----------------------------------------------------------------------
  // 6. Full e2e scenario: project lifecycle
  // -----------------------------------------------------------------------
  describe('Full lifecycle: canvas → chat → document → back → canvas', () => {
    it('simulates the complete user journey through center views', async () => {
      render(<VisualShell />, { wrapper: Wrapper })

      // Step 1: Starts on canvas
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()
      expect(screen.getByTestId('center-view-indicator')).toBeDefined()
      expect(screen.queryByTestId('center-view-back-button')).toBeNull()

      // Step 2: User opens CEO chat (Cmd+2)
      pressKey('2', { metaKey: true })
      expect(screen.getByTestId('chat-full-view')).toBeDefined()
      expect(screen.queryByTestId('canvas-viewport')).toBeNull()
      expect(screen.getByTestId('center-view-back-button')).toBeDefined()

      // Step 3: User opens a document via store action
      act(() => {
        useVisualWorkspaceStore.getState().openDocumentView('doc-smoke-1')
      })
      await waitFor(() => {
        expect(screen.getByTestId('document-embedded-view')).toBeDefined()
      })
      expect(screen.queryByTestId('chat-full-view')).toBeNull()

      // Step 4: User clicks back — returns to chat
      fireEvent.click(screen.getByTestId('center-view-back-button'))
      expect(screen.getByTestId('chat-full-view')).toBeDefined()

      // Step 5: User presses Cmd+1 — returns to canvas
      pressKey('1', { metaKey: true })
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()
      expect(screen.queryByTestId('chat-full-view')).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // 7. ChatDock removed — no bottom panel
  // -----------------------------------------------------------------------
  describe('ChatDock is fully removed', () => {
    it('no chat-dock testid exists in the shell', () => {
      render(<VisualShell />, { wrapper: Wrapper })
      expect(screen.queryByTestId('chat-dock')).toBeNull()
    })

    it('no toggleChatDock action exists in store', () => {
      const state = useVisualWorkspaceStore.getState() as unknown as Record<string, unknown>
      expect(state.toggleChatDock).toBeUndefined()
    })

    it('no chatDockOpen state exists in store', () => {
      const state = useVisualWorkspaceStore.getState() as unknown as Record<string, unknown>
      expect(state.chatDockOpen).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // 8. DocumentEditorModal removed — no modal overlay
  // -----------------------------------------------------------------------
  describe('DocumentEditorModal is fully removed', () => {
    it('no document-editor-modal testid exists in the shell', () => {
      render(<VisualShell />, { wrapper: Wrapper })
      expect(screen.queryByTestId('document-editor-modal')).toBeNull()
    })

    it('no openDocumentId state exists in store', () => {
      const state = useVisualWorkspaceStore.getState() as unknown as Record<string, unknown>
      expect(state.openDocumentId).toBeUndefined()
    })
  })
})
