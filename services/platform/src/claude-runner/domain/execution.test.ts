import { describe, it, expect } from 'vitest'
import { Execution } from './execution'

function createExecution(overrides: Partial<Parameters<typeof Execution.create>[0]> = {}) {
  return Execution.create({
    id: 'exec-1',
    projectId: 'proj-1',
    agentId: 'agent-1',
    taskType: 'generate-doc',
    instruction: 'Write a README',
    ...overrides,
  })
}

describe('Execution', () => {
  describe('create', () => {
    it('should create a pending execution with defaults', () => {
      const exec = createExecution()

      expect(exec.id).toBe('exec-1')
      expect(exec.projectId).toBe('proj-1')
      expect(exec.agentId).toBe('agent-1')
      expect(exec.taskType).toBe('generate-doc')
      expect(exec.instruction).toBe('Write a README')
      expect(exec.status).toBe('pending')
      expect(exec.timeout).toBe(300)
      expect(exec.maxRetries).toBe(1)
      expect(exec.retryCount).toBe(0)
      expect(exec.stdoutSummary).toBeNull()
      expect(exec.errorCode).toBeNull()
      expect(exec.errorMessage).toBeNull()
      expect(exec.createdAt).toBeInstanceOf(Date)
      expect(exec.startedAt).toBeNull()
      expect(exec.completedAt).toBeNull()
    })

    it('should emit ExecutionCreated event', () => {
      const exec = createExecution()
      const events = exec.domainEvents

      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('ExecutionCreated')
      expect(events[0]!.aggregateId).toBe('exec-1')
      expect(events[0]!.payload).toEqual({
        projectId: 'proj-1',
        agentId: 'agent-1',
        taskType: 'generate-doc',
      })
    })

    it('should accept custom timeout and maxRetries', () => {
      const exec = createExecution({ timeout: 600, maxRetries: 3 })

      expect(exec.timeout).toBe(600)
      expect(exec.maxRetries).toBe(3)
    })

    it('should clamp timeout to safety limits', () => {
      const tooHigh = createExecution({ timeout: 9999 })
      expect(tooHigh.timeout).toBe(600) // maxTimeoutSeconds

      const tooLow = createExecution({ timeout: 1 })
      expect(tooLow.timeout).toBe(10) // minTimeoutSeconds
    })

    it('should clamp maxRetries to safety limits', () => {
      const tooHigh = createExecution({ maxRetries: 100 })
      expect(tooHigh.maxRetries).toBe(5) // RUNTIME_SAFETY_LIMITS.maxRetries
    })

    it('should trim instruction whitespace', () => {
      const exec = createExecution({ instruction: '  some task  ' })
      expect(exec.instruction).toBe('some task')
    })

    it('should reject empty instruction', () => {
      expect(() => createExecution({ instruction: '   ' }))
        .toThrow('Execution instruction cannot be empty')
    })

    it('should reject non-positive timeout', () => {
      expect(() => createExecution({ timeout: 0 }))
        .toThrow('Execution timeout must be positive')
      expect(() => createExecution({ timeout: -1 }))
        .toThrow('Execution timeout must be positive')
    })
  })

  describe('reconstitute', () => {
    it('should reconstitute from props without events', () => {
      const exec = Execution.reconstitute('exec-2', {
        projectId: 'proj-1',
        agentId: 'agent-1',
        taskType: 'review',
        instruction: 'Review code',
        status: 'completed',
        timeout: 120,
        maxRetries: 0,
        retryCount: 0,
        stdoutSummary: 'Looks good',
        errorCode: null,
        errorMessage: null,
        createdAt: new Date('2026-01-01'),
        startedAt: new Date('2026-01-01'),
        completedAt: new Date('2026-01-01'),
      })

      expect(exec.id).toBe('exec-2')
      expect(exec.status).toBe('completed')
      expect(exec.stdoutSummary).toBe('Looks good')
      expect(exec.domainEvents).toHaveLength(0)
    })
  })

  describe('markRunning', () => {
    it('should transition pending → running', () => {
      const exec = createExecution()
      exec.clearEvents()

      exec.markRunning()

      expect(exec.status).toBe('running')
      expect(exec.startedAt).toBeInstanceOf(Date)
      expect(exec.domainEvents).toHaveLength(1)
      expect(exec.domainEvents[0]!.eventType).toBe('ExecutionStarted')
    })

    it('should reject non-pending state', () => {
      const exec = createExecution()
      exec.markRunning()

      expect(() => exec.markRunning())
        .toThrow("Cannot start execution in status 'running'")
    })
  })

  describe('markCompleted', () => {
    it('should transition running → completed', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.clearEvents()

      exec.markCompleted('All done')

      expect(exec.status).toBe('completed')
      expect(exec.stdoutSummary).toBe('All done')
      expect(exec.completedAt).toBeInstanceOf(Date)
      expect(exec.domainEvents).toHaveLength(1)
      expect(exec.domainEvents[0]!.eventType).toBe('ExecutionCompleted')
    })

    it('should reject non-running state', () => {
      const exec = createExecution()

      expect(() => exec.markCompleted('done'))
        .toThrow("Cannot complete execution in status 'pending'")
    })
  })

  describe('markFailed', () => {
    it('should transition running → failed', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.clearEvents()

      exec.markFailed('ERR_01', 'Something broke')

      expect(exec.status).toBe('failed')
      expect(exec.errorCode).toBe('ERR_01')
      expect(exec.errorMessage).toBe('Something broke')
      expect(exec.completedAt).toBeInstanceOf(Date)
      expect(exec.domainEvents).toHaveLength(1)
      expect(exec.domainEvents[0]!.eventType).toBe('ExecutionFailed')
    })

    it('should reject non-running state', () => {
      const exec = createExecution()

      expect(() => exec.markFailed('ERR', 'msg'))
        .toThrow("Cannot fail execution in status 'pending'")
    })
  })

  describe('markTimedOut', () => {
    it('should transition running → timed-out', () => {
      const exec = createExecution({ timeout: 60 })
      exec.markRunning()
      exec.clearEvents()

      exec.markTimedOut()

      expect(exec.status).toBe('timed-out')
      expect(exec.errorCode).toBe('TIMEOUT')
      expect(exec.errorMessage).toBe('Execution timed out after 60s')
      expect(exec.domainEvents).toHaveLength(1)
      expect(exec.domainEvents[0]!.eventType).toBe('ExecutionTimedOut')
    })

    it('should reject non-running state', () => {
      const exec = createExecution()

      expect(() => exec.markTimedOut())
        .toThrow("Cannot time out execution in status 'pending'")
    })
  })

  describe('markCancelled', () => {
    it('should transition pending → cancelled', () => {
      const exec = createExecution()
      exec.clearEvents()

      exec.markCancelled()

      expect(exec.status).toBe('cancelled')
      expect(exec.completedAt).toBeInstanceOf(Date)
      expect(exec.domainEvents).toHaveLength(1)
      expect(exec.domainEvents[0]!.eventType).toBe('ExecutionCancelled')
    })

    it('should transition running → cancelled', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.clearEvents()

      exec.markCancelled()

      expect(exec.status).toBe('cancelled')
    })

    it('should reject completed state', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.markCompleted('done')

      expect(() => exec.markCancelled())
        .toThrow("Cannot cancel execution in status 'completed'")
    })
  })

  describe('canRetry', () => {
    it('should allow retry when failed and retries remain', () => {
      const exec = createExecution({ maxRetries: 2 })
      exec.markRunning()
      exec.markFailed('ERR', 'fail')

      expect(exec.canRetry).toBe(true)
    })

    it('should allow retry when timed-out and retries remain', () => {
      const exec = createExecution({ maxRetries: 1 })
      exec.markRunning()
      exec.markTimedOut()

      expect(exec.canRetry).toBe(true)
    })

    it('should disallow retry when retries exhausted', () => {
      const exec = createExecution({ maxRetries: 1 })
      exec.markRunning()
      exec.markFailed('ERR', 'fail')
      exec.incrementRetry()
      exec.markRunning()
      exec.markFailed('ERR', 'fail again')

      expect(exec.canRetry).toBe(false)
    })

    it('should disallow retry when completed', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.markCompleted('ok')

      expect(exec.canRetry).toBe(false)
    })

    it('should disallow retry when cancelled', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.markCancelled()

      expect(exec.canRetry).toBe(false)
    })
  })

  describe('incrementRetry', () => {
    it('should reset to pending and increment count', () => {
      const exec = createExecution({ maxRetries: 2 })
      exec.markRunning()
      exec.markFailed('ERR', 'fail')
      exec.clearEvents()

      exec.incrementRetry()

      expect(exec.status).toBe('pending')
      expect(exec.retryCount).toBe(1)
      expect(exec.errorCode).toBeNull()
      expect(exec.errorMessage).toBeNull()
      expect(exec.startedAt).toBeNull()
      expect(exec.completedAt).toBeNull()
      expect(exec.domainEvents).toHaveLength(1)
      expect(exec.domainEvents[0]!.eventType).toBe('ExecutionRetrying')
    })

    it('should reject when cannot retry', () => {
      const exec = createExecution({ maxRetries: 0 })
      exec.markRunning()
      exec.markFailed('ERR', 'fail')

      expect(() => exec.incrementRetry())
        .toThrow('Execution cannot be retried')
    })
  })

  describe('toResultStatus', () => {
    it('should map completed', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.markCompleted('ok')
      expect(exec.toResultStatus()).toBe('completed')
    })

    it('should map failed', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.markFailed('ERR', 'msg')
      expect(exec.toResultStatus()).toBe('failed')
    })

    it('should map timed-out', () => {
      const exec = createExecution()
      exec.markRunning()
      exec.markTimedOut()
      expect(exec.toResultStatus()).toBe('timed-out')
    })

    it('should map cancelled', () => {
      const exec = createExecution()
      exec.markCancelled()
      expect(exec.toResultStatus()).toBe('cancelled')
    })

    it('should default to failed for pending', () => {
      const exec = createExecution()
      expect(exec.toResultStatus()).toBe('failed')
    })
  })

  describe('equality', () => {
    it('should be equal by id', () => {
      const a = createExecution({ id: 'same' })
      const b = createExecution({ id: 'same' })
      expect(a.equals(b)).toBe(true)
    })

    it('should not be equal with different id', () => {
      const a = createExecution({ id: 'a' })
      const b = createExecution({ id: 'b' })
      expect(a.equals(b)).toBe(false)
    })
  })
})
