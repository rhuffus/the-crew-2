import { useState } from 'react'
import type { DepartmentDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateWorkflow } from '@/hooks/use-workflows'

interface CreateWorkflowFormProps {
  projectId: string
  departments: DepartmentDto[]
  onClose: () => void
}

export function CreateWorkflowForm({ projectId, departments, onClose }: CreateWorkflowFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ownerDepartmentId, setOwnerDepartmentId] = useState('')
  const [triggerDescription, setTriggerDescription] = useState('')
  const createWorkflow = useCreateWorkflow(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setOwnerDepartmentId('')
    setTriggerDescription('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createWorkflow.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        ownerDepartmentId: ownerDepartmentId || null,
        triggerDescription: triggerDescription.trim(),
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Workflow</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="wf-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="wf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Onboarding Flow"
          />
        </div>
        <div>
          <label htmlFor="wf-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="wf-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        {departments.length > 0 && (
          <div>
            <label htmlFor="wf-owner" className="mb-1 block text-sm font-medium">
              Owner Department
            </label>
            <select
              id="wf-owner"
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
        <div>
          <label htmlFor="wf-trigger" className="mb-1 block text-sm font-medium">
            Trigger
          </label>
          <input
            id="wf-trigger"
            type="text"
            value={triggerDescription}
            onChange={(e) => setTriggerDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What triggers this workflow?"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createWorkflow.isPending}>
            {createWorkflow.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
