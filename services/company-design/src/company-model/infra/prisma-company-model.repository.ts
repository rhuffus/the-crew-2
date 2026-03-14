import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { CompanyModelRepository } from '../domain/company-model-repository'
import { CompanyModel } from '../domain/company-model'

@Injectable()
export class PrismaCompanyModelRepository implements CompanyModelRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findByProjectId(projectId: string): Promise<CompanyModel | null> {
    const row = await this.prisma.companyModel.findUnique({
      where: { projectId },
    })
    return row ? this.toDomain(row) : null
  }

  async save(model: CompanyModel): Promise<void> {
    await this.prisma.companyModel.upsert({
      where: { projectId: model.projectId },
      create: {
        projectId: model.projectId,
        purpose: model.purpose,
        type: model.type,
        scope: model.scope,
        principles: model.principles as string[],
        updatedAt: model.updatedAt,
      },
      update: {
        purpose: model.purpose,
        type: model.type,
        scope: model.scope,
        principles: model.principles as string[],
        updatedAt: model.updatedAt,
      },
    })
  }

  private toDomain(row: {
    projectId: string
    purpose: string
    type: string
    scope: string
    principles: string[]
    updatedAt: Date
  }): CompanyModel {
    return CompanyModel.reconstitute(row.projectId, {
      purpose: row.purpose,
      type: row.type,
      scope: row.scope,
      principles: [...row.principles],
      updatedAt: row.updatedAt,
    })
  }
}
