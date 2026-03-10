import { useState } from 'react'
import type { AgentArchetypeDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateAgentAssignment } from '@/hooks/use-agent-assignments'

interface CreateAssignmentFormProps {
  projectId: string
  archetypes: AgentArchetypeDto[]
  onClose: () => void
}

export function CreateAssignmentForm({ projectId, archetypes, onClose }: CreateAssignmentFormProps) {
  const [name, setName] = useState('')
  const [archetypeId, setArchetypeId] = useState('')
  const createAssignment = useCreateAgentAssignment(projectId)

  function resetForm() {
    setName('')
    setArchetypeId('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createAssignment.mutate(
      {
        archetypeId,
        name: name.trim(),
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Agent Assignment</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="assignment-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="assignment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Primary Deployer"
          />
        </div>
        <div>
          <label htmlFor="assignment-archetype" className="mb-1 block text-sm font-medium">
            Archetype
          </label>
          <select
            id="assignment-archetype"
            value={archetypeId}
            onChange={(e) => setArchetypeId(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select archetype...</option>
            {archetypes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createAssignment.isPending}>
            {createAssignment.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
