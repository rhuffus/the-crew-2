import { Injectable } from '@nestjs/common'
import type { AuditEntry } from '../domain/audit-entry'
import type { AuditRepository } from '../domain/audit-repository'

@Injectable()
export class InMemoryAuditRepository implements AuditRepository {
  private readonly store = new Map<string, AuditEntry>()

  async save(entry: AuditEntry): Promise<void> {
    this.store.set(entry.id, entry)
  }

  async findByProjectId(projectId: string): Promise<AuditEntry[]> {
    return [...this.store.values()]
      .filter((e) => e.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async findByEntity(projectId: string, entityType: string, entityId: string): Promise<AuditEntry[]> {
    return [...this.store.values()]
      .filter((e) => e.projectId === projectId && e.entityType === entityType && e.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
}
