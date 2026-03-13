import { useCallback, useEffect } from 'react'
import type { EdgeType, EdgeCategory, EdgeStyle } from '@the-crew/shared-types'
import { CONNECTION_RULES } from '@the-crew/shared-types'

export interface EdgeTypePickerProps {
  options: EdgeType[]
  onSelect: (edgeType: EdgeType) => void
  onCancel: () => void
}

const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  reports_to: 'Reports To',
  owns: 'Owns',
  assigned_to: 'Assigned To',
  contributes_to: 'Contributes To',
  has_skill: 'Has Skill',
  compatible_with: 'Compatible With',
  provides: 'Provides',
  consumes: 'Consumes',
  bound_by: 'Bound By',
  participates_in: 'Participates In',
  hands_off_to: 'Hands Off To',
  governs: 'Governs',
  produces_artifact: 'Produces',
  consumes_artifact: 'Consumes',
  contains: 'Contains',
  belongs_to: 'Belongs to',
  led_by: 'Led by',
  accountable_for: 'Accountable for',
  supervises: 'Supervises',
  requests_from: 'Requests from',
  delegates_to: 'Delegates to',
  reviews: 'Reviews',
  approves: 'Approves',
  escalates_to: 'Escalates to',
  produces: 'Produces',
  informs: 'Informs',
  triggers: 'Triggers',
  governed_by: 'Governed by',
  constrained_by: 'Constrained by',
  proposed_by: 'Proposed by',
  approved_by: 'Approved by',
}

const CATEGORY_COLORS: Record<EdgeCategory, string> = {
  hierarchical: 'bg-blue-100 text-blue-700',
  ownership: 'bg-emerald-100 text-emerald-700',
  assignment: 'bg-purple-100 text-purple-700',
  capability: 'bg-amber-100 text-amber-700',
  contract: 'bg-cyan-100 text-cyan-700',
  workflow: 'bg-orange-100 text-orange-700',
  governance: 'bg-rose-100 text-rose-700',
  artifact: 'bg-indigo-100 text-indigo-700',
  structural: 'bg-slate-100 text-slate-700',
  responsibility: 'bg-violet-100 text-violet-700',
  collaboration: 'bg-teal-100 text-teal-700',
  flow: 'bg-yellow-100 text-yellow-700',
}

function getEdgeInfo(edgeType: EdgeType): { category: EdgeCategory; style: EdgeStyle } | null {
  const rule = CONNECTION_RULES.find((r) => r.edgeType === edgeType)
  return rule ? { category: rule.category, style: rule.style } : null
}

function StyleIndicator({ style }: { style: EdgeStyle }) {
  const dashArray = style === 'dashed' ? '6 3' : style === 'dotted' ? '2 3' : 'none'
  return (
    <svg width="24" height="8" className="shrink-0">
      <line
        x1="0" y1="4" x2="24" y2="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={dashArray}
      />
    </svg>
  )
}

export function EdgeTypePicker({ options, onSelect, onCancel }: EdgeTypePickerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    },
    [onCancel],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      data-testid="edge-type-picker-backdrop"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/10"
      onClick={onCancel}
    >
      <div
        data-testid="edge-type-picker"
        className="rounded-lg border border-border bg-card p-3 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          Select relationship type
        </div>
        <div className="flex flex-col gap-1">
          {options.map((edgeType) => {
            const info = getEdgeInfo(edgeType)
            return (
              <button
                key={edgeType}
                type="button"
                data-testid={`edge-option-${edgeType}`}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent"
                onClick={() => onSelect(edgeType)}
              >
                {info && <StyleIndicator style={info.style} />}
                <span className="font-medium">{EDGE_TYPE_LABELS[edgeType]}</span>
                {info && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[info.category]}`}>
                    {info.category}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
