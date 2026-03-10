import { useEffect } from 'react'
import type { NodeType } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export const DRILLABLE_NODE_TYPES: ReadonlySet<NodeType> = new Set([
  'company',
  'department',
  'workflow',
])

function isTextInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export interface UseCanvasKeyboardOptions {
  onDrillIn: (nodeId: string) => void
  onDrillOut: () => void
}

export function useCanvasKeyboard({
  onDrillIn,
  onDrillOut,
}: UseCanvasKeyboardOptions): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTextInputFocused()) return

      const store = useVisualWorkspaceStore.getState()

      switch (e.key) {
        case 'Enter': {
          if (store.selectedNodeIds.length !== 1) return
          const nodeId = store.selectedNodeIds[0]!
          const node = store.graphNodes.find((n) => n.id === nodeId)
          if (!node || !DRILLABLE_NODE_TYPES.has(node.nodeType)) return
          e.preventDefault()
          onDrillIn(nodeId)
          break
        }

        case 'Escape': {
          e.preventDefault()
          if (
            store.selectedNodeIds.length > 0 ||
            store.selectedEdgeIds.length > 0
          ) {
            store.clearSelection()
          } else {
            onDrillOut()
          }
          break
        }

        case 'Tab': {
          if (store.graphNodes.length === 0) return
          e.preventDefault()
          const nodes = store.graphNodes
          const currentIdx =
            store.selectedNodeIds.length === 1
              ? nodes.findIndex((n) => n.id === store.selectedNodeIds[0])
              : -1
          let nextIdx: number
          if (e.shiftKey) {
            nextIdx = currentIdx <= 0 ? nodes.length - 1 : currentIdx - 1
          } else {
            nextIdx =
              currentIdx >= nodes.length - 1 || currentIdx < 0
                ? 0
                : currentIdx + 1
          }
          const nextNode = nodes[nextIdx]!
          store.selectNodes([nextNode.id])
          store.focusNode(nextNode.id)
          break
        }

        default:
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (e.key === 'E' || e.key === 'e') {
              e.preventDefault()
              store.toggleExplorer()
            } else if (e.key === 'I' || e.key === 'i') {
              e.preventDefault()
              store.toggleInspector()
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onDrillIn, onDrillOut])
}
