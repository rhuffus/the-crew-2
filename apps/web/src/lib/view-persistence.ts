import type { LayerId, NodeType, NodeStatus, VisualDiffStatus } from '@the-crew/shared-types'

const STORAGE_PREFIX = 'the-crew:view'

export interface ViewState {
  activeLayers: LayerId[]
  nodeTypeFilter: NodeType[] | null
  statusFilter: NodeStatus[] | null
}

export interface DiffViewState extends ViewState {
  diffFilter: VisualDiffStatus[] | null
}

export interface SavedView {
  name: string
  state: ViewState
}

function viewStateKey(projectId: string, scope: string): string {
  return `${STORAGE_PREFIX}:${projectId}:${scope}`
}

function savedViewsKey(projectId: string): string {
  return `${STORAGE_PREFIX}:saved:${projectId}`
}

export function saveViewState(projectId: string, scope: string, state: ViewState): void {
  try {
    localStorage.setItem(viewStateKey(projectId, scope), JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadViewState(projectId: string, scope: string): ViewState | null {
  try {
    const raw = localStorage.getItem(viewStateKey(projectId, scope))
    if (!raw) return null
    return JSON.parse(raw) as ViewState
  } catch {
    return null
  }
}

export function clearViewState(projectId: string, scope: string): void {
  try {
    localStorage.removeItem(viewStateKey(projectId, scope))
  } catch {
    // ignore
  }
}

export function listSavedViews(projectId: string): SavedView[] {
  try {
    const raw = localStorage.getItem(savedViewsKey(projectId))
    if (!raw) return []
    return JSON.parse(raw) as SavedView[]
  } catch {
    return []
  }
}

export function saveNamedView(projectId: string, name: string, state: ViewState): SavedView[] {
  const views = listSavedViews(projectId)
  const existing = views.findIndex((v) => v.name === name)
  if (existing >= 0) {
    views[existing] = { name, state }
  } else {
    views.push({ name, state })
  }
  try {
    localStorage.setItem(savedViewsKey(projectId), JSON.stringify(views))
  } catch {
    // ignore
  }
  return views
}

export function deleteNamedView(projectId: string, name: string): SavedView[] {
  const views = listSavedViews(projectId).filter((v) => v.name !== name)
  try {
    localStorage.setItem(savedViewsKey(projectId), JSON.stringify(views))
  } catch {
    // ignore
  }
  return views
}

function diffViewKey(projectId: string, baseReleaseId: string, compareReleaseId: string, scope: string): string {
  return `${STORAGE_PREFIX}:${projectId}:diff:${baseReleaseId}:${compareReleaseId}:${scope}`
}

export function saveDiffViewState(
  projectId: string,
  baseReleaseId: string,
  compareReleaseId: string,
  scope: string,
  state: DiffViewState,
): void {
  try {
    localStorage.setItem(diffViewKey(projectId, baseReleaseId, compareReleaseId, scope), JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function loadDiffViewState(
  projectId: string,
  baseReleaseId: string,
  compareReleaseId: string,
  scope: string,
): DiffViewState | null {
  try {
    const raw = localStorage.getItem(diffViewKey(projectId, baseReleaseId, compareReleaseId, scope))
    if (!raw) return null
    return JSON.parse(raw) as DiffViewState
  } catch {
    return null
  }
}
