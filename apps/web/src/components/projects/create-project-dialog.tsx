import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateProject } from '@/hooks/use-projects'
import { Plus } from 'lucide-react'

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createProject = useCreateProject()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createProject.mutate(
      { name: name.trim(), description: description.trim() },
      {
        onSuccess: () => {
          setName('')
          setDescription('')
          setOpen(false)
        },
      },
    )
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="mr-1.5 h-4 w-4" />
        New Project
      </Button>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-3 font-semibold">Create Project</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="project-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="My Company"
          />
        </div>
        <div>
          <label htmlFor="project-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createProject.isPending}>
            {createProject.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false)
              setName('')
              setDescription('')
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
