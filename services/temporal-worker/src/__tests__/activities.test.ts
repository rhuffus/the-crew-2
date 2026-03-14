import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as bootstrap from '../activities/bootstrap.activities'
import * as org from '../activities/org.activities'
import * as runner from '../activities/runner.activities'
import type { ResultEnvelope, AgentTaskInput } from '@the-crew/shared-types'

describe('bootstrap activities', () => {
  it('loadBootstrapState returns pending status', async () => {
    const result = await bootstrap.loadBootstrapState('project-1')
    expect(result).toEqual({ projectId: 'project-1', status: 'pending' })
  })

  it('loadProjectSeed returns empty seed', async () => {
    const result = await bootstrap.loadProjectSeed('project-1')
    expect(result).toEqual({
      projectId: 'project-1',
      name: '',
      description: '',
    })
  })

  it('persistAssistantMessage returns message id', async () => {
    const result = await bootstrap.persistAssistantMessage(
      'project-1',
      'hello',
    )
    expect(result.projectId).toBe('project-1')
    expect(result.messageId).toMatch(/^msg-/)
  })
})

// Document activities are tested in document-activities.test.ts

describe('org activities', () => {
  it('evaluateOrgProposal returns not approved', async () => {
    const result = await org.evaluateOrgProposal('project-1', 'proposal-1')
    expect(result).toEqual({
      projectId: 'project-1',
      proposalId: 'proposal-1',
      approved: false,
    })
  })

  it('createDepartment returns department id', async () => {
    const result = await org.createDepartment('project-1', 'Engineering')
    expect(result.projectId).toBe('project-1')
    expect(result.departmentId).toMatch(/^dept-/)
  })

  it('createTeam returns team id', async () => {
    const result = await org.createTeam('project-1', 'dept-1', 'Frontend')
    expect(result.projectId).toBe('project-1')
    expect(result.teamId).toMatch(/^team-/)
  })

  it('createSpecialist returns specialist id', async () => {
    const result = await org.createSpecialist(
      'project-1',
      'team-1',
      'Senior Dev',
    )
    expect(result.projectId).toBe('project-1')
    expect(result.specialistId).toMatch(/^spec-/)
  })
})

// --------------------------------------------------------------------------
// Runner activities (real implementations)
// --------------------------------------------------------------------------

const validInput: AgentTaskInput = {
  projectId: 'project-1',
  agentId: 'agent-1',
  taskType: 'research-memo',
  instruction: 'Research competitors',
}

const mockResultEnvelope: ResultEnvelope = {
  executionId: 'exec-original',
  status: 'completed',
  stdoutSummary: 'Research complete. Found 5 competitors.',
  generatedDocs: [
    { path: 'output/research.md', content: '# Research', docType: 'markdown' },
  ],
  generatedProposals: [
    { title: 'Strategy Proposal', description: 'Focus on X', proposalType: 'strategy' },
  ],
  generatedDecisions: [
    { title: 'Target Market', description: 'Go B2B', rationale: 'Higher LTV' },
  ],
  costApproximation: { inputTokens: 1000, outputTokens: 500, estimatedCostUsd: 0.05 },
  timestamps: {
    queuedAt: '2026-01-01T00:00:00Z',
    startedAt: '2026-01-01T00:00:01Z',
    completedAt: '2026-01-01T00:00:30Z',
    durationMs: 29000,
  },
  errorInfo: null,
}

