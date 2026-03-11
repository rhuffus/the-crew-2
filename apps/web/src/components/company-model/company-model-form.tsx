import { useState, useEffect } from 'react'
import type { CompanyModelDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useUpdateCompanyModel } from '@/hooks/use-company-model'
import { Save, Plus, X } from 'lucide-react'

interface CompanyModelFormProps {
  model: CompanyModelDto
}

export function CompanyModelForm({ model }: CompanyModelFormProps) {
  const [purpose, setPurpose] = useState(model.purpose)
  const [type, setType] = useState(model.type)
  const [scope, setScope] = useState(model.scope)
  const [principles, setPrinciples] = useState<string[]>(model.principles)
  const updateModel = useUpdateCompanyModel(model.projectId)

  useEffect(() => {
    setPurpose(model.purpose)
    setType(model.type)
    setScope(model.scope)
    setPrinciples(model.principles)
  }, [model])

  const hasChanges =
    purpose !== model.purpose ||
    type !== model.type ||
    scope !== model.scope ||
    JSON.stringify(principles) !== JSON.stringify(model.principles)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateModel.mutate({ purpose, type, scope, principles })
  }

  function addPrinciple() {
    setPrinciples([...principles, ''])
  }

  function updatePrinciple(index: number, value: string) {
    const updated = [...principles]
    updated[index] = value
    setPrinciples(updated)
  }

  function removePrinciple(index: number) {
    setPrinciples(principles.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="cm-purpose" className="mb-1 block text-sm font-medium">
          Purpose
        </label>
        <textarea
          id="cm-purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="What is this company's reason for existing?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cm-type" className="mb-1 block text-sm font-medium">
            Type
          </label>
          <input
            id="cm-type"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. SaaS, Marketplace, Agency"
          />
        </div>
        <div>
          <label htmlFor="cm-scope" className="mb-1 block text-sm font-medium">
            Scope
          </label>
          <input
            id="cm-scope"
            type="text"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. Global, EMEA, B2B Enterprise"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium">Principles</label>
          <Button type="button" variant="ghost" size="sm" onClick={addPrinciple}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        {principles.length === 0 && (
          <p className="text-sm text-muted-foreground">No principles defined yet.</p>
        )}
        <div className="space-y-2">
          {principles.map((principle, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={principle}
                onChange={(e) => updatePrinciple(index, e.target.value)}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={`Principle ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePrinciple(index)}
                aria-label={`Remove principle ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={!hasChanges || updateModel.isPending}>
          <Save className="mr-1.5 h-4 w-4" />
          {updateModel.isPending ? 'Updating...' : 'Update'}
        </Button>
        {updateModel.isSuccess && (
          <span className="text-sm text-emerald-600">Updated</span>
        )}
      </div>
    </form>
  )
}
