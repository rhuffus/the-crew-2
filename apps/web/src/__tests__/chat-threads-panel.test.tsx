import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ChatThreadsPanel } from '@/components/visual-shell/explorer/chat-threads-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockThreads = [
  { id: 't1', projectId: 'p1', scopeType: 'company', entityId: null, title: 'Chat: company', messageCount: 3, lastMessageAt: '2024-01-02T00:00:00Z', createdAt: '2024-01-01T00:00:00Z' },
  { id: 't2', projectId: 'p1', scopeType: 'department', entityId: 'd1', title: 'Chat: Engineering', messageCount: 0, lastMessageAt: null, createdAt: '2024-01-01T00:00:00Z' },
]

vi.mock('@/hooks/use-chat', () => ({
  useChatThreads: vi.fn(() => ({ data: mockThreads, isLoading: false })),
  useChatThread: vi.fn(() => ({ data: null })),
  useChatMessages: vi.fn(() => ({ data: [], isLoading: false })),
  useSendMessage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('ChatThreadsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVisualWorkspaceStore.setState({ chatDockOpen: false })
  })

  it('shows no project message when no projectId', () => {
    render(<ChatThreadsPanel />, { wrapper: Wrapper })
    expect(screen.getByText('No project selected')).toBeDefined()
  })

  it('renders thread list', () => {
    render(<ChatThreadsPanel projectId="p1" />, { wrapper: Wrapper })
    expect(screen.getByTestId('chat-threads-panel')).toBeDefined()
    expect(screen.getByText('Chat: company')).toBeDefined()
    expect(screen.getByText('Chat: Engineering')).toBeDefined()
  })

  it('shows message count', () => {
    render(<ChatThreadsPanel projectId="p1" />, { wrapper: Wrapper })
    expect(screen.getByText(/3 messages/)).toBeDefined()
    expect(screen.getByText(/0 messages/)).toBeDefined()
  })

  it('navigates to scope on thread click', () => {
    render(<ChatThreadsPanel projectId="p1" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Chat: company'))
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/projects/$projectId/org' }),
    )
  })

  it('opens chat dock on click if closed', () => {
    render(<ChatThreadsPanel projectId="p1" />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Chat: company'))
    expect(useVisualWorkspaceStore.getState().chatDockOpen).toBe(true)
  })

  it('sorts threads by last message (newest first)', () => {
    render(<ChatThreadsPanel projectId="p1" />, { wrapper: Wrapper })
    const buttons = screen.getAllByRole('button')
    // Company thread (with lastMessageAt) should be first
    expect(buttons[0]!.textContent).toContain('Chat: company')
  })
})
