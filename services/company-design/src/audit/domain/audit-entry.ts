import { Entity } from '@the-crew/domain-core'
import type { AuditAction } from '@the-crew/shared-types'

export interface AuditEntryProps {
  projectId: string
  entityType: string
  entityId: string
  entityName: string
  action: AuditAction
  changes: Record<string, unknown> | null
  timestamp: Date
}

export class AuditEntry extends Entity<string> {
  private _projectId: string
  private _entityType: string
  private _entityId: string
  private _entityName: string
  private _action: AuditAction
  private _changes: Record<string, unknown> | null
  private _timestamp: Date

  private constructor(id: string, props: AuditEntryProps) {
    super(id)
    this._projectId = props.projectId
    this._entityType = props.entityType
    this._entityId = props.entityId
    this._entityName = props.entityName
    this._action = props.action
    this._changes = props.changes
    this._timestamp = props.timestamp
  }

  get projectId(): string {
    return this._projectId
  }
  get entityType(): string {
    return this._entityType
  }
  get entityId(): string {
    return this._entityId
  }
  get entityName(): string {
    return this._entityName
  }
  get action(): AuditAction {
    return this._action
  }
  get changes(): Record<string, unknown> | null {
    return this._changes ? { ...this._changes } : null
  }
  get timestamp(): Date {
    return this._timestamp
  }

  static create(props: { id: string } & AuditEntryProps): AuditEntry {
    if (!props.entityType.trim()) throw new Error('Entity type cannot be empty')
    if (!props.entityId.trim()) throw new Error('Entity id cannot be empty')
    if (!props.entityName.trim()) throw new Error('Entity name cannot be empty')

    return new AuditEntry(props.id, {
      projectId: props.projectId,
      entityType: props.entityType.trim(),
      entityId: props.entityId.trim(),
      entityName: props.entityName.trim(),
      action: props.action,
      changes: props.changes,
      timestamp: props.timestamp,
    })
  }

  static reconstitute(id: string, props: AuditEntryProps): AuditEntry {
    return new AuditEntry(id, props)
  }
}
