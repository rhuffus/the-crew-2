import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInput } from '@/components/visual-shell/chat-dock/chat-input'

describe('ChatInput', () => {
  it('renders textarea and send button', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeDefined()
    expect(screen.getByLabelText('Send message')).toBeDefined()
  })

  it('calls onSend on Enter', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('clears input after send', () => {
    render(<ChatInput onSend={vi.fn()} />)
    const textarea = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toBe('')
  })

  it('does not send on Shift+Enter', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('does not send empty message', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('send button disabled when input is empty', () => {
    render(<ChatInput onSend={vi.fn()} />)
    const btn = screen.getByLabelText('Send message')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('send button enabled when input has text', () => {
    render(<ChatInput onSend={vi.fn()} />)
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    const btn = screen.getByLabelText('Send message')
    expect(btn.hasAttribute('disabled')).toBe(false)
  })

  it('calls onSend on click', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)
    const textarea = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(textarea, { target: { value: 'Click send' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(onSend).toHaveBeenCalledWith('Click send')
  })

  it('disabled state disables textarea', () => {
    render(<ChatInput onSend={vi.fn()} disabled />)
    const textarea = screen.getByPlaceholderText('Type a message...')
    expect(textarea.hasAttribute('disabled')).toBe(true)
  })
})
