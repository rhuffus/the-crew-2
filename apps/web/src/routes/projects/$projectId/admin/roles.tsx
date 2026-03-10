import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useRoles, useDeleteRole } from '@/hooks/use-roles'
import { useDepartments } from '@/hooks/use-departments'
import { RoleList } from '@/components/roles/role-list'
import { CreateRoleForm } from '@/components/roles/create-role-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/roles')({
  component: RolesPage,
})

function RolesPage() {
  const { projectId } = Route.useParams()
  const { data: roles, isLoading, error } = useRoles(projectId)
  const { data: departments } = useDepartments(projectId)
  const deleteRole = useDeleteRole(projectId)
  const [showForm, setShowForm] = useState(false)

  const deptMap = new Map((departments ?? []).map((d) => [d.id, d.name]))

  function resolveDepartmentName(id: string) {
    return deptMap.get(id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Roles</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Role
          </Button>
        )}
      </div>
      {showForm && (
        <CreateRoleForm
          projectId={projectId}
          departments={departments ?? []}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading roles...</p>}
      {error && <p className="text-destructive">Failed to load roles.</p>}
      {roles && (
        <RoleList
          roles={roles}
          resolveDepartmentName={resolveDepartmentName}
          onDelete={(id) => deleteRole.mutate(id)}
        />
      )}
    </div>
  )
}
