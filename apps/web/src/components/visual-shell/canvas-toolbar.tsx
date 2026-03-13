import { ZoomIn, ZoomOut, Maximize, LayoutGrid, RotateCcw, ShieldCheck, Minimize2, Maximize2, Loader2, Undo2, Redo2, Keyboard, Activity, Clock, Radio, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { NodeType } from '@the-crew/shared-types'
import { OVERLAY_DEFINITIONS, isOverlayActive } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
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

export function CanvasToolbar({ onZoomIn, onZoomOut, onFitView, onAutoLayout, onAddEntity, isPending = false }: CanvasToolbarProps) {
  const currentView = useVisualWorkspaceStore((s) => s.currentView)
  const activeLayers = useVisualWorkspaceStore((s) => s.activeLayers)
  const zoomLevel = useVisualWorkspaceStore((s) => s.zoomLevel)
  const nodeTypeFilter = useVisualWorkspaceStore((s) => s.nodeTypeFilter)
  const statusFilter = useVisualWorkspaceStore((s) => s.statusFilter)
  const showValidationOverlay = useVisualWorkspaceStore((s) => s.showValidationOverlay)
  const toggleValidationOverlay = useVisualWorkspaceStore((s) => s.toggleValidationOverlay)
  const showOperationsOverlay = useVisualWorkspaceStore((s) => s.showOperationsOverlay)
  const toggleOperationsOverlay = useVisualWorkspaceStore((s) => s.toggleOperationsOverlay)
  const operationsStatus = useVisualWorkspaceStore((s) => s.operationsStatus)
  const collapsedNodeIds = useVisualWorkspaceStore((s) => s.collapsedNodeIds)
  const expandAll = useVisualWorkspaceStore((s) => s.expandAll)
  const collapseAll = useVisualWorkspaceStore((s) => s.collapseAll)
  const isDiffMode = useVisualWorkspaceStore((s) => s.isDiffMode)
  const preselectedEdgeType = useVisualWorkspaceStore((s) => s.preselectedEdgeType)
  const setPreselectedEdgeType = useVisualWorkspaceStore((s) => s.setPreselectedEdgeType)
  const activePreset = useVisualWorkspaceStore((s) => s.activePreset)
  const setActivePreset = useVisualWorkspaceStore((s) => s.setActivePreset)
  const clearActivePreset = useVisualWorkspaceStore((s) => s.clearActivePreset)
  const currentScope = useVisualWorkspaceStore((s) => s.currentScope)
  const designMode = useVisualWorkspaceStore((s) => s.designMode)
  const setDesignMode = useVisualWorkspaceStore((s) => s.setDesignMode)
  const resetToDefaults = useVisualWorkspaceStore((s) => s.resetToDefaults)
  const clearFilters = useVisualWorkspaceStore((s) => s.clearFilters)

  const { t } = useTranslation('canvas')
  const { t: tCommon } = useTranslation('common')

  // Permission checks (CAV-020)
  const canCreateNodes = usePermission('canvas:node:create')
  const canAutoLayout = usePermission('canvas:layout:auto')

  const scopeLabel =
    currentView === 'org'
      ? t('scope.companyOrg')
      : currentView === 'department'
        ? t('scope.department')
        : t('scope.workflow')

  const activeOverlayLabels = OVERLAY_DEFINITIONS
    .filter((o) => !o.locked && isOverlayActive(activeLayers, o.id))
    .map((o) => o.label)

  const hasFilters = nodeTypeFilter !== null || statusFilter !== null

  return (
    <div
      data-testid="canvas-toolbar"
      className="flex h-10 items-center justify-between border-b border-border bg-card px-3"
    >
      <div className="flex items-center gap-1">
        {/* View tools */}
        <ToolbarButton icon={ZoomOut} label={t('toolbar.zoomOut')} onClick={onZoomOut} />
        <ToolbarButton icon={ZoomIn} label={t('toolbar.zoomIn')} onClick={onZoomIn} />
        <ToolbarButton icon={Maximize} label={t('toolbar.fitView')} onClick={onFitView} />
        <div className="mx-2 h-4 w-px bg-border" />
        {canAutoLayout && <ToolbarButton icon={LayoutGrid} label={t('toolbar.autoLayout')} onClick={onAutoLayout} />}
        <div className="mx-2 h-4 w-px bg-border" />
        {/* Undo/Redo (CAV-009) */}
        <UndoRedoButtons />
        <div className="mx-2 h-4 w-px bg-border" />
        {/* Editing tools */}
        <ToolbarToggleButton
          icon={ShieldCheck}
          label={t('toolbar.validationOverlay')}
          active={showValidationOverlay}
          onClick={toggleValidationOverlay}
        />
        <ToolbarToggleButton
          icon={Activity}
          label={t('toolbar.operationsOverlay')}
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
        <div className="mx-2 h-4 w-px bg-border" />
        <ToolbarToggleButton
          icon={Radio}
          label={t('toolbar.liveMode')}
          active={designMode === 'live'}
          onClick={() => setDesignMode(designMode === 'live' ? 'design' : 'live')}
          disabled={isDiffMode}
        />
        {designMode === 'live' && (
          <span className="text-[10px] font-medium text-green-600" data-testid="live-mode-indicator">
            {tCommon('live')}
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
            <ToolbarButton icon={Minimize2} label={t('toolbar.collapseAll')} onClick={collapseAll} />
            <ToolbarButton icon={Maximize2} label={t('toolbar.expandAll')} onClick={expandAll} />
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
              label={t('toolbar.resetFilters')}
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
            {tCommon('saving')}
          </span>
        )}
        {preselectedEdgeType && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary" data-testid="preselected-edge-pill">
            {EDGE_TYPE_LABELS[preselectedEdgeType]}
            <button
              type="button"
              aria-label={t('toolbar.clearPreselectedEdge')}
              data-testid="preselected-edge-dismiss"
              onClick={() => setPreselectedEdgeType(null)}
              className="rounded-full p-0.5 hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        <span className="text-xs text-muted-foreground" data-testid="active-overlays-label">
          {activeOverlayLabels.length > 0
            ? `${t('overlays.label')} ${activeOverlayLabels.join(', ')}`
            : t('overlays.none')}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('scope.label')} {scopeLabel}
        </span>
        <span className={`text-xs font-medium ${designMode === 'live' ? 'text-green-600' : 'text-muted-foreground'}`} data-testid="design-mode-label">
          {designMode === 'live' ? tCommon('live') : tCommon('design')}
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
  const { t } = useTranslation('canvas')
  const canUndo = undoStack.length > 0
  const canRedo = redoStack.length > 0

  return (
    <>
      <button
        type="button"
        aria-label={t('toolbar.undo')}
        title={t('toolbar.undo')}
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
        aria-label={t('toolbar.redo')}
        title={t('toolbar.redo')}
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
  const { t } = useTranslation('canvas')

  return (
    <button
      type="button"
      aria-label={t('toolbar.keyboardShortcuts')}
      title={t('toolbar.keyboardShortcuts')}
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
