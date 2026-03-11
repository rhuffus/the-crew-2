import { describe, it, expect } from 'vitest'
import { ChatThread } from './chat-thread'

describe('ChatThread', () => {
  it('creates a company thread with auto title', () => {
    const thread = ChatThread.create('p1', 'company', null)
    expect(thread.projectId).toBe('p1')
    expect(thread.scopeType).toBe('company')
    expect(thread.entityId).toBeNull()
    expect(thread.title).toBe('Chat: company')
    expect(thread.messageCount).toBe(0)
    expect(thread.lastMessageAt).toBeNull()
  })

  it('creates a department thread with entity in title', () => {
    const thread = ChatThread.create('p1', 'department', 'd1')
    expect(thread.entityId).toBe('d1')
    expect(thread.title).toBe('Chat: department d1')
  })

  it('addMessage creates and stores a message', () => {
    const thread = ChatThread.create('p1', 'company', null)
    const msg = thread.addMessage('user', 'Hello')
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Hello')
    expect(msg.threadId).toBe(thread.id)
    expect(thread.messageCount).toBe(1)
    expect(thread.lastMessageAt).toEqual(msg.createdAt)
  })

  it('addMessage with entity refs', () => {
    const thread = ChatThread.create('p1', 'company', null)
    const refs = [{ entityId: 'e1', entityType: 'department' as const, label: 'Eng' }]
    const msg = thread.addMessage('user', 'About @Eng', refs)
    expect(msg.entityRefs).toEqual(refs)
  })

  it('addMessage with actions', () => {
    const thread = ChatThread.create('p1', 'company', null)
    const actions = [{ type: 'navigate' as const, label: 'Go', payload: { id: '1', route: '/somewhere' } }]
    const msg = thread.addMessage('assistant', 'Try this', [], actions)
    expect(msg.actions).toEqual(actions)
  })

  it('multiple messages increment count', () => {
    const thread = ChatThread.create('p1', 'company', null)
    thread.addMessage('user', 'First')
    thread.addMessage('assistant', 'Reply')
    thread.addMessage('user', 'Second')
    expect(thread.messageCount).toBe(3)
  })

  it('messages returns defensive copy', () => {
    const thread = ChatThread.create('p1', 'company', null)
    thread.addMessage('user', 'Hello')
    const msgs1 = thread.messages
    const msgs2 = thread.messages
    expect(msgs1).toEqual(msgs2)
    expect(msgs1).not.toBe(msgs2)
  })

  it('updateTitle changes the title', () => {
    const thread = ChatThread.create('p1', 'company', null)
    thread.updateTitle('Engineering Chat')
    expect(thread.title).toBe('Engineering Chat')
  })

  it('reconstitute restores a thread', () => {
    const thread = ChatThread.create('p1', 'department', 'd1')
    thread.addMessage('user', 'Test')
    const reconstituted = ChatThread.reconstitute({
      id: thread.id,
      projectId: thread.projectId,
      scopeType: thread.scopeType,
      entityId: thread.entityId,
      title: thread.title,
      messages: [...thread.messages],
      createdAt: thread.createdAt,
    })
    expect(reconstituted.id).toBe(thread.id)
    expect(reconstituted.messageCount).toBe(1)
  })

  it('lastMessageAt returns last message timestamp', () => {
    const thread = ChatThread.create('p1', 'company', null)
    thread.addMessage('user', 'First')
    const last = thread.addMessage('user', 'Second')
    expect(thread.lastMessageAt).toEqual(last.createdAt)
  })
})
