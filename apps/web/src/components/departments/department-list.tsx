import type { DepartmentDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DepartmentListProps {
  departments: DepartmentDto[]
  onDelete: (id: string) => void
  onEdit: (department: DepartmentDto) => void
}

export function DepartmentList({ departments, onDelete, onEdit }: DepartmentListProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No departments yet. Create your first department to get started.
        </p>
      </div>
    )
  }

  const parentMap = new Map(departments.map((d) => [d.id, d.name]))

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mandate</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Parent</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {departments.map((dept) => (
            <tr key={dept.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="cursor-pointer font-medium text-primary hover:underline"
                  onClick={() => onEdit(dept)}
                >
                  {dept.name}
                </button>
              </td>
              <td className="max-w-xs truncate px-4 py-3">{dept.description}</td>
              <td className="max-w-xs truncate px-4 py-3">{dept.mandate}</td>
              <td className="px-4 py-3">
                {dept.parentId ? parentMap.get(dept.parentId) ?? '\u2014' : '\u2014'}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(dept.id)}
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
