/**
 * AIR-020 — Smoke test: Agent task workflow activity chain
 *
 * Validates the full activity chain for basicAgentTaskWorkflow:
 *   prepareExecutionWorkspace → launchClaudeContainer → collectExecutionResult → persistExecutionOutputs
 *
 * Uses mocked fetch for HTTP calls to platform and company-design services.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  prepareExecutionWorkspace,
  launchClaudeContainer,
  collectExecutionResult,
  persistExecutionOutputs,
} from '../activities/runner.activities'
import type { AgentTaskInput, ResultEnvelope, AgentTaskResult } from '@the-crew/shared-types'

function makeTaskInput(overrides: Partial<AgentTaskInput> = {}): AgentTaskInput {
  return {
    projectId: 'smoke-proj-1',
    agentId: 'agent-specialist-1',
    taskType: 'document-drafting',
    instruction: 'Draft a technical overview document for the API module',
    contextBundle: { projectName: 'SmokeTest Inc' },
    inputDocs: [{ path: 'context/api-spec.md', content: '# API Spec\nGET /health' }],
    allowedOutputs: ['documents'],
    maxTurns: 1,
    timeout: 120,
    maxRetries: 1,
    ...overrides,
  }
}

function makeResultEnvelope(overrides: Partial<ResultEnvelope> = {}): ResultEnvelope {
  return {
    executionId: 'exec-test-001',
    status: 'completed',
    stdoutSummary: 'Generated a technical overview document covering the API module architecture.',
    generatedDocs: [
      {
        path: 'docs/api-overview.md',
        content: '# API Overview\n\nThis document covers the API architecture.',
        docType: 'technical-overview',
      },
    ],
    generatedProposals: [],
    generatedDecisions: [
      {
        title: 'Use REST for public API',
        description: 'REST is more appropriate for our public-facing API',
        rationale: 'Better tooling support and client compatibility',
      },
    ],
    costApproximation: {
      inputTokens: 1500,
      outputTokens: 800,
      estimatedCostUsd: 0.035,
    },
    timestamps: {
      queuedAt: '2026-03-13T10:00:00Z',
      startedAt: '2026-03-13T10:00:01Z',
      completedAt: '2026-03-13T10:00:45Z',
      durationMs: 44000,
    },
    errorInfo: null,
    ...overrides,
  }
}

describe('Smoke: Agent Task Activity Chain', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  // -------------------------------------------------------------------------
  // Activity 1: Prepare execution workspace
  // -------------------------------------------------------------------------
  describe('prepareExecutionWorkspace', () => {
    it('should validate input and return executionId', async () => {
      const input = makeTaskInput()
      const { executionId, validatedInput } = await prepareExecutionWorkspace(input)

      expect(executionId).toMatch(/^exec-/)
      expect(validatedInput.projectId).toBe('smoke-proj-1')
      expect(validatedInput.agentId).toBe('agent-specialist-1')
      expect(validatedInput.taskType).toBe('document-drafting')
    })

    it('should reject missing projectId', async () => {
      await expect(
        prepareExecutionWorkspace(makeTaskInput({ projectId: '' })),
      ).rejects.toThrow('projectId is required')
    })

    it('should reject missing agentId', async () => {
      await expect(
        prepareExecutionWorkspace(makeTaskInput({ agentId: '' })),
      ).rejects.toThrow('agentId is required')
    })

    it('should reject empty instruction', async () => {
      await expect(
        prepareExecutionWorkspace(makeTaskInput({ instruction: '  ' })),
      ).rejects.toThrow('instruction is required')
    })

    it('should reject missing taskType', async () => {
      await expect(
        prepareExecutionWorkspace(makeTaskInput({ taskType: '' as never })),
      ).rejects.toThrow('taskType is required')
    })
  })

  // -------------------------------------------------------------------------
  // Activity 2: Launch Claude container
  // -------------------------------------------------------------------------
  describe('launchClaudeContainer', () => {
    it('should call platform runner and return result envelope', async () => {
      const envelope = makeResultEnvelope()
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(envelope),
      })

      const result = await launchClaudeContainer('exec-001', makeTaskInput())

      expect(result.status).toBe('completed')
      expect(result.executionId).toBe('exec-001') // overridden by activity
      expect(result.generatedDocs).toHaveLength(1)
      expect(result.generatedDocs[0]!.path).toBe('docs/api-overview.md')

      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/claude-runner/execute'),
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('should throw on non-OK response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      })

      await expect(
        launchClaudeContainer('exec-002', makeTaskInput()),
      ).rejects.toThrow('Claude runner returned 500')
    })
  })

  // -------------------------------------------------------------------------
  // Activity 3: Collect execution result
  // -------------------------------------------------------------------------
  describe('collectExecutionResult', () => {
    it('should normalize successful result into AgentTaskResult', async () => {
      const envelope = makeResultEnvelope()
      const result = await collectExecutionResult(
        'smoke-proj-1',
        'agent-1',
        'exec-001',
        envelope,
      )

      expect(result.executionId).toBe('exec-001')
      expect(result.projectId).toBe('smoke-proj-1')
      expect(result.agentId).toBe('agent-1')
      expect(result.status).toBe('completed')
      expect(result.summary).toBe(envelope.stdoutSummary)
      expect(result.generatedDocs).toHaveLength(1)
      expect(result.generatedDecisions).toHaveLength(1)
      expect(result.costApproximation.estimatedCostUsd).toBe(0.035)
      expect(result.durationMs).toBe(44000)
    })

    it('should map cancelled status to failed', async () => {
      const envelope = makeResultEnvelope({ status: 'cancelled' })
      const result = await collectExecutionResult(
        'proj-1', 'agent-1', 'exec-001', envelope,
      )
      expect(result.status).toBe('failed')
    })

    it('should pass through timed-out status', async () => {
      const envelope = makeResultEnvelope({ status: 'timed-out' })
      const result = await collectExecutionResult(
        'proj-1', 'agent-1', 'exec-001', envelope,
      )
      expect(result.status).toBe('timed-out')
    })

    it('should include error info when present', async () => {
      const envelope = makeResultEnvelope({
        status: 'failed',
        errorInfo: { code: 'TIMEOUT', message: 'Container timed out', details: '' },
      })
      const result = await collectExecutionResult(
        'proj-1', 'agent-1', 'exec-001', envelope,
      )
      expect(result.errorInfo).toEqual({
        code: 'TIMEOUT',
        message: 'Container timed out',
        details: '',
      })
    })
  })

  // -------------------------------------------------------------------------
  // Activity 4: Persist execution outputs
  // -------------------------------------------------------------------------
  describe('persistExecutionOutputs', () => {
    function makeAgentTaskResult(): AgentTaskResult {
      return {
        executionId: 'exec-001',
        projectId: 'smoke-proj-1',
        agentId: 'agent-1',
        status: 'completed',
        summary: 'Task completed successfully',
        generatedDocs: [{ path: 'doc.md', content: '# Doc', docType: 'overview' }],
        generatedProposals: [],
        generatedDecisions: [],
        costApproximation: { inputTokens: 100, outputTokens: 50, estimatedCostUsd: 0.01 },
        durationMs: 5000,
        errorInfo: null,
      }
    }

    it('should persist execution and event records', async () => {
      const fetchCalls: string[] = []
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        fetchCalls.push(url)
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      const { executionId, persisted } = await persistExecutionOutputs(
        'smoke-proj-1',
        'exec-001',
        makeAgentTaskResult(),
      )

      expect(executionId).toBe('exec-001')
      expect(persisted).toBe(true)
      expect(fetchCalls).toHaveLength(2)
      expect(fetchCalls[0]).toContain('/runtime/executions')
      expect(fetchCalls[1]).toContain('/runtime/events')
    })

    it('should return persisted=false when execution record fails', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error'))

      const { persisted } = await persistExecutionOutputs(
        'smoke-proj-1',
        'exec-001',
        makeAgentTaskResult(),
      )

      expect(persisted).toBe(false)
    })

    it('should set event type to execution-failed for failed tasks', async () => {
      let capturedBody: Record<string, unknown> | null = null
      let callCount = 0
      globalThis.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        callCount++
        if (callCount === 2) {
          capturedBody = JSON.parse(init?.body as string)
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      const failedResult = makeAgentTaskResult()
      failedResult.status = 'failed'
      failedResult.summary = 'Container crashed'

      await persistExecutionOutputs('smoke-proj-1', 'exec-001', failedResult)

      expect(capturedBody!.eventType).toBe('execution-failed')
      expect(capturedBody!.severity).toBe('error')
    })
  })

  // -------------------------------------------------------------------------
  // Full chain: activities 1→2→3→4 feed data correctly
  // -------------------------------------------------------------------------
  describe('Full activity chain', () => {
    it('should chain all four activities correctly', async () => {
      const envelope = makeResultEnvelope()
      let persistCallCount = 0

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if ((url as string).includes('/claude-runner/execute')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(envelope),
          })
        }
        persistCallCount++
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      // Step 1: Prepare
      const input = makeTaskInput()
      const { executionId, validatedInput } = await prepareExecutionWorkspace(input)
      expect(executionId).toBeTruthy()

      // Step 2: Launch
      const resultEnvelope = await launchClaudeContainer(executionId, validatedInput)
      expect(resultEnvelope.status).toBe('completed')
      expect(resultEnvelope.executionId).toBe(executionId)

      // Step 3: Collect
      const result = await collectExecutionResult(
        input.projectId,
        input.agentId,
        executionId,
        resultEnvelope,
      )
      expect(result.status).toBe('completed')
      expect(result.generatedDocs).toHaveLength(1)
      expect(result.generatedDecisions).toHaveLength(1)

      // Step 4: Persist
      const { persisted } = await persistExecutionOutputs(
        input.projectId,
        executionId,
        result,
      )
      expect(persisted).toBe(true)
      expect(persistCallCount).toBe(2)
    })

    it('should handle a failed execution gracefully through the chain', async () => {
      const failedEnvelope = makeResultEnvelope({
        status: 'failed',
        stdoutSummary: 'Claude exited with non-zero code',
        generatedDocs: [],
        generatedDecisions: [],
        errorInfo: { code: 'RUNTIME_ERROR', message: 'Process crashed', details: '' },
      })

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if ((url as string).includes('/claude-runner/execute')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(failedEnvelope),
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      const input = makeTaskInput()
      const { executionId, validatedInput } = await prepareExecutionWorkspace(input)

      const resultEnvelope = await launchClaudeContainer(executionId, validatedInput)
      expect(resultEnvelope.status).toBe('failed')

      const result = await collectExecutionResult(
        input.projectId, input.agentId, executionId, resultEnvelope,
      )
      expect(result.status).toBe('failed')
      expect(result.errorInfo).toBeTruthy()
      expect(result.generatedDocs).toHaveLength(0)

      const { persisted } = await persistExecutionOutputs(
        input.projectId, executionId, result,
      )
      expect(persisted).toBe(true)
    })

    it('should handle timed-out execution through the chain', async () => {
      const timedOutEnvelope = makeResultEnvelope({
        status: 'timed-out',
        stdoutSummary: 'Execution exceeded timeout',
        generatedDocs: [],
        errorInfo: { code: 'TIMEOUT', message: 'Hard timeout reached', details: '' },
        budgetExceeded: true,
      })

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if ((url as string).includes('/claude-runner/execute')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(timedOutEnvelope),
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      })

      const input = makeTaskInput()
      const { executionId, validatedInput } = await prepareExecutionWorkspace(input)
      const resultEnvelope = await launchClaudeContainer(executionId, validatedInput)
      const result = await collectExecutionResult(
        input.projectId, input.agentId, executionId, resultEnvelope,
      )

      expect(result.status).toBe('timed-out')
      expect(resultEnvelope.budgetExceeded).toBe(true)
    })
  })
})
