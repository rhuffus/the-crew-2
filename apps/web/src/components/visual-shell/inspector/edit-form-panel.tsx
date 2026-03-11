import { useState, useCallback, useEffect } from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import type { EditFieldSchema } from '@/lib/entity-edit-schemas'
import { getEditSchema, getEditRequiredSources } from '@/lib/entity-edit-schemas'
import { useOptionsForSources } from '@/hooks/use-entity-form-data'

export interface EditFormPanelProps {
  nodeType: NodeType
  entityId: string
  entityData: Record<string, unknown> | undefined
  isLoadingData: boolean
  projectId: string
  onSave: (entityId: string, nodeType: NodeType, patch: Record<string, unknown>) => void
  isPending?: boolean
}

interface FieldRendererProps {
  field: EditFieldSchema
  value: unknown
  optionsMap: Record<string, { value: string; label: string }[]>
  onSave: (fieldName: string, value: unknown) => void
  isPending: boolean
  formValues: Record<string, unknown>
}

function resolveOptions(
  field: EditFieldSchema,
  optionsMap: Record<string, { value: string; label: string }[]>,
): { value: string; label: string }[] {
  if (field.options) return field.options
  if (field.optionsSource) {
    return optionsMap[field.optionsSource] ?? []
  }
  return []
}

function formatTagsValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') return value
  return ''
}

function parseTagsValue(input: string): string[] {
  return input.split(',').map((s) => s.trim()).filter(Boolean)
}

function getDisplayValue(
  value: unknown,
  field: EditFieldSchema,
  optionsMap: Record<string, { value: string; label: string }[]>,
): string {
  if (value === null || value === undefined || value === '') return '—'

  if (field.type === 'select' || field.type === 'status-select' || field.type === 'party-select') {
    const options = resolveOptions(field, optionsMap)
    const match = options.find((o) => o.value === value)
    return match?.label ?? String(value)
  }

  if (field.type === 'multi-select') {
    if (!Array.isArray(value) || value.length === 0) return '—'
    const options = resolveOptions(field, optionsMap)
    return value
      .map((v) => {
        const match = options.find((o) => o.value === v)
        return match?.label ?? v
      })
      .join(', ')
  }

  if (field.type === 'tags') {
    return formatTagsValue(value) || '—'
  }

  return String(value)
}

