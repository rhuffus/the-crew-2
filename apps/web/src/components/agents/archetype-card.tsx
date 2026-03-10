import type { AgentArchetypeDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface ArchetypeCardProps {
  archetype: AgentArchetypeDto
  resolveRoleName: (id: string) => string | undefined
  resolveDepartmentName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function ArchetypeCard({ archetype, resolveRoleName, resolveDepartmentName, onDelete }: ArchetypeCardProps) {
  const roleName = resolveRoleName(archetype.roleId) ?? archetype.roleId
  const deptName = resolveDepartmentName(archetype.departmentId) ?? archetype.departmentId

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-card-foreground">{archetype.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(archetype.id)}
          aria-label={`Delete ${archetype.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {archetype.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{archetype.description}</p>
      )}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Role:</span>
          <span>{roleName}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Department:</span>
          <span>{deptName}</span>
        </div>
        {archetype.constraints.maxConcurrency != null && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium">Max concurrency:</span>
            <span>{archetype.constraints.maxConcurrency}</span>
          </div>
        )}
      </div>
      {archetype.skillIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="outline">{archetype.skillIds.length} skills</Badge>
        </div>
      )}
    </div>
  )
}
