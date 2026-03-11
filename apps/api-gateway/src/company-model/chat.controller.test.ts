import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatController } from './chat.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listChatThreads: vi.fn(),
  getChatThread: vi.fn(),
  listChatMessages: vi.fn(),
  sendChatMessage: vi.fn(),
  deleteChatThread: vi.fn(),
}

describe('ChatController (gateway)', () => {
  let controller: ChatController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ChatController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list threads', async () => {
    mockClient.listChatThreads.mockResolvedValue([{ id: 't1', scopeType: 'company' }])
    const result = await controller.listThreads('p1')
    expect(result).toEqual([{ id: 't1', scopeType: 'company' }])
    expect(mockClient.listChatThreads).toHaveBeenCalledWith('p1')
  })

  it('should get thread by scope', async () => {
    mockClient.getChatThread.mockResolvedValue({ id: 't1', scopeType: 'department' })
    const result = await controller.getThread('p1', 'department', 'd1')
    expect(result).toEqual({ id: 't1', scopeType: 'department' })
    expect(mockClient.getChatThread).toHaveBeenCalledWith('p1', 'department', 'd1')
  })

  it('should list messages', async () => {
    mockClient.listChatMessages.mockResolvedValue([{ id: 'm1', content: 'Hello' }])
    const result = await controller.listMessages('p1', 't1', '10', 'cursor')
    expect(result).toEqual([{ id: 'm1', content: 'Hello' }])
    expect(mockClient.listChatMessages).toHaveBeenCalledWith('t1', 'p1', 10, 'cursor')
  })

  it('should send a message', async () => {
    mockClient.sendChatMessage.mockResolvedValue({ id: 'm1', content: 'Test' })
    const dto = { content: 'Test' }
    const result = await controller.sendMessage('p1', 't1', dto)
    expect(result).toEqual({ id: 'm1', content: 'Test' })
    expect(mockClient.sendChatMessage).toHaveBeenCalledWith('t1', 'p1', dto)
  })

  it('should delete a thread', async () => {
    mockClient.deleteChatThread.mockResolvedValue(undefined)
    await controller.deleteThread('p1', 't1')
    expect(mockClient.deleteChatThread).toHaveBeenCalledWith('t1', 'p1')
  })
})
