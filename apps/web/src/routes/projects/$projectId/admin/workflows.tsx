import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useWorkflows, useDeleteWorkflow } from '@/hooks/use-workflows'
import { useDepartments } from '@/hooks/use-departments'
import { WorkflowList } from '@/components/workflows/workflow-list'
import { CreateWorkflowForm } from '@/components/workflows/create-workflow-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/workflows')({
  component: WorkflowsPage,
})

function WorkflowsPage() {
  const { projectId } = Route.useParams()
  const { data: workflows, isLoading, error } = useWorkflows(projectId)
  const { data: departments } = useDepartments(projectId)
  const deleteWorkflow = useDeleteWorkflow(projectId)
  const [showForm, setShowForm] = useState(false)

  const deptMap = new Map((departments ?? []).map((d) => [d.id, d.name]))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Workflows</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Workflow
          </Button>
        )}
      </div>
      {showForm && (
        <CreateWorkflowForm
          projectId={projectId}
          departments={departments ?? []}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading workflows...</p>}
      {error && <p className="text-destructive">Failed to load workflows.</p>}
      {workflows && (
        <WorkflowList
          workflows={workflows}
          resolveDeptName={(id) => deptMap.get(id)}
          onDelete={(id) => deleteWorkflow.mutate(id)}
        />
      )}
    </div>
  )
}
