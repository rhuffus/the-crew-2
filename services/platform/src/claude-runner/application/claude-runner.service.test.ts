import { describe, it, expect, beforeEach } from 'vitest'
import { ClaudeRunnerService, type SubmitExecutionRequest } from './claude-runner.service'
import { StubClaudeRunnerAdapter } from '../infra/stub-claude-runner.adapter'
import type { AiProviderConfigService } from '../../ai-provider-config/application/ai-provider-config.service'

function stubAiProviderConfigService(apiKey: string | null = null): AiProviderConfigService {
  return { getActiveApiKey: async () => apiKey } as unknown as AiProviderConfigService
}

function baseRequest(overrides: Partial<SubmitExecutionRequest> = {}): SubmitExecutionRequest {
  return {
    projectId: 'proj-1',
    agentId: 'agent-1',
    taskType: 'generate-doc',
    instruction: 'Write a README',
    ...overrides,
  }
}

describe('ClaudeRunnerService', () => {
  let service: ClaudeRunnerService
  let stub: StubClaudeRunnerAdapter

  beforeEach(() => {
    stub = new StubClaudeRunnerAdapter()
    service = new ClaudeRunnerService(stub, stubAiProviderConfigService())
  })

  it('should submit and return a successful result', async () => {
    const result = await service.submit(baseRequest())

    expect(result.status).toBe('completed')
    expect(result.executionId).toBeTruthy()
    expect(result.stdoutSummary).toContain('generate-doc')
    expect(result.errorInfo).toBeNull()
  })

  it('should pass execution envelope to the adapter', async () => {
    await service.submit(baseRequest({
      contextBundle: { key: 'value' },
      inputDocs: [{ path: 'readme.md', content: '# Hello' }],
      allowedOutputs: ['markdown'],
      maxTurns: 3,
      timeout: 120,
      runMode: 'one-shot',
    }))

    expect(stub.executedEnvelopes).toHaveLength(1)
    const env = stub.executedEnvelopes[0]!

    expect(env.projectId).toBe('proj-1')
    expect(env.agentId).toBe('agent-1')
    expect(env.taskType).toBe('generate-doc')
    expect(env.instruction).toBe('Write a README')
    expect(env.contextBundle).toEqual({ key: 'value' })
    expect(env.inputDocs).toEqual([{ path: 'readme.md', content: '# Hello' }])
    expect(env.allowedOutputs).toEqual(['markdown'])
    expect(env.budgetCaps.maxTurns).toBe(3)
    expect(env.timeout).toBe(120)
    expect(env.runMode).toBe('one-shot')
  })

  it('should use defaults for optional fields', async () => {
    await service.submit(baseRequest())

    const env = stub.executedEnvelopes[0]!

    expect(env.contextBundle).toEqual({})
    expect(env.inputDocs).toEqual([])
    expect(env.allowedOutputs).toEqual([])
    expect(env.budgetCaps.maxTokens).toBeNull()
    expect(env.budgetCaps.maxCostUsd).toBeNull()
    expect(env.budgetCaps.maxTurns).toBe(1)
    expect(env.timeout).toBe(300)
    expect(env.runMode).toBe('one-shot')
  })

  it('should apply task-type defaults for known task types', async () => {
    await service.submit(baseRequest({ taskType: 'research-memo' }))

    const env = stub.executedEnvelopes[0]!

    // research-memo defaults: timeout 300, maxTurns 3, maxTokens 32000, maxCostUsd 1.00
    expect(env.timeout).toBe(300)
    expect(env.budgetCaps.maxTurns).toBe(3)
    expect(env.budgetCaps.maxTokens).toBe(32000)
    expect(env.budgetCaps.maxCostUsd).toBe(1.00)
  })

  it('should prefer explicit values over task-type defaults', async () => {
    await service.submit(baseRequest({
      taskType: 'research-memo',
      maxTokens: 5000,
      maxCostUsd: 0.10,
      maxTurns: 1,
      timeout: 60,
      maxRetries: 0,
    }))

    const env = stub.executedEnvelopes[0]!

    expect(env.budgetCaps.maxTokens).toBe(5000)
    expect(env.budgetCaps.maxCostUsd).toBe(0.10)
    expect(env.budgetCaps.maxTurns).toBe(1)
    expect(env.timeout).toBe(60)
  })

  it('should return failed result when adapter returns failure', async () => {
    stub.configureNextResult({
      status: 'failed',
      errorInfo: { code: 'TEST_ERR', message: 'Simulated failure', details: null },
    })

    const result = await service.submit(baseRequest({ maxRetries: 0 }))

    expect(result.status).toBe('failed')
    expect(result.errorInfo?.code).toBe('TEST_ERR')
  })

  it('should return timed-out result', async () => {
    stub.configureNextResult({
      status: 'timed-out',
      errorInfo: { code: 'TIMEOUT', message: 'Timed out', details: null },
    })

    const result = await service.submit(baseRequest({ maxRetries: 0 }))

    expect(result.status).toBe('timed-out')
  })

  it('should retry on failure when maxRetries > 0', async () => {
    let callCount = 0
    const originalExecute = stub.execute.bind(stub)
    stub.execute = async (envelope) => {
      callCount++
      if (callCount === 1) {
        return {
          ...await originalExecute(envelope),
          status: 'failed' as const,
          errorInfo: { code: 'ERR', message: 'first fail', details: null },
        }
      }
      return originalExecute(envelope)
    }

    const result = await service.submit(baseRequest({ maxRetries: 1 }))

    expect(callCount).toBe(2)
    expect(result.status).toBe('completed')
  })

  it('should stop retrying after maxRetries exhausted', async () => {
    stub.configureNextResult({
      status: 'failed',
      errorInfo: { code: 'ERR', message: 'always fails', details: null },
    })

    const result = await service.submit(baseRequest({ maxRetries: 2 }))

    // initial attempt + 2 retries = 3 calls
    expect(stub.executedEnvelopes).toHaveLength(3)
    expect(result.status).toBe('failed')
  })

  it('should handle adapter throwing an error', async () => {
    stub.configureFailure(new Error('Docker is down'))

    const result = await service.submit(baseRequest({ maxRetries: 0 }))

    expect(result.status).toBe('failed')
    expect(result.errorInfo?.code).toBe('ADAPTER_ERROR')
    expect(result.errorInfo?.message).toBe('Docker is down')
  })

  it('should retry on adapter error when retries remain', async () => {
    let callCount = 0
    const originalExecute = stub.execute.bind(stub)
    stub.execute = async (envelope) => {
      callCount++
      if (callCount === 1) {
        throw new Error('Transient Docker error')
      }
      stub.reset()
      return originalExecute(envelope)
    }

    const result = await service.submit(baseRequest({ maxRetries: 1 }))

    expect(callCount).toBe(2)
    expect(result.status).toBe('completed')
  })

  it('should reject empty instruction', async () => {
    await expect(service.submit(baseRequest({ instruction: '   ' })))
      .rejects.toThrow('Execution instruction cannot be empty')
  })

  it('should pass DB API key in envelope when available', async () => {
    const svcWithKey = new ClaudeRunnerService(stub, stubAiProviderConfigService('sk-db-key-123'))
    await svcWithKey.submit(baseRequest())

    const env = stub.executedEnvelopes[0]!
    expect(env.apiKey).toBe('sk-db-key-123')
  })

  it('should leave apiKey undefined when DB returns null', async () => {
    await service.submit(baseRequest())

    const env = stub.executedEnvelopes[0]!
    expect(env.apiKey).toBeUndefined()
  })

  it('should fall back gracefully when AI provider config throws', async () => {
    const failingService = {
      getActiveApiKey: async () => { throw new Error('DB down') },
    } as unknown as AiProviderConfigService
    const svcWithFailing = new ClaudeRunnerService(stub, failingService)

    const result = await svcWithFailing.submit(baseRequest())

    expect(result.status).toBe('completed')
    const env = stub.executedEnvelopes[0]!
    expect(env.apiKey).toBeUndefined()
  })
})
