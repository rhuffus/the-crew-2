import type { RoleDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface RoleCardProps {
  role: RoleDto
  resolveDepartmentName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function RoleCard({ role, resolveDepartmentName, onDelete }: RoleCardProps) {
  const deptName = resolveDepartmentName(role.departmentId) ?? role.departmentId

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-card-foreground">{role.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(role.id)}
          aria-label={`Delete ${role.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {role.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{role.description}</p>
      )}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Department:</span>
          <span>{deptName}</span>
        </div>
        {role.accountability && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium">Accountability:</span>
            <span className="line-clamp-1">{role.accountability}</span>
          </div>
        )}
        {role.authority && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium">Authority:</span>
            <span className="line-clamp-1">{role.authority}</span>
          </div>
        )}
      </div>
      {role.capabilityIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="outline">{role.capabilityIds.length} capabilities</Badge>
        </div>
      )}
    </div>
  )
}
