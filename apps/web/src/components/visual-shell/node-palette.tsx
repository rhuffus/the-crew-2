import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import {
  Building2, Users, UserCog, Bot, UserCheck,
  Zap, Wrench, Workflow, FileText, Shield,
} from 'lucide-react'
import type { NodeType, ZoomLevel } from '@the-crew/shared-types'
import {
  getGroupedNodePaletteItems,
  getNodePaletteItems,
  filterNodePaletteItems,
  type NodePaletteItem,
} from '@/lib/palette-data'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const NODE_TYPE_ICONS: Record<string, typeof Building2> = {
  department: Users,
  role: UserCog,
  'agent-archetype': Bot,
  'agent-assignment': UserCheck,
  capability: Zap,
  skill: Wrench,
  workflow: Workflow,
  contract: FileText,
  policy: Shield,
}

export interface NodePaletteProps {
  zoomLevel: ZoomLevel
  onSelect: (nodeType: NodeType) => void
  onClose: () => void
}

export function NodePalette({ zoomLevel, onSelect, onClose }: NodePaletteProps) {
  const [search, setSearch] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => getNodePaletteItems(zoomLevel), [zoomLevel])
  const filtered = useMemo(() => filterNodePaletteItems(allItems, search), [allItems, search])
  const grouped = useMemo(() => {
    if (search.trim()) {
      // When searching, show flat filtered results
      return null
    }
    return getGroupedNodePaletteItems(zoomLevel)
  }, [zoomLevel, search])

  // Focus search input on open
  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [onClose])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleSelect = useCallback(
    (item: NodePaletteItem) => {
      onSelect(item.nodeType)
      onClose()
    },
    [onSelect, onClose],
  )

  function renderItem(item: NodePaletteItem) {
    const Icon = NODE_TYPE_ICONS[item.nodeType] ?? Building2
    return (
      <button
        key={item.nodeType}
        type="button"
        data-testid={`node-palette-item-${item.nodeType}`}
        onClick={() => handleSelect(item)}
        className="flex w-full items-start gap-2.5 rounded px-2.5 py-2 text-left hover:bg-accent"
      >
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
          <div className="text-xs text-muted-foreground">{item.description}</div>
        </div>
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      data-testid="node-palette"
      className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-popover shadow-lg"
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="node-palette-search"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-1">
        {allItems.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground" data-testid="node-palette-empty">
            No nodes available at this level
          </div>
        )}
        {allItems.length > 0 && filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground" data-testid="node-palette-no-results">
            No matching nodes
          </div>
        )}
        {grouped
          ? grouped.map((group) => (
              <div key={group.category} data-testid={`node-palette-group-${group.category}`}>
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
                {group.items.map(renderItem)}
              </div>
            ))
          : filtered.map(renderItem)
        }
      </div>
    </div>
  )
}

export interface NodePaletteButtonProps {
  zoomLevel: ZoomLevel
  onAddEntity: (nodeType: NodeType) => void
}

export function NodePaletteButton({ zoomLevel, onAddEntity }: NodePaletteButtonProps) {
  const nodePaletteOpen = useVisualWorkspaceStore((s) => s.nodePaletteOpen)
  const toggleNodePalette = useVisualWorkspaceStore((s) => s.toggleNodePalette)

  const handleClose = useCallback(() => {
    if (nodePaletteOpen) toggleNodePalette()
  }, [nodePaletteOpen, toggleNodePalette])

  const items = getNodePaletteItems(zoomLevel)
  if (items.length === 0) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Add node"
        title="Add node"
        data-testid="node-palette-button"
        onClick={toggleNodePalette}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Plus className="h-4 w-4" />
      </button>
      {nodePaletteOpen && (
        <NodePalette
          zoomLevel={zoomLevel}
          onSelect={onAddEntity}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
