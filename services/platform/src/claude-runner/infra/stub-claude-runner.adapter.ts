import { Injectable } from '@nestjs/common'
import type { ExecutionEnvelope, ResultEnvelope } from '@the-crew/shared-types'
import type { ClaudeRunnerPort } from '../domain/claude-runner.port'

@Injectable()
export class StubClaudeRunnerAdapter implements ClaudeRunnerPort {
  readonly executedEnvelopes: ExecutionEnvelope[] = []
  private _nextResult: Partial<ResultEnvelope> | null = null
  private _shouldFail = false
  private _failError: Error | null = null

  configureNextResult(result: Partial<ResultEnvelope>): void {
    this._nextResult = result
  }

  configureFailure(error: Error): void {
    this._shouldFail = true
    this._failError = error
  }

  reset(): void {
    this.executedEnvelopes.length = 0
    this._nextResult = null
    this._shouldFail = false
    this._failError = null
  }

  async execute(envelope: ExecutionEnvelope): Promise<ResultEnvelope> {
    this.executedEnvelopes.push(envelope)

    if (this._shouldFail && this._failError) {
      throw this._failError
    }

    const now = new Date().toISOString()
    const base: ResultEnvelope = {
      executionId: envelope.executionId,
      status: 'completed',
      stdoutSummary: `Stub result for ${envelope.taskType}`,
      generatedDocs: [],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 100, outputTokens: 50, estimatedCostUsd: 0.001 },
      timestamps: {
        queuedAt: now,
        startedAt: now,
        completedAt: now,
        durationMs: 10,
      },
      errorInfo: null,
    }

    if (this._nextResult) {
      return { ...base, ...this._nextResult }
    }

    return base
  }
}
