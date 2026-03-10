import { Injectable } from '@nestjs/common'
import type { ReleaseRepository } from '../domain/release-repository'
import type { Release } from '../domain/release'

@Injectable()
export class InMemoryReleaseRepository implements ReleaseRepository {
  private readonly store = new Map<string, Release>()

  async findById(id: string): Promise<Release | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Release[]> {
    return [...this.store.values()].filter((r) => r.projectId === projectId)
  }

  async save(release: Release): Promise<void> {
    this.store.set(release.id, release)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
