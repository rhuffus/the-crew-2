import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { WorkflowRunStatus, CreateWorkflowRunDto, UpdateWorkflowRunDto } from '@the-crew/shared-types'

export interface WorkflowRunProps {
  id: string
  projectId: string
  workflowId: string
  status: WorkflowRunStatus
  currentStageIndex: number | null
  startedAt: Date
  completedAt: Date | null
  failureReason: string | null
  createdAt: Date
  updatedAt: Date
}

export class WorkflowRun extends Entity<string> {
  readonly projectId: string
  readonly workflowId: string
  private _status: WorkflowRunStatus
  private _currentStageIndex: number | null
  readonly startedAt: Date
  private _completedAt: Date | null
  private _failureReason: string | null
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: WorkflowRunProps) {
    super(props.id)
    this.projectId = props.projectId
    this.workflowId = props.workflowId
    this._status = props.status
    this._currentStageIndex = props.currentStageIndex
    this.startedAt = props.startedAt
    this._completedAt = props.completedAt
    this._failureReason = props.failureReason
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(projectId: string, dto: CreateWorkflowRunDto): WorkflowRun {
    const now = new Date()
    return new WorkflowRun({
      id: randomUUID(),
      projectId,
      workflowId: dto.workflowId,
      status: 'running',
      currentStageIndex: 0,
      startedAt: now,
      completedAt: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: WorkflowRunProps): WorkflowRun {
    return new WorkflowRun(props)
  }

  get status(): WorkflowRunStatus { return this._status }
  get currentStageIndex(): number | null { return this._currentStageIndex }
  get completedAt(): Date | null { return this._completedAt }
  get failureReason(): string | null { return this._failureReason }
  get updatedAt(): Date { return this._updatedAt }

  update(dto: UpdateWorkflowRunDto): void {
    if (dto.status !== undefined) {
      this._status = dto.status
      if (dto.status === 'completed' || dto.status === 'failed' || dto.status === 'cancelled') {
        this._completedAt = new Date()
      }
    }
    if (dto.currentStageIndex !== undefined) {
      this._currentStageIndex = dto.currentStageIndex
    }
    if (dto.failureReason !== undefined) {
      this._failureReason = dto.failureReason
    }
    this._updatedAt = new Date()
  }
}
