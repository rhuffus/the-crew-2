import { Lock } from 'lucide-react'
import { OVERLAY_DEFINITIONS } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export function OverlaysPanel() {
  const activeOverlays = useVisualWorkspaceStore((s) => s.activeOverlays)
  const toggleOverlay = useVisualWorkspaceStore((s) => s.toggleOverlay)

  return (
    <div data-testid="overlays-panel" className="p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Overlays
      </h4>
      <ul className="space-y-1">
        {OVERLAY_DEFINITIONS.map((overlay) => {
          const isActive = activeOverlays.includes(overlay.id)
          return (
            <li key={overlay.id}>
              <label
                className={`flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent ${
                  overlay.locked ? 'cursor-default opacity-80' : 'cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleOverlay(overlay.id)}
                  disabled={overlay.locked}
                  className="rounded border-border"
                />
                <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                  {overlay.label}
                </span>
                {overlay.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
