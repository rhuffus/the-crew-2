import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ReleaseRepository } from '../domain/release-repository'
import { Release, type ReleaseStatus } from '../domain/release'
import type { ReleaseSnapshotDto, ValidationIssue } from '@the-crew/shared-types'

@Injectable()
export class PrismaReleaseRepository implements ReleaseRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Release | null> {
    const row = await this.prisma.release.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Release[]> {
    const rows = await this.prisma.release.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(release: Release): Promise<void> {
    const data = {
      projectId: release.projectId,
      version: release.version,
      status: release.status,
      notes: release.notes,
      snapshot: release.snapshot !== null ? (release.snapshot as object) : Prisma.JsonNull,
      validationIssues: release.validationIssues as object[],
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
      publishedAt: release.publishedAt,
    }
    await this.prisma.release.upsert({
      where: { id: release.id },
      create: { id: release.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.release.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    version: string
    status: string
    notes: string
    snapshot: unknown
    validationIssues: unknown
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
  }): Release {
    return Release.reconstitute(row.id, {
      projectId: row.projectId,
      version: row.version,
      status: row.status as ReleaseStatus,
      notes: row.notes,
      snapshot: row.snapshot as ReleaseSnapshotDto | null,
      validationIssues: row.validationIssues as ValidationIssue[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
    })
  }
}
