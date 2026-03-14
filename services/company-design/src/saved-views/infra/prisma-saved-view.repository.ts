import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { SavedViewRepository } from '../domain/saved-view-repository'
import { SavedView, type SavedViewState } from '../domain/saved-view'

@Injectable()
export class PrismaSavedViewRepository implements SavedViewRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<SavedView | null> {
    const row = await this.prisma.savedView.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<SavedView[]> {
    const rows = await this.prisma.savedView.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(view: SavedView): Promise<void> {
    const data = {
      projectId: view.projectId,
      name: view.name,
      state: view.state as object,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    }
    await this.prisma.savedView.upsert({
      where: { id: view.id },
      create: { id: view.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.savedView.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    state: unknown
    createdAt: Date
    updatedAt: Date
  }): SavedView {
    return SavedView.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      state: row.state as SavedViewState,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
