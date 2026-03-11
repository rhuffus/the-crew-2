import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Search, Cable } from 'lucide-react'
import type { EdgeType, EdgeCategory, EdgeStyle } from '@the-crew/shared-types'
import { CONNECTION_RULES } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import {
  getGroupedRelationships,
  getCreatableRelationships,
  filterRelationshipItems,
  formatTypeList,
  type RelationshipPaletteItem,
} from '@/lib/palette-data'

const CATEGORY_COLORS: Record<EdgeCategory, string> = {
  hierarchical: 'bg-blue-100 text-blue-700',
  ownership: 'bg-emerald-100 text-emerald-700',
  assignment: 'bg-purple-100 text-purple-700',
  capability: 'bg-amber-100 text-amber-700',
  contract: 'bg-cyan-100 text-cyan-700',
  workflow: 'bg-orange-100 text-orange-700',
  governance: 'bg-rose-100 text-rose-700',
  artifact: 'bg-indigo-100 text-indigo-700',
}

function StyleIndicator({ style }: { style: EdgeStyle }) {
  const dashArray = style === 'dashed' ? '6 3' : style === 'dotted' ? '2 3' : 'none'
  return (
    <svg width="20" height="8" className="shrink-0">
      <line
        x1="0" y1="4" x2="20" y2="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={dashArray}
      />
    </svg>
  )
}

export interface RelationshipPaletteProps {
  onSelect: (edgeType: EdgeType) => void
  onClose: () => void
}

export function RelationshipPalette({ onSelect, onClose }: RelationshipPaletteProps) {
  const [search, setSearch] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => getCreatableRelationships(CONNECTION_RULES), [])
  const filtered = useMemo(() => filterRelationshipItems(allItems, search), [allItems, search])
  const grouped = useMemo(() => {
    if (search.trim()) return null
    return getGroupedRelationships(CONNECTION_RULES)
  }, [search])

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

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
    (item: RelationshipPaletteItem) => {
      onSelect(item.edgeType)
      onClose()
    },
    [onSelect, onClose],
  )

  function renderItem(item: RelationshipPaletteItem) {
    return (
      <button
        key={item.edgeType}
        type="button"
        data-testid={`rel-palette-item-${item.edgeType}`}
        onClick={() => handleSelect(item)}
        className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left hover:bg-accent"
      >
        <StyleIndicator style={item.style as EdgeStyle} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
          <div className="text-[11px] text-muted-foreground">
            {formatTypeList(item.sourceTypes)} → {formatTypeList(item.targetTypes)}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category]}`}>
          {item.category}
        </span>
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      data-testid="relationship-palette"
      className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-popover shadow-lg"
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search relationships..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="rel-palette-search"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-1">
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground" data-testid="rel-palette-no-results">
            No matching relationships
          </div>
        )}
        {grouped
          ? grouped.map((group) => (
              <div key={group.category} data-testid={`rel-palette-group-${group.category}`}>
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

export function RelationshipPaletteButton() {
  const [open, setOpen] = useState(false)
  const { setPreselectedEdgeType, isDiffMode } = useVisualWorkspaceStore()

  const handleSelect = useCallback(
    (edgeType: EdgeType) => {
      setPreselectedEdgeType(edgeType)
    },
    [setPreselectedEdgeType],
  )

  if (isDiffMode) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Add relationship"
        title="Add relationship"
        data-testid="rel-palette-button"
        onClick={() => setOpen(!open)}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Cable className="h-4 w-4" />
      </button>
      {open && (
        <RelationshipPalette
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