function InlineTextField({
  field,
  value,
  onSave,
  isPending,
}: {
  field: EditFieldSchema
  value: string
  onSave: (name: string, val: unknown) => void
  isPending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  useEffect(() => { setEditValue(value) }, [value])

  const startEdit = useCallback(() => {
    setEditValue(value)
    setEditing(true)
  }, [value])

  const cancel = useCallback(() => {
    setEditing(false)
    setEditValue(value)
  }, [value])

  const save = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed !== value) {
      onSave(field.name, trimmed)
    }
    setEditing(false)
  }, [editValue, value, field.name, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && field.type !== 'textarea') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }, [save, cancel, field.type])

  if (editing) {
    const InputEl = field.type === 'textarea' ? 'textarea' : 'input'
    return (
      <div className="mt-0.5 flex items-start gap-1">
        <InputEl
          data-testid={`edit-field-${field.name}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          autoFocus
          rows={field.type === 'textarea' ? 3 : undefined}
          className="flex-1 rounded border border-primary bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="button" aria-label={`Save ${field.label}`} onClick={save} className="rounded p-0.5 text-primary hover:bg-primary/10">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label={`Cancel editing ${field.label}`} onMouseDown={(e) => e.preventDefault()} onClick={cancel} className="rounded p-0.5 text-muted-foreground hover:bg-accent">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <dd className="group mt-0.5 flex items-center gap-1">
      <span className="flex-1 text-sm text-foreground">{value || '—'}</span>
      {!field.readOnly && (
        <button type="button" aria-label={`Edit ${field.label}`} onClick={startEdit} className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100">
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </dd>
  )
}

function InlineSelectField({
  field,
  value,
  optionsMap,
  onSave,
  isPending,
}: {
  field: EditFieldSchema
  value: string
  optionsMap: Record<string, { value: string; label: string }[]>
  onSave: (name: string, val: unknown) => void
  isPending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const options = resolveOptions(field, optionsMap)
  const displayValue = getDisplayValue(value, field, optionsMap)

  useEffect(() => { setEditValue(value) }, [value])

  const save = useCallback((newVal: string) => {
    if (newVal !== value) {
      onSave(field.name, newVal || null)
    }
    setEditing(false)
  }, [value, field.name, onSave])

  if (editing) {
    return (
      <div className="mt-0.5 flex items-center gap-1">
        <select
          data-testid={`edit-field-${field.name}`}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value)
            save(e.target.value)
          }}
          disabled={isPending}
          autoFocus
          className="flex-1 rounded border border-primary bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">— None —</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="button" aria-label={`Cancel editing ${field.label}`} onMouseDown={(e) => e.preventDefault()} onClick={() => setEditing(false)} className="rounded p-0.5 text-muted-foreground hover:bg-accent">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <dd className="group mt-0.5 flex items-center gap-1">
      <span className="flex-1 text-sm text-foreground">{displayValue}</span>
      {!field.readOnly && (
        <button type="button" aria-label={`Edit ${field.label}`} onClick={() => setEditing(true)} className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100">
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </dd>
  )
}

function InlineMultiSelectField({
  field,
  value,
  optionsMap,
  onSave,
  isPending,
}: {
  field: EditFieldSchema
  value: string[]
  optionsMap: Record<string, { value: string; label: string }[]>
  onSave: (name: string, val: unknown) => void
  isPending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState<string[]>(value)
  const options = resolveOptions(field, optionsMap)
  const displayValue = getDisplayValue(value, field, optionsMap)

  useEffect(() => { setEditValue(value) }, [value])

  const save = useCallback(() => {
    const arraysEqual = editValue.length === value.length && editValue.every((v, i) => v === value[i])
    if (!arraysEqual) {
      onSave(field.name, editValue)
    }
    setEditing(false)
  }, [editValue, value, field.name, onSave])

  const toggle = useCallback((optValue: string) => {
    setEditValue((prev) =>
      prev.includes(optValue)
        ? prev.filter((v) => v !== optValue)
        : [...prev, optValue],
    )
  }, [])

  if (editing) {
    return (
      <div className="mt-0.5 space-y-1">
        <div data-testid={`edit-field-${field.name}`} className="max-h-32 overflow-y-auto rounded border border-primary bg-background p-1">
          {options.length === 0 && (
            <span className="px-1 text-xs text-muted-foreground">No options available</span>
          )}
          {options.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-accent">
              <input
                type="checkbox"
                checked={editValue.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                disabled={isPending}
                className="h-3 w-3"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="flex gap-1">
          <button type="button" aria-label={`Save ${field.label}`} onClick={save} className="rounded px-2 py-0.5 text-xs text-primary hover:bg-primary/10">
            Done
          </button>
          <button type="button" aria-label={`Cancel editing ${field.label}`} onClick={() => { setEditValue(value); setEditing(false) }} className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <dd className="group mt-0.5 flex items-center gap-1">
      <span className="flex-1 text-sm text-foreground">{displayValue}</span>
      {!field.readOnly && (
        <button type="button" aria-label={`Edit ${field.label}`} onClick={() => { setEditValue(value); setEditing(true) }} className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100">
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </dd>
  )
}

function InlineTagsField({
  field,
  value,
  onSave,
  isPending,
}: {
  field: EditFieldSchema
  value: string[]
  onSave: (name: string, val: unknown) => void
  isPending: boolean
}) {
  const display = formatTagsValue(value)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(display)

  useEffect(() => { setEditValue(formatTagsValue(value)) }, [value])

  const save = useCallback(() => {
    const parsed = parseTagsValue(editValue)
    const same = parsed.length === value.length && parsed.every((v, i) => v === value[i])
    if (!same) {
      onSave(field.name, parsed)
    }
    setEditing(false)
  }, [editValue, value, field.name, onSave])

  const cancel = useCallback(() => {
    setEditing(false)
    setEditValue(formatTagsValue(value))
  }, [value])

  if (editing) {
    return (
      <div className="mt-0.5 flex items-start gap-1">
        <input
          data-testid={`edit-field-${field.name}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); save() }
            else if (e.key === 'Escape') { e.preventDefault(); cancel() }
          }}
          disabled={isPending}
          autoFocus
          placeholder={field.placeholder}
          className="flex-1 rounded border border-primary bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="button" aria-label={`Save ${field.label}`} onClick={save} className="rounded p-0.5 text-primary hover:bg-primary/10">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label={`Cancel editing ${field.label}`} onMouseDown={(e) => e.preventDefault()} onClick={cancel} className="rounded p-0.5 text-muted-foreground hover:bg-accent">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <dd className="group mt-0.5 flex items-center gap-1">
      <span className="flex-1 text-sm text-foreground">{display || '—'}</span>
      {!field.readOnly && (
        <button type="button" aria-label={`Edit ${field.label}`} onClick={() => setEditing(true)} className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100">
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </dd>
  )
}

