import type { AuditEntryDto } from '@the-crew/shared-types'
import type { AuditEntry } from '../domain/audit-entry'

export class AuditMapper {
  static toDto(entry: AuditEntry): AuditEntryDto {
    return {
      id: entry.id,
      projectId: entry.projectId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      entityName: entry.entityName,
      action: entry.action,
      changes: entry.changes,
      timestamp: entry.timestamp.toISOString(),
    }
  }
}
