import { AggregateRoot } from '@the-crew/domain-core'
import type { ExecutionResultStatus } from '@the-crew/shared-types'
import { RUNTIME_SAFETY_LIMITS } from '@the-crew/shared-types'

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timed-out'
  | 'cancelled'

export interface ExecutionProps {
  projectId: string
  agentId: string
  taskType: string
  instruction: string
  status: ExecutionStatus
  timeout: number
  maxRetries: number
  retryCount: number
  stdoutSummary: string | null
  errorCode: string | null
  errorMessage: string | null
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
}

export class Execution extends AggregateRoot<string> {
  private _projectId: string
  private _agentId: string
  private _taskType: string
  private _instruction: string
  private _status: ExecutionStatus
  private _timeout: number
  private _maxRetries: number
  private _retryCount: number
  private _stdoutSummary: string | null
  private _errorCode: string | null
  private _errorMessage: string | null
  private _createdAt: Date
  private _startedAt: Date | null
  private _completedAt: Date | null

  private constructor(id: string, props: ExecutionProps) {
    super(id)
    this._projectId = props.projectId
    this._agentId = props.agentId
    this._taskType = props.taskType
    this._instruction = props.instruction
    this._status = props.status
    this._timeout = props.timeout
    this._maxRetries = props.maxRetries
    this._retryCount = props.retryCount
    this._stdoutSummary = props.stdoutSummary
    this._errorCode = props.errorCode
    this._errorMessage = props.errorMessage
    this._createdAt = props.createdAt
    this._startedAt = props.startedAt
    this._completedAt = props.completedAt
  }

  get projectId() { return this._projectId }
  get agentId() { return this._agentId }
  get taskType() { return this._taskType }
  get instruction() { return this._instruction }
  get status() { return this._status }
  get timeout() { return this._timeout }
  get maxRetries() { return this._maxRetries }
  get retryCount() { return this._retryCount }
  get stdoutSummary() { return this._stdoutSummary }
  get errorCode() { return this._errorCode }
  get errorMessage() { return this._errorMessage }
  get createdAt() { return this._createdAt }
  get startedAt() { return this._startedAt }
  get completedAt() { return this._completedAt }

  get canRetry(): boolean {
    return (this._status === 'failed' || this._status === 'timed-out')
      && this._retryCount < this._maxRetries
  }

  static create(props: {
    id: string
    projectId: string
    agentId: string
    taskType: string
    instruction: string
    timeout?: number
    maxRetries?: number
  }): Execution {
    if (!props.instruction.trim()) {
      throw new Error('Execution instruction cannot be empty')
    }
    if (props.timeout !== undefined && props.timeout <= 0) {
      throw new Error('Execution timeout must be positive')
    }

    const rawTimeout = props.timeout ?? 300
    const clampedTimeout = Math.min(
      Math.max(rawTimeout, RUNTIME_SAFETY_LIMITS.minTimeoutSeconds),
      RUNTIME_SAFETY_LIMITS.maxTimeoutSeconds,
    )

    const rawRetries = props.maxRetries ?? 1
    const clampedRetries = Math.min(
      Math.max(rawRetries, 0),
      RUNTIME_SAFETY_LIMITS.maxRetries,
    )

    const now = new Date()
    const execution = new Execution(props.id, {
      projectId: props.projectId,
      agentId: props.agentId,
      taskType: props.taskType,
      instruction: props.instruction.trim(),
      status: 'pending',
      timeout: clampedTimeout,
      maxRetries: clampedRetries,
      retryCount: 0,
      stdoutSummary: null,
      errorCode: null,
      errorMessage: null,
      createdAt: now,
      startedAt: null,
      completedAt: null,
    })

    execution.addDomainEvent({
      eventType: 'ExecutionCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, agentId: props.agentId, taskType: props.taskType },
    })

    return execution
  }

  static reconstitute(id: string, props: ExecutionProps): Execution {
    return new Execution(id, props)
  }

  markRunning(): void {
    if (this._status !== 'pending') {
      throw new Error(`Cannot start execution in status '${this._status}'`)
    }
    this._status = 'running'
    this._startedAt = new Date()
    this.addDomainEvent({
      eventType: 'ExecutionStarted',
      occurredOn: this._startedAt,
      aggregateId: this.id,
      payload: {},
    })
  }

  markCompleted(stdoutSummary: string): void {
    if (this._status !== 'running') {
      throw new Error(`Cannot complete execution in status '${this._status}'`)
    }
    this._status = 'completed'
    this._stdoutSummary = stdoutSummary
    this._completedAt = new Date()
    this.addDomainEvent({
      eventType: 'ExecutionCompleted',
      occurredOn: this._completedAt,
      aggregateId: this.id,
      payload: { stdoutSummary: stdoutSummary.slice(0, 200) },
    })
  }

  markFailed(errorCode: string, errorMessage: string): void {
    if (this._status !== 'running') {
      throw new Error(`Cannot fail execution in status '${this._status}'`)
    }
    this._status = 'failed'
    this._errorCode = errorCode
    this._errorMessage = errorMessage
    this._completedAt = new Date()
    this.addDomainEvent({
      eventType: 'ExecutionFailed',
      occurredOn: this._completedAt,
      aggregateId: this.id,
      payload: { errorCode, errorMessage },
    })
  }

  markTimedOut(): void {
    if (this._status !== 'running') {
      throw new Error(`Cannot time out execution in status '${this._status}'`)
    }
    this._status = 'timed-out'
    this._errorCode = 'TIMEOUT'
    this._errorMessage = `Execution timed out after ${this._timeout}s`
    this._completedAt = new Date()
    this.addDomainEvent({
      eventType: 'ExecutionTimedOut',
      occurredOn: this._completedAt,
      aggregateId: this.id,
      payload: { timeout: this._timeout },
    })
  }

  markCancelled(): void {
    if (this._status !== 'pending' && this._status !== 'running') {
      throw new Error(`Cannot cancel execution in status '${this._status}'`)
    }
    this._status = 'cancelled'
    this._completedAt = new Date()
    this.addDomainEvent({
      eventType: 'ExecutionCancelled',
      occurredOn: this._completedAt,
      aggregateId: this.id,
      payload: {},
    })
  }

  incrementRetry(): void {
    if (!this.canRetry) {
      throw new Error('Execution cannot be retried')
    }
    this._retryCount += 1
    this._status = 'pending'
    this._errorCode = null
    this._errorMessage = null
    this._startedAt = null
    this._completedAt = null
    this.addDomainEvent({
      eventType: 'ExecutionRetrying',
      occurredOn: new Date(),
      aggregateId: this.id,
      payload: { retryCount: this._retryCount },
    })
  }

  toResultStatus(): ExecutionResultStatus {
    switch (this._status) {
      case 'completed': return 'completed'
      case 'failed': return 'failed'
      case 'timed-out': return 'timed-out'
      case 'cancelled': return 'cancelled'
      default: return 'failed'
    }
  }
}
