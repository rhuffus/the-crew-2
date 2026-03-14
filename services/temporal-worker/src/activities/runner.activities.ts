import type {
  AgentTaskInput,
  AgentTaskResult,
  ResultEnvelope,
  CreateRuntimeExecutionDto,
  CreateRuntimeEventDto,
} from '@the-crew/shared-types'

const getPlatformUrl = () =>
  process.env.PLATFORM_SERVICE_URL ?? 'http://localhost:4010'

const getCompanyDesignUrl = () =>
  process.env.COMPANY_DESIGN_SERVICE_URL ?? 'http://localhost:4020'

/**
 * Activity 1: Prepare execution workspace.
 * Validates input and generates a unique execution ID.
 */
export async function prepareExecutionWorkspace(
  input: AgentTaskInput,
): Promise<{ executionId: string; validatedInput: AgentTaskInput }> {
  if (!input.projectId) throw new Error('projectId is required')
  if (!input.agentId) throw new Error('agentId is required')
  if (!input.instruction?.trim()) throw new Error('instruction is required')
  if (!input.taskType) throw new Error('taskType is required')

  const executionId = `exec-${crypto.randomUUID()}`
  return { executionId, validatedInput: input }
}

/**
 * Activity 2: Launch Claude container via the platform service's runner.
 * Sends a SubmitExecutionRequest to POST /claude-runner/execute.
 */
export async function launchClaudeContainer(
  executionId: string,
  input: AgentTaskInput,
): Promise<ResultEnvelope> {
  const platformUrl = getPlatformUrl()

  const request = {
    projectId: input.projectId,
    agentId: input.agentId,
    taskType: input.taskType,
    instruction: input.instruction,
    contextBundle: input.contextBundle ?? {},
    inputDocs: input.inputDocs ?? [],
    allowedOutputs: input.allowedOutputs ?? [],
    maxTurns: input.maxTurns ?? 1,
    maxTokens: input.maxTokens ?? null,
    maxCostUsd: input.maxCostUsd ?? null,
    timeout: input.timeout ?? 300,
    maxRetries: input.maxRetries ?? 1,
    runMode: 'one-shot' as const,
  }

  const response = await fetch(`${platformUrl}/claude-runner/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Claude runner returned ${response.status}: ${body}`)
  }

  const result = (await response.json()) as ResultEnvelope
  // Override the executionId so the workflow tracks its own ID
  return { ...result, executionId }
}

/**
 * Activity 3: Collect and normalize the execution result into AgentTaskResult.
 */
export async function collectExecutionResult(
  projectId: string,
  agentId: string,
  executionId: string,
  resultEnvelope: ResultEnvelope,
): Promise<AgentTaskResult> {
  const status =
    resultEnvelope.status === 'cancelled' ? 'failed' : resultEnvelope.status
  return {
    executionId,
    projectId,
    agentId,
    status,
    summary: resultEnvelope.stdoutSummary,
    generatedDocs: resultEnvelope.generatedDocs,
    generatedProposals: resultEnvelope.generatedProposals,
    generatedDecisions: resultEnvelope.generatedDecisions,
    costApproximation: resultEnvelope.costApproximation,
    durationMs: resultEnvelope.timestamps.durationMs,
    errorInfo: resultEnvelope.errorInfo,
  }
}

/**
 * Activity 4: Persist execution outputs as runtime records.
 * Creates a RuntimeExecution and a RuntimeEvent in company-design service.
 * Non-critical: failures here don't break the workflow.
 */
export async function persistExecutionOutputs(
  projectId: string,
  executionId: string,
  result: AgentTaskResult,
): Promise<{ executionId: string; persisted: boolean }> {
  const companyDesignUrl = getCompanyDesignUrl()
  let persisted = true

  // Create runtime execution record
  try {
    const executionDto: CreateRuntimeExecutionDto = {
      executionType: 'agent-task',
      agentId: result.agentId,
      input: {
        executionId,
        taskType: 'agent-task',
        summary: result.summary,
        status: result.status,
        durationMs: result.durationMs,
        cost: result.costApproximation,
        docsGenerated: result.generatedDocs.length,
        proposalsGenerated: result.generatedProposals.length,
      },
    }

    await fetch(
      `${companyDesignUrl}/projects/${projectId}/runtime/executions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionDto),
      },
    )
  } catch {
    persisted = false
  }

  // Create runtime event
  try {
    const eventDto: CreateRuntimeEventDto = {
      eventType:
        result.status === 'completed'
          ? 'execution-completed'
          : 'execution-failed',
      severity: result.status === 'completed' ? 'info' : 'error',
      title: `Agent task ${result.status}`,
      description: result.summary.slice(0, 500) || `Task ${result.status}`,
      sourceEntityType: 'agent',
      sourceEntityId: result.agentId,
      executionId,
      metadata: {
        docsGenerated: result.generatedDocs.length,
        proposalsGenerated: result.generatedProposals.length,
        decisionsGenerated: result.generatedDecisions.length,
        durationMs: result.durationMs,
        cost: result.costApproximation,
      },
    }

    await fetch(`${companyDesignUrl}/projects/${projectId}/runtime/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventDto),
    })
  } catch {
    persisted = false
  }

  return { executionId, persisted }
}
