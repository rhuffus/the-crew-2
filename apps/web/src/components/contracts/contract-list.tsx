import type { ContractDto } from '@the-crew/shared-types'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const typeLabels: Record<string, string> = {
  SLA: 'SLA',
  DataContract: 'Data Contract',
  InterfaceContract: 'Interface',
  OperationalAgreement: 'Ops Agreement',
}

const statusVariants: Record<string, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  deprecated: 'outline',
}

interface ContractListProps {
  contracts: ContractDto[]
  resolvePartyName: (id: string, type: string) => string | undefined
  onDelete: (id: string) => void
}

export function ContractList({ contracts, resolvePartyName, onDelete }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No contracts yet. Create your first contract to get started.
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
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consumer</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {contracts.map((contract) => (
            <tr key={contract.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{contract.name}</td>
              <td className="px-4 py-3">{typeLabels[contract.type] ?? contract.type}</td>
              <td className="px-4 py-3">
                {resolvePartyName(contract.providerId, contract.providerType) ?? '\u2014'}
              </td>
              <td className="px-4 py-3">
                {resolvePartyName(contract.consumerId, contract.consumerType) ?? '\u2014'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariants[contract.status] ?? 'secondary'}>
                  {contract.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(contract.id)}
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
