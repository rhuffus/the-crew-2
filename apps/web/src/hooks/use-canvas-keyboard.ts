import { useEffect } from 'react'
import type { NodeType } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useUndoRedoStore } from '@/stores/undo-redo-store'

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
      const mod = e.ctrlKey || e.metaKey

      // Undo: Ctrl/Cmd+Z (no Shift)
      if (mod && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        useUndoRedoStore.getState().undo()
        return
      }

      // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      if (mod && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        useUndoRedoStore.getState().redo()
        return
      }
      if (mod && !e.shiftKey && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault()
        useUndoRedoStore.getState().redo()
        return
      }

      // Select all: Ctrl/Cmd+A
      if (mod && !e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        const allIds = store.graphNodes.map((n) => n.id)
        if (allIds.length > 0) {
          store.selectNodes(allIds)
        }
        return
      }

      // Keyboard shortcuts help: ?
      if (e.key === '?' && !mod && !e.altKey) {
        e.preventDefault()
        store.toggleKeyboardHelp()
        return
      }

      // Palette shortcuts: N = toggle node palette, E = toggle relationship palette (no modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        if ((e.key === 'n' || e.key === 'N') && !store.isDiffMode) {
          e.preventDefault()
          store.toggleNodePalette()
          return
        }
        if ((e.key === 'e' || e.key === 'E') && !store.isDiffMode) {
          e.preventDefault()
          store.toggleRelationshipPalette()
          return
        }
      }

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

          // Dismiss context menu first (CAV-008)
          if (store.contextMenu) {
            store.dismissContextMenu()
            return
          }

          // Dismiss keyboard help first
          if (store.showKeyboardHelp) {
            store.dismissKeyboardHelp()
            return
          }

          // Cancel preselected edge type
          if (store.preselectedEdgeType) {
            store.setPreselectedEdgeType(null)
            store.setAddEdgeSource(null)
            return
          }

          // Cancel add-edge source
          if (store.addEdgeSource) {
            store.setAddEdgeSource(null)
            return
          }

          // Default escape: clear selection, then drill out
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
