import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatDock } from '@/components/visual-shell/chat-dock/chat-dock'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('ChatDock', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      chatDockOpen: false,
      currentView: 'org',
      scopeEntityId: null,
    })
  })

  it('should render collapsed by default', () => {
    render(<ChatDock />)
    expect(screen.getByTestId('chat-dock')).toBeInTheDocument()
    expect(screen.getByText('Chat: Company')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Type a message...')).not.toBeInTheDocument()
  })

  it('should expand when clicked', async () => {
    render(<ChatDock />)
    await userEvent.click(screen.getByText('Chat: Company'))
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    expect(screen.getByText('Chat messages will appear here.')).toBeInTheDocument()
  })

  it('should show scope entity id for department view', () => {
    useVisualWorkspaceStore.setState({
      currentView: 'department',
      scopeEntityId: 'marketing',
    })
    render(<ChatDock />)
    expect(screen.getByText('Chat: marketing')).toBeInTheDocument()
  })

  it('should collapse when toggled again', async () => {
    useVisualWorkspaceStore.setState({ chatDockOpen: true })
    render(<ChatDock />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Chat: Company'))
    expect(screen.queryByPlaceholderText('Type a message...')).not.toBeInTheDocument()
  })
})
