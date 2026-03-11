import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChatDock } from '@/components/visual-shell/chat-dock/chat-dock'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const mockThread = { id: 't1', projectId: 'p1', scopeType: 'company', entityId: null, title: 'Chat: company', messageCount: 2, lastMessageAt: '2024-01-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z' }
const mockMessages = [
  { id: 'm1', threadId: 't1', role: 'user', content: 'Hello', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'm2', threadId: 't1', role: 'assistant', content: 'Hi there', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:01Z' },
]

const mockSend = vi.fn()
vi.mock('@/hooks/use-chat', () => ({
  useChatThread: vi.fn(() => ({ data: mockThread })),
  useChatMessages: vi.fn(() => ({ data: mockMessages, isLoading: false })),
  useSendMessage: vi.fn(() => ({ mutate: mockSend, isPending: false })),
  useChatThreads: vi.fn(() => ({ data: [], isLoading: false })),
}))

import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ChatDock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVisualWorkspaceStore.setState({
      chatDockOpen: false,
      projectId: 'p1',
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
    })
  })

  it('renders collapsed header with scope label', () => {
    render(<ChatDock />, { wrapper: Wrapper })
    expect(screen.getByText('Chat: company')).toBeDefined()
    expect(screen.queryByTestId('chat-dock-panel')).toBeNull()
  })

  it('shows message count badge', () => {
    render(<ChatDock />, { wrapper: Wrapper })
    expect(screen.getByText('2')).toBeDefined()
  })

  it('expands on toggle click', () => {
    useVisualWorkspaceStore.setState({ chatDockOpen: true })
    render(<ChatDock />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-dock-panel')).toBeDefined()
  })

  it('shows messages when expanded', () => {
    useVisualWorkspaceStore.setState({ chatDockOpen: true })
    render(<ChatDock />, { wrapper: Wrapper })
    expect(screen.getByText('Hello')).toBeDefined()
    expect(screen.getByText('Hi there')).toBeDefined()
  })

  it('sends a message on Enter', () => {
    useVisualWorkspaceStore.setState({ chatDockOpen: true })
    render(<ChatDock />, { wrapper: Wrapper })
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(mockSend).toHaveBeenCalledWith({ content: 'Test message' })
  })

  it('does not send empty message', () => {
    useVisualWorkspaceStore.setState({ chatDockOpen: true })
    render(<ChatDock />, { wrapper: Wrapper })
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('allows newline with shift+enter', () => {
    useVisualWorkspaceStore.setState({ chatDockOpen: true })
    render(<ChatDock />, { wrapper: Wrapper })
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Line 1' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(mockSend).not.toHaveBeenCalled()
  })
})
