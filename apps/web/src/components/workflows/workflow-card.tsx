import { useState } from 'react'
import type { WorkflowDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { WorkflowDiagram } from './workflow-diagram'

interface WorkflowCardProps {
  workflow: WorkflowDto
  ownerName?: string
  onDelete: (id: string) => void
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
}

export function WorkflowCard({ workflow, ownerName, onDelete }: WorkflowCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasStages = workflow.stages.length > 0

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <button
          type="button"
          onClick={() => hasStages && setExpanded(!expanded)}
          className="flex items-center gap-1 text-left"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${workflow.name}`}
          disabled={!hasStages}
        >
          <h4 className="font-semibold text-card-foreground hover:text-primary">
            {workflow.name}
          </h4>
          {hasStages && (
            expanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(workflow.id)}
          aria-label={`Delete ${workflow.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {workflow.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{workflow.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        <Badge variant={statusVariant[workflow.status] ?? 'secondary'}>{workflow.status}</Badge>
        {ownerName && <Badge variant="outline">{ownerName}</Badge>}
        {hasStages && (
          <Badge variant="secondary">
            {workflow.stages.length} stage{workflow.stages.length !== 1 ? 's' : ''}
          </Badge>
        )}
        {workflow.participants.length > 0 && (
          <Badge variant="secondary">
            {workflow.participants.length} participant{workflow.participants.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      {expanded && (
        <div className="mt-4 border-t pt-3">
          <WorkflowDiagram
            stages={workflow.stages}
            participants={workflow.participants}
          />
        </div>
      )}
    </div>
  )
}
