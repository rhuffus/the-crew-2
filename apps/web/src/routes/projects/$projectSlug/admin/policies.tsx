import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { usePolicies, useDeletePolicy } from '@/hooks/use-policies'
import { useDepartments } from '@/hooks/use-departments'
import { PolicyList } from '@/components/policies/policy-list'
import { CreatePolicyForm } from '@/components/policies/create-policy-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCurrentProject } from '@/providers/project-provider'

export const Route = createFileRoute('/projects/$projectSlug/admin/policies')({
  component: PoliciesPage,
})

function PoliciesPage() {
  const { projectId } = useCurrentProject()
  const { data: policies, isLoading, error } = usePolicies(projectId)
  const { data: departments } = useDepartments(projectId)
  const deletePolicy = useDeletePolicy(projectId)
  const [showForm, setShowForm] = useState(false)

  const deptMap = new Map((departments ?? []).map((d) => [d.id, d.name]))

  function resolveDepartmentName(id: string) {
    return deptMap.get(id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Policies</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Policy
          </Button>
        )}
      </div>
      {showForm && (
        <CreatePolicyForm
          projectId={projectId}
          departments={departments ?? []}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading policies...</p>}
      {error && <p className="text-destructive">Failed to load policies.</p>}
      {policies && (
        <PolicyList
          policies={policies}
          resolveDepartmentName={resolveDepartmentName}
          onDelete={(id) => deletePolicy.mutate(id)}
        />
      )}
    </div>
  )
}
