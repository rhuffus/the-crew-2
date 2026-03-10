import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { DepartmentDto } from '@the-crew/shared-types'
import { useDepartments, useDeleteDepartment, useUpdateDepartment } from '@/hooks/use-departments'
import { DepartmentList } from '@/components/departments/department-list'
import { CreateDepartmentForm } from '@/components/departments/create-department-form'
import { Button } from '@/components/ui/button'
import { Plus, Save } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/departments')({
  component: DepartmentsPage,
})

function DepartmentsPage() {
  const { projectId } = Route.useParams()
  const { data: departments, isLoading, error } = useDepartments(projectId)
  const deleteDepartment = useDeleteDepartment(projectId)
  const [editing, setEditing] = useState<DepartmentDto | null>(null)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Departments</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Department
          </Button>
        )}
      </div>
      {showForm && (
        <CreateDepartmentForm
          projectId={projectId}
          departments={departments ?? []}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading departments...</p>}
      {error && <p className="text-destructive">Failed to load departments.</p>}
      {departments && (
        <>
          <DepartmentList
            departments={departments}
            onDelete={(id) => deleteDepartment.mutate(id)}
            onEdit={(dept) => setEditing(dept)}
          />
          {editing && (
            <EditDepartmentPanel
              projectId={projectId}
              department={editing}
              onClose={() => setEditing(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

function EditDepartmentPanel({
  projectId,
  department,
  onClose,
}: {
  projectId: string
  department: DepartmentDto
  onClose: () => void
}) {
  const [name, setName] = useState(department.name)
  const [description, setDescription] = useState(department.description)
  const [mandate, setMandate] = useState(department.mandate)
  const updateDepartment = useUpdateDepartment(projectId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateDepartment.mutate(
      { id: department.id, dto: { name, description, mandate } },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="mt-6 rounded-lg border bg-card p-4 shadow-sm">
      <h4 className="mb-3 font-semibold">Edit Department</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="edit-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="edit-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="edit-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="edit-mandate" className="mb-1 block text-sm font-medium">
            Mandate
          </label>
          <textarea
            id="edit-mandate"
            value={mandate}
            onChange={(e) => setMandate(e.target.value)}
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={updateDepartment.isPending}>
            <Save className="mr-1.5 h-4 w-4" />
            {updateDepartment.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
