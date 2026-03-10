import type { PolicyDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const typeLabels: Record<string, string> = {
  'approval-gate': 'Approval Gate',
  constraint: 'Constraint',
  rule: 'Rule',
}

const enforcementVariants: Record<string, 'default' | 'outline'> = {
  mandatory: 'default',
  advisory: 'outline',
}

const statusVariants: Record<string, 'default' | 'secondary'> = {
  active: 'default',
  inactive: 'secondary',
}

interface PolicyListProps {
  policies: PolicyDto[]
  resolveDepartmentName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

export function PolicyList({ policies, resolveDepartmentName, onDelete }: PolicyListProps) {
  if (policies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No policies yet. Create your first policy to get started.
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
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Scope</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enforcement</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {policies.map((policy) => (
            <tr key={policy.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{policy.name}</td>
              <td className="px-4 py-3">{typeLabels[policy.type] ?? policy.type}</td>
              <td className="px-4 py-3">
                {policy.scope === 'global'
                  ? 'Global'
                  : policy.departmentId
                    ? resolveDepartmentName(policy.departmentId) ?? '\u2014'
                    : '\u2014'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={enforcementVariants[policy.enforcement] ?? 'outline'}>
                  {policy.enforcement}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariants[policy.status] ?? 'secondary'}>
                  {policy.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(policy.id)}
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
