import { useState } from 'react'
import type { ContractType, PartyType, DepartmentDto, CapabilityDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreateContract } from '@/hooks/use-contracts'

interface CreateContractFormProps {
  projectId: string
  departments: DepartmentDto[]
  capabilities: CapabilityDto[]
  onClose: () => void
}

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'SLA', label: 'SLA' },
  { value: 'DataContract', label: 'Data Contract' },
  { value: 'InterfaceContract', label: 'Interface Contract' },
  { value: 'OperationalAgreement', label: 'Operational Agreement' },
]

function partyOptions(departments: DepartmentDto[], capabilities: CapabilityDto[]) {
  return [
    ...departments.map((d) => ({ id: d.id, type: 'department' as PartyType, label: `Dept: ${d.name}` })),
    ...capabilities.map((c) => ({ id: c.id, type: 'capability' as PartyType, label: `Cap: ${c.name}` })),
  ]
}

export function CreateContractForm({ projectId, departments, capabilities, onClose }: CreateContractFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ContractType>('SLA')
  const [provider, setProvider] = useState('')
  const [consumer, setConsumer] = useState('')
  const createContract = useCreateContract(projectId)

  const parties = partyOptions(departments, capabilities)

  function resetForm() {
    setName('')
    setDescription('')
    setType('SLA')
    setProvider('')
    setConsumer('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const providerParty = parties.find((p) => `${p.type}:${p.id}` === provider)
    const consumerParty = parties.find((p) => `${p.type}:${p.id}` === consumer)
    if (!providerParty || !consumerParty) return
    createContract.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        type,
        providerId: providerParty.id,
        providerType: providerParty.type,
        consumerId: consumerParty.id,
        consumerType: consumerParty.type,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Contract</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="contract-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="contract-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Data Delivery SLA"
          />
        </div>
        <div>
          <label htmlFor="contract-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="contract-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div>
          <label htmlFor="contract-type" className="mb-1 block text-sm font-medium">
            Type
          </label>
          <select
            id="contract-type"
            value={type}
            onChange={(e) => setType(e.target.value as ContractType)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CONTRACT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contract-provider" className="mb-1 block text-sm font-medium">
            Provider
          </label>
          <select
            id="contract-provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select provider...</option>
            {parties.map((p) => (
              <option key={`provider-${p.type}:${p.id}`} value={`${p.type}:${p.id}`}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contract-consumer" className="mb-1 block text-sm font-medium">
            Consumer
          </label>
          <select
            id="contract-consumer"
            value={consumer}
            onChange={(e) => setConsumer(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select consumer...</option>
            {parties.map((p) => (
              <option key={`consumer-${p.type}:${p.id}`} value={`${p.type}:${p.id}`}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createContract.isPending}>
            {createContract.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
