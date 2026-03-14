/**
 * Agent Task Types -- BasicAgentTaskWorkflow contracts
 *
 * Used by temporal-worker, platform service, and api-gateway.
 * Source of truth: docs/64-basic-autonomous-work-spec.md
 */

import type {
  ResultDoc,
  ResultProposal,
  ResultDecision,
  CostApproximation,
  ExecutionErrorInfo,
} from './claude-runner-types'

/** Valid task types for basic autonomous work */
export type AgentTaskType =
  | 'document-drafting'
  | 'document-revision'
  | 'structured-summarization'
  | 'proposal-drafting'
  | 'backlog-drafting'
  | 'roadmap-drafting'
  | 'research-memo'

/** Per-task-type default configuration for budgets, timeouts, and retries */
export interface TaskTypeDefaults {
  timeout: number
  maxRetries: number
  maxTurns: number
  maxTokens: number | null
  maxCostUsd: number | null
}

export const TASK_TYPE_DEFAULTS: Record<AgentTaskType, TaskTypeDefaults> = {
  'document-drafting':        { timeout: 180, maxRetries: 1, maxTurns: 1, maxTokens: 16000, maxCostUsd: 0.50 },
  'document-revision':        { timeout: 120, maxRetries: 1, maxTurns: 1, maxTokens: 16000, maxCostUsd: 0.30 },
  'structured-summarization': { timeout: 120, maxRetries: 1, maxTurns: 1, maxTokens: 8000,  maxCostUsd: 0.20 },
  'proposal-drafting':        { timeout: 180, maxRetries: 1, maxTurns: 1, maxTokens: 16000, maxCostUsd: 0.50 },
  'backlog-drafting':         { timeout: 240, maxRetries: 1, maxTurns: 1, maxTokens: 16000, maxCostUsd: 0.50 },
  'roadmap-drafting':         { timeout: 240, maxRetries: 1, maxTurns: 1, maxTokens: 16000, maxCostUsd: 0.50 },
  'research-memo':            { timeout: 300, maxRetries: 2, maxTurns: 3, maxTokens: 32000, maxCostUsd: 1.00 },
}

/** Input for BasicAgentTaskWorkflow */
export interface AgentTaskInput {
  projectId: string
  agentId: string
  taskType: AgentTaskType
  instruction: string
  contextBundle?: Record<string, unknown>
  inputDocs?: Array<{ path: string; content: string }>
  allowedOutputs?: string[]
  maxTurns?: number
  maxTokens?: number | null
  maxCostUsd?: number | null
  timeout?: number // seconds
  maxRetries?: number
}

/** Result from BasicAgentTaskWorkflow */
export interface AgentTaskResult {
  executionId: string
  projectId: string
  agentId: string
  status: 'completed' | 'failed' | 'timed-out'
  summary: string
  generatedDocs: ResultDoc[]
  generatedProposals: ResultProposal[]
  generatedDecisions: ResultDecision[]
  costApproximation: CostApproximation
  durationMs: number | null
  errorInfo: ExecutionErrorInfo | null
}

/** DTO to submit an agent task via API */
export interface SubmitAgentTaskDto {
  agentId: string
  taskType: AgentTaskType
  instruction: string
  contextBundle?: Record<string, unknown>
  inputDocs?: Array<{ path: string; content: string }>
  allowedOutputs?: string[]
  maxTurns?: number
  maxTokens?: number | null
  maxCostUsd?: number | null
  timeout?: number
  maxRetries?: number
}

/** DTO for agent task status response */
export interface AgentTaskStatusDto {
  workflowId: string
  projectId: string
  agentId: string
  status: 'running' | 'completed' | 'failed' | 'timed-out' | 'cancelled'
  result?: AgentTaskResult
}
