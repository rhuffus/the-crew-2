import type { SavedViewDto } from '@the-crew/shared-types'
import type { SavedView } from '../domain/saved-view'

export class SavedViewMapper {
  static toDto(view: SavedView): SavedViewDto {
    const state = view.state
    return {
      id: view.id,
      projectId: view.projectId,
      name: view.name,
      state: {
        activeLayers: [...state.activeLayers],
        nodeTypeFilter: state.nodeTypeFilter ? [...state.nodeTypeFilter] : null,
        statusFilter: state.statusFilter ? [...state.statusFilter] : null,
      },
      createdAt: view.createdAt.toISOString(),
      updatedAt: view.updatedAt.toISOString(),
    }
  }
}
