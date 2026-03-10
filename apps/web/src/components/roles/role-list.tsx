import type { RoleDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoleListProps {
  roles: RoleDto[]
  resolveDepartmentName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function RoleList({ roles, resolveDepartmentName, onDelete }: RoleListProps) {
  if (roles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No roles yet. Create your first role to get started.
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
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accountability</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Authority</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{role.name}</td>
              <td className="px-4 py-3">
                {resolveDepartmentName(role.departmentId) ?? '\u2014'}
              </td>
              <td className="max-w-xs truncate px-4 py-3">{role.accountability}</td>
              <td className="max-w-xs truncate px-4 py-3">{role.authority}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(role.id)}
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
