import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { StageExecutionStatus } from '@the-crew/shared-types'

export interface StageExecutionProps {
  id: string
  runId: string
  workflowId: string
  stageName: string
  stageIndex: number
  status: StageExecutionStatus
  assigneeId: string | null
  blockReason: string | null
  startedAt: Date | null
  completedAt: Date | null
}

export class StageExecution extends Entity<string> {
  readonly runId: string
  readonly workflowId: string
  readonly stageName: string
  readonly stageIndex: number
  private _status: StageExecutionStatus
  private _assigneeId: string | null
  private _blockReason: string | null
  private _startedAt: Date | null
  private _completedAt: Date | null

  private constructor(props: StageExecutionProps) {
    super(props.id)
    this.runId = props.runId
    this.workflowId = props.workflowId
    this.stageName = props.stageName
    this.stageIndex = props.stageIndex
    this._status = props.status
    this._assigneeId = props.assigneeId
    this._blockReason = props.blockReason
    this._startedAt = props.startedAt
    this._completedAt = props.completedAt
  }

  static create(runId: string, workflowId: string, stageName: string, stageIndex: number): StageExecution {
    return new StageExecution({
      id: randomUUID(),
      runId,
      workflowId,
      stageName,
      stageIndex,
      status: 'pending',
      assigneeId: null,
      blockReason: null,
      startedAt: null,
      completedAt: null,
    })
  }

  static reconstitute(props: StageExecutionProps): StageExecution {
    return new StageExecution(props)
  }

  get status(): StageExecutionStatus { return this._status }
  get assigneeId(): string | null { return this._assigneeId }
  get blockReason(): string | null { return this._blockReason }
  get startedAt(): Date | null { return this._startedAt }
  get completedAt(): Date | null { return this._completedAt }

  advance(status: StageExecutionStatus, blockReason?: string | null): void {
    this._status = status
    if (status === 'running') {
      this._startedAt = this._startedAt ?? new Date()
    }
    if (status === 'completed' || status === 'failed' || status === 'skipped') {
      this._completedAt = new Date()
    }
    if (status === 'blocked') {
      this._blockReason = blockReason ?? null
    }
  }

  setAssignee(assigneeId: string | null): void {
    this._assigneeId = assigneeId
  }
}
