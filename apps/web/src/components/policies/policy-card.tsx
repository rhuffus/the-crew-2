import type { PolicyDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface PolicyCardProps {
  policy: PolicyDto
  resolveDepartmentName: (id: string) => string | undefined
  onDelete: (id: string) => void
}

const statusVariant: Record<string, 'default' | 'secondary'> = {
  active: 'default',
  inactive: 'secondary',
}

const typeLabels: Record<string, string> = {
  'approval-gate': 'Approval Gate',
  constraint: 'Constraint',
  rule: 'Rule',
}

const enforcementVariant: Record<string, 'default' | 'outline'> = {
  mandatory: 'default',
  advisory: 'outline',
}

export function PolicyCard({ policy, resolveDepartmentName, onDelete }: PolicyCardProps) {
  const scopeLabel =
    policy.scope === 'department'
      ? resolveDepartmentName(policy.departmentId ?? '') ?? policy.departmentId
      : 'Global'

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-card-foreground">{policy.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(policy.id)}
          aria-label={`Delete ${policy.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {policy.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{policy.description}</p>
      )}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Scope:</span>
          <span>{scopeLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Condition:</span>
          <span className="line-clamp-1">{policy.condition}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        <Badge variant={statusVariant[policy.status] ?? 'secondary'}>{policy.status}</Badge>
        <Badge variant="outline">{typeLabels[policy.type] ?? policy.type}</Badge>
        <Badge variant={enforcementVariant[policy.enforcement] ?? 'outline'}>
          {policy.enforcement}
        </Badge>
      </div>
    </div>
  )
}
