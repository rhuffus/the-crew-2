import type { LayerId, NodeType, NodeStatus, VisualDiffStatus, ViewPresetId } from '@the-crew/shared-types'

const STORAGE_PREFIX = 'the-crew:view'

export interface ViewState {
  activeLayers: LayerId[]
  nodeTypeFilter: NodeType[] | null
  statusFilter: NodeStatus[] | null
  activePreset?: ViewPresetId | null
}

export interface DiffViewState extends ViewState {
  diffFilter: VisualDiffStatus[] | null
}

function viewStateKey(projectId: string, scope: string): string {
  return `${STORAGE_PREFIX}:${projectId}:${scope}`
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
