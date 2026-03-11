import { Injectable } from '@nestjs/common'
import type { SavedViewRepository } from '../domain/saved-view-repository'
import type { SavedView } from '../domain/saved-view'

@Injectable()
export class InMemorySavedViewRepository implements SavedViewRepository {
  private readonly store = new Map<string, SavedView>()

  async findById(id: string): Promise<SavedView | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<SavedView[]> {
    return [...this.store.values()].filter((v) => v.projectId === projectId)
  }

  async save(view: SavedView): Promise<void> {
    this.store.set(view.id, view)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
