import type { Node } from '@xyflow/react'

const STORAGE_PREFIX = 'the-crew:layout'

export type LayoutPositions = Record<string, { x: number; y: number }>

function layoutKey(projectId: string, scope: string): string {
  return `${STORAGE_PREFIX}:${projectId}:${scope}`
}

export function saveNodePositions(projectId: string, scope: string, positions: LayoutPositions): void {
  try {
    localStorage.setItem(layoutKey(projectId, scope), JSON.stringify(positions))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadNodePositions(projectId: string, scope: string): LayoutPositions | null {
  try {
    const raw = localStorage.getItem(layoutKey(projectId, scope))
    if (!raw) return null
    return JSON.parse(raw) as LayoutPositions
  } catch {
    return null
  }
}

export function clearNodePositions(projectId: string, scope: string): void {
  try {
    localStorage.removeItem(layoutKey(projectId, scope))
  } catch {
    // ignore
  }
}

/**
 * Merges persisted positions into flow nodes, overriding computed layout
 * positions for nodes that have saved positions.
 */
export function applyPersistedPositions(flowNodes: Node[], positions: LayoutPositions): Node[] {
  if (!positions || Object.keys(positions).length === 0) return flowNodes
  return flowNodes.map((node) => {
    const saved = positions[node.id]
    if (!saved) return node
    return { ...node, position: { x: saved.x, y: saved.y } }
  })
}

/**
 * Updates a single node's position in the positions map.
 * Returns a new map (does not mutate the input).
 */
export function updatePosition(
  positions: LayoutPositions,
  nodeId: string,
  position: { x: number; y: number },
): LayoutPositions {
  return { ...positions, [nodeId]: { x: position.x, y: position.y } }
}
