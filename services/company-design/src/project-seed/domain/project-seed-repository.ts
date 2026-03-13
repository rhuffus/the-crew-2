import type { ProjectSeed } from './project-seed'

export interface ProjectSeedRepository {
  findByProjectId(projectId: string): Promise<ProjectSeed | null>
  save(seed: ProjectSeed): Promise<void>
}

export const PROJECT_SEED_REPOSITORY = Symbol('PROJECT_SEED_REPOSITORY')
