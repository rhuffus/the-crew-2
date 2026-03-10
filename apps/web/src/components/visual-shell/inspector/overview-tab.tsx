import { useState, useCallback } from 'react'
import { AlertCircle, AlertTriangle, Pencil, Check, X } from 'lucide-react'
import type { VisualNodeDto, NodeType, ValidationIssue } from '@the-crew/shared-types'
import { getNodeTypeLabel } from './inspector-utils'

export interface OverviewTabProps {
  node: VisualNodeDto
  validationIssues?: ValidationIssue[]
  onNodeUpdate?: (entityId: string, nodeType: NodeType, patch: Record<string, string>) => void
  isPending?: boolean
}

interface FieldDef {
  label: string
  value: string | null | undefined
  editable: boolean
  fieldKey: string | null
}

/** Maps nodeType to the API field name for the sublabel. */
function getSublabelFieldKey(nodeType: NodeType): string | null {
  switch (nodeType) {
    case 'department':
      return 'mandate'
    case 'role':
      return 'accountability'
    case 'agent-archetype':
    case 'capability':
      return 'description'
    case 'skill':
      return 'category'
    default:
      return null
  }
}

function getSublabelName(nodeType: NodeType): string {
  switch (nodeType) {
    case 'company':
      return 'Company Type'
    case 'department':
      return 'Mandate'
    case 'role':
      return 'Accountability'
    case 'agent-archetype':
      return 'Description'
    case 'agent-assignment':
      return 'Assignment Status'
    case 'capability':
      return 'Description'
    case 'skill':
      return 'Category'
    case 'workflow':
      return 'Workflow Status'
    case 'workflow-stage':
      return 'Description'
    case 'contract':
      return 'Contract Info'
    case 'policy':
      return 'Policy Info'
    default:
      return 'Details'
  }
}

/** Node types that support editing via the entity API. */
const EDITABLE_NODE_TYPES = new Set<NodeType>([
  'department',
  'capability',
  'role',
  'agent-archetype',
  'skill',
  'workflow',
  'contract',
  'policy',
])

function getOverviewFields(node: VisualNodeDto): FieldDef[] {
  const isEditable = EDITABLE_NODE_TYPES.has(node.nodeType)

  const base: FieldDef[] = [
    { label: 'Name', value: node.label, editable: isEditable, fieldKey: 'name' },
  ]

  if (node.sublabel) {
    const sublabelFieldKey = getSublabelFieldKey(node.nodeType)
    base.push({
      label: getSublabelName(node.nodeType),
      value: node.sublabel,
      editable: isEditable && sublabelFieldKey !== null,
      fieldKey: sublabelFieldKey,
    })
  }

  base.push({ label: 'Type', value: getNodeTypeLabel(node.nodeType), editable: false, fieldKey: null })

  if (node.status !== 'normal') {
    base.push({ label: 'Status', value: node.status, editable: false, fieldKey: null })
  }

  return base
}

function EditableField({
  label,
  value,
  fieldKey,
  onSave,
  isPending,
}: {
  label: string
  value: string
  fieldKey: string
  onSave: (fieldKey: string, newValue: string) => void
  isPending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const startEdit = useCallback(() => {
    setEditValue(value)
    setEditing(true)
  }, [value])

  const cancelEdit = useCallback(() => {
    setEditing(false)
    setEditValue(value)
  }, [value])

  const saveEdit = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== value) {
      onSave(fieldKey, trimmed)
    }
    setEditing(false)
  }, [editValue, value, fieldKey, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        saveEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEdit()
      }
    },
    [saveEdit, cancelEdit],
  )

  if (editing) {
    return (
      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 flex items-center gap-1">
          <input
            data-testid={`edit-field-${fieldKey}`}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveEdit}
            disabled={isPending}
            autoFocus
            className="flex-1 rounded border border-primary bg-background px-1.5 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            aria-label={`Save ${label}`}
            onClick={saveEdit}
            className="rounded p-0.5 text-primary hover:bg-primary/10"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Cancel editing ${label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancelEdit}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </dd>
      </div>
    )
  }

  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="group mt-0.5 flex items-center gap-1">
        <span className="flex-1 text-sm text-foreground">{value || '—'}</span>
        <button
          type="button"
          aria-label={`Edit ${label}`}
          onClick={startEdit}
          className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </dd>
    </div>
  )
}

export function OverviewTab({ node, validationIssues = [], onNodeUpdate, isPending = false }: OverviewTabProps) {
  const fields = getOverviewFields(node)

  const handleFieldSave = useCallback(
    (fieldKey: string, newValue: string) => {
      if (onNodeUpdate) {
        onNodeUpdate(node.entityId, node.nodeType, { [fieldKey]: newValue })
      }
    },
    [node.entityId, node.nodeType, onNodeUpdate],
  )

  return (
    <div data-testid="overview-tab" className="space-y-3">
      {fields.map((field) =>
        field.editable && field.fieldKey && onNodeUpdate ? (
          <EditableField
            key={field.label}
            label={field.label}
            value={field.value || ''}
            fieldKey={field.fieldKey}
            onSave={handleFieldSave}
            isPending={isPending}
          />
        ) : (
          <div key={field.label}>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {field.label}
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {field.value || '—'}
            </dd>
          </div>
        ),
      )}
      {node.parentId && (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Parent
          </dt>
          <dd className="mt-0.5 text-sm text-foreground">
            {node.parentId}
          </dd>
        </div>
      )}
      {validationIssues.length > 0 && (
        <div data-testid="inspector-validation-issues">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Validation Issues
          </dt>
          <dd className="mt-1 space-y-1">
            {validationIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-1.5 rounded p-1.5 text-xs ${
                  issue.severity === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                {issue.severity === 'error' ? (
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                )}
                <span>{issue.message}</span>
              </div>
            ))}
          </dd>
        </div>
      )}
    </div>
  )
}
