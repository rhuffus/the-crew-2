import { AggregateRoot } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type {
  RuntimeExecutionType,
  RuntimeExecutionStatus,
  RuntimeErrorDto,
  ApprovalRecordDto,
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
} from '@the-crew/shared-types'

export interface RuntimeExecutionProps {
  id: string
  projectId: string
  executionType: RuntimeExecutionType
  workflowId: string | null
  agentId: string | null
  status: RuntimeExecutionStatus
  startedAt: Date | null
  completedAt: Date | null
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  errors: RuntimeErrorDto[]
  waitingFor: string | null
  approvals: ApprovalRecordDto[]
  aiCost: number
  logSummary: string
  parentExecutionId: string | null
  operationsRunId: string | null
  createdAt: Date
  updatedAt: Date
}

const TERMINAL_STATUSES: RuntimeExecutionStatus[] = ['completed', 'failed', 'cancelled']

const VALID_TRANSITIONS: Record<RuntimeExecutionStatus, RuntimeExecutionStatus[]> = {
  pending: ['running', 'cancelled'],
  running: ['completed', 'failed', 'cancelled', 'waiting'],
  waiting: ['running', 'blocked', 'cancelled'],
  blocked: ['running', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
}

export class RuntimeExecution extends AggregateRoot<string> {
  readonly projectId: string
  readonly executionType: RuntimeExecutionType
  private _workflowId: string | null
  private _agentId: string | null
  private _status: RuntimeExecutionStatus
  private _startedAt: Date | null
  private _completedAt: Date | null
  private _input: Record<string, unknown>
  private _output: Record<string, unknown> | null
  private _errors: RuntimeErrorDto[]
  private _waitingFor: string | null
  private _approvals: ApprovalRecordDto[]
  private _aiCost: number
  private _logSummary: string
  readonly parentExecutionId: string | null
  readonly operationsRunId: string | null
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: RuntimeExecutionProps) {
    super(props.id)
    this.projectId = props.projectId
    this.executionType = props.executionType
    this._workflowId = props.workflowId
    this._agentId = props.agentId
    this._status = props.status
    this._startedAt = props.startedAt
    this._completedAt = props.completedAt
    this._input = props.input
    this._output = props.output
    this._errors = [...props.errors]
    this._waitingFor = props.waitingFor
    this._approvals = [...props.approvals]
    this._aiCost = props.aiCost
    this._logSummary = props.logSummary
    this.parentExecutionId = props.parentExecutionId
    this.operationsRunId = props.operationsRunId
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(projectId: string, dto: CreateRuntimeExecutionDto): RuntimeExecution {
    if (dto.executionType === 'workflow-run' && !dto.workflowId) {
      throw new Error('workflowId is required for workflow-run executions')
    }
    if (dto.executionType === 'agent-task' && !dto.agentId) {
      throw new Error('agentId is required for agent-task executions')
    }
    const now = new Date()
    return new RuntimeExecution({
      id: randomUUID(),
      projectId,
      executionType: dto.executionType,
      workflowId: dto.workflowId ?? null,
      agentId: dto.agentId ?? null,
      status: 'pending',
      startedAt: null,
      completedAt: null,
      input: dto.input ?? {},
      output: null,
      errors: [],
      waitingFor: null,
      approvals: [],
      aiCost: 0,
      logSummary: '',
      parentExecutionId: dto.parentExecutionId ?? null,
      operationsRunId: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: RuntimeExecutionProps): RuntimeExecution {
    return new RuntimeExecution(props)
  }

  get workflowId(): string | null { return this._workflowId }
  get agentId(): string | null { return this._agentId }
  get status(): RuntimeExecutionStatus { return this._status }
  get startedAt(): Date | null { return this._startedAt }
  get completedAt(): Date | null { return this._completedAt }
  get input(): Record<string, unknown> { return this._input }
  get output(): Record<string, unknown> | null { return this._output }
  get errors(): RuntimeErrorDto[] { return [...this._errors] }
  get waitingFor(): string | null { return this._waitingFor }
  get approvals(): ApprovalRecordDto[] { return [...this._approvals] }
  get aiCost(): number { return this._aiCost }
  get logSummary(): string { return this._logSummary }
  get updatedAt(): Date { return this._updatedAt }

  update(dto: UpdateRuntimeExecutionDto): void {
    if (dto.status !== undefined) {
      this.transitionStatus(dto.status, dto.waitingFor ?? null)
    }
    if (dto.output !== undefined) {
      this._output = dto.output
    }
    if (dto.waitingFor !== undefined && dto.status === undefined) {
      this._waitingFor = dto.waitingFor
    }
    if (dto.logSummary !== undefined) {
      this._logSummary = dto.logSummary
    }
    if (dto.addError) {
      this._errors.push(dto.addError)
    }
    if (dto.addApproval) {
      this._approvals.push({
        ...dto.addApproval,
        approvedAt: null,
        approvedBy: null,
      })
    }
    if (dto.resolveApproval) {
      const approval = this._approvals.find(a => a.subject === dto.resolveApproval!.subject && a.status === 'pending')
      if (approval) {
        approval.status = dto.resolveApproval.status
        approval.approvedAt = new Date().toISOString()
        approval.approvedBy = dto.resolveApproval.approvedBy ?? null
      }
    }
    if (dto.addCost !== undefined && dto.addCost > 0) {
      this._aiCost += dto.addCost
    }
    this._updatedAt = new Date()
  }

  private transitionStatus(newStatus: RuntimeExecutionStatus, waitingFor: string | null): void {
    const allowed = VALID_TRANSITIONS[this._status]
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${this._status} → ${newStatus}`)
    }
    this._status = newStatus
    if (newStatus === 'running' && !this._startedAt) {
      this._startedAt = new Date()
    }
    if (TERMINAL_STATUSES.includes(newStatus)) {
      this._completedAt = new Date()
    }
    if (newStatus === 'waiting' || newStatus === 'blocked') {
      this._waitingFor = waitingFor
    }
    if (newStatus === 'running') {
      this._waitingFor = null
    }
  }
}
