import { describe, it, expect, beforeEach } from 'vitest'
import { StubClaudeRunnerAdapter } from './stub-claude-runner.adapter'
import type { ExecutionEnvelope } from '@the-crew/shared-types'

function buildEnvelope(overrides: Partial<ExecutionEnvelope> = {}): ExecutionEnvelope {
  return {
    executionId: 'exec-1',
    projectId: 'proj-1',
    agentId: 'agent-1',
    taskType: 'test-task',
    instruction: 'Do something',
    contextBundle: {},
    inputDocs: [],
    allowedOutputs: [],
    budgetCaps: { maxTokens: null, maxCostUsd: null, maxTurns: 1 },
    timeout: 60,
    runMode: 'one-shot',
    ...overrides,
  }
}

describe('StubClaudeRunnerAdapter', () => {
  let adapter: StubClaudeRunnerAdapter

  beforeEach(() => {
    adapter = new StubClaudeRunnerAdapter()
  })

  it('should return a default successful result', async () => {
    const result = await adapter.execute(buildEnvelope())

    expect(result.executionId).toBe('exec-1')
    expect(result.status).toBe('completed')
    expect(result.stdoutSummary).toContain('test-task')
    expect(result.errorInfo).toBeNull()
    expect(result.costApproximation.inputTokens).toBe(100)
    expect(result.costApproximation.outputTokens).toBe(50)
  })

  it('should track executed envelopes', async () => {
    await adapter.execute(buildEnvelope({ executionId: 'a' }))
    await adapter.execute(buildEnvelope({ executionId: 'b' }))

    expect(adapter.executedEnvelopes).toHaveLength(2)
    expect(adapter.executedEnvelopes[0]!.executionId).toBe('a')
    expect(adapter.executedEnvelopes[1]!.executionId).toBe('b')
  })

  it('should return configured result', async () => {
    adapter.configureNextResult({
      status: 'failed',
      errorInfo: { code: 'TEST', message: 'configured error', details: null },
    })

    const result = await adapter.execute(buildEnvelope())

    expect(result.status).toBe('failed')
    expect(result.errorInfo?.code).toBe('TEST')
  })

  it('should throw when configured to fail', async () => {
    adapter.configureFailure(new Error('Docker unavailable'))

    await expect(adapter.execute(buildEnvelope()))
      .rejects.toThrow('Docker unavailable')
  })

  it('should reset state', async () => {
    adapter.configureNextResult({ status: 'failed' })
    adapter.configureFailure(new Error('err'))
    await adapter.execute(buildEnvelope()).catch(() => {})

    adapter.reset()

    expect(adapter.executedEnvelopes).toHaveLength(0)
    const result = await adapter.execute(buildEnvelope())
    expect(result.status).toBe('completed')
  })
})
