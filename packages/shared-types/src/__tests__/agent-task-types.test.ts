import { describe, it, expect } from 'vitest'
import type {
  AgentTaskInput,
  AgentTaskResult,
  AgentTaskType,
  SubmitAgentTaskDto,
  AgentTaskStatusDto,
} from '../agent-task-types'
import { TASK_TYPE_DEFAULTS } from '../agent-task-types'

describe('agent-task-types', () => {
  it('AgentTaskType covers all valid task types', () => {
    const types: AgentTaskType[] = [
      'document-drafting',
      'document-revision',
      'structured-summarization',
      'proposal-drafting',
      'backlog-drafting',
      'roadmap-drafting',
      'research-memo',
    ]
    expect(types).toHaveLength(7)
  })

  it('AgentTaskInput minimal fields', () => {
    const input: AgentTaskInput = {
      projectId: 'p-1',
      agentId: 'a-1',
      taskType: 'research-memo',
      instruction: 'Do research',
    }
    expect(input.projectId).toBe('p-1')
    expect(input.contextBundle).toBeUndefined()
    expect(input.inputDocs).toBeUndefined()
    expect(input.maxTurns).toBeUndefined()
    expect(input.timeout).toBeUndefined()
  })

  it('AgentTaskInput full fields with budget caps', () => {
    const input: AgentTaskInput = {
      projectId: 'p-1',
      agentId: 'a-1',
      taskType: 'document-drafting',
      instruction: 'Draft vision doc',
      contextBundle: { market: 'B2B' },
      inputDocs: [{ path: 'ref.md', content: '# Ref' }],
      allowedOutputs: ['markdown'],
      maxTurns: 3,
      maxTokens: 16000,
      maxCostUsd: 0.50,
      timeout: 120,
      maxRetries: 2,
    }
    expect(input.inputDocs).toHaveLength(1)
    expect(input.maxTurns).toBe(3)
    expect(input.maxTokens).toBe(16000)
    expect(input.maxCostUsd).toBe(0.50)
    expect(input.maxRetries).toBe(2)
  })

  it('AgentTaskResult structure', () => {
    const result: AgentTaskResult = {
      executionId: 'exec-1',
      projectId: 'p-1',
      agentId: 'a-1',
      status: 'completed',
      summary: 'Done',
      generatedDocs: [{ path: 'out.md', content: '#Out', docType: 'markdown' }],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 100, outputTokens: 50, estimatedCostUsd: 0.01 },
      durationMs: 5000,
      errorInfo: null,
    }
    expect(result.status).toBe('completed')
    expect(result.generatedDocs).toHaveLength(1)
  })

  it('AgentTaskResult failed with error', () => {
    const result: AgentTaskResult = {
      executionId: 'exec-2',
      projectId: 'p-1',
      agentId: 'a-1',
      status: 'failed',
      summary: '',
      generatedDocs: [],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
      durationMs: null,
      errorInfo: { code: 'TIMEOUT', message: 'Timed out', details: null },
    }
    expect(result.errorInfo?.code).toBe('TIMEOUT')
  })

  it('SubmitAgentTaskDto minimal', () => {
    const dto: SubmitAgentTaskDto = {
      agentId: 'a-1',
      taskType: 'backlog-drafting',
      instruction: 'Draft backlog',
    }
    expect(dto.agentId).toBe('a-1')
  })

  it('AgentTaskStatusDto running', () => {
    const status: AgentTaskStatusDto = {
      workflowId: 'wf-1',
      projectId: 'p-1',
      agentId: 'a-1',
      status: 'running',
    }
    expect(status.result).toBeUndefined()
  })

  it('SubmitAgentTaskDto with budget fields', () => {
    const dto: SubmitAgentTaskDto = {
      agentId: 'a-1',
      taskType: 'research-memo',
      instruction: 'Research competitors',
      maxTokens: 32000,
      maxCostUsd: 1.00,
      maxRetries: 2,
    }
    expect(dto.maxTokens).toBe(32000)
    expect(dto.maxCostUsd).toBe(1.00)
    expect(dto.maxRetries).toBe(2)
  })

  describe('TASK_TYPE_DEFAULTS', () => {
    it('should define defaults for all task types', () => {
      const allTypes: AgentTaskType[] = [
        'document-drafting',
        'document-revision',
        'structured-summarization',
        'proposal-drafting',
        'backlog-drafting',
        'roadmap-drafting',
        'research-memo',
      ]

      for (const taskType of allTypes) {
        const defaults = TASK_TYPE_DEFAULTS[taskType]
        expect(defaults).toBeDefined()
        expect(defaults.timeout).toBeGreaterThan(0)
        expect(defaults.maxRetries).toBeGreaterThanOrEqual(0)
        expect(defaults.maxTurns).toBeGreaterThan(0)
      }
    })

    it('should have research-memo with highest budget', () => {
      const research = TASK_TYPE_DEFAULTS['research-memo']
      const drafting = TASK_TYPE_DEFAULTS['document-drafting']

      expect(research.timeout).toBeGreaterThanOrEqual(drafting.timeout)
      expect(research.maxTokens).toBeGreaterThan(drafting.maxTokens!)
      expect(research.maxCostUsd).toBeGreaterThan(drafting.maxCostUsd!)
    })

    it('should have all timeouts within safety limits', () => {
      for (const [, defaults] of Object.entries(TASK_TYPE_DEFAULTS)) {
        expect(defaults.timeout).toBeGreaterThanOrEqual(10)
        expect(defaults.timeout).toBeLessThanOrEqual(600)
      }
    })
  })

  it('AgentTaskStatusDto completed with result', () => {
    const status: AgentTaskStatusDto = {
      workflowId: 'wf-1',
      projectId: 'p-1',
      agentId: 'a-1',
      status: 'completed',
      result: {
        executionId: 'exec-1',
        projectId: 'p-1',
        agentId: 'a-1',
        status: 'completed',
        summary: 'Done',
        generatedDocs: [],
        generatedProposals: [],
        generatedDecisions: [],
        costApproximation: { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
        durationMs: 1000,
        errorInfo: null,
      },
    }
    expect(status.result?.executionId).toBe('exec-1')
  })
})
