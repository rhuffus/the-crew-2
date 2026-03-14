import { Injectable, Logger } from '@nestjs/common'
import { execFile } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { ExecutionEnvelope, ResultEnvelope } from '@the-crew/shared-types'
import { RUNTIME_SAFETY_LIMITS } from '@the-crew/shared-types'
import type { ClaudeRunnerPort } from '../domain/claude-runner.port'

const RUNNER_IMAGE = process.env.CLAUDE_RUNNER_IMAGE ?? 'claude-runner:latest'
const CONTAINER_LABEL = 'the-crew.runner=true'

@Injectable()
export class DockerClaudeRunnerAdapter implements ClaudeRunnerPort {
  private readonly logger = new Logger(DockerClaudeRunnerAdapter.name)

  async execute(envelope: ExecutionEnvelope): Promise<ResultEnvelope> {
    const workDir = mkdtempSync(join(tmpdir(), `claude-exec-${envelope.executionId}-`))
    const startedAt = new Date().toISOString()
    const containerName = `claude-exec-${envelope.executionId}`

    try {
      writeFileSync(join(workDir, 'execution.json'), JSON.stringify(envelope, null, 2))

      const apiKey = envelope.apiKey ?? process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        return this.buildErrorResult(envelope.executionId, startedAt, 'MISSING_API_KEY', 'No API key available. Configure one in Settings or set ANTHROPIC_API_KEY env var.', null)
      }

      const args = [
        'run', '--rm',
        '--name', containerName,
        '--label', CONTAINER_LABEL,
        '--label', `the-crew.execution-id=${envelope.executionId}`,
        '-v', `${workDir}:/workspace`,
        '-e', `ANTHROPIC_API_KEY=${apiKey}`,
        '-e', `EXECUTION_TIMEOUT=${envelope.timeout}`,
        `--memory`, `${RUNTIME_SAFETY_LIMITS.defaultMemoryMb}m`,
        '--cpus', String(RUNTIME_SAFETY_LIMITS.defaultCpus),
        '--pids-limit', String(RUNTIME_SAFETY_LIMITS.containerPidsLimit),
        '--network', 'none',
        RUNNER_IMAGE,
      ]

      this.logger.log(
        `Running container ${containerName} for execution ${envelope.executionId} ` +
        `(timeout: ${envelope.timeout}s, budget: ${JSON.stringify(envelope.budgetCaps)})`,
      )

      const hardTimeout = (envelope.timeout + RUNTIME_SAFETY_LIMITS.containerGracePeriodSeconds) * 1000

      await new Promise<void>((resolve, reject) => {
        execFile('docker', args, {
          timeout: hardTimeout,
          maxBuffer: RUNTIME_SAFETY_LIMITS.containerMaxBufferBytes,
        }, (error, stdout, stderr) => {
          if (stdout) this.logger.debug(`[docker stdout] ${stdout.slice(0, 500)}`)
          if (stderr) this.logger.debug(`[docker stderr] ${stderr.slice(0, 500)}`)

          if (error) {
            if (error.killed) {
              this.forceRemoveContainer(containerName)
              reject(new Error(`Docker container killed after ${hardTimeout / 1000}s`))
              return
            }
            if (existsSync(join(workDir, 'result.json'))) {
              resolve()
              return
            }
            reject(new Error(`Docker execution failed: ${error.message}`))
            return
          }
          resolve()
        })
      })

      const resultPath = join(workDir, 'result.json')
      if (!existsSync(resultPath)) {
        return this.buildErrorResult(envelope.executionId, startedAt, 'NO_RESULT', 'Container did not produce result.json', null)
      }

      const result: ResultEnvelope = JSON.parse(readFileSync(resultPath, 'utf-8'))
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`Execution ${envelope.executionId} failed: ${message}`)
      return this.buildErrorResult(envelope.executionId, startedAt, 'DOCKER_ERROR', message, null)
    } finally {
      try {
        rmSync(workDir, { recursive: true, force: true })
      } catch {
        this.logger.warn(`Failed to cleanup workspace ${workDir}`)
      }
    }
  }

  /**
   * Force-remove a container that may have survived a hard timeout kill.
   * Fire-and-forget — failures are logged but not thrown.
   */
  private forceRemoveContainer(containerName: string): void {
    execFile('docker', ['rm', '-f', containerName], { timeout: 10_000 }, (err) => {
      if (err) {
        this.logger.warn(`Failed to force-remove container ${containerName}: ${err.message}`)
      } else {
        this.logger.debug(`Force-removed container ${containerName}`)
      }
    })
  }

  /**
   * Cleanup stale runner containers that may have been left behind.
   * Intended for periodic maintenance or adapter initialization.
   */
  cleanupStaleContainers(): void {
    execFile('docker', ['container', 'prune', '-f', '--filter', `label=${CONTAINER_LABEL}`], { timeout: 30_000 }, (err, stdout) => {
      if (err) {
        this.logger.warn(`Failed to prune stale containers: ${err.message}`)
      } else if (stdout.trim()) {
        this.logger.log(`Pruned stale containers: ${stdout.trim()}`)
      }
    })
  }

  private buildErrorResult(
    executionId: string,
    startedAt: string,
    code: string,
    message: string,
    details: string | null,
  ): ResultEnvelope {
    return {
      executionId,
      status: 'failed',
      stdoutSummary: '',
      generatedDocs: [],
      generatedProposals: [],
      generatedDecisions: [],
      costApproximation: { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
      timestamps: {
        queuedAt: startedAt,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - new Date(startedAt).getTime(),
      },
      errorInfo: { code, message, details },
    }
  }
}