function FieldRenderer({ field, value, optionsMap, onSave, isPending, formValues }: FieldRendererProps) {
  if (field.conditional) {
    const condVal = formValues[field.conditional.field]
    if (condVal !== field.conditional.value) return null
  }

  const label = (
    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {field.label}
    </dt>
  )

  switch (field.type) {
    case 'text':
    case 'textarea':
      return (
        <div>
          {label}
          <InlineTextField field={field} value={String(value ?? '')} onSave={onSave} isPending={isPending} />
        </div>
      )
    case 'select':
    case 'status-select':
    case 'party-select':
      return (
        <div>
          {label}
          <InlineSelectField field={field} value={String(value ?? '')} optionsMap={optionsMap} onSave={onSave} isPending={isPending} />
        </div>
      )
    case 'multi-select':
      return (
        <div>
          {label}
          <InlineMultiSelectField field={field} value={Array.isArray(value) ? value : []} optionsMap={optionsMap} onSave={onSave} isPending={isPending} />
        </div>
      )
    case 'tags':
      return (
        <div>
          {label}
          <InlineTagsField field={field} value={Array.isArray(value) ? value : []} onSave={onSave} isPending={isPending} />
        </div>
      )
    default:
      return null
  }
}

export function EditFormPanel({
  nodeType,
  entityId,
  entityData,
  isLoadingData,
  projectId,
  onSave,
  isPending = false,
}: EditFormPanelProps) {
  const schema = getEditSchema(nodeType)
  const sources = schema ? getEditRequiredSources(schema) : []
  const { optionsMap, isLoading: optionsLoading } = useOptionsForSources(projectId, sources)

  const handleFieldSave = useCallback(
    (fieldName: string, value: unknown) => {
      onSave(entityId, nodeType, { [fieldName]: value })
    },
    [entityId, nodeType, onSave],
  )

  if (!schema) {
    return (
      <div data-testid="edit-form-panel" className="space-y-3">
        <p className="text-xs text-muted-foreground">This entity type is not editable.</p>
      </div>
    )
  }

  if (isLoadingData || optionsLoading) {
    return (
      <div data-testid="edit-form-panel" className="flex items-center gap-2 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading entity data...</span>
      </div>
    )
  }

  if (!entityData) {
    return (
      <div data-testid="edit-form-panel" className="space-y-3">
        <p className="text-xs text-muted-foreground">Unable to load entity data.</p>
      </div>
    )
  }

  return (
    <div data-testid="edit-form-panel" className="space-y-3">
      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={entityData[field.name]}
          optionsMap={optionsMap}
          onSave={handleFieldSave}
          isPending={isPending}
          formValues={entityData}
        />
      ))}
    </div>
  )
}
