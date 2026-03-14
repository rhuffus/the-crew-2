#!/usr/bin/env node
/**
 * Claude Runner Container Entrypoint
 *
 * Reads /workspace/execution.json, runs the Claude CLI,
 * and writes /workspace/result.json.
 *
 * Local/dev only — not production-hardened.
 */

const { execFile } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const EXECUTION_PATH = '/workspace/execution.json'
const RESULT_PATH = '/workspace/result.json'
const DOCS_DIR = '/workspace/docs'

function writeResult(result) {
  fs.writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2))
}

function buildErrorResult(executionId, startedAt, code, message, details) {
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

async function main() {
  const startedAt = new Date().toISOString()

  // 1. Read execution envelope
  if (!fs.existsSync(EXECUTION_PATH)) {
    console.error('No execution.json found at', EXECUTION_PATH)
    writeResult(buildErrorResult('unknown', startedAt, 'MISSING_ENVELOPE', 'execution.json not found', null))
    process.exit(1)
  }

  let envelope
  try {
    envelope = JSON.parse(fs.readFileSync(EXECUTION_PATH, 'utf-8'))
  } catch (err) {
    console.error('Invalid execution.json:', err.message)
    writeResult(buildErrorResult('unknown', startedAt, 'INVALID_ENVELOPE', 'Failed to parse execution.json', err.message))
    process.exit(1)
  }

  const { executionId, instruction, contextBundle, inputDocs, budgetCaps, timeout, runMode } = envelope

  console.log(`[claude-runner] Starting execution ${executionId}`)
  console.log(`[claude-runner] Task type: ${envelope.taskType}`)
  console.log(`[claude-runner] Run mode: ${runMode}`)
  console.log(`[claude-runner] Budget caps: maxTokens=${budgetCaps?.maxTokens ?? 'none'}, maxCostUsd=${budgetCaps?.maxCostUsd ?? 'none'}, maxTurns=${budgetCaps?.maxTurns ?? 'none'}`)
  console.log(`[claude-runner] Timeout: ${timeout ?? 'default'}s`)

  // 2. Write input docs to workspace
  if (inputDocs && inputDocs.length > 0) {
    for (const doc of inputDocs) {
      const docPath = path.join(DOCS_DIR, doc.path)
      fs.mkdirSync(path.dirname(docPath), { recursive: true })
      fs.writeFileSync(docPath, doc.content)
    }
    console.log(`[claude-runner] Wrote ${inputDocs.length} input doc(s)`)
  }

  // 3. Build prompt from instruction + context
  let prompt = instruction
  if (contextBundle && Object.keys(contextBundle).length > 0) {
    prompt = `Context:\n${JSON.stringify(contextBundle, null, 2)}\n\nInstruction:\n${instruction}`
  }

  // 4. Build claude CLI args
  const args = [
    '--print',
    '--output-format', 'json',
    '--dangerously-skip-permissions',
  ]

  if (budgetCaps && budgetCaps.maxTurns) {
    args.push('--max-turns', String(budgetCaps.maxTurns))
  }

  args.push(prompt)

  // 5. Execute claude with timeout
  const effectiveTimeout = (process.env.EXECUTION_TIMEOUT
    ? parseInt(process.env.EXECUTION_TIMEOUT, 10)
    : timeout || 300) * 1000

  console.log(`[claude-runner] Running claude CLI (timeout: ${effectiveTimeout / 1000}s)`)

  const result = await new Promise((resolve) => {
    const child = execFile('claude', args, {
      timeout: effectiveTimeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd: '/workspace',
      env: {
        ...process.env,
        HOME: '/root',
      },
    }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          resolve(buildErrorResult(executionId, startedAt, 'TIMEOUT', `Execution timed out after ${effectiveTimeout / 1000}s`, stderr || null))
          return
        }
        resolve(buildErrorResult(executionId, startedAt, 'EXECUTION_ERROR', error.message, stderr || null))
        return
      }

      const completedAt = new Date().toISOString()
      const durationMs = Date.now() - new Date(startedAt).getTime()

      // Parse claude JSON output
      let claudeOutput = {}
      try {
        claudeOutput = JSON.parse(stdout)
      } catch {
        // If not valid JSON, treat stdout as plain text result
        claudeOutput = { result: stdout }
      }

      // Collect any generated files in output dir
      const generatedDocs = []
      const outputDir = '/workspace/output'
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir, { recursive: true })
        for (const file of files) {
          const filePath = path.join(outputDir, String(file))
          if (fs.statSync(filePath).isFile()) {
            generatedDocs.push({
              path: String(file),
              content: fs.readFileSync(filePath, 'utf-8'),
              docType: path.extname(String(file)).slice(1) || 'txt',
            })
          }
        }
      }

      const actualInputTokens = claudeOutput.usage?.input_tokens || 0
      const actualOutputTokens = claudeOutput.usage?.output_tokens || 0
      const totalTokens = actualInputTokens + actualOutputTokens

      // Post-hoc budget check
      let budgetExceeded = false
      if (budgetCaps?.maxTokens && totalTokens > budgetCaps.maxTokens) {
        console.warn(`[claude-runner] Budget exceeded: tokens ${totalTokens} > limit ${budgetCaps.maxTokens}`)
        budgetExceeded = true
      }

      resolve({
        executionId,
        status: 'completed',
        stdoutSummary: typeof claudeOutput.result === 'string'
          ? claudeOutput.result.slice(0, 5000)
          : stdout.slice(0, 5000),
        generatedDocs,
        generatedProposals: [],
        generatedDecisions: [],
        costApproximation: {
          inputTokens: actualInputTokens,
          outputTokens: actualOutputTokens,
          estimatedCostUsd: 0,
        },
        timestamps: {
          queuedAt: envelope._queuedAt || startedAt,
          startedAt,
          completedAt,
          durationMs,
        },
        errorInfo: null,
        budgetExceeded,
      })
    })
  })

  // 6. Write result
  writeResult(result)
  console.log(`[claude-runner] Execution ${executionId} finished with status: ${result.status}`)
}

main().catch((err) => {
  console.error('[claude-runner] Fatal error:', err)
  process.exit(2)
})
