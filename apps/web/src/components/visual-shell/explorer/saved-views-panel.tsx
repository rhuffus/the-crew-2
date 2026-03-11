import { useState } from 'react'
import { Bookmark, Trash2, Loader2 } from 'lucide-react'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useSavedViews, useCreateSavedView, useDeleteSavedView } from '@/hooks/use-saved-views'

export function SavedViewsPanel() {
  const { projectId, activeLayers, nodeTypeFilter, statusFilter, setActiveLayers, setNodeTypeFilter, setStatusFilter } =
    useVisualWorkspaceStore()

  const pid = projectId ?? ''
  const { data: views = [], isLoading } = useSavedViews(pid)
  const createMutation = useCreateSavedView(pid)
  const deleteMutation = useDeleteSavedView(pid)
  const [newName, setNewName] = useState('')

  const handleSave = () => {
    const name = newName.trim()
    if (!name) return
    createMutation.mutate({
      name,
      state: { activeLayers, nodeTypeFilter, statusFilter },
    })
    setNewName('')
  }

  const handleLoad = (view: { state: { activeLayers: typeof activeLayers; nodeTypeFilter: typeof nodeTypeFilter; statusFilter: typeof statusFilter } }) => {
    setActiveLayers(view.state.activeLayers)
    setNodeTypeFilter(view.state.nodeTypeFilter)
    setStatusFilter(view.state.statusFilter)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const isSaving = createMutation.isPending || deleteMutation.isPending

  return (
    <div data-testid="saved-views-panel" className="p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Saved Views
      </h4>

      <div className="mb-3 flex gap-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="View name..."
          className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm"
          data-testid="saved-view-name-input"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!newName.trim() || isSaving}
          className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          data-testid="save-view-button"
        >
          Save
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="saved-views-loading">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading views...
        </div>
      ) : views.length === 0 ? (
        <p className="text-xs text-muted-foreground">No saved views yet</p>
      ) : (
        <ul className="space-y-1">
          {views.map((view) => (
            <li
              key={view.id}
              className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-accent"
            >
              <button
                type="button"
                onClick={() => handleLoad(view)}
                className="flex items-center gap-2 text-sm text-foreground"
                data-testid={`load-view-${view.name}`}
              >
                <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                {view.name}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(view.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Delete view ${view.name}`}
                data-testid={`delete-view-${view.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
