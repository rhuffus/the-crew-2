import { Entity } from '@the-crew/domain-core'
import type { LayerId, NodeType, NodeStatus } from '@the-crew/shared-types'

export interface SavedViewState {
  activeLayers: LayerId[]
  nodeTypeFilter: NodeType[] | null
  statusFilter: NodeStatus[] | null
}

export interface SavedViewProps {
  projectId: string
  name: string
  state: SavedViewState
  createdAt: Date
  updatedAt: Date
}

export class SavedView extends Entity<string> {
  private _projectId: string
  private _name: string
  private _state: SavedViewState
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: SavedViewProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._state = props.state
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this._projectId
  }
  get name() {
    return this._name
  }
  get state(): SavedViewState {
    return {
      activeLayers: [...this._state.activeLayers],
      nodeTypeFilter: this._state.nodeTypeFilter ? [...this._state.nodeTypeFilter] : null,
      statusFilter: this._state.statusFilter ? [...this._state.statusFilter] : null,
    }
  }
  get createdAt() {
    return this._createdAt
  }
  get updatedAt() {
    return this._updatedAt
  }

  static create(props: {
    id: string
    projectId: string
    name: string
    state: SavedViewState
  }): SavedView {
    if (!props.name.trim()) {
      throw new Error('Saved view name cannot be empty')
    }
    const now = new Date()
    return new SavedView(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      state: props.state,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(id: string, props: SavedViewProps): SavedView {
    return new SavedView(id, props)
  }

  update(props: { name?: string; state?: SavedViewState }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Saved view name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.state !== undefined) {
      this._state = props.state
    }
    this._updatedAt = new Date()
  }
}
