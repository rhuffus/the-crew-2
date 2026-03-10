import { useState } from 'react'
import type { DepartmentDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateRole } from '@/hooks/use-roles'

interface CreateRoleFormProps {
  projectId: string
  departments: DepartmentDto[]
  onClose: () => void
}

export function CreateRoleForm({ projectId, departments, onClose }: CreateRoleFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [accountability, setAccountability] = useState('')
  const [authority, setAuthority] = useState('')
  const createRole = useCreateRole(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setDepartmentId('')
    setAccountability('')
    setAuthority('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createRole.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        departmentId,
        accountability: accountability.trim() || undefined,
        authority: authority.trim() || undefined,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Role</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="role-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="role-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Product Manager"
          />
        </div>
        <div>
          <label htmlFor="role-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="role-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div>
          <label htmlFor="role-department" className="mb-1 block text-sm font-medium">
            Department
          </label>
          <select
            id="role-department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select department...</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role-accountability" className="mb-1 block text-sm font-medium">
            Accountability
          </label>
          <input
            id="role-accountability"
            type="text"
            value={accountability}
            onChange={(e) => setAccountability(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What is this role accountable for?"
          />
        </div>
        <div>
          <label htmlFor="role-authority" className="mb-1 block text-sm font-medium">
            Authority
          </label>
          <input
            id="role-authority"
            type="text"
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What decision power does this role have?"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createRole.isPending}>
            {createRole.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
