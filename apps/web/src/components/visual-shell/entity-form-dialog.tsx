import { useState, useCallback, useEffect, useRef, useId } from 'react'
import { X } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { getSchemaForType } from '@/lib/entity-form-schemas'
import type { FormFieldSchema } from '@/lib/entity-form-schemas'
import { useEntityFormData } from '@/hooks/use-entity-form-data'
import { useFocusTrap } from '@/hooks/use-focus-trap'

export interface EntityFormDialogProps {
  nodeType: NodeType
  projectId: string
  scopeContext?: { departmentId?: string }
  onSubmit: (nodeType: NodeType, data: Record<string, unknown>) => Promise<{ id: string } | undefined>
  onCreated?: (nodeType: NodeType, entityId: string) => void
  onClose: () => void
}

export function EntityFormDialog({
  nodeType,
  projectId,
  scopeContext,
  onSubmit,
  onCreated,
  onClose,
}: EntityFormDialogProps) {
  const schema = getSchemaForType(nodeType)
  const { optionsMap, isLoading: refDataLoading } = useEntityFormData(projectId, nodeType)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (schema) {
      for (const field of schema.fields) {
        if (field.defaultValue) {
          initial[field.name] = field.defaultValue
        }
      }
      // Auto-fill scope fields
      if (schema.scopeAutoFill && scopeContext) {
        for (const [fieldName, contextKey] of Object.entries(schema.scopeAutoFill)) {
          const val = scopeContext[contextKey as keyof typeof scopeContext]
          if (val) initial[fieldName] = val
        }
      }
    }
    return initial
  })
  const [submitting, setSubmitting] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // Focus trap + auto-focus first input + return focus on close
  useFocusTrap(dialogRef, true)

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const setValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!schema || submitting) return

      // Build payload
      const data: Record<string, unknown> = {}
      for (const field of schema.fields) {
        const val = values[field.name]

        if (field.type === 'party-select') {
          // party-select maps to providerId/providerType or consumerId/consumerType
          const partyTypeVal = values[`${field.name}Type`]
          const partyIdVal = values[`${field.name}Id`]
          if (partyIdVal) {
            data[`${field.name}Id`] = partyIdVal
            data[`${field.name}Type`] = partyTypeVal || 'department'
          }
          continue
        }

        if (field.type === 'tags') {
          if (val && val.trim()) {
            data[field.name] = val.split(',').map((t) => t.trim()).filter(Boolean)
          }
          continue
        }

        // Skip empty optional fields (don't send undefined values)
        if (val !== undefined && val !== '') {
          data[field.name] = val
        }
      }

      setSubmitting(true)
      try {
        const result = await onSubmit(nodeType, data)
        if (result?.id) {
          onCreated?.(nodeType, result.id)
        }
        onClose()
      } catch {
        // Stay open on error so user can retry
        setSubmitting(false)
      }
    },
    [schema, values, nodeType, submitting, onSubmit, onCreated, onClose],
  )

  if (!schema) return null

  const isValid = schema.fields
    .filter((f) => f.required)
    .every((f) => {
      if (f.type === 'party-select') return true // party fields are optional
      return (values[f.name] ?? '').trim().length > 0
    })

  return (
    <div
      data-testid="entity-form-backdrop"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="entity-form-dialog"
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold text-card-foreground">
            New {schema.label}
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="entity-form-close"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {refDataLoading ? (
          <div data-testid="entity-form-loading" className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit} data-testid="entity-form">
            <div className="space-y-3">
              {schema.fields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={values[field.name] ?? ''}
                  values={values}
                  optionsMap={optionsMap}
                  onChange={setValue}
                  scopeContext={scopeContext}
                  schema={schema}
                />
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                data-testid="entity-form-cancel"
                className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || submitting}
                data-testid="entity-form-submit"
                className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function FormField({
  field,
  value,
  values,
  optionsMap,
  onChange,
  scopeContext,
  schema,
}: {
  field: FormFieldSchema
  value: string
  values: Record<string, string>
  optionsMap: Record<string, { value: string; label: string }[]>
  onChange: (name: string, value: string) => void
  scopeContext?: { departmentId?: string }
  schema: { scopeAutoFill?: Record<string, string> }
}) {
  // Conditional visibility
  if (field.conditional) {
    const condValue = values[field.conditional.field]
    if (condValue !== field.conditional.value) return null
  }

  // Check if this field is auto-filled from scope
  const isAutoFilled = Boolean(
    schema.scopeAutoFill?.[field.name] &&
    scopeContext?.[schema.scopeAutoFill[field.name] as keyof typeof scopeContext],
  )

  const baseInputClass =
    'w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-60'

  if (field.type === 'party-select') {
    return <PartySelectField field={field} values={values} optionsMap={optionsMap} onChange={onChange} />
  }

  const fieldId = `entity-form-field-${field.name}`

  if (field.type === 'select') {
    const options = field.options ?? optionsMap[field.optionsSource ?? ''] ?? []
    return (
      <div data-testid={`field-${field.name}`}>
        <label htmlFor={fieldId} className="mb-1 block text-xs font-medium text-muted-foreground">
          {field.label}{field.required && ' *'}
        </label>
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          disabled={isAutoFilled}
          data-testid={`input-${field.name}`}
          className={baseInputClass}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div data-testid={`field-${field.name}`}>
        <label htmlFor={fieldId} className="mb-1 block text-xs font-medium text-muted-foreground">
          {field.label}{field.required && ' *'}
        </label>
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          data-testid={`input-${field.name}`}
          rows={2}
          className={baseInputClass + ' resize-none'}
        />
      </div>
    )
  }

  // text and tags
  return (
    <div data-testid={`field-${field.name}`}>
      <label htmlFor={fieldId} className="mb-1 block text-xs font-medium text-muted-foreground">
        {field.label}{field.required && ' *'}
      </label>
      <input
        id={fieldId}
        type="text"
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        data-testid={`input-${field.name}`}
        className={baseInputClass}
      />
    </div>
  )
}

function PartySelectField({
  field,
  values,
  optionsMap,
  onChange,
}: {
  field: FormFieldSchema
  values: Record<string, string>
  optionsMap: Record<string, { value: string; label: string }[]>
  onChange: (name: string, value: string) => void
}) {
  const partyType = values[`${field.name}Type`] ?? 'department'
  const partyId = values[`${field.name}Id`] ?? ''
  const options = optionsMap[partyType === 'department' ? 'departments' : 'capabilities'] ?? []

  const baseInputClass =
    'w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary'

  const typeFieldId = `entity-form-field-${field.name}-type`
  const idFieldId = `entity-form-field-${field.name}-id`

  return (
    <div data-testid={`field-${field.name}`}>
      <label htmlFor={typeFieldId} className="mb-1 block text-xs font-medium text-muted-foreground">
        {field.label}
      </label>
      <div className="flex gap-2">
        <select
          id={typeFieldId}
          value={partyType}
          onChange={(e) => {
            onChange(`${field.name}Type`, e.target.value)
            onChange(`${field.name}Id`, '')
          }}
          data-testid={`input-${field.name}-type`}
          className={baseInputClass + ' w-1/3'}
        >
          <option value="department">Dept</option>
          <option value="capability">Cap</option>
        </select>
        <select
          id={idFieldId}
          aria-label={`${field.label} entity`}
          value={partyId}
          onChange={(e) => onChange(`${field.name}Id`, e.target.value)}
          data-testid={`input-${field.name}-id`}
          className={baseInputClass + ' w-2/3'}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
