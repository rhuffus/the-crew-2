import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateRelease } from '@/hooks/use-releases'
import { Plus } from 'lucide-react'

interface CreateReleaseFormProps {
  projectId: string
}

export function CreateReleaseForm({ projectId }: CreateReleaseFormProps) {
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState('')
  const [notes, setNotes] = useState('')
  const createRelease = useCreateRelease(projectId)

  function resetForm() {
    setVersion('')
    setNotes('')
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createRelease.mutate(
      {
        version: version.trim(),
        notes: notes.trim() || undefined,
      },
      { onSuccess: resetForm },
    )
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="mr-1.5 h-4 w-4" />
        New Release
      </Button>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-3 font-semibold">Create Release</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="release-version" className="mb-1 block text-sm font-medium">
            Version
          </label>
          <input
            id="release-version"
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="1.0.0"
          />
        </div>
        <div>
          <label htmlFor="release-notes" className="mb-1 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="release-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Release notes..."
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createRelease.isPending}>
            {createRelease.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
