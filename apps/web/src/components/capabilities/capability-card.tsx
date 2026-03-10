import type { CapabilityDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface CapabilityCardProps {
  capability: CapabilityDto
  ownerName?: string
  onDelete: (id: string) => void
  onEdit: (capability: CapabilityDto) => void
}

export function CapabilityCard({ capability, ownerName, onDelete, onEdit }: CapabilityCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <button type="button" onClick={() => onEdit(capability)} className="text-left">
          <h4 className="font-semibold text-card-foreground hover:text-primary">
            {capability.name}
          </h4>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(capability.id)}
          aria-label={`Delete ${capability.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {capability.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {capability.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {ownerName && <Badge variant="outline">{ownerName}</Badge>}
        {capability.inputs.length > 0 && (
          <Badge variant="secondary">{capability.inputs.length} input(s)</Badge>
        )}
        {capability.outputs.length > 0 && (
          <Badge variant="secondary">{capability.outputs.length} output(s)</Badge>
        )}
      </div>
    </div>
  )
}
