import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities'

// Short-lived activities: validation, result normalization
const { prepareExecutionWorkspace, collectExecutionResult } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '60s',
  })

// Long-lived activity: container execution — uses max safety timeout + grace.
// Infrastructure retries only (transient Docker/network errors).
// Task-level retries are handled by the ClaudeRunnerService inside the container call.
const { launchClaudeContainer } = proxyActivities<typeof activities>({
  startToCloseTimeout: '660s', // 600s max execution + 60s grace
  retry: {
    maximumAttempts: 2,
    initialInterval: '10s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
  },
})

// Persistence activity: non-critical, no retry needed
const { persistExecutionOutputs } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
})

export interface AgentTaskWorkflowInput {
  projectId: string
  agentId: string
  taskType:
    | 'document-drafting'
    | 'document-revision'
    | 'structured-summarization'
    | 'proposal-drafting'
    | 'backlog-drafting'
    | 'roadmap-drafting'
    | 'research-memo'
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

export interface AgentTaskWorkflowResult {
  executionId: string
  projectId: string
  agentId: string
  status: 'completed' | 'failed' | 'timed-out'
  summary: string
  generatedDocsCount: number
  generatedProposalsCount: number
  durationMs: number | null
  persisted: boolean
  budgetExceeded: boolean
}

/**
 * BasicAgentTaskWorkflow
 *
 * Orchestrates a single specialist task using the Claude runner:
 * 1. Prepare execution workspace (validate, generate executionId)
 * 2. Launch Claude container (call platform runner service)
 * 3. Collect execution result (normalize into AgentTaskResult)
 * 4. Persist execution outputs (create runtime records)
 */
export async function basicAgentTaskWorkflow(
  input: AgentTaskWorkflowInput,
): Promise<AgentTaskWorkflowResult> {
  // Step 1: Prepare
  const { executionId, validatedInput } =
    await prepareExecutionWorkspace(input)

  // Step 2: Launch
  const resultEnvelope = await launchClaudeContainer(
    executionId,
    validatedInput,
  )

  // Step 3: Collect
  const result = await collectExecutionResult(
    input.projectId,
    input.agentId,
    executionId,
    resultEnvelope,
  )

  // Step 4: Persist
  const { persisted } = await persistExecutionOutputs(
    input.projectId,
    executionId,
    result,
  )

  return {
    executionId,
    projectId: input.projectId,
    agentId: input.agentId,
    status: result.status,
    summary: result.summary,
    generatedDocsCount: result.generatedDocs.length,
    generatedProposalsCount: result.generatedProposals.length,
    durationMs: result.durationMs,
    persisted,
    budgetExceeded: resultEnvelope.budgetExceeded ?? false,
  }
}