describe('runner activities', () => {
  describe('prepareExecutionWorkspace', () => {
    it('validates and generates execution id', async () => {
      const result = await runner.prepareExecutionWorkspace(validInput)
      expect(result.executionId).toMatch(/^exec-/)
      expect(result.validatedInput).toEqual(validInput)
    })

    it('rejects missing projectId', async () => {
      await expect(
        runner.prepareExecutionWorkspace({ ...validInput, projectId: '' }),
      ).rejects.toThrow('projectId is required')
    })

    it('rejects missing agentId', async () => {
      await expect(
        runner.prepareExecutionWorkspace({ ...validInput, agentId: '' }),
      ).rejects.toThrow('agentId is required')
    })

    it('rejects empty instruction', async () => {
      await expect(
        runner.prepareExecutionWorkspace({ ...validInput, instruction: '   ' }),
      ).rejects.toThrow('instruction is required')
    })

    it('rejects missing taskType', async () => {
      await expect(
        runner.prepareExecutionWorkspace({ ...validInput, taskType: '' as AgentTaskInput['taskType'] }),
      ).rejects.toThrow('taskType is required')
    })
  })

  describe('launchClaudeContainer', () => {
    let fetchSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      fetchSpy = vi.fn()
      vi.stubGlobal('fetch', fetchSpy)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('calls platform service and returns result with overridden executionId', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResultEnvelope),
      })

      const result = await runner.launchClaudeContainer('exec-123', validInput)

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('http://localhost:4010/claude-runner/execute')
      expect(opts.method).toBe('POST')

      const body = JSON.parse(opts.body as string)
      expect(body.projectId).toBe('project-1')
      expect(body.agentId).toBe('agent-1')
      expect(body.taskType).toBe('research-memo')
      expect(body.instruction).toBe('Research competitors')
      expect(body.runMode).toBe('one-shot')

      expect(result.executionId).toBe('exec-123')
      expect(result.status).toBe('completed')
    })

    it('throws on non-ok response', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      })

      await expect(
        runner.launchClaudeContainer('exec-1', validInput),
      ).rejects.toThrow('Claude runner returned 500: Internal Server Error')
    })

    it('uses custom PLATFORM_SERVICE_URL', async () => {
      process.env.PLATFORM_SERVICE_URL = 'http://custom:9999'
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResultEnvelope),
      })

      await runner.launchClaudeContainer('exec-1', validInput)

      const [url] = fetchSpy.mock.calls[0] as [string]
      expect(url).toBe('http://custom:9999/claude-runner/execute')

      delete process.env.PLATFORM_SERVICE_URL
    })

    it('passes optional fields correctly including budget caps', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResultEnvelope),
      })

      const inputWithOptions: AgentTaskInput = {
        ...validInput,
        contextBundle: { key: 'value' },
        inputDocs: [{ path: 'doc.md', content: '# Doc' }],
        allowedOutputs: ['markdown'],
        maxTurns: 3,
        maxTokens: 8000,
        maxCostUsd: 0.50,
        timeout: 120,
        maxRetries: 2,
      }

      await runner.launchClaudeContainer('exec-1', inputWithOptions)

      const body = JSON.parse(
        (fetchSpy.mock.calls[0] as [string, RequestInit])[1].body as string,
      )
      expect(body.contextBundle).toEqual({ key: 'value' })
      expect(body.inputDocs).toEqual([{ path: 'doc.md', content: '# Doc' }])
      expect(body.allowedOutputs).toEqual(['markdown'])
      expect(body.maxTurns).toBe(3)
      expect(body.maxTokens).toBe(8000)
      expect(body.maxCostUsd).toBe(0.50)
      expect(body.timeout).toBe(120)
      expect(body.maxRetries).toBe(2)
    })
  })

  describe('collectExecutionResult', () => {
    it('normalizes completed result', async () => {
      const result = await runner.collectExecutionResult(
        'project-1', 'agent-1', 'exec-1', mockResultEnvelope,
      )

      expect(result.executionId).toBe('exec-1')
      expect(result.projectId).toBe('project-1')
      expect(result.agentId).toBe('agent-1')
      expect(result.status).toBe('completed')
      expect(result.summary).toBe('Research complete. Found 5 competitors.')
      expect(result.generatedDocs).toHaveLength(1)
      expect(result.generatedProposals).toHaveLength(1)
      expect(result.generatedDecisions).toHaveLength(1)
      expect(result.durationMs).toBe(29000)
      expect(result.errorInfo).toBeNull()
    })

    it('maps cancelled status to failed', async () => {
      const cancelled: ResultEnvelope = {
        ...mockResultEnvelope,
        status: 'cancelled',
        errorInfo: { code: 'CANCELLED', message: 'User cancelled', details: null },
      }

      const result = await runner.collectExecutionResult(
        'project-1', 'agent-1', 'exec-1', cancelled,
      )

      expect(result.status).toBe('failed')
    })

    it('preserves failed status and error info', async () => {
      const failed: ResultEnvelope = {
        ...mockResultEnvelope,
        status: 'failed',
        errorInfo: { code: 'TIMEOUT', message: 'Timed out', details: 'After 300s' },
      }

      const result = await runner.collectExecutionResult(
        'project-1', 'agent-1', 'exec-1', failed,
      )

      expect(result.status).toBe('failed')
      expect(result.errorInfo?.code).toBe('TIMEOUT')
    })
  })

  describe('persistExecutionOutputs', () => {
    let fetchSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      fetchSpy = vi.fn()
      vi.stubGlobal('fetch', fetchSpy)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    const taskResult = {
      executionId: 'exec-1',
      projectId: 'project-1',
      agentId: 'agent-1',
      status: 'completed' as const,
      summary: 'Done',
      generatedDocs: [{ path: 'a.md', content: '#A', docType: 'markdown' }],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 100, outputTokens: 50, estimatedCostUsd: 0.01 },
      durationMs: 5000,
      errorInfo: null,
    }

    it('creates runtime execution and event records', async () => {
      fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

      const result = await runner.persistExecutionOutputs('project-1', 'exec-1', taskResult)

      expect(result.executionId).toBe('exec-1')
      expect(result.persisted).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(2)

      // First call: runtime execution
      const [execUrl] = fetchSpy.mock.calls[0] as [string]
      expect(execUrl).toContain('/projects/project-1/runtime/executions')

      // Second call: runtime event
      const [eventUrl] = fetchSpy.mock.calls[1] as [string]
      expect(eventUrl).toContain('/projects/project-1/runtime/events')
    })

    it('uses correct event type for completed tasks', async () => {
      fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

      await runner.persistExecutionOutputs('project-1', 'exec-1', taskResult)

      const eventBody = JSON.parse(
        (fetchSpy.mock.calls[1] as [string, RequestInit])[1].body as string,
      )
      expect(eventBody.eventType).toBe('execution-completed')
      expect(eventBody.severity).toBe('info')
    })

    it('uses correct event type for failed tasks', async () => {
      fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

      await runner.persistExecutionOutputs('project-1', 'exec-1', {
        ...taskResult,
        status: 'failed',
      })

      const eventBody = JSON.parse(
        (fetchSpy.mock.calls[1] as [string, RequestInit])[1].body as string,
      )
      expect(eventBody.eventType).toBe('execution-failed')
      expect(eventBody.severity).toBe('error')
    })

    it('returns persisted=false but does not throw on fetch errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      const result = await runner.persistExecutionOutputs('project-1', 'exec-1', taskResult)

      expect(result.executionId).toBe('exec-1')
      expect(result.persisted).toBe(false)
    })

    it('uses custom COMPANY_DESIGN_SERVICE_URL', async () => {
      process.env.COMPANY_DESIGN_SERVICE_URL = 'http://custom:8888'
      fetchSpy.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

      await runner.persistExecutionOutputs('project-1', 'exec-1', taskResult)

      const [url] = fetchSpy.mock.calls[0] as [string]
      expect(url).toContain('http://custom:8888')

      delete process.env.COMPANY_DESIGN_SERVICE_URL
    })
  })
})
