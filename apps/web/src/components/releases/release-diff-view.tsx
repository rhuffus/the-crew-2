import { useState } from 'react'
import type { ReleaseDiffDto, EntityChange, DiffEntityType } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Plus, Minus, Pencil } from 'lucide-react'

interface ReleaseDiffViewProps {
  diff: ReleaseDiffDto
  onClose: () => void
}

const entityTypeLabels: Record<DiffEntityType, string> = {
  companyModel: 'Company Model',
  department: 'Departments',
  capability: 'Capabilities',
  role: 'Roles',
  agentArchetype: 'Agent Archetypes',
  agentAssignment: 'Agent Assignments',
  skill: 'Skills',
  contract: 'Contracts',
  workflow: 'Workflows',
  policy: 'Policies',
}

const changeTypeConfig = {
  added: { label: 'Added', variant: 'default' as const, icon: Plus, className: 'text-green-600' },
  removed: { label: 'Removed', variant: 'destructive' as const, icon: Minus, className: 'text-red-600' },
  modified: { label: 'Modified', variant: 'secondary' as const, icon: Pencil, className: 'text-yellow-600' },
}

function groupByEntityType(changes: EntityChange[]) {
  const groups = new Map<DiffEntityType, EntityChange[]>()
  for (const change of changes) {
    const list = groups.get(change.entityType) ?? []
    list.push(change)
    groups.set(change.entityType, list)
  }
  return groups
}

function ChangeItem({ change }: { change: EntityChange }) {
  const [expanded, setExpanded] = useState(false)
  const config = changeTypeConfig[change.changeType]
  const Icon = config.icon

  return (
    <div className="border-b last:border-b-0">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <Icon className={`h-3.5 w-3.5 shrink-0 ${config.className}`} />
        <span className="font-medium">{change.entityName}</span>
        <Badge variant={config.variant} className="ml-auto text-xs">
          {config.label}
        </Badge>
      </button>
      {expanded && change.changeType === 'modified' && change.before && change.after && (
        <div className="bg-muted/30 px-3 py-2">
          <FieldDiff before={change.before} after={change.after} />
        </div>
      )}
      {expanded && change.changeType === 'added' && change.after && (
        <div className="bg-muted/30 px-3 py-2">
          <FieldList fields={change.after} label="New values" className="text-green-700" />
        </div>
      )}
      {expanded && change.changeType === 'removed' && change.before && (
        <div className="bg-muted/30 px-3 py-2">
          <FieldList fields={change.before} label="Removed values" className="text-red-700" />
        </div>
      )}
    </div>
  )
}

const SKIP_FIELDS = new Set(['id', 'projectId', 'createdAt', 'updatedAt'])

function FieldDiff({ before, after }: { before: Record<string, unknown>; after: Record<string, unknown> }) {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (k) => !SKIP_FIELDS.has(k),
  )
  const changed = keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]))

  if (changed.length === 0) {
    return <p className="text-xs text-muted-foreground">No visible field changes (timestamps only)</p>
  }

  return (
    <div className="space-y-1">
      {changed.map((key) => (
        <div key={key} className="text-xs">
          <span className="font-medium text-muted-foreground">{key}:</span>
          <div className="ml-3 flex flex-col gap-0.5">
            <span className="text-red-600 line-through">{formatValue(before[key])}</span>
            <span className="text-green-600">{formatValue(after[key])}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FieldList({
  fields,
  label,
  className,
}: {
  fields: Record<string, unknown>
  label: string
  className: string
}) {
  const keys = Object.keys(fields).filter((k) => !SKIP_FIELDS.has(k))
  return (
    <div className="space-y-1">
      <p className={`text-xs font-medium ${className}`}>{label}</p>
      {keys.map((key) => (
        <div key={key} className="text-xs">
          <span className="font-medium text-muted-foreground">{key}:</span>{' '}
          <span>{formatValue(fields[key])}</span>
        </div>
      ))}
    </div>
  )
}

function formatValue(val: unknown): string {
  if (val == null) return '(empty)'
  if (Array.isArray(val)) return val.length === 0 ? '[]' : JSON.stringify(val)
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

export function ReleaseDiffView({ diff, onClose }: ReleaseDiffViewProps) {
  const groups = groupByEntityType(diff.changes)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(groups.keys()))

  function toggleGroup(type: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Diff: {diff.baseVersion} → {diff.compareVersion}
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {diff.summary.added} added, {diff.summary.removed} removed, {diff.summary.modified}{' '}
            modified
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {diff.changes.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground">No differences found between these releases.</p>
        </div>
      )}

      {Array.from(groups.entries()).map(([entityType, changes]) => (
        <div key={entityType} className="rounded-lg border">
          <button
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium hover:bg-muted/50"
            onClick={() => toggleGroup(entityType)}
          >
            {expandedGroups.has(entityType) ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {entityTypeLabels[entityType]}
            <Badge variant="secondary" className="ml-auto">
              {changes.length}
            </Badge>
          </button>
          {expandedGroups.has(entityType) && (
            <div className="border-t">
              {changes.map((change, i) => (
                <ChangeItem key={change.entityId ?? `cm-${i}`} change={change} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
