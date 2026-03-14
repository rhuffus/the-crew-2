/**
 * Claude Runner — Execution & Result Envelope Types
 *
 * Contracts for the Claude Code container runtime.
 * Source of truth: docs/62-claude-container-runtime-spec.md
 */

// ---------------------------------------------------------------------------
// Execution Envelope (input contract for the runner container)
// ---------------------------------------------------------------------------

export type ExecutionRunMode = 'one-shot' | 'conversational'

export interface ExecutionInputDoc {
  path: string
  content: string
}

export interface ExecutionBudgetCaps {
  maxTokens: number | null
  maxCostUsd: number | null
  maxTurns: number
}

export interface ExecutionEnvelope {
  executionId: string
  projectId: string
  agentId: string
  taskType: string
  instruction: string
  contextBundle: Record<string, unknown>
  inputDocs: ExecutionInputDoc[]
  allowedOutputs: string[]
  budgetCaps: ExecutionBudgetCaps
  timeout: number // seconds
  runMode: ExecutionRunMode
  apiKey?: string
}

// ---------------------------------------------------------------------------
// Result Envelope (output contract from the runner container)
// ---------------------------------------------------------------------------

export type ExecutionResultStatus = 'completed' | 'failed' | 'timed-out' | 'cancelled'

export interface ResultDoc {
  path: string
  content: string
  docType: string
}

export interface ResultProposal {
  title: string
  description: string
  proposalType: string
}

export interface ResultDecision {
  title: string
  description: string
  rationale: string
}

export interface CostApproximation {
  inputTokens: number
  outputTokens: number
  estimatedCostUsd: number
}

export interface ExecutionTimestamps {
  queuedAt: string
  startedAt: string | null
  completedAt: string | null
  durationMs: number | null
}

export interface ExecutionErrorInfo {
  code: string
  message: string
  details: string | null
}

export interface ResultEnvelope {
  executionId: string
  status: ExecutionResultStatus
  stdoutSummary: string
  generatedDocs: ResultDoc[]
  generatedProposals: ResultProposal[]
  generatedDecisions: ResultDecision[]
  costApproximation: CostApproximation
  timestamps: ExecutionTimestamps
  errorInfo: ExecutionErrorInfo | null
  budgetExceeded?: boolean
}

// ---------------------------------------------------------------------------
// Runtime Safety Limits — hard caps that cannot be overridden by callers
// ---------------------------------------------------------------------------

export const RUNTIME_SAFETY_LIMITS = {
  /** Maximum allowed execution timeout (seconds) */
  maxTimeoutSeconds: 600,
  /** Minimum allowed execution timeout (seconds) */
  minTimeoutSeconds: 10,
  /** Maximum retries allowed per execution */
  maxRetries: 5,
  /** Grace period added to container hard timeout (seconds) */
  containerGracePeriodSeconds: 30,
  /** Maximum process count inside container */
  containerPidsLimit: 100,
  /** Maximum stdout/stderr buffer per container (bytes) */
  containerMaxBufferBytes: 10 * 1024 * 1024,
  /** Default container memory limit (MB) */
  defaultMemoryMb: 512,
  /** Default container CPU limit */
  defaultCpus: 1,
} as const
