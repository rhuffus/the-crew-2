import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessageList } from '@/components/visual-shell/chat-dock/chat-message-list'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('ChatMessageList', () => {
  it('shows loading state', () => {
    render(<ChatMessageList messages={[]} projectId="p1" isLoading />)
    expect(screen.getByTestId('chat-loading')).toBeDefined()
  })

  it('shows empty state', () => {
    render(<ChatMessageList messages={[]} projectId="p1" />)
    expect(screen.getByTestId('chat-empty')).toBeDefined()
  })

  it('renders messages', () => {
    const messages = [
      { id: 'm1', threadId: 't1', role: 'user' as const, content: 'First', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:00Z' },
      { id: 'm2', threadId: 't1', role: 'assistant' as const, content: 'Second', entityRefs: [], actions: [], createdAt: '2024-01-01T00:00:01Z' },
    ]
    render(<ChatMessageList messages={messages} projectId="p1" />)
    expect(screen.getByTestId('chat-message-list')).toBeDefined()
    expect(screen.getByText('First')).toBeDefined()
    expect(screen.getByText('Second')).toBeDefined()
  })
})
