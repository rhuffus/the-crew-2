import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { RuntimeEventRepository } from '../domain/runtime-repository'
import { RuntimeEvent } from '../domain/runtime-event'
import type { RuntimeEventType, EventSeverity } from '@the-crew/shared-types'

@Injectable()
export class PrismaRuntimeEventRepository implements RuntimeEventRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<RuntimeEvent | null> {
    const row = await this.prisma.runtimeEvent.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async append(event: RuntimeEvent): Promise<void> {
    await this.prisma.runtimeEvent.create({
      data: {
        id: event.id,
        projectId: event.projectId,
        eventType: event.eventType,
        severity: event.severity,
        title: event.title,
        description: event.description,
        sourceEntityType: event.sourceEntityType,
        sourceEntityId: event.sourceEntityId,
        targetEntityType: event.targetEntityType,
        targetEntityId: event.targetEntityId,
        executionId: event.executionId,
        metadata: event.metadata as object,
        occurredAt: event.occurredAt,
      },
    })
  }

  async listByProject(
    projectId: string,
    limit?: number,
    offset?: number,
  ): Promise<RuntimeEvent[]> {
    const rows = await this.prisma.runtimeEvent.findMany({
      where: { projectId },
      orderBy: { occurredAt: 'desc' },
      ...(limit !== undefined && { take: limit }),
      ...(offset !== undefined && { skip: offset }),
    })
    return rows.map((row) => this.toDomain(row))
  }

  async listByExecution(executionId: string): Promise<RuntimeEvent[]> {
    const rows = await this.prisma.runtimeEvent.findMany({
      where: { executionId },
      orderBy: { occurredAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(entityId: string, limit?: number): Promise<RuntimeEvent[]> {
    const rows = await this.prisma.runtimeEvent.findMany({
      where: {
        OR: [{ sourceEntityId: entityId }, { targetEntityId: entityId }],
      },
      orderBy: { occurredAt: 'desc' },
      ...(limit !== undefined && { take: limit }),
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findLatestByEntity(entityId: string): Promise<RuntimeEvent | null> {
    const row = await this.prisma.runtimeEvent.findFirst({
      where: {
        OR: [{ sourceEntityId: entityId }, { targetEntityId: entityId }],
      },
      orderBy: { occurredAt: 'desc' },
    })
    return row ? this.toDomain(row) : null
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.runtimeEvent.count({ where: { projectId } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    eventType: string
    severity: string
    title: string
    description: string
    sourceEntityType: string
    sourceEntityId: string
    targetEntityType: string | null
    targetEntityId: string | null
    executionId: string | null
    metadata: unknown
    occurredAt: Date
  }): RuntimeEvent {
    return RuntimeEvent.reconstitute({
      id: row.id,
      projectId: row.projectId,
      eventType: row.eventType as RuntimeEventType,
      severity: row.severity as EventSeverity,
      title: row.title,
      description: row.description,
      sourceEntityType: row.sourceEntityType,
      sourceEntityId: row.sourceEntityId,
      targetEntityType: row.targetEntityType,
      targetEntityId: row.targetEntityId,
      executionId: row.executionId,
      metadata: row.metadata as Record<string, unknown>,
      occurredAt: row.occurredAt,
    })
  }
}
