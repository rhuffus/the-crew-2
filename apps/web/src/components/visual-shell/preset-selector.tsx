import { useState, useRef, useEffect } from 'react'
import {
  Building2,
  Puzzle,
  Workflow,
  FileSignature,
  FileBox,
  Shield,
  Activity,
  Package,
  ChevronDown,
  Check,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ViewPresetId, ScopeType } from '@the-crew/shared-types'
import { VIEW_PRESET_REGISTRY } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const PRESET_ICONS: Record<ViewPresetId, typeof Building2> = {
  organization: Building2,
  work: Workflow,
  deliverables: Package,
  rules: Shield,
  'live-status': Activity,
  // Legacy presets
  capabilities: Puzzle,
  workflows: Workflow,
  contracts: FileSignature,
  'artifact-flow': FileBox,
  governance: Shield,
  operations: Activity,
}

const PRESET_ORDER: ViewPresetId[] = [
  'organization',
  'capabilities',
  'workflows',
  'contracts',
  'artifact-flow',
  'governance',
  'operations',
]

export interface PresetSelectorProps {
  currentScope: ScopeType
  activePreset: ViewPresetId | null
  onSelectPreset: (presetId: ViewPresetId) => void
  onClearPreset: () => void
}

export function PresetSelector({
  currentScope,
  activePreset,
  onSelectPreset,
  onClearPreset,
}: PresetSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation('canvas')

  const availablePresets = PRESET_ORDER.filter((id) => {
    const def = VIEW_PRESET_REGISTRY[id]
    return def.availableAtScopes.includes(currentScope)
  })

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const activePresetDef = activePreset ? VIEW_PRESET_REGISTRY[activePreset] : null

  return (
    <div ref={ref} className="relative" data-testid="preset-selector">
      <button
        type="button"
        data-testid="preset-selector-trigger"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
          activePreset
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        {activePresetDef ? (
          <>
            {(() => {
              const Icon = PRESET_ICONS[activePreset!]
              return <Icon className="h-3.5 w-3.5" />
            })()}
            {activePresetDef.label}
          </>
        ) : (
          <>{t('views')}</>
        )}
        <ChevronDown className="h-3 w-3" />
      </button>

      {activePreset && (
        <button
          type="button"
          data-testid="preset-clear"
          onClick={(e) => {
            e.stopPropagation()
            onClearPreset()
          }}
          className="ml-0.5 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title={t('clearPreset')}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {open && (
        <div
          data-testid="preset-selector-popover"
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          {availablePresets.map((id) => {
            const def = VIEW_PRESET_REGISTRY[id]
            const Icon = PRESET_ICONS[id]
            const isActive = activePreset === id

            return (
              <button
                key={id}
                type="button"
                data-testid={`preset-option-${id}`}
                onClick={() => {
                  if (isActive) {
                    onClearPreset()
                  } else {
                    onSelectPreset(id)
                    // Auto-enable operations overlay when selecting operations preset
                    if (id === 'operations' && !useVisualWorkspaceStore.getState().showOperationsOverlay) {
                      useVisualWorkspaceStore.getState().toggleOperationsOverlay()
                    }
                  }
                  setOpen(false)
                }}
                className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{def.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {def.description}
                  </div>
                </div>
                {isActive && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
