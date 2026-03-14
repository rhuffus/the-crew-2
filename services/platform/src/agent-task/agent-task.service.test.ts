import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentTaskService } from './agent-task.service'
import type { SubmitAgentTaskDto } from '@the-crew/shared-types'

// Mock @temporalio/client
const mockWorkflowStart = vi.fn()
const mockWorkflowGetHandle = vi.fn()
const mockConnectionConnect = vi.fn()
const mockConnectionClose = vi.fn()

vi.mock('@temporalio/client', () => ({
  Connection: {
    connect: (...args: unknown[]) => mockConnectionConnect(...args),
  },
  Client: vi.fn().mockImplementation(() => ({
    workflow: {
      start: mockWorkflowStart,
      getHandle: mockWorkflowGetHandle,
    },
  })),
}))

describe('AgentTaskService', () => {
  let service: AgentTaskService

  const dto: SubmitAgentTaskDto = {
    agentId: 'agent-1',
    taskType: 'research-memo',
    instruction: 'Research the market',
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockConnectionConnect.mockResolvedValue({ close: mockConnectionClose })
    service = new AgentTaskService()
    await service.onModuleInit()
  })

  describe('submit', () => {
    it('starts a Temporal workflow and returns running status', async () => {
      mockWorkflowStart.mockResolvedValue({
        workflowId: 'agent-task-proj-1-agent-1-12345',
      })

      const result = await service.submit('proj-1', dto)

      expect(result.status).toBe('running')
      expect(result.projectId).toBe('proj-1')
      expect(result.agentId).toBe('agent-1')
      expect(result.workflowId).toContain('agent-task-proj-1-agent-1-')

      expect(mockWorkflowStart).toHaveBeenCalledWith(
        'basicAgentTaskWorkflow',
        expect.objectContaining({
          taskQueue: 'agent-execution',
          args: [
            expect.objectContaining({
              projectId: 'proj-1',
              agentId: 'agent-1',
              taskType: 'research-memo',
              instruction: 'Research the market',
            }),
          ],
        }),
      )
    })

    it('passes optional fields to workflow', async () => {
      mockWorkflowStart.mockResolvedValue({ workflowId: 'wf-1' })

      await service.submit('proj-1', {
        ...dto,
        contextBundle: { key: 'val' },
        inputDocs: [{ path: 'doc.md', content: '#Doc' }],
        maxTurns: 5,
        timeout: 120,
      })

      const args = mockWorkflowStart.mock.calls[0]![1].args[0]
      expect(args.contextBundle).toEqual({ key: 'val' })
      expect(args.inputDocs).toEqual([{ path: 'doc.md', content: '#Doc' }])
      expect(args.maxTurns).toBe(5)
      expect(args.timeout).toBe(120)
    })
  })

  describe('getStatus', () => {
    it('returns completed status with result', async () => {
      const mockResult = {
        projectId: 'proj-1',
        agentId: 'agent-1',
        status: 'completed',
        summary: 'Done',
      }

      mockWorkflowGetHandle.mockReturnValue({
        describe: () =>
          Promise.resolve({ status: { name: 'COMPLETED' } }),
        result: () => Promise.resolve(mockResult),
      })

      const result = await service.getStatus('wf-1')

      expect(result.status).toBe('completed')
      expect(result.workflowId).toBe('wf-1')
      expect(result.result).toEqual(mockResult)
    })

    it('returns running status for in-progress workflows', async () => {
      mockWorkflowGetHandle.mockReturnValue({
        describe: () =>
          Promise.resolve({ status: { name: 'RUNNING' } }),
      })

      const result = await service.getStatus('wf-1')

      expect(result.status).toBe('running')
    })

    it('returns failed status', async () => {
      mockWorkflowGetHandle.mockReturnValue({
        describe: () =>
          Promise.resolve({ status: { name: 'FAILED' } }),
      })

      const result = await service.getStatus('wf-1')

      expect(result.status).toBe('failed')
    })

    it('returns timed-out status', async () => {
      mockWorkflowGetHandle.mockReturnValue({
        describe: () =>
          Promise.resolve({ status: { name: 'TIMED_OUT' } }),
      })

      const result = await service.getStatus('wf-1')

      expect(result.status).toBe('timed-out')
    })

    it('returns cancelled status', async () => {
      mockWorkflowGetHandle.mockReturnValue({
        describe: () =>
          Promise.resolve({ status: { name: 'CANCELLED' } }),
      })

      const result = await service.getStatus('wf-1')

      expect(result.status).toBe('cancelled')
    })
  })

  describe('when Temporal is not connected', () => {
    it('submit throws helpful error', async () => {
      const disconnectedService = new AgentTaskService()
      // Don't call onModuleInit

      await expect(
        disconnectedService.submit('proj-1', dto),
      ).rejects.toThrow('Temporal client is not connected')
    })

    it('getStatus throws helpful error', async () => {
      const disconnectedService = new AgentTaskService()

      await expect(
        disconnectedService.getStatus('wf-1'),
      ).rejects.toThrow('Temporal client is not connected')
    })
  })

  describe('onModuleDestroy', () => {
    it('closes the connection', async () => {
      await service.onModuleDestroy()
      expect(mockConnectionClose).toHaveBeenCalled()
    })
  })
})
