import type { AgentArchetypeDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArchetypeListProps {
  archetypes: AgentArchetypeDto[]
  resolveRoleName: (id: string) => string | undefined
  resolveDepartmentName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function ArchetypeList({ archetypes, resolveRoleName, resolveDepartmentName, onDelete }: ArchetypeListProps) {
  if (archetypes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No agent archetypes yet. Create your first archetype to get started.
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
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Skills</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {archetypes.map((archetype) => (
            <tr key={archetype.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{archetype.name}</td>
              <td className="px-4 py-3">
                {resolveRoleName(archetype.roleId) ?? '\u2014'}
              </td>
              <td className="px-4 py-3">
                {resolveDepartmentName(archetype.departmentId) ?? '\u2014'}
              </td>
              <td className="px-4 py-3">{archetype.skillIds.length}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(archetype.id)}
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
