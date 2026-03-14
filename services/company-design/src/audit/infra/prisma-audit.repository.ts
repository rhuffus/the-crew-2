import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { AuditRepository } from '../domain/audit-repository'
import { AuditEntry } from '../domain/audit-entry'
import type { AuditAction } from '@the-crew/shared-types'

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async save(entry: AuditEntry): Promise<void> {
    await this.prisma.auditEntry.create({
      data: {
        id: entry.id,
        projectId: entry.projectId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        entityName: entry.entityName,
        action: entry.action,
        changes: entry.changes as object | undefined,
        timestamp: entry.timestamp,
      },
    })
  }

  async findByProjectId(projectId: string): Promise<AuditEntry[]> {
    const rows = await this.prisma.auditEntry.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async findByEntity(
    projectId: string,
    entityType: string,
    entityId: string,
  ): Promise<AuditEntry[]> {
    const rows = await this.prisma.auditEntry.findMany({
      where: { projectId, entityType, entityId },
    })
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: {
    id: string
    projectId: string
    entityType: string
    entityId: string
    entityName: string
    action: string
    changes: unknown
    timestamp: Date
  }): AuditEntry {
    return AuditEntry.reconstitute(row.id, {
      projectId: row.projectId,
      entityType: row.entityType,
      entityId: row.entityId,
      entityName: row.entityName,
      action: row.action as AuditAction,
      changes: row.changes as Record<string, unknown> | null,
      timestamp: row.timestamp,
    })
  }
}
