import { Injectable } from '@nestjs/common'
import type { ProjectSeedRepository } from '../domain/project-seed-repository'
import type { ProjectSeed } from '../domain/project-seed'

@Injectable()
export class InMemoryProjectSeedRepository implements ProjectSeedRepository {
  private readonly store = new Map<string, ProjectSeed>()

  async findByProjectId(projectId: string): Promise<ProjectSeed | null> {
    return this.store.get(projectId) ?? null
  }

  async save(seed: ProjectSeed): Promise<void> {
    this.store.set(seed.projectId, seed)
  }
}
