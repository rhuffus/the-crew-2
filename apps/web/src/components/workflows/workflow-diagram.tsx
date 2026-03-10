import type { WorkflowStageDto, WorkflowParticipantDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

interface WorkflowDiagramProps {
  stages: WorkflowStageDto[]
  participants: WorkflowParticipantDto[]
  resolveParticipantName?: (id: string, type: string) => string | undefined
}

export function WorkflowDiagram({
  stages,
  participants,
  resolveParticipantName,
}: WorkflowDiagramProps) {
  if (stages.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">No stages defined yet.</p>
      </div>
    )
  }

  const sorted = [...stages].sort((a, b) => a.order - b.order)

  return (
    <div className="flex items-start gap-2 overflow-x-auto py-2" role="list" aria-label="Workflow stages">
      {sorted.map((stage, i) => (
        <div key={stage.order} className="flex items-start gap-2">
          <StageNode
            stage={stage}
            participants={participants}
            resolveParticipantName={resolveParticipantName}
          />
          {i < sorted.length - 1 && (
            <div className="flex items-center self-center pt-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StageNode({
  stage,
  participants,
  resolveParticipantName,
}: {
  stage: WorkflowStageDto
  participants: WorkflowParticipantDto[]
  resolveParticipantName?: (id: string, type: string) => string | undefined
}) {
  return (
    <div
      className="min-w-[140px] max-w-[200px] rounded-lg border bg-card p-3 shadow-sm"
      role="listitem"
    >
      <div className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {stage.order}
        </span>
        <span className="text-sm font-medium text-card-foreground">{stage.name}</span>
      </div>
      {stage.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{stage.description}</p>
      )}
      {participants.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {participants.map((p) => {
            const name = resolveParticipantName?.(p.participantId, p.participantType) ?? p.participantId
            return (
              <Badge key={`${p.participantType}:${p.participantId}`} variant="outline" className="text-xs">
                {name}
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
