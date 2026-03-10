import { useCallback, useEffect, useState } from 'react'
import type { EdgeType } from '@the-crew/shared-types'

export interface MetadataInputProps {
  edgeType: EdgeType
  onSubmit: (metadata: Record<string, unknown>) => void
  onCancel: () => void
}

export function MetadataInput({ edgeType, onSubmit, onCancel }: MetadataInputProps) {
  const [responsibility, setResponsibility] = useState('')

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    },
    [onCancel],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (edgeType === 'participates_in') {
        const trimmed = responsibility.trim()
        if (!trimmed) return
        onSubmit({ responsibility: trimmed })
      }
    },
    [edgeType, responsibility, onSubmit],
  )

  if (edgeType === 'participates_in') {
    return (
      <div
        data-testid="metadata-input-backdrop"
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/10"
        onClick={onCancel}
      >
        <form
          data-testid="metadata-input"
          className="rounded-lg border border-border bg-card p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
        >
          <div className="mb-3 text-sm font-medium text-foreground">
            Add participation details
          </div>
          <label className="mb-1 block text-xs text-muted-foreground" htmlFor="responsibility">
            Responsibility
          </label>
          <input
            id="responsibility"
            data-testid="metadata-responsibility"
            type="text"
            maxLength={200}
            placeholder="e.g. Approves final deliverable"
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
            className="mb-3 w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              data-testid="metadata-cancel"
              className="rounded px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="metadata-submit"
              disabled={!responsibility.trim()}
              className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    )
  }

  return null
}
