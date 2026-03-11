import { Injectable } from '@nestjs/common'
import type { ArtifactRepository } from '../domain/artifact-repository'
import type { Artifact } from '../domain/artifact'

@Injectable()
export class InMemoryArtifactRepository implements ArtifactRepository {
  private readonly store = new Map<string, Artifact>()

  async findById(id: string): Promise<Artifact | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Artifact[]> {
    return [...this.store.values()].filter((a) => a.projectId === projectId)
  }

  async save(artifact: Artifact): Promise<void> {
    this.store.set(artifact.id, artifact)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
