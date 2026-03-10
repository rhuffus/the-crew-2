import { useState, useRef, useEffect, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize, LayoutGrid, RotateCcw, ShieldCheck, Minimize2, Maximize2, Plus } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { LAYER_DEFINITIONS } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export interface CanvasToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitView?: () => void
  onAutoLayout?: () => void
  onAddEntity?: (nodeType: NodeType) => void
}

interface AddableEntity {
  nodeType: NodeType
  label: string
}

const L1_ADDABLE: AddableEntity[] = [
  { nodeType: 'department', label: 'Department' },
]

const L2_ADDABLE: AddableEntity[] = [
  { nodeType: 'role', label: 'Role' },
  { nodeType: 'capability', label: 'Capability' },
  { nodeType: 'workflow', label: 'Workflow' },
  { nodeType: 'contract', label: 'Contract' },
  { nodeType: 'policy', label: 'Policy' },
  { nodeType: 'skill', label: 'Skill' },
  { nodeType: 'agent-archetype', label: 'Agent Archetype' },
  { nodeType: 'agent-assignment', label: 'Agent Assignment' },
]

export function CanvasToolbar({ onZoomIn, onZoomOut, onFitView, onAutoLayout, onAddEntity }: CanvasToolbarProps) {
  const { currentView, activeLayers, zoomLevel, nodeTypeFilter, statusFilter, resetToDefaults, clearFilters, showValidationOverlay, toggleValidationOverlay, collapsedNodeIds, expandAll, collapseAll } =
    useVisualWorkspaceStore()

  const scopeLabel =
    currentView === 'org'
      ? 'Company Org'
      : currentView === 'department'
        ? 'Department'
        : 'Workflow'

  const activeLayerLabels = LAYER_DEFINITIONS
    .filter((l) => activeLayers.includes(l.id))
    .map((l) => l.label)

  const hasFilters = nodeTypeFilter !== null || statusFilter !== null

  const addableEntities = zoomLevel === 'L1' ? L1_ADDABLE : zoomLevel === 'L2' ? L2_ADDABLE : []

  return (
    <div
      data-testid="canvas-toolbar"
      className="flex h-10 items-center justify-between border-b border-border bg-card px-3"
    >
      <div className="flex items-center gap-1">
        <ToolbarButton icon={ZoomOut} label="Zoom out" onClick={onZoomOut} />
        <ToolbarButton icon={ZoomIn} label="Zoom in" onClick={onZoomIn} />
        <ToolbarButton icon={Maximize} label="Fit view" onClick={onFitView} />
        <div className="mx-2 h-4 w-px bg-border" />
        <ToolbarButton icon={LayoutGrid} label="Auto layout" onClick={onAutoLayout} />
        <div className="mx-2 h-4 w-px bg-border" />
        <ToolbarToggleButton
          icon={ShieldCheck}
          label="Validation overlay"
          active={showValidationOverlay}
          onClick={toggleValidationOverlay}
        />
        {zoomLevel !== 'L1' && (
          <>
            <div className="mx-2 h-4 w-px bg-border" />
            <ToolbarButton icon={Minimize2} label="Collapse all" onClick={collapseAll} />
            <ToolbarButton icon={Maximize2} label="Expand all" onClick={expandAll} />
            {collapsedNodeIds.length > 0 && (
              <span className="text-[10px] text-muted-foreground" data-testid="collapsed-count">
                {collapsedNodeIds.length}
              </span>
            )}
          </>
        )}
        {hasFilters && (
          <>
            <div className="mx-2 h-4 w-px bg-border" />
            <ToolbarButton
              icon={RotateCcw}
              label="Reset filters"
              onClick={() => {
                resetToDefaults(zoomLevel)
                clearFilters()
              }}
            />
          </>
        )}
        {onAddEntity && addableEntities.length > 0 && (
          <>
            <div className="mx-2 h-4 w-px bg-border" />
            <AddEntityDropdown entities={addableEntities} onAddEntity={onAddEntity} />
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground" data-testid="active-layers-label">
          {activeLayerLabels.join(', ')}
        </span>
        <span className="text-xs text-muted-foreground">
          Scope: {scopeLabel}
        </span>
      </div>
    </div>
  )
}

function AddEntityDropdown({
  entities,
  onAddEntity,
}: {
  entities: AddableEntity[]
  onAddEntity: (nodeType: NodeType) => void
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = useCallback(
    (entity: AddableEntity) => {
      onAddEntity(entity.nodeType)
      setOpen(false)
    },
    [onAddEntity],
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Add element"
        title="Add element"
        data-testid="add-entity-button"
        onClick={() => setOpen(!open)}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Plus className="h-4 w-4" />
      </button>
      {open && (
        <div
          data-testid="add-entity-dropdown"
          className="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {entities.map((entity) => (
            <button
              key={entity.nodeType}
              type="button"
              data-testid={`add-entity-option-${entity.nodeType}`}
              onClick={() => handleSelect(entity)}
              className="flex w-full items-center rounded px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {entity.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ZoomIn
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ToolbarToggleButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof ZoomIn
  label: string
  active: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-testid={`toolbar-toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`rounded p-1.5 ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
