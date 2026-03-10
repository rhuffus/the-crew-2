import { useState } from 'react'
import type { DepartmentDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateCapability } from '@/hooks/use-capabilities'

interface CreateCapabilityFormProps {
  projectId: string
  departments: DepartmentDto[]
  onClose: () => void
}

export function CreateCapabilityForm({ projectId, departments, onClose }: CreateCapabilityFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ownerDepartmentId, setOwnerDepartmentId] = useState('')
  const createCapability = useCreateCapability(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setOwnerDepartmentId('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createCapability.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        ownerDepartmentId: ownerDepartmentId || null,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Capability</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="cap-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="cap-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="User Onboarding"
          />
        </div>
        <div>
          <label htmlFor="cap-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="cap-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        {departments.length > 0 && (
          <div>
            <label htmlFor="cap-owner" className="mb-1 block text-sm font-medium">
              Owner Department
            </label>
            <select
              id="cap-owner"
              value={ownerDepartmentId}
              onChange={(e) => setOwnerDepartmentId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createCapability.isPending}>
            {createCapability.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
