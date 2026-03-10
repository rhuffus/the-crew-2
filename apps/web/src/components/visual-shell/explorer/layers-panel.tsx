import { LAYER_DEFINITIONS } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export function LayersPanel() {
  const { activeLayers, toggleLayer } = useVisualWorkspaceStore()

  return (
    <div data-testid="layers-panel" className="p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Layers
      </h4>
      <ul className="space-y-1">
        {LAYER_DEFINITIONS.map((layer) => {
          const isActive = activeLayers.includes(layer.id)
          return (
            <li key={layer.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleLayer(layer.id)}
                  className="rounded border-border"
                />
                <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                  {layer.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
