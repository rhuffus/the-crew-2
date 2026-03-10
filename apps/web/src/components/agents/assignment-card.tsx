import type { AgentAssignmentDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface AssignmentCardProps {
  assignment: AgentAssignmentDto
  resolveArchetypeName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function AssignmentCard({ assignment, resolveArchetypeName, onDelete }: AssignmentCardProps) {
  const archetypeName = resolveArchetypeName(assignment.archetypeId) ?? assignment.archetypeId

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-card-foreground">{assignment.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(assignment.id)}
          aria-label={`Delete ${assignment.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Archetype:</span>
          <span>{archetypeName}</span>
        </div>
      </div>
      <div className="mt-3">
        <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
          {assignment.status}
        </Badge>
      </div>
    </div>
  )
}
