import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ExecutionEnvelope, ResultEnvelope, AgentTaskType } from '@the-crew/shared-types'
import { TASK_TYPE_DEFAULTS } from '@the-crew/shared-types'
import { Execution } from '../domain/execution'
import { CLAUDE_RUNNER_PORT, type ClaudeRunnerPort } from '../domain/claude-runner.port'
import { AiProviderConfigService } from '../../ai-provider-config/application/ai-provider-config.service'

export interface SubmitExecutionRequest {
  projectId: string
  agentId: string
  taskType: string
  instruction: string
  contextBundle?: Record<string, unknown>
  inputDocs?: Array<{ path: string; content: string }>
  allowedOutputs?: string[]
  maxTokens?: number | null
  maxCostUsd?: number | null
  maxTurns?: number
  timeout?: number
  maxRetries?: number
  runMode?: 'one-shot' | 'conversational'
}

@Injectable()
export class ClaudeRunnerService {
  private readonly logger = new Logger(ClaudeRunnerService.name)

  constructor(
    @Inject(CLAUDE_RUNNER_PORT) private readonly runner: ClaudeRunnerPort,
    private readonly aiProviderConfigService: AiProviderConfigService,
  ) {}

  async submit(request: SubmitExecutionRequest): Promise<ResultEnvelope> {
    const defaults = TASK_TYPE_DEFAULTS[request.taskType as AgentTaskType]

    const execution = Execution.create({
      id: crypto.randomUUID(),
      projectId: request.projectId,
      agentId: request.agentId,
      taskType: request.taskType,
      instruction: request.instruction,
      timeout: request.timeout ?? defaults?.timeout,
      maxRetries: request.maxRetries ?? defaults?.maxRetries,
    })

    // Resolve API key: DB lookup > env var
    let apiKey: string | undefined
    try {
      const dbKey = await this.aiProviderConfigService.getActiveApiKey('anthropic')
      if (dbKey) apiKey = dbKey
    } catch {
      this.logger.debug('Could not fetch API key from DB, falling back to env')
    }

    const envelope: ExecutionEnvelope = {
      executionId: execution.id,
      projectId: request.projectId,
      agentId: request.agentId,
      taskType: request.taskType,
      instruction: request.instruction,
      contextBundle: request.contextBundle ?? {},
      inputDocs: (request.inputDocs ?? []).map((d) => ({ path: d.path, content: d.content })),
      allowedOutputs: request.allowedOutputs ?? [],
      budgetCaps: {
        maxTokens: request.maxTokens ?? defaults?.maxTokens ?? null,
        maxCostUsd: request.maxCostUsd ?? defaults?.maxCostUsd ?? null,
        maxTurns: request.maxTurns ?? defaults?.maxTurns ?? 1,
      },
      timeout: execution.timeout,
      runMode: request.runMode ?? 'one-shot',
      apiKey,
    }

    this.logger.log(`Submitting execution ${execution.id} (${request.taskType})`)
    execution.markRunning()

    let result: ResultEnvelope
    let lastResult: ResultEnvelope | null = null

    // Retry loop
    for (let attempt = 0; attempt <= execution.maxRetries; attempt++) {
      if (attempt > 0) {
        this.logger.log(`Retrying execution ${execution.id} (attempt ${attempt + 1})`)
        execution.incrementRetry()
        execution.markRunning()
      }

      try {
        result = await this.runner.execute(envelope)
        lastResult = result

        if (result.status === 'completed') {
          execution.markCompleted(result.stdoutSummary)
          this.logger.log(`Execution ${execution.id} completed`)
          return result
        }

        if (result.status === 'timed-out') {
          execution.markTimedOut()
        } else if (result.status === 'failed') {
          execution.markFailed(
            result.errorInfo?.code ?? 'UNKNOWN',
            result.errorInfo?.message ?? 'Unknown error',
          )
        } else {
          execution.markFailed('UNEXPECTED_STATUS', `Unexpected result status: ${result.status}`)
        }

        if (!execution.canRetry) {
          break
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        execution.markFailed('ADAPTER_ERROR', message)
        lastResult = {
          executionId: execution.id,
          status: 'failed',
          stdoutSummary: '',
          generatedDocs: [],
          generatedProposals: [],
          generatedDecisions: [],
          costApproximation: { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
          timestamps: {
            queuedAt: execution.createdAt.toISOString(),
            startedAt: execution.startedAt?.toISOString() ?? null,
            completedAt: new Date().toISOString(),
            durationMs: null,
          },
          errorInfo: { code: 'ADAPTER_ERROR', message, details: null },
        }

        if (!execution.canRetry) {
          break
        }
      }
    }

    this.logger.warn(`Execution ${execution.id} finished with status: ${execution.status}`)
    return lastResult!
  }
}
