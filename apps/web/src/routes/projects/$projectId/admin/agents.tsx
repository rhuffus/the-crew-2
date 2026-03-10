import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAgentArchetypes, useDeleteAgentArchetype } from '@/hooks/use-agent-archetypes'
import { useAgentAssignments, useDeleteAgentAssignment } from '@/hooks/use-agent-assignments'
import { useDepartments } from '@/hooks/use-departments'
import { useRoles } from '@/hooks/use-roles'
import { ArchetypeList } from '@/components/agents/archetype-list'
import { CreateArchetypeForm } from '@/components/agents/create-archetype-form'
import { AssignmentList } from '@/components/agents/assignment-list'
import { CreateAssignmentForm } from '@/components/agents/create-assignment-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/agents')({
  component: AgentsPage,
})

function AgentsPage() {
  const { projectId } = Route.useParams()
  const { data: archetypes, isLoading: loadingArchetypes, error: archetypesError } = useAgentArchetypes(projectId)
  const { data: assignments, isLoading: loadingAssignments, error: assignmentsError } = useAgentAssignments(projectId)
  const { data: departments } = useDepartments(projectId)
  const { data: roles } = useRoles(projectId)
  const deleteArchetype = useDeleteAgentArchetype(projectId)
  const deleteAssignment = useDeleteAgentAssignment(projectId)
  const [showArchetypeForm, setShowArchetypeForm] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)

  const deptMap = new Map((departments ?? []).map((d) => [d.id, d.name]))
  const roleMap = new Map((roles ?? []).map((r) => [r.id, r.name]))
  const archetypeMap = new Map((archetypes ?? []).map((a) => [a.id, a.name]))

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Agent Archetypes</h3>
          {!showArchetypeForm && (
            <Button onClick={() => setShowArchetypeForm(true)} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Archetype
            </Button>
          )}
        </div>
        {showArchetypeForm && (
          <CreateArchetypeForm
            projectId={projectId}
            departments={departments ?? []}
            roles={roles ?? []}
            onClose={() => setShowArchetypeForm(false)}
          />
        )}
        {loadingArchetypes && <p className="text-muted-foreground">Loading archetypes...</p>}
        {archetypesError && <p className="text-destructive">Failed to load archetypes.</p>}
        {archetypes && (
          <ArchetypeList
            archetypes={archetypes}
            resolveRoleName={(id) => roleMap.get(id)}
            resolveDepartmentName={(id) => deptMap.get(id)}
            onDelete={(id) => deleteArchetype.mutate(id)}
          />
        )}
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Agent Assignments</h3>
          {!showAssignmentForm && (
            <Button onClick={() => setShowAssignmentForm(true)} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Assignment
            </Button>
          )}
        </div>
        {showAssignmentForm && (
          <CreateAssignmentForm
            projectId={projectId}
            archetypes={archetypes ?? []}
            onClose={() => setShowAssignmentForm(false)}
          />
        )}
        {loadingAssignments && <p className="text-muted-foreground">Loading assignments...</p>}
        {assignmentsError && <p className="text-destructive">Failed to load assignments.</p>}
        {assignments && (
          <AssignmentList
            assignments={assignments}
            resolveArchetypeName={(id) => archetypeMap.get(id)}
            onDelete={(id) => deleteAssignment.mutate(id)}
          />
        )}
      </div>
    </div>
  )
}
