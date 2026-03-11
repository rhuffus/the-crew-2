import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { NodeType, AcquireLockDto } from '@the-crew/shared-types'

export interface EntityLockProps {
  id: string
  projectId: string
  entityId: string
  nodeType: NodeType
  lockedBy: string
  lockedByName: string
  lockedAt: Date
  expiresAt: Date
}

const DEFAULT_LOCK_DURATION_MS = 300_000 // 5 minutes

export class EntityLock extends Entity<string> {
  readonly projectId: string
  readonly entityId: string
  readonly nodeType: NodeType
  readonly lockedBy: string
  readonly lockedByName: string
  readonly lockedAt: Date
  private _expiresAt: Date

  private constructor(props: EntityLockProps) {
    super(props.id)
    this.projectId = props.projectId
    this.entityId = props.entityId
    this.nodeType = props.nodeType
    this.lockedBy = props.lockedBy
    this.lockedByName = props.lockedByName
    this.lockedAt = props.lockedAt
    this._expiresAt = props.expiresAt
  }

  static create(projectId: string, dto: AcquireLockDto): EntityLock {
    const now = new Date()
    const durationMs = dto.durationMs ?? DEFAULT_LOCK_DURATION_MS
    return new EntityLock({
      id: randomUUID(),
      projectId,
      entityId: dto.entityId,
      nodeType: dto.nodeType,
      lockedBy: dto.lockedBy,
      lockedByName: dto.lockedByName,
      lockedAt: now,
      expiresAt: new Date(now.getTime() + durationMs),
    })
  }

  static reconstitute(props: EntityLockProps): EntityLock {
    return new EntityLock(props)
  }

  get expiresAt(): Date {
    return this._expiresAt
  }

  get isExpired(): boolean {
    return new Date() > this._expiresAt
  }

  extend(durationMs: number): void {
    this._expiresAt = new Date(Date.now() + durationMs)
  }
}
