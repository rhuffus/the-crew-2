import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import type { CenterView } from '@/stores/visual-workspace-store'

// Mock resizable panels
vi.mock('react-resizable-panels', () => ({
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Separator: () => <div />,
}))

// Mock tanstack router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

// Mock project provider
vi.mock('@/providers/project-provider', () => ({
  useCurrentProject: () => ({
    projectId: 'p1',
    projectName: 'Test',
    projectSlug: 'test',
  }),
}))

// Mock language store
vi.mock('@/stores/language-store', () => ({
  useLanguageStore: vi.fn(() => ({ language: 'en', setLanguage: vi.fn() })),
}))

// Mock useProjectDocument
vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocument: () => ({ data: undefined, isLoading: false }),
  useUpdateProjectDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useProjectDocuments: () => ({ data: [], isLoading: false }),
}))

// Mock inspector to avoid deep hook dependencies
vi.mock('@/components/visual-shell/inspector/inspector', () => ({
  Inspector: () => <div data-testid="inspector" />,
}))

// Mock useBeforeUnload
vi.mock('@/hooks/use-before-unload', () => ({
  useBeforeUnload: () => {},
}))

// Mock useBootstrapStatus
vi.mock('@/hooks/use-bootstrap', () => ({
  useBootstrapStatus: () => ({ data: undefined }),
}))

// Mock center panel children
vi.mock('@/components/visual-shell/canvas-viewport', () => ({
  CanvasViewport: () => <div data-testid="canvas-viewport" />,
}))

vi.mock('@/components/visual-shell/chat-dock/chat-full-view', () => ({
  ChatFullView: () => <div data-testid="chat-full-view" />,
}))

vi.mock('@/components/documents/document-embedded-view', () => ({
  DocumentEmbeddedView: () => <div data-testid="document-embedded-view" />,
}))

import { VisualShell } from '@/components/visual-shell/visual-shell'

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

function resetStore(overrides?: Partial<{ centerView: CenterView; centerViewHistory: CenterView[] }>) {
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

describe('Center view keyboard shortcuts (VSR-017)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('Cmd+1 should switch to canvas view', () => {
    resetStore({ centerView: { type: 'chat', threadId: null, chatMode: 'ceo' } })
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('1', { metaKey: true })
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
  })

  it('Ctrl+1 should switch to canvas view', () => {
    resetStore({ centerView: { type: 'chat', threadId: null, chatMode: 'ceo' } })
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('1', { ctrlKey: true })
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
  })

  it('Cmd+2 should switch to CEO chat view', () => {
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('2', { metaKey: true })
    const state = useVisualWorkspaceStore.getState()
    expect(state.centerView.type).toBe('chat')
    if (state.centerView.type === 'chat') {
      expect(state.centerView.chatMode).toBe('ceo')
    }
  })

  it('Ctrl+2 should switch to CEO chat view', () => {
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('2', { ctrlKey: true })
    const state = useVisualWorkspaceStore.getState()
    expect(state.centerView.type).toBe('chat')
  })

  it('Cmd+3 should switch to last document from history', () => {
    resetStore({
      centerView: { type: 'canvas' },
      centerViewHistory: [
        { type: 'chat', threadId: null, chatMode: 'ceo' },
        { type: 'document', documentId: 'doc-42' },
      ],
    })
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('3', { metaKey: true })
    const state = useVisualWorkspaceStore.getState()
    expect(state.centerView.type).toBe('document')
    if (state.centerView.type === 'document') {
      expect(state.centerView.documentId).toBe('doc-42')
    }
  })

  it('Cmd+3 should do nothing when no document in history', () => {
    resetStore({
      centerView: { type: 'canvas' },
      centerViewHistory: [{ type: 'chat', threadId: null, chatMode: 'ceo' }],
    })
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('3', { metaKey: true })
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
  })

  it('Cmd+3 should do nothing when already on document view', () => {
    resetStore({
      centerView: { type: 'document', documentId: 'doc-1' },
      centerViewHistory: [{ type: 'document', documentId: 'doc-2' }],
    })
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('3', { metaKey: true })
    const state = useVisualWorkspaceStore.getState()
    expect(state.centerView).toEqual({ type: 'document', documentId: 'doc-1' })
  })

  it('Cmd+3 should find the most recent document when multiple in history', () => {
    resetStore({
      centerView: { type: 'chat', threadId: null, chatMode: 'ceo' },
      centerViewHistory: [
        { type: 'document', documentId: 'doc-old' },
        { type: 'canvas' },
        { type: 'document', documentId: 'doc-recent' },
      ],
    })
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('3', { metaKey: true })
    const state = useVisualWorkspaceStore.getState()
    if (state.centerView.type === 'document') {
      expect(state.centerView.documentId).toBe('doc-recent')
    } else {
      expect.fail('Expected document view')
    }
  })

  it('should not trigger when typing in an input', () => {
    render(<VisualShell />, { wrapper: Wrapper })
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    fireEvent.keyDown(input, { key: '2', metaKey: true })
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
    document.body.removeChild(input)
  })

  it('should not trigger when typing in a textarea', () => {
    render(<VisualShell />, { wrapper: Wrapper })
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()
    fireEvent.keyDown(textarea, { key: '1', metaKey: true })
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
    document.body.removeChild(textarea)
  })

  it('should not trigger without modifier key', () => {
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('2')
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
  })

  it('Cmd+1 when already on canvas should remain on canvas', () => {
    render(<VisualShell />, { wrapper: Wrapper })
    pressKey('1', { metaKey: true })
    expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
  })
})
