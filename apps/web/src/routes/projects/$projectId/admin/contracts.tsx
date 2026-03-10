import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useContracts, useDeleteContract } from '@/hooks/use-contracts'
import { useDepartments } from '@/hooks/use-departments'
import { useCapabilities } from '@/hooks/use-capabilities'
import { ContractList } from '@/components/contracts/contract-list'
import { CreateContractForm } from '@/components/contracts/create-contract-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/contracts')({
  component: ContractsPage,
})

function ContractsPage() {
  const { projectId } = Route.useParams()
  const { data: contracts, isLoading, error } = useContracts(projectId)
  const { data: departments } = useDepartments(projectId)
  const { data: capabilities } = useCapabilities(projectId)
  const deleteContract = useDeleteContract(projectId)
  const [showForm, setShowForm] = useState(false)

  const deptMap = new Map((departments ?? []).map((d) => [d.id, d.name]))
  const capMap = new Map((capabilities ?? []).map((c) => [c.id, c.name]))

  function resolvePartyName(id: string, type: string) {
    return type === 'department' ? deptMap.get(id) : capMap.get(id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Contracts</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Contract
          </Button>
        )}
      </div>
      {showForm && (
        <CreateContractForm
          projectId={projectId}
          departments={departments ?? []}
          capabilities={capabilities ?? []}
          onClose={() => setShowForm(false)}
        />
      )}
      {isLoading && <p className="text-muted-foreground">Loading contracts...</p>}
      {error && <p className="text-destructive">Failed to load contracts.</p>}
      {contracts && (
        <ContractList
          contracts={contracts}
          resolvePartyName={resolvePartyName}
          onDelete={(id) => deleteContract.mutate(id)}
        />
      )}
    </div>
  )
}
