import { useEffect, useRef, useCallback } from 'react'
import type { NodeType } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { usePermission } from '@/hooks/use-permissions'
import {
  getNodeContextMenuSections,
  getEdgeContextMenuSections,
  getPaneContextMenuSections,
  getMultiSelectContextMenuSections,
  resolveEdgeForDeletion,
  type ContextMenuActionId,
  type ContextMenuSection,
} from '@/lib/context-menu-actions'

export interface CanvasContextMenuProps {
  onAddEntity?: (nodeType: NodeType) => void
  onDrillIn?: (nodeId: string) => void
  onNodeDelete?: (nodeType: string, entityId: string) => void
  onFitView?: () => void
  onAutoLayout?: () => void
}

export function CanvasContextMenu({
  onAddEntity,
  onDrillIn,
  onNodeDelete,
  onFitView,
  onAutoLayout,
}: CanvasContextMenuProps) {
  // Permission checks (CAV-020)
  const canEditNodes = usePermission('canvas:node:edit')
  const canDeleteNodes = usePermission('canvas:node:delete')
  const canDeleteEdges = usePermission('canvas:edge:delete')
  const canCreateEdges = usePermission('canvas:edge:create')
  const canCreateNodes = usePermission('canvas:node:create')
  const permissions = { canEdit: canEditNodes, canDelete: canDeleteNodes && canDeleteEdges, canCreateEdges }

  const menuRef = useRef<HTMLDivElement>(null)
  const contextMenu = useVisualWorkspaceStore((s) => s.contextMenu)
  const graphNodes = useVisualWorkspaceStore((s) => s.graphNodes)
  const graphEdges = useVisualWorkspaceStore((s) => s.graphEdges)
  const collapsedNodeIds = useVisualWorkspaceStore((s) => s.collapsedNodeIds)
  const isDiffMode = useVisualWorkspaceStore((s) => s.isDiffMode)
  const currentScope = useVisualWorkspaceStore((s) => s.currentScope)
  const selectedNodeIds = useVisualWorkspaceStore((s) => s.selectedNodeIds)

  // Close on click outside
  useEffect(() => {
    if (!contextMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        useVisualWorkspaceStore.getState().dismissContextMenu()
      }
    }
    // Use a timeout so the contextmenu event itself doesn't trigger close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [contextMenu])

  // Close on Escape
  useEffect(() => {
    if (!contextMenu) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        useVisualWorkspaceStore.getState().dismissContextMenu()
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [contextMenu])

  // Close on scroll
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => useVisualWorkspaceStore.getState().dismissContextMenu()
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [contextMenu])

  // Arrow key navigation within menu
  useEffect(() => {
    if (!contextMenu) return
    const menu = menuRef.current
    if (!menu) return

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'))
      if (items.length === 0) return
      const current = items.indexOf(document.activeElement as HTMLElement)
      let next: number
      if (e.key === 'ArrowDown') {
        next = current < items.length - 1 ? current + 1 : 0
      } else {
        next = current > 0 ? current - 1 : items.length - 1
      }
      items[next]?.focus()
    }
    menu.addEventListener('keydown', handler)
    return () => menu.removeEventListener('keydown', handler)
  }, [contextMenu])

  // Focus first item on mount
  useEffect(() => {
    if (!contextMenu) return
    const menu = menuRef.current
    if (!menu) return
    const timer = setTimeout(() => {
      const first = menu.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
      first?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [contextMenu])

  const handleAction = useCallback(
    (actionId: ContextMenuActionId, nodeType?: NodeType) => {
      const state = useVisualWorkspaceStore.getState()
      if (!state.contextMenu) return
      const { targetId } = state.contextMenu

      state.dismissContextMenu()

      switch (actionId) {
        case 'inspect': {
          if (targetId) state.selectNodes([targetId])
          break
        }
        case 'edit': {
          if (targetId) state.selectNodes([targetId])
          break
        }
        case 'drill-in': {
          if (targetId) onDrillIn?.(targetId)
          break
        }
        case 'create-relationship': {
          if (targetId) {
            state.setAddEdgeSource(targetId)
          }
          break
        }
        case 'collapse':
        case 'expand': {
          if (targetId) state.toggleCollapse(targetId)
          break
        }
        case 'delete-node': {
          if (targetId) {
            const node = state.graphNodes.find((n) => n.id === targetId)
            if (node) onNodeDelete?.(node.nodeType, node.entityId)
          }
          break
        }
        case 'inspect-edge': {
          if (targetId) state.selectEdges([targetId])
          break
        }
        case 'delete-edge': {
          if (targetId) {
            const resolved = resolveEdgeForDeletion(targetId, state.graphEdges)
            if (resolved) {
              state.showDeleteConfirm(resolved.edgeType, resolved.sourceId, resolved.targetId)
            }
          }
          break
        }
        case 'focus-source': {
          if (targetId) {
            const edge = state.graphEdges.find((e) => e.id === targetId)
            if (edge) {
              state.selectNodes([edge.sourceId])
              state.focusNode(edge.sourceId)
            }
          }
          break
        }
        case 'focus-target': {
          if (targetId) {
            const edge = state.graphEdges.find((e) => e.id === targetId)
            if (edge) {
              state.selectNodes([edge.targetId])
              state.focusNode(edge.targetId)
            }
          }
          break
        }
        case 'add-node': {
          if (nodeType) {
            if (onAddEntity) {
              onAddEntity(nodeType)
            } else {
              state.showEntityForm(nodeType)
            }
          }
          break
        }
        case 'fit-view': {
          onFitView?.()
          break
        }
        case 'auto-layout': {
          onAutoLayout?.()
          break
        }
        case 'select-all': {
          const allIds = state.graphNodes.map((n) => n.id)
          if (allIds.length > 0) state.selectNodes(allIds)
          break
        }
        case 'delete-selected': {
          for (const nodeId of state.selectedNodeIds) {
            const node = state.graphNodes.find((n) => n.id === nodeId)
            if (node) onNodeDelete?.(node.nodeType, node.entityId)
          }
          break
        }
        case 'deselect-all': {
          state.clearSelection()
          break
        }
      }
    },
    [onAddEntity, onDrillIn, onNodeDelete, onFitView, onAutoLayout],
  )

  if (!contextMenu) return null

  let sections: ContextMenuSection[]

  switch (contextMenu.type) {
    case 'node':
      sections = getNodeContextMenuSections(
        contextMenu.targetId!,
        graphNodes,
        collapsedNodeIds,
        isDiffMode,
        permissions,
      )
      break
    case 'edge':
      sections = getEdgeContextMenuSections(
        contextMenu.targetId!,
        graphEdges,
        graphNodes,
        isDiffMode,
        { canDelete: canDeleteEdges },
      )
      break
    case 'pane':
      sections = getPaneContextMenuSections(
        currentScope.scopeType,
        isDiffMode,
        graphNodes.length > 0,
        { canEdit: canCreateNodes },
      )
      break
    case 'multi-select':
      sections = getMultiSelectContextMenuSections(selectedNodeIds, isDiffMode, { canDelete: canDeleteNodes })
      break
    default:
      sections = []
  }

  if (sections.length === 0) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      data-testid="canvas-context-menu"
      className="fixed z-50 min-w-48 rounded-lg border border-border bg-popover p-1 shadow-lg"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {sections.map((section, si) => (
        <div key={si}>
          {si > 0 && <div role="separator" className="my-1 border-t border-border" data-testid="context-menu-separator" />}
          {section.items.map((item) => (
            <button
              key={`${item.id}-${item.nodeType ?? ''}`}
              type="button"
              role="menuitem"
              data-testid={`context-menu-${item.id}${item.nodeType ? `-${item.nodeType}` : ''}`}
              disabled={item.disabled}
              onClick={() => handleAction(item.id, item.nodeType)}
              className={`flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-sm ${
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-popover-foreground hover:bg-accent'
              } ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-4 text-xs text-muted-foreground">{item.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
