import { useState } from 'react'
import type { DepartmentDto, RoleDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateAgentArchetype } from '@/hooks/use-agent-archetypes'

interface CreateArchetypeFormProps {
  projectId: string
  departments: DepartmentDto[]
  roles: RoleDto[]
  onClose: () => void
}

export function CreateArchetypeForm({ projectId, departments, roles, onClose }: CreateArchetypeFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [roleId, setRoleId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const createArchetype = useCreateAgentArchetype(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setRoleId('')
    setDepartmentId('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createArchetype.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        roleId,
        departmentId,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Agent Archetype</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="archetype-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="archetype-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Deployment Bot"
          />
        </div>
        <div>
          <label htmlFor="archetype-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="archetype-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div>
          <label htmlFor="archetype-role" className="mb-1 block text-sm font-medium">
            Role
          </label>
          <select
            id="archetype-role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select role...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="archetype-department" className="mb-1 block text-sm font-medium">
            Department
          </label>
          <select
            id="archetype-department"
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
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createArchetype.isPending}>
            {createArchetype.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
