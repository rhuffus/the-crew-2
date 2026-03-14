import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { LockRepository } from '../domain/collaboration-repository'
import { EntityLock } from '../domain/entity-lock'
import type { NodeType } from '@the-crew/shared-types'

@Injectable()
export class PrismaLockRepository implements LockRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findByEntity(
    projectId: string,
    entityId: string,
  ): Promise<EntityLock | null> {
    const row = await this.prisma.entityLock.findFirst({
      where: { projectId, entityId },
    })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<EntityLock[]> {
    const rows = await this.prisma.entityLock.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(lock: EntityLock): Promise<void> {
    const data = {
      projectId: lock.projectId,
      entityId: lock.entityId,
      nodeType: lock.nodeType,
      lockedBy: lock.lockedBy,
      lockedByName: lock.lockedByName,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
    }
    await this.prisma.entityLock.upsert({
      where: { id: lock.id },
      create: { id: lock.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.entityLock.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    entityId: string
    nodeType: string
    lockedBy: string
    lockedByName: string
    lockedAt: Date
    expiresAt: Date
  }): EntityLock {
    return EntityLock.reconstitute({
      id: row.id,
      projectId: row.projectId,
      entityId: row.entityId,
      nodeType: row.nodeType as NodeType,
      lockedBy: row.lockedBy,
      lockedByName: row.lockedByName,
      lockedAt: row.lockedAt,
      expiresAt: row.expiresAt,
    })
  }
}
