import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentTaskController } from './agent-task.controller'
import { AgentTaskService } from './agent-task.service'
import type { AgentTaskStatusDto, SubmitAgentTaskDto } from '@the-crew/shared-types'

// Mock @temporalio/client to prevent real connections
vi.mock('@temporalio/client', () => ({
  Connection: { connect: vi.fn().mockResolvedValue({ close: vi.fn() }) },
  Client: vi.fn().mockImplementation(() => ({
    workflow: { start: vi.fn(), getHandle: vi.fn() },
  })),
}))

describe('AgentTaskController', () => {
  let controller: AgentTaskController
  let service: AgentTaskService

  beforeEach(async () => {
    service = new AgentTaskService()
    controller = new AgentTaskController(service)
  })

  it('submit delegates to service', async () => {
    const dto: SubmitAgentTaskDto = {
      agentId: 'agent-1',
      taskType: 'research-memo',
      instruction: 'Do research',
    }

    const expected: AgentTaskStatusDto = {
      workflowId: 'wf-1',
      projectId: 'proj-1',
      agentId: 'agent-1',
      status: 'running',
    }

    vi.spyOn(service, 'submit').mockResolvedValue(expected)

    const result = await controller.submit('proj-1', dto)

    expect(result).toEqual(expected)
    expect(service.submit).toHaveBeenCalledWith('proj-1', dto)
  })

  it('getStatus delegates to service', async () => {
    const expected: AgentTaskStatusDto = {
      workflowId: 'wf-1',
      projectId: 'proj-1',
      agentId: 'agent-1',
      status: 'completed',
    }

    vi.spyOn(service, 'getStatus').mockResolvedValue(expected)

    const result = await controller.getStatus('wf-1')

    expect(result).toEqual(expected)
    expect(service.getStatus).toHaveBeenCalledWith('wf-1')
  })
})
