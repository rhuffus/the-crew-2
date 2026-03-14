import { describe, it, expect } from 'vitest'
import type {
  ExecutionEnvelope,
  ResultEnvelope,
  ExecutionRunMode,
  ExecutionResultStatus,
  ExecutionInputDoc,
  ExecutionBudgetCaps,
  ResultDoc,
  ResultProposal,
  ResultDecision,
  CostApproximation,
  ExecutionTimestamps,
  ExecutionErrorInfo,
} from '../claude-runner-types'
import { RUNTIME_SAFETY_LIMITS } from '../claude-runner-types'

describe('Claude Runner Types', () => {
  it('should allow constructing a valid ExecutionEnvelope', () => {
    const envelope: ExecutionEnvelope = {
      executionId: 'exec-1',
      projectId: 'proj-1',
      agentId: 'agent-1',
      taskType: 'generate-doc',
      instruction: 'Write a README',
      contextBundle: { repoName: 'the-crew' },
      inputDocs: [{ path: 'existing.md', content: '# Old' }],
      allowedOutputs: ['markdown'],
      budgetCaps: { maxTokens: 10000, maxCostUsd: 0.5, maxTurns: 3 },
      timeout: 300,
      runMode: 'one-shot',
    }

    expect(envelope.executionId).toBe('exec-1')
    expect(envelope.runMode).toBe('one-shot')
  })

  it('should allow constructing a valid ResultEnvelope', () => {
    const result: ResultEnvelope = {
      executionId: 'exec-1',
      status: 'completed',
      stdoutSummary: 'Generated README successfully',
      generatedDocs: [{ path: 'README.md', content: '# TheCrew', docType: 'md' }],
      generatedProposals: [{ title: 'Add CI', description: 'Set up CI/CD', proposalType: 'infrastructure' }],
      generatedDecisions: [{ title: 'Use Vitest', description: 'Adopt Vitest', rationale: 'Fast and TS-native' }],
      costApproximation: { inputTokens: 500, outputTokens: 200, estimatedCostUsd: 0.01 },
      timestamps: {
        queuedAt: '2026-01-01T00:00:00Z',
        startedAt: '2026-01-01T00:00:01Z',
        completedAt: '2026-01-01T00:00:10Z',
        durationMs: 9000,
      },
      errorInfo: null,
    }

    expect(result.status).toBe('completed')
    expect(result.generatedDocs).toHaveLength(1)
  })

  it('should allow constructing a failed ResultEnvelope', () => {
    const result: ResultEnvelope = {
      executionId: 'exec-2',
      status: 'failed',
      stdoutSummary: '',
      generatedDocs: [],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
      timestamps: {
        queuedAt: '2026-01-01T00:00:00Z',
        startedAt: '2026-01-01T00:00:01Z',
        completedAt: '2026-01-01T00:00:05Z',
        durationMs: 4000,
      },
      errorInfo: { code: 'TIMEOUT', message: 'Execution timed out', details: null },
    }

    expect(result.status).toBe('failed')
    expect(result.errorInfo).not.toBeNull()
    expect(result.errorInfo!.code).toBe('TIMEOUT')
  })

  it('should validate all run modes', () => {
    const modes: ExecutionRunMode[] = ['one-shot', 'conversational']
    expect(modes).toHaveLength(2)
  })

  it('should validate all result statuses', () => {
    const statuses: ExecutionResultStatus[] = ['completed', 'failed', 'timed-out', 'cancelled']
    expect(statuses).toHaveLength(4)
  })

  it('should validate ExecutionInputDoc shape', () => {
    const doc: ExecutionInputDoc = { path: 'file.md', content: '# Content' }
    expect(doc.path).toBeTruthy()
  })

  it('should validate ExecutionBudgetCaps with nulls', () => {
    const caps: ExecutionBudgetCaps = { maxTokens: null, maxCostUsd: null, maxTurns: 1 }
    expect(caps.maxTurns).toBe(1)
  })

  it('should validate ResultDoc shape', () => {
    const doc: ResultDoc = { path: 'out.md', content: '# Output', docType: 'md' }
    expect(doc.docType).toBe('md')
  })

  it('should validate ResultProposal shape', () => {
    const proposal: ResultProposal = { title: 'T', description: 'D', proposalType: 'pt' }
    expect(proposal.title).toBe('T')
  })

  it('should validate ResultDecision shape', () => {
    const decision: ResultDecision = { title: 'T', description: 'D', rationale: 'R' }
    expect(decision.rationale).toBe('R')
  })

  it('should validate CostApproximation shape', () => {
    const cost: CostApproximation = { inputTokens: 100, outputTokens: 50, estimatedCostUsd: 0.01 }
    expect(cost.estimatedCostUsd).toBeGreaterThan(0)
  })

  it('should validate ExecutionTimestamps with nulls', () => {
    const ts: ExecutionTimestamps = {
      queuedAt: '2026-01-01T00:00:00Z',
      startedAt: null,
      completedAt: null,
      durationMs: null,
    }
    expect(ts.startedAt).toBeNull()
  })

  it('should validate ExecutionErrorInfo shape', () => {
    const err: ExecutionErrorInfo = { code: 'ERR', message: 'msg', details: 'extra info' }
    expect(err.details).toBe('extra info')
  })

  it('should allow budgetExceeded flag on ResultEnvelope', () => {
    const result: ResultEnvelope = {
      executionId: 'exec-1',
      status: 'completed',
      stdoutSummary: 'Done',
      generatedDocs: [],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 50000, outputTokens: 20000, estimatedCostUsd: 1.50 },
      timestamps: {
        queuedAt: '2026-01-01T00:00:00Z',
        startedAt: '2026-01-01T00:00:01Z',
        completedAt: '2026-01-01T00:01:00Z',
        durationMs: 59000,
      },
      errorInfo: null,
      budgetExceeded: true,
    }
    expect(result.budgetExceeded).toBe(true)
  })

  describe('RUNTIME_SAFETY_LIMITS', () => {
    it('should define all required safety limits', () => {
      expect(RUNTIME_SAFETY_LIMITS.maxTimeoutSeconds).toBe(600)
      expect(RUNTIME_SAFETY_LIMITS.minTimeoutSeconds).toBe(10)
      expect(RUNTIME_SAFETY_LIMITS.maxRetries).toBe(5)
      expect(RUNTIME_SAFETY_LIMITS.containerGracePeriodSeconds).toBe(30)
      expect(RUNTIME_SAFETY_LIMITS.containerPidsLimit).toBe(100)
      expect(RUNTIME_SAFETY_LIMITS.containerMaxBufferBytes).toBe(10 * 1024 * 1024)
      expect(RUNTIME_SAFETY_LIMITS.defaultMemoryMb).toBe(512)
      expect(RUNTIME_SAFETY_LIMITS.defaultCpus).toBe(1)
    })

    it('should have consistent min/max timeout bounds', () => {
      expect(RUNTIME_SAFETY_LIMITS.minTimeoutSeconds).toBeLessThan(RUNTIME_SAFETY_LIMITS.maxTimeoutSeconds)
    })
  })
})
