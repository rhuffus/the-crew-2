import type { DepartmentDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DepartmentCardProps {
  department: DepartmentDto
  parentName?: string
  onDelete: (id: string) => void
  onEdit: (department: DepartmentDto) => void
}

export function DepartmentCard({ department, parentName, onDelete, onEdit }: DepartmentCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <button
          type="button"
          onClick={() => onEdit(department)}
          className="text-left"
        >
          <h4 className="font-semibold text-card-foreground hover:text-primary">
            {department.name}
          </h4>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(department.id)}
          aria-label={`Delete ${department.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {department.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{department.description}</p>
      )}
      {department.mandate && (
        <div className="mt-2">
          <span className="text-xs font-medium text-muted-foreground">Mandate: </span>
          <span className="text-xs text-muted-foreground">{department.mandate}</span>
        </div>
      )}
      <div className="mt-2 flex gap-2">
        {parentName && <Badge variant="outline">{parentName}</Badge>}
      </div>
    </div>
  )
}
