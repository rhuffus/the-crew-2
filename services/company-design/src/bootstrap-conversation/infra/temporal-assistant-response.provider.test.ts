import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TemporalAssistantResponseProvider } from './temporal-assistant-response.provider'
import type { AssistantResponseContext } from '../domain/assistant-response-provider'

function makeCtx(overrides: Partial<AssistantResponseContext> = {}): AssistantResponseContext {
  return {
    projectId: 'proj-001',
    companyName: 'Acme Corp',
    companyMission: 'Build great software',
    companyType: 'saas-startup',
    conversationStatus: 'collecting-context',
    recentMessages: [],
    ...overrides,
  }
}

function createMockHandle(result: unknown) {
  return { result: vi.fn().mockResolvedValue(result) }
}

function createMockWorkflowClient() {
  return {
    start: vi.fn(),
    connection: { close: vi.fn() },
  }
}

function createMockLazy(workflowClient: ReturnType<typeof createMockWorkflowClient>) {
  return {
    getClient: vi.fn().mockResolvedValue(workflowClient),
    close: vi.fn(),
  }
}

describe('TemporalAssistantResponseProvider', () => {
  let provider: TemporalAssistantResponseProvider
  let mockClient: ReturnType<typeof createMockWorkflowClient>

  beforeEach(() => {
    mockClient = createMockWorkflowClient()
    const mockLazy = createMockLazy(mockClient)
    provider = new TemporalAssistantResponseProvider(mockLazy as never)
  })

  describe('generateKickoff', () => {
    it('should start a workflow with isKickoff=true', async () => {
      const handle = createMockHandle({
        content: 'Hello! I am the CEO.',
        suggestedNextStatus: null,
      })
      mockClient.start.mockResolvedValue(handle)

      const result = await provider.generateKickoff(makeCtx())

      expect(mockClient.start).toHaveBeenCalledTimes(1)
      const call = mockClient.start.mock.calls[0] as [string, { taskQueue: string; workflowId: string; args: [{ isKickoff: boolean; projectId: string }] }]
      const [workflowName, options] = call
      expect(workflowName).toBe('bootstrapConversationWorkflow')
      expect(options.taskQueue).toBe('bootstrap')
      expect(options.workflowId).toMatch(/^bootstrap-kickoff-proj-001-/)
      expect(options.args[0].isKickoff).toBe(true)
      expect(options.args[0].projectId).toBe('proj-001')
      expect(result.content).toBe('Hello! I am the CEO.')
      expect(result.suggestedNextStatus).toBeNull()
    })

    it('should pass company context to workflow', async () => {
      const handle = createMockHandle({ content: 'response', suggestedNextStatus: null })
      mockClient.start.mockResolvedValue(handle)

      await provider.generateKickoff(makeCtx({
        companyName: 'TestCo',
        companyMission: 'Test mission',
        companyType: 'agency',
      }))

      const call = mockClient.start.mock.calls[0] as [string, { args: [{ context: { companyName: string; companyMission: string; companyType: string } }] }]
      const input = call[1].args[0]
      expect(input.context.companyName).toBe('TestCo')
      expect(input.context.companyMission).toBe('Test mission')
      expect(input.context.companyType).toBe('agency')
    })

    it('should return status suggestion from workflow', async () => {
      const handle = createMockHandle({
        content: 'Moving forward',
        suggestedNextStatus: 'drafting-foundation-docs',
      })
      mockClient.start.mockResolvedValue(handle)

      const result = await provider.generateKickoff(makeCtx())

      expect(result.suggestedNextStatus).toBe('drafting-foundation-docs')
    })
  })

  describe('generateReply', () => {
    it('should start a workflow with isKickoff=false and userMessage', async () => {
      const handle = createMockHandle({
        content: 'Great question!',
        suggestedNextStatus: null,
      })
      mockClient.start.mockResolvedValue(handle)

      const result = await provider.generateReply(
        makeCtx({
          recentMessages: [
            { id: '1', threadId: 't1', role: 'assistant', content: 'Hello', entityRefs: [], actions: [], createdAt: new Date().toISOString() },
          ],
        }),
        'What is our strategy?',
      )

      expect(mockClient.start).toHaveBeenCalledTimes(1)
      const replyCall = mockClient.start.mock.calls[0] as [string, { workflowId: string; args: [{ isKickoff: boolean; userMessage: string }] }]
      const [workflowName, options] = replyCall
      expect(workflowName).toBe('bootstrapConversationWorkflow')
      expect(options.workflowId).toMatch(/^bootstrap-reply-proj-001-/)
      expect(options.args[0].isKickoff).toBe(false)
      expect(options.args[0].userMessage).toBe('What is our strategy?')
      expect(result.content).toBe('Great question!')
    })

    it('should map recent messages to role/content pairs', async () => {
      const handle = createMockHandle({ content: 'ok', suggestedNextStatus: null })
      mockClient.start.mockResolvedValue(handle)

      await provider.generateReply(
        makeCtx({
          recentMessages: [
            { id: '1', threadId: 't1', role: 'assistant', content: 'Hi', entityRefs: [], actions: [], createdAt: new Date().toISOString() },
            { id: '2', threadId: 't1', role: 'user', content: 'Hello', entityRefs: [], actions: [], createdAt: new Date().toISOString() },
          ],
        }),
        'Hello',
      )

      const call = mockClient.start.mock.calls[0] as [string, { args: [{ context: { recentMessages: Array<{ role: string; content: string }> } }] }]
      expect(call[1].args[0].context.recentMessages).toEqual([
        { role: 'assistant', content: 'Hi' },
        { role: 'user', content: 'Hello' },
      ])
    })

    it('should propagate workflow errors', async () => {
      mockClient.start.mockRejectedValue(new Error('Temporal unavailable'))

      await expect(
        provider.generateReply(makeCtx(), 'Hello'),
      ).rejects.toThrow('Temporal unavailable')
    })
  })
})
