import { Building2, Users, UsersRound } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { useOrganizationalUnit } from '@/hooks/use-organizational-units'

const UO_TYPE_ICONS: Record<string, typeof Building2> = {
  company: Building2,
  department: Users,
  team: UsersRound,
}

interface UoDetailPanelProps {
  entityId: string
  nodeType: NodeType
  projectId: string
}

export function UoDetailPanel({ entityId, projectId }: UoDetailPanelProps) {
  const { data: uo, isLoading } = useOrganizationalUnit(projectId, entityId)

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>
  if (!uo) return <p className="text-xs text-muted-foreground">Not found</p>

  const Icon = UO_TYPE_ICONS[uo.uoType] ?? Building2

  return (
    <div className="space-y-3" data-testid="uo-detail-panel">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium capitalize text-muted-foreground">{uo.uoType}</span>
      </div>

      <div>
        <h4 className="text-sm font-semibold">{uo.name}</h4>
        {uo.purpose && <p className="mt-1 text-xs text-muted-foreground">{uo.purpose}</p>}
      </div>

      {uo.mandate && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Mandate</h5>
          <p className="mt-0.5 text-xs">{uo.mandate}</p>
        </div>
      )}

      {uo.functions && uo.functions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Functions</h5>
          <ul className="mt-0.5 space-y-0.5">
            {uo.functions.map((fn: string, i: number) => (
              <li key={i} className="text-xs">• {fn}</li>
            ))}
          </ul>
        </div>
      )}

      {uo.coordinatorAgentId && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Coordinator</h5>
          <p className="mt-0.5 text-xs font-mono">{uo.coordinatorAgentId}</p>
        </div>
      )}

      <div>
        <h5 className="text-xs font-medium text-muted-foreground">Status</h5>
        <span className="mt-0.5 inline-flex rounded bg-muted px-1.5 py-0.5 text-xs capitalize">{uo.status ?? 'active'}</span>
      </div>
    </div>
  )
}
