import type { CapabilityDto, DepartmentDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CapabilityListProps {
  capabilities: CapabilityDto[]
  departments: DepartmentDto[]
  onDelete: (id: string) => void
  onEdit: (capability: CapabilityDto) => void
}

export function CapabilityList({
  capabilities,
  departments,
  onDelete,
  onEdit,
}: CapabilityListProps) {
  if (capabilities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No capabilities yet. Create your first capability to get started.
        </p>
      </div>
    )
  }

  const deptMap = new Map(departments.map((d) => [d.id, d.name]))

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Inputs</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Outputs</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {capabilities.map((cap) => (
            <tr key={cap.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="cursor-pointer font-medium text-primary hover:underline"
                  onClick={() => onEdit(cap)}
                >
                  {cap.name}
                </button>
              </td>
              <td className="max-w-xs truncate px-4 py-3">{cap.description}</td>
              <td className="px-4 py-3">
                {cap.ownerDepartmentId ? deptMap.get(cap.ownerDepartmentId) ?? '\u2014' : '\u2014'}
              </td>
              <td className="px-4 py-3">{cap.inputs.length}</td>
              <td className="px-4 py-3">{cap.outputs.length}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(cap.id)}
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
