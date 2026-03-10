import type { ContractDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface ContractCardProps {
  contract: ContractDto
  resolvePartyName: (id: string, type: string) => string | undefined
  onDelete: (id: string) => void
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  active: 'default',
  deprecated: 'outline',
}

const typeLabels: Record<string, string> = {
  SLA: 'SLA',
  DataContract: 'Data Contract',
  InterfaceContract: 'Interface Contract',
  OperationalAgreement: 'Operational Agreement',
}

export function ContractCard({ contract, resolvePartyName, onDelete }: ContractCardProps) {
  const providerName = resolvePartyName(contract.providerId, contract.providerType) ?? contract.providerId
  const consumerName = resolvePartyName(contract.consumerId, contract.consumerType) ?? contract.consumerId

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-card-foreground">{contract.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(contract.id)}
          aria-label={`Delete ${contract.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {contract.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{contract.description}</p>
      )}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Provider:</span>
          <span>{providerName}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Consumer:</span>
          <span>{consumerName}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        <Badge variant={statusVariant[contract.status] ?? 'secondary'}>{contract.status}</Badge>
        <Badge variant="outline">{typeLabels[contract.type] ?? contract.type}</Badge>
        {contract.acceptanceCriteria.length > 0 && (
          <Badge variant="secondary">
            {contract.acceptanceCriteria.length} criteria
          </Badge>
        )}
      </div>
    </div>
  )
}
