import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessageBubble } from '@/components/visual-shell/chat-dock/chat-message'
import type { ChatMessageDto } from '@the-crew/shared-types'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

const baseMsg: ChatMessageDto = {
  id: 'm1',
  threadId: 't1',
  role: 'user',
  content: 'Hello world',
  entityRefs: [],
  actions: [],
  createdAt: '2024-01-01T12:00:00Z',
}

describe('ChatMessageBubble', () => {
  it('renders user message', () => {
    render(<ChatMessageBubble message={baseMsg} projectId="p1" />)
    expect(screen.getByText('Hello world')).toBeDefined()
    const el = screen.getByTestId('chat-message')
    expect(el.getAttribute('data-role')).toBe('user')
  })

  it('renders assistant message', () => {
    render(
      <ChatMessageBubble
        message={{ ...baseMsg, role: 'assistant', content: 'I can help' }}
        projectId="p1"
      />,
    )
    expect(screen.getByText('I can help')).toBeDefined()
  })

  it('renders system message', () => {
    render(
      <ChatMessageBubble
        message={{ ...baseMsg, role: 'system', content: 'Thread started' }}
        projectId="p1"
      />,
    )
    expect(screen.getByText('Thread started')).toBeDefined()
  })

  it('renders entity refs as chips', () => {
    const msg: ChatMessageDto = {
      ...baseMsg,
      entityRefs: [{ entityId: 'e1', entityType: 'department', label: 'Engineering' }],
    }
    render(<ChatMessageBubble message={msg} projectId="p1" />)
    expect(screen.getByText('@Engineering')).toBeDefined()
  })

  it('renders action buttons', () => {
    const msg: ChatMessageDto = {
      ...baseMsg,
      role: 'assistant',
      actions: [{ type: 'navigate', label: 'Go to Eng', payload: { entityId: 'e1' } }],
    }
    render(<ChatMessageBubble message={msg} projectId="p1" />)
    expect(screen.getByText('Go to Eng')).toBeDefined()
  })

  it('shows timestamp', () => {
    render(<ChatMessageBubble message={baseMsg} projectId="p1" />)
    // Should show time formatted
    const timeEl = screen.getByTestId('chat-message').querySelector('span:last-child')
    expect(timeEl?.textContent).toBeDefined()
  })
})
