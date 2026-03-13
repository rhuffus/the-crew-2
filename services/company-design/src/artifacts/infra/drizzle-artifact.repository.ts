import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ArtifactRepository } from '../domain/artifact-repository'
import { Artifact } from '../domain/artifact'
import type { ArtifactType, ArtifactStatus, PartyType } from '@the-crew/shared-types'
import { artifacts } from '../../drizzle/schema/artifacts'

@Injectable()
export class DrizzleArtifactRepository implements ArtifactRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Artifact | null> {
    const rows = await this.db
      .select()
      .from(artifacts)
      .where(eq(artifacts.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Artifact[]> {
    const rows = await this.db
      .select()
      .from(artifacts)
      .where(eq(artifacts.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(artifact: Artifact): Promise<void> {
    const row = this.toRow(artifact)
    await this.db
      .insert(artifacts)
      .values(row)
      .onConflictDoUpdate({ target: artifacts.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(artifacts).where(eq(artifacts.id, id))
  }

  private toDomain(row: typeof artifacts.$inferSelect): Artifact {
    return Artifact.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      type: row.type as ArtifactType,
      status: row.status as ArtifactStatus,
      producerId: row.producerId ?? null,
      producerType: (row.producerType as PartyType) ?? null,
      consumerIds: [...(row.consumerIds as string[])],
      tags: [...(row.tags as string[])],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(artifact: Artifact): typeof artifacts.$inferInsert {
    return {
      id: artifact.id,
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
  }
}
