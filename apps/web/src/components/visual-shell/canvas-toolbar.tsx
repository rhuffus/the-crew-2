import { ZoomIn, ZoomOut, Maximize, LayoutGrid, RotateCcw, ShieldCheck, Minimize2, Maximize2, Loader2, MousePointer2, Hand, Spline, Plus, Cable, Undo2, Redo2, Keyboard, Activity, Clock } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { LAYER_DEFINITIONS } from '@the-crew/shared-types'
import { useVisualWorkspaceStore, type CanvasMode } from '@/stores/visual-workspace-store'
import { useUndoRedoStore } from '@/stores/undo-redo-store'
import { usePermission } from '@/hooks/use-permissions'
import { EDGE_TYPE_LABELS } from '@/lib/palette-data'
import { NodePaletteButton } from './node-palette'
import { RelationshipPaletteButton } from './relationship-palette'
import { PresetSelector } from './preset-selector'
import { formatRelativeTime } from '@/lib/operations-enrichment'

export interface CanvasToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitView?: () => void
  onAutoLayout?: () => void
  onAddEntity?: (nodeType: NodeType) => void
  isPending?: boolean
}

export const CANVAS_MODES: { mode: CanvasMode; icon: typeof ZoomIn; label: string; shortcut: string }[] = [
  { mode: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { mode: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
  { mode: 'connect', icon: Spline, label: 'Connect', shortcut: 'C' },
  { mode: 'add-node', icon: Plus, label: 'Add Node', shortcut: 'N' },
  { mode: 'add-edge', icon: Cable, label: 'Add Edge', shortcut: 'E' },
]

const MODE_LABELS: Record<CanvasMode, string> = {
  select: 'Select',
  pan: 'Pan',
  connect: 'Connect',
  'add-node': 'Add Node',
  'add-edge': 'Add Edge',
}

export function CanvasToolbar({ onZoomIn, onZoomOut, onFitView, onAutoLayout, onAddEntity, isPending = false }: CanvasToolbarProps) {
  const { currentView, activeLayers, zoomLevel, nodeTypeFilter, statusFilter, resetToDefaults, clearFilters, showValidationOverlay, toggleValidationOverlay, showOperationsOverlay, toggleOperationsOverlay, operationsStatus, collapsedNodeIds, expandAll, collapseAll, canvasMode, setCanvasMode, isDiffMode, preselectedEdgeType, activePreset, setActivePreset, clearActivePreset, currentScope } =
    useVisualWorkspaceStore()

  // Permission checks (CAV-020)
  const canEdit = usePermission('canvas:node:edit')
  const canCreateNodes = usePermission('canvas:node:create')
  const canAutoLayout = usePermission('canvas:layout:auto')

  const effectiveMode = isDiffMode ? 'select' : canvasMode

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

  // Build mode label, including preselected edge type hint
  const modeLabel = effectiveMode === 'add-edge' && preselectedEdgeType
    ? `Add Edge: ${EDGE_TYPE_LABELS[preselectedEdgeType]}`
    : MODE_LABELS[effectiveMode]

  return (
    <div
      data-testid="canvas-toolbar"
      className="flex h-10 items-center justify-between border-b border-border bg-card px-3"
    >
      <div className="flex items-center gap-1">
        {/* Mode selector group */}
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5" data-testid="mode-group">
          {CANVAS_MODES.map(({ mode, icon: Icon, label, shortcut }) => {
            // Gate editing modes by permissions (CAV-020)
            const modeRequiresEdit = mode === 'connect' || mode === 'add-node' || mode === 'add-edge'
            const modeDisabled = (isDiffMode && mode !== 'select') || (modeRequiresEdit && !canEdit)
            return (
              <button
                key={mode}
                type="button"
                aria-label={`${label} (${shortcut})`}
                title={`${label} (${shortcut})`}
                data-testid={`mode-${mode}`}
                onClick={() => !modeDisabled && setCanvasMode(mode)}
                disabled={modeDisabled}
                className={`rounded p-1.5 ${
                  effectiveMode === mode
                    ? 'bg-primary/10 text-primary'
                    : modeDisabled
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
        <div className="mx-2 h-4 w-px bg-border" />
        {/* View tools */}
        <ToolbarButton icon={ZoomOut} label="Zoom out" onClick={onZoomOut} />
        <ToolbarButton icon={ZoomIn} label="Zoom in" onClick={onZoomIn} />
        <ToolbarButton icon={Maximize} label="Fit view" onClick={onFitView} />
        <div className="mx-2 h-4 w-px bg-border" />
        {canAutoLayout && <ToolbarButton icon={LayoutGrid} label="Auto layout" onClick={onAutoLayout} />}
        <div className="mx-2 h-4 w-px bg-border" />
        {/* Undo/Redo (CAV-009) */}
        <UndoRedoButtons />
        <div className="mx-2 h-4 w-px bg-border" />
        {/* Editing tools */}
        <ToolbarToggleButton
          icon={ShieldCheck}
          label="Validation overlay"
          active={showValidationOverlay}
          onClick={toggleValidationOverlay}
        />
        <ToolbarToggleButton
          icon={Activity}
          label="Operations overlay"
          active={showOperationsOverlay}
          onClick={toggleOperationsOverlay}
          disabled={isDiffMode}
        />
        {showOperationsOverlay && operationsStatus && (
          <span className="text-xs text-muted-foreground flex items-center" title={`Last updated: ${operationsStatus.fetchedAt}`}>
            <Clock className="mr-1 inline h-3 w-3" />
            {formatRelativeTime(operationsStatus.fetchedAt)}
          </span>
        )}
        {!isDiffMode && (
          <>
            <div className="mx-2 h-4 w-px bg-border" />
            <PresetSelector
              currentScope={currentScope.scopeType}
              activePreset={activePreset}
              onSelectPreset={setActivePreset}
              onClearPreset={clearActivePreset}
            />
          </>
        )}
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
        {/* Typed palettes (CAV-006) — gated by permissions (CAV-020) */}
        {onAddEntity && !isDiffMode && canCreateNodes && (
          <>
            <div className="mx-2 h-4 w-px bg-border" />
            <NodePaletteButton zoomLevel={zoomLevel} onAddEntity={onAddEntity} />
            <RelationshipPaletteButton />
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isPending && (
          <span className="flex items-center gap-1 text-xs text-primary" data-testid="saving-indicator" aria-live="polite">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
        <span className="text-xs font-medium text-primary" data-testid="mode-label">
          {modeLabel}
        </span>
        <span className="text-xs text-muted-foreground" data-testid="active-layers-label">
          {activeLayerLabels.join(', ')}
        </span>
        <span className="text-xs text-muted-foreground">
          Scope: {scopeLabel}
        </span>
        <KeyboardHelpButton />
      </div>
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

function UndoRedoButtons() {
  const { undoStack, redoStack } = useUndoRedoStore()
  const canUndo = undoStack.length > 0
  const canRedo = redoStack.length > 0

  return (
    <>
      <button
        type="button"
        aria-label="Undo (Ctrl+Z)"
        title="Undo (Ctrl+Z)"
        data-testid="toolbar-undo"
        onClick={() => useUndoRedoStore.getState().undo()}
        disabled={!canUndo}
        className={`rounded p-1.5 ${
          canUndo
            ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            : 'text-muted-foreground/30 cursor-not-allowed'
        }`}
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Redo (Ctrl+Shift+Z)"
        title="Redo (Ctrl+Shift+Z)"
        data-testid="toolbar-redo"
        onClick={() => useUndoRedoStore.getState().redo()}
        disabled={!canRedo}
        className={`rounded p-1.5 ${
          canRedo
            ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            : 'text-muted-foreground/30 cursor-not-allowed'
        }`}
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </>
  )
}

function KeyboardHelpButton() {
  const toggleKeyboardHelp = useVisualWorkspaceStore((s) => s.toggleKeyboardHelp)

  return (
    <button
      type="button"
      aria-label="Keyboard shortcuts (?)"
      title="Keyboard shortcuts (?)"
      data-testid="toolbar-keyboard-help"
      onClick={toggleKeyboardHelp}
      className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Keyboard className="h-4 w-4" />
    </button>
  )
}

function ToolbarToggleButton({
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
}: {
  icon: typeof ZoomIn
  label: string
  active: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      data-testid={`toolbar-toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      disabled={disabled}
      className={`rounded p-1.5 ${
        disabled
          ? 'text-muted-foreground/30 cursor-not-allowed'
          : active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
