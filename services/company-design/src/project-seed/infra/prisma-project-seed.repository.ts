import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ProjectSeedRepository } from '../domain/project-seed-repository'
import {
  ProjectSeed,
  type AiBudgetProps,
  type FounderPreferencesProps,
  type MaturityPhase,
} from '../domain/project-seed'

@Injectable()
export class PrismaProjectSeedRepository implements ProjectSeedRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findByProjectId(projectId: string): Promise<ProjectSeed | null> {
    const row = await this.prisma.projectSeed.findUnique({ where: { projectId } })
    return row ? this.toDomain(row) : null
  }

  async save(seed: ProjectSeed): Promise<void> {
    await this.prisma.projectSeed.upsert({
      where: { projectId: seed.projectId },
      create: {
        projectId: seed.projectId,
        name: seed.name,
        description: seed.description,
        mission: seed.mission,
        vision: seed.vision,
        companyType: seed.companyType,
        restrictions: seed.restrictions as string[],
        principles: seed.principles as string[],
        aiBudget: seed.aiBudget as object,
        initialObjectives: seed.initialObjectives as string[],
        founderPreferences: seed.founderPreferences as object,
        maturityPhase: seed.maturityPhase,
        createdAt: seed.createdAt,
        updatedAt: seed.updatedAt,
      },
      update: {
        name: seed.name,
        description: seed.description,
        mission: seed.mission,
        vision: seed.vision,
        companyType: seed.companyType,
        restrictions: seed.restrictions as string[],
        principles: seed.principles as string[],
        aiBudget: seed.aiBudget as object,
        initialObjectives: seed.initialObjectives as string[],
        founderPreferences: seed.founderPreferences as object,
        maturityPhase: seed.maturityPhase,
        updatedAt: seed.updatedAt,
      },
    })
  }

  private toDomain(row: {
    projectId: string
    name: string
    description: string
    mission: string
    vision: string
    companyType: string
    restrictions: string[]
    principles: string[]
    aiBudget: unknown
    initialObjectives: string[]
    founderPreferences: unknown
    maturityPhase: string
    createdAt: Date
    updatedAt: Date
  }): ProjectSeed {
    return ProjectSeed.reconstitute(row.projectId, {
      name: row.name,
      description: row.description,
      mission: row.mission,
      vision: row.vision,
      companyType: row.companyType,
      restrictions: [...row.restrictions],
      principles: [...row.principles],
      aiBudget: row.aiBudget as AiBudgetProps,
      initialObjectives: [...row.initialObjectives],
      founderPreferences: row.founderPreferences as FounderPreferencesProps,
      maturityPhase: row.maturityPhase as MaturityPhase,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
