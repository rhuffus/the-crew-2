import { useState } from 'react'
import type { DepartmentDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateDepartment } from '@/hooks/use-departments'

interface CreateDepartmentFormProps {
  projectId: string
  departments: DepartmentDto[]
  onClose: () => void
}

export function CreateDepartmentForm({ projectId, departments, onClose }: CreateDepartmentFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mandate, setMandate] = useState('')
  const [parentId, setParentId] = useState('')
  const createDepartment = useCreateDepartment(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setMandate('')
    setParentId('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createDepartment.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        mandate: mandate.trim(),
        parentId: parentId || null,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Department</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="dept-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="dept-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Engineering"
          />
        </div>
        <div>
          <label htmlFor="dept-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="dept-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div>
          <label htmlFor="dept-mandate" className="mb-1 block text-sm font-medium">
            Mandate
          </label>
          <textarea
            id="dept-mandate"
            value={mandate}
            onChange={(e) => setMandate(e.target.value)}
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What is this department responsible for?"
          />
        </div>
        {departments.length > 0 && (
          <div>
            <label htmlFor="dept-parent" className="mb-1 block text-sm font-medium">
              Parent Department
            </label>
            <select
              id="dept-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">None (top-level)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createDepartment.isPending}>
            {createDepartment.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
