import { useState } from 'react'
import type {
  PolicyType,
  PolicyEnforcement,
  PolicyScope,
  DepartmentDto,
} from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useCreatePolicy } from '@/hooks/use-policies'

interface CreatePolicyFormProps {
  projectId: string
  departments: DepartmentDto[]
  onClose: () => void
}

const POLICY_TYPES: { value: PolicyType; label: string }[] = [
  { value: 'approval-gate', label: 'Approval Gate' },
  { value: 'constraint', label: 'Constraint' },
  { value: 'rule', label: 'Rule' },
]

const ENFORCEMENT_OPTIONS: { value: PolicyEnforcement; label: string }[] = [
  { value: 'mandatory', label: 'Mandatory' },
  { value: 'advisory', label: 'Advisory' },
]

export function CreatePolicyForm({ projectId, departments, onClose }: CreatePolicyFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scope, setScope] = useState<PolicyScope>('global')
  const [departmentId, setDepartmentId] = useState('')
  const [type, setType] = useState<PolicyType>('constraint')
  const [condition, setCondition] = useState('')
  const [enforcement, setEnforcement] = useState<PolicyEnforcement>('mandatory')
  const createPolicy = useCreatePolicy(projectId)

  function resetForm() {
    setName('')
    setDescription('')
    setScope('global')
    setDepartmentId('')
    setType('constraint')
    setCondition('')
    setEnforcement('mandatory')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createPolicy.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        scope,
        departmentId: scope === 'department' ? departmentId : undefined,
        type,
        condition: condition.trim(),
        enforcement,
      },
      { onSuccess: resetForm },
    )
  }

  return (
    <div className="mx-auto mb-6 max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-base font-semibold">Create Policy</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="policy-name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="policy-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="No unassigned roles"
          />
        </div>
        <div>
          <label htmlFor="policy-description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <input
            id="policy-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Brief description..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="policy-scope" className="mb-1 block text-sm font-medium">
              Scope
            </label>
            <select
              id="policy-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as PolicyScope)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="global">Global</option>
              <option value="department">Department</option>
            </select>
          </div>
          {scope === 'department' && (
            <div>
              <label htmlFor="policy-department" className="mb-1 block text-sm font-medium">
                Department
              </label>
              <select
                id="policy-department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="policy-type" className="mb-1 block text-sm font-medium">
              Type
            </label>
            <select
              id="policy-type"
              value={type}
              onChange={(e) => setType(e.target.value as PolicyType)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {POLICY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="policy-enforcement" className="mb-1 block text-sm font-medium">
              Enforcement
            </label>
            <select
              id="policy-enforcement"
              value={enforcement}
              onChange={(e) => setEnforcement(e.target.value as PolicyEnforcement)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ENFORCEMENT_OPTIONS.map((eo) => (
                <option key={eo.value} value={eo.value}>
                  {eo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="policy-condition" className="mb-1 block text-sm font-medium">
            Condition
          </label>
          <textarea
            id="policy-condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="All roles must have a department assignment"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={createPolicy.isPending}>
            {createPolicy.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
