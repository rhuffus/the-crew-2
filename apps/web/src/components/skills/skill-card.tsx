import type { SkillDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface SkillCardProps {
  skill: SkillDto
  onDelete: (id: string) => void
}

export function SkillCard({ skill, onDelete }: SkillCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-card-foreground">{skill.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(skill.id)}
          aria-label={`Delete ${skill.name}`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {skill.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
      )}
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Category:</span>
          <span>{skill.category}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {skill.tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
        {skill.compatibleRoleIds.length > 0 && (
          <Badge variant="secondary">{skill.compatibleRoleIds.length} roles</Badge>
        )}
      </div>
    </div>
  )
}
