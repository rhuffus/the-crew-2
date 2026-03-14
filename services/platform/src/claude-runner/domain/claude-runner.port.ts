import type { ExecutionEnvelope, ResultEnvelope } from '@the-crew/shared-types'

export interface ClaudeRunnerPort {
  execute(envelope: ExecutionEnvelope): Promise<ResultEnvelope>
}

export const CLAUDE_RUNNER_PORT = Symbol('CLAUDE_RUNNER_PORT')
