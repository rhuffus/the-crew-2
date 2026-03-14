import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ArtifactRepository } from '../domain/artifact-repository'
import { Artifact } from '../domain/artifact'
import type { ArtifactType, ArtifactStatus, PartyType } from '@the-crew/shared-types'

@Injectable()
export class PrismaArtifactRepository implements ArtifactRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Artifact | null> {
    const row = await this.prisma.artifact.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Artifact[]> {
    const rows = await this.prisma.artifact.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(artifact: Artifact): Promise<void> {
    const data = {
      projectId: artifact.projectId,
      name: artifact.name,
      description: artifact.description,
      type: artifact.type,
      status: artifact.status,
      producerId: artifact.producerId,
      producerType: artifact.producerType,
      consumerIds: artifact.consumerIds as string[],
      tags: artifact.tags as string[],
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    }
    await this.prisma.artifact.upsert({
      where: { id: artifact.id },
      create: { id: artifact.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.artifact.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    type: string
    status: string
    producerId: string | null
    producerType: string | null
    consumerIds: string[]
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }): Artifact {
    return Artifact.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      type: row.type as ArtifactType,
      status: row.status as ArtifactStatus,
      producerId: row.producerId ?? null,
      producerType: (row.producerType as PartyType) ?? null,
      consumerIds: [...row.consumerIds],
      tags: [...row.tags],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
