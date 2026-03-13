import type { ProjectSeedDto } from '@the-crew/shared-types'
import type { ProjectSeed } from '../domain/project-seed'

export class ProjectSeedMapper {
  static toDto(seed: ProjectSeed): ProjectSeedDto {
    return {
      projectId: seed.projectId,
      name: seed.name,
      description: seed.description,
      mission: seed.mission,
      vision: seed.vision,
      companyType: seed.companyType,
      restrictions: [...seed.restrictions],
      principles: [...seed.principles],
      aiBudget: { ...seed.aiBudget },
      initialObjectives: [...seed.initialObjectives],
      founderPreferences: { ...seed.founderPreferences },
      maturityPhase: seed.maturityPhase,
      createdAt: seed.createdAt.toISOString(),
      updatedAt: seed.updatedAt.toISOString(),
    }
  }
}
