import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { CenterPanel } from '@/components/visual-shell/center-panel'
import { Inspector } from '@/components/visual-shell/inspector/inspector'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

// --- Mocks ---

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/hooks/use-chat', () => ({
  useChatThread: vi.fn(() => ({ data: { id: 't1', messageCount: 1 } })),
  useChatMessages: vi.fn(() => ({
    data: [{ id: 'm1', threadId: 't1', role: 'user', content: 'Hello', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:00Z' }],
    isLoading: false,
  })),
  useSendMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useChatThreads: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('@/hooks/use-permissions', () => ({
  usePermission: vi.fn(() => true),
}))

vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: vi.fn(() => ({
    data: { maturityPhase: 'growth' },
  })),
  useBootstrapProject: vi.fn(() => ({ mutate: vi.fn() })),
}))

vi.mock('@/hooks/use-bootstrap-conversation', () => ({
  useBootstrapConversation: vi.fn(() => ({
    data: { status: 'collecting-context', threadId: 't1' },
    isError: false,
  })),
  useStartBootstrapConversation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useSendBootstrapMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useProposeGrowth: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useApproveGrowthProposal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRejectGrowthProposal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocuments: vi.fn(() => ({
    data: [
      { id: 'd1', projectId: 'p1', slug: 'vision', title: 'Vision Doc', bodyMarkdown: '', status: 'draft', linkedEntityIds: [], lastUpdatedBy: 'user', sourceType: 'agent', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ],
  })),
  useUpdateProjectDocument: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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

vi.mock('@/hooks/use-entity-detail', () => ({
  useEntityDetail: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('@/lib/validation-mapping', () => ({
  groupIssuesByVisualNodeId: vi.fn(() => new Map()),
}))

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en' },
    }),
  }
})

vi.mock('@/components/visual-shell/canvas-viewport', () => ({
  CanvasViewport: () => <div data-testid="canvas-viewport">Canvas</div>,
}))

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('VSR-007: Chat as center view integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVisualWorkspaceStore.setState({
      projectId: 'p1',
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
      centerView: { type: 'canvas' },
      centerViewHistory: [],
      selectedNodeIds: [],
      selectedEdgeIds: [],
      graphNodes: [],
      graphEdges: [],
      inspectorCollapsed: false,
      isDiffMode: false,
    })
  })

  // --- CenterPanel ---

  describe('CenterPanel renders ChatFullView when centerView is chat', () => {
    it('shows ChatFullView instead of canvas when centerView is chat', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      })
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('center-panel')).toBeDefined()
      expect(screen.getByTestId('chat-full-view')).toBeDefined()
      expect(screen.queryByTestId('canvas-viewport')).toBeNull()
    })

    it('shows canvas when centerView is canvas', () => {
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()
      expect(screen.queryByTestId('chat-full-view')).toBeNull()
    })

    it('shows ChatFullView with generic mode', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: 't1', chatMode: 'generic' },
      })
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('chat-full-view')).toBeDefined()
    })
  })

  // --- Inspector ---

  describe('Inspector renders ChatInspectorPanel when centerView is chat', () => {
    it('shows ChatInspectorPanel when centerView is chat and no selection', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('inspector')).toBeDefined()
      expect(screen.getByTestId('chat-inspector-panel')).toBeDefined()
    })

    it('shows CanvasSummary when centerView is canvas and no selection', () => {
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('inspector')).toBeDefined()
      expect(screen.getByTestId('canvas-summary')).toBeDefined()
      expect(screen.queryByTestId('chat-inspector-panel')).toBeNull()
    })

    it('ChatInspectorPanel shows bootstrap status section', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('chat-inspector-bootstrap')).toBeDefined()
    })

    it('ChatInspectorPanel shows documents section', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('chat-inspector-documents')).toBeDefined()
      expect(screen.getByText('Vision Doc')).toBeDefined()
    })

    it('ChatInspectorPanel shows proposals section', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('chat-inspector-proposals')).toBeDefined()
    })

    it('ChatInspectorPanel shows runtime section', () => {
      useVisualWorkspaceStore.setState({
        centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      })
      render(<Inspector />, { wrapper: Wrapper })
      expect(screen.getByTestId('chat-inspector-runtime')).toBeDefined()
    })
  })

  // --- Store transitions ---

  describe('Store transitions between canvas and chat', () => {
    it('openChatView transitions centerView to chat', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: null, chatMode: 'ceo' })
    })

    it('openCanvasView transitions back from chat to canvas', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().openCanvasView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
    })

    it('goBackCenterView returns from chat to previous canvas view', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().goBackCenterView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
    })

    it('CenterPanel re-renders correctly after store transition', () => {
      render(<CenterPanel />, { wrapper: Wrapper })
      expect(screen.getByTestId('canvas-viewport')).toBeDefined()

      act(() => {
        useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      })

      expect(screen.getByTestId('chat-full-view')).toBeDefined()
      expect(screen.queryByTestId('canvas-viewport')).toBeNull()
    })
  })
})
