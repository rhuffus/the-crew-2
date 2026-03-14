import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { IncidentRepository } from '../domain/operations-repository'
import { Incident } from '../domain/incident'
import type { NodeType, IncidentSeverity, IncidentStatus } from '@the-crew/shared-types'

@Injectable()
export class PrismaIncidentRepository implements IncidentRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Incident | null> {
    const row = await this.prisma.incident.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<Incident[]> {
    const rows = await this.prisma.incident.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(projectId: string, entityId: string): Promise<Incident[]> {
    const rows = await this.prisma.incident.findMany({
      where: { projectId, entityId },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async save(incident: Incident): Promise<void> {
    const data = {
      projectId: incident.projectId,
      entityType: incident.entityType,
      entityId: incident.entityId,
      severity: incident.severity,
      status: incident.status,
      title: incident.title,
      description: incident.description,
      reportedAt: incident.reportedAt,
      resolvedAt: incident.resolvedAt,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    }
    await this.prisma.incident.upsert({
      where: { id: incident.id },
      create: { id: incident.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.incident.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    entityType: string
    entityId: string
    severity: string
    status: string
    title: string
    description: string
    reportedAt: Date
    resolvedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }): Incident {
    return Incident.reconstitute({
      id: row.id,
      projectId: row.projectId,
      entityType: row.entityType as NodeType,
      entityId: row.entityId,
      severity: row.severity as IncidentSeverity,
      status: row.status as IncidentStatus,
      title: row.title,
      description: row.description,
      reportedAt: row.reportedAt,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
