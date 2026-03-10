import type { WorkflowDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusVariants: Record<string, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
}

interface WorkflowListProps {
  workflows: WorkflowDto[]
  resolveDeptName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function WorkflowList({ workflows, resolveDeptName, onDelete }: WorkflowListProps) {
  if (workflows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No workflows yet. Create your first workflow to get started.
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
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stages</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {workflows.map((wf) => (
            <tr key={wf.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{wf.name}</td>
              <td className="px-4 py-3">
                {wf.ownerDepartmentId ? resolveDeptName(wf.ownerDepartmentId) ?? '\u2014' : '\u2014'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariants[wf.status] ?? 'secondary'}>
                  {wf.status}
                </Badge>
              </td>
              <td className="px-4 py-3">{wf.stages.length}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(wf.id)}
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
