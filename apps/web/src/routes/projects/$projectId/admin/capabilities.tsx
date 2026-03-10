import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useCapabilities, useDeleteCapability } from '@/hooks/use-capabilities'
import { useDepartments } from '@/hooks/use-departments'
import { CapabilityList } from '@/components/capabilities/capability-list'
import { CreateCapabilityForm } from '@/components/capabilities/create-capability-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/capabilities')({
  component: CapabilitiesPage,
})

function CapabilitiesPage() {
  const { projectId } = Route.useParams()
  const { data: capabilities, isLoading, error } = useCapabilities(projectId)
  const { data: departments } = useDepartments(projectId)
  const deleteCapability = useDeleteCapability(projectId)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Capabilities</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Capability
          </Button>
        )}
      </div>
      {showForm && (
        <CreateCapabilityForm
          projectId={projectId}
          departments={departments ?? []}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading capabilities...</p>}
      {error && <p className="text-destructive">Failed to load capabilities.</p>}
      {capabilities && (
        <CapabilityList
          capabilities={capabilities}
          departments={departments ?? []}
          onDelete={(id) => deleteCapability.mutate(id)}
          onEdit={() => {}}
        />
      )}
    </div>
  )
}
