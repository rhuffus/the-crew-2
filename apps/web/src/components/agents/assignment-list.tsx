import type { AgentAssignmentDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusVariants: Record<string, 'default' | 'secondary'> = {
  active: 'default',
  inactive: 'secondary',
}

interface AssignmentListProps {
  assignments: AgentAssignmentDto[]
  resolveArchetypeName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function AssignmentList({ assignments, resolveArchetypeName, onDelete }: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No agent assignments yet. Create your first assignment to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Archetype</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{assignment.name}</td>
              <td className="px-4 py-3">
                {resolveArchetypeName(assignment.archetypeId) ?? '\u2014'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariants[assignment.status] ?? 'secondary'}>
                  {assignment.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(assignment.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
