import type { Repository } from '@the-crew/domain-core'
import type { SavedView } from './saved-view'

export interface SavedViewRepository extends Repository<SavedView, string> {
  findByProjectId(projectId: string): Promise<SavedView[]>
}

export const SAVED_VIEW_REPOSITORY = Symbol('SAVED_VIEW_REPOSITORY')
