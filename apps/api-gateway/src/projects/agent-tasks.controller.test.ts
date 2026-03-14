import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentTasksProxyController } from './agent-tasks.controller'
import { PlatformClient } from './platform.client'
import type { AgentTaskStatusDto, SubmitAgentTaskDto } from '@the-crew/shared-types'

describe('AgentTasksProxyController', () => {
  let controller: AgentTasksProxyController
  let client: PlatformClient

  beforeEach(() => {
    client = { submitAgentTask: vi.fn(), getAgentTaskStatus: vi.fn() } as unknown as PlatformClient
    controller = new AgentTasksProxyController(client)
  })

  it('submit proxies to platform client', async () => {
    const dto: SubmitAgentTaskDto = {
      agentId: 'agent-1',
      taskType: 'research-memo',
      instruction: 'Research competitors',
    }

    const expected: AgentTaskStatusDto = {
      workflowId: 'wf-1',
      projectId: 'proj-1',
      agentId: 'agent-1',
      status: 'running',
    }

    vi.mocked(client.submitAgentTask).mockResolvedValue(expected)

    const result = await controller.submit('proj-1', dto)

    expect(result).toEqual(expected)
    expect(client.submitAgentTask).toHaveBeenCalledWith('proj-1', dto)
  })

  it('getStatus proxies to platform client', async () => {
    const expected: AgentTaskStatusDto = {
      workflowId: 'wf-1',
      projectId: 'proj-1',
      agentId: 'agent-1',
      status: 'completed',
    }

    vi.mocked(client.getAgentTaskStatus).mockResolvedValue(expected)

    const result = await controller.getStatus('proj-1', 'wf-1')

    expect(result).toEqual(expected)
    expect(client.getAgentTaskStatus).toHaveBeenCalledWith('proj-1', 'wf-1')
  })
})
