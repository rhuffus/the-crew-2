import { describe, it, expect } from 'vitest'
import { ChatMessage } from './chat-message'

describe('ChatMessage', () => {
  it('creates a user message', () => {
    const msg = ChatMessage.create('t1', 'user', 'Hello world')
    expect(msg.threadId).toBe('t1')
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Hello world')
    expect(msg.entityRefs).toEqual([])
    expect(msg.actions).toEqual([])
    expect(msg.id).toBeDefined()
    expect(msg.createdAt).toBeInstanceOf(Date)
  })

  it('creates an assistant message', () => {
    const msg = ChatMessage.create('t1', 'assistant', 'I can help')
    expect(msg.role).toBe('assistant')
  })

  it('creates a system message', () => {
    const msg = ChatMessage.create('t1', 'system', 'Thread started')
    expect(msg.role).toBe('system')
  })

  it('rejects empty content', () => {
    expect(() => ChatMessage.create('t1', 'user', '')).toThrow('empty')
    expect(() => ChatMessage.create('t1', 'user', '   ')).toThrow('empty')
  })

  it('stores entity refs', () => {
    const refs: import('@the-crew/shared-types').ChatEntityRef[] = [
      { entityId: 'e1', entityType: 'department', label: 'Eng' },
      { entityId: 'e2', entityType: 'role', label: 'Lead', scopeType: 'department' },
    ]
    const msg = ChatMessage.create('t1', 'user', 'About @Eng', refs)
    expect(msg.entityRefs).toEqual(refs)
  })

  it('stores action suggestions', () => {
    const actions: import('@the-crew/shared-types').ChatActionSuggestion[] = [
      { type: 'navigate', label: 'Go to Eng', payload: { entityId: 'e1' } },
      { type: 'create-entity', label: 'Add role', payload: { nodeType: 'role' } },
    ]
    const msg = ChatMessage.create('t1', 'assistant', 'Try this', [], actions)
    expect(msg.actions).toEqual(actions)
  })

  it('entityRefs is a defensive copy', () => {
    const refs: import('@the-crew/shared-types').ChatEntityRef[] = [
      { entityId: 'e1', entityType: 'department', label: 'Eng' },
    ]
    const msg = ChatMessage.create('t1', 'user', 'Test', refs)
    refs.push({ entityId: 'e2', entityType: 'role', label: 'Lead' })
    expect(msg.entityRefs).toHaveLength(1)
  })

  it('reconstitute restores a message', () => {
    const original = ChatMessage.create('t1', 'user', 'Hello')
    const restored = ChatMessage.reconstitute({
      id: original.id,
      threadId: original.threadId,
      role: original.role,
      content: original.content,
      entityRefs: original.entityRefs,
      actions: original.actions,
      createdAt: original.createdAt,
    })
    expect(restored.id).toBe(original.id)
    expect(restored.content).toBe('Hello')
  })
})
