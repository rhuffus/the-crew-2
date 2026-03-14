import { describe, it, expect, beforeEach } from 'vitest'
import { ClaudeRunnerController } from './claude-runner.controller'
import { ClaudeRunnerService } from './application/claude-runner.service'
import { StubClaudeRunnerAdapter } from './infra/stub-claude-runner.adapter'
import type { AiProviderConfigService } from '../ai-provider-config/application/ai-provider-config.service'

function stubAiProviderConfigService(): AiProviderConfigService {
  return { getActiveApiKey: async () => null } as unknown as AiProviderConfigService
}

describe('ClaudeRunnerController', () => {
  let controller: ClaudeRunnerController
  let stub: StubClaudeRunnerAdapter

  beforeEach(() => {
    stub = new StubClaudeRunnerAdapter()
    const service = new ClaudeRunnerService(stub, stubAiProviderConfigService())
    controller = new ClaudeRunnerController(service)
  })

  it('should execute and return result', async () => {
    const result = await controller.execute({
      projectId: 'proj-1',
      agentId: 'agent-1',
      taskType: 'generate-doc',
      instruction: 'Write tests',
    })

    expect(result.status).toBe('completed')
    expect(result.executionId).toBeTruthy()
  })

  it('should pass request through to service', async () => {
    await controller.execute({
      projectId: 'proj-2',
      agentId: 'agent-2',
      taskType: 'code-review',
      instruction: 'Review this PR',
      contextBundle: { prUrl: 'https://example.com' },
      maxTurns: 5,
    })

    expect(stub.executedEnvelopes).toHaveLength(1)
    expect(stub.executedEnvelopes[0]!.projectId).toBe('proj-2')
    expect(stub.executedEnvelopes[0]!.taskType).toBe('code-review')
  })

  it('should propagate failure results', async () => {
    stub.configureNextResult({
      status: 'failed',
      errorInfo: { code: 'TEST', message: 'fail', details: null },
    })

    const result = await controller.execute({
      projectId: 'proj-1',
      agentId: 'agent-1',
      taskType: 'task',
      instruction: 'do something',
      maxRetries: 0,
    })

    expect(result.status).toBe('failed')
  })
})
