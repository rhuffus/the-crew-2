import type { ReleaseDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Rocket } from 'lucide-react'

interface ReleaseCardProps {
  release: ReleaseDto
  onPublish: (id: string) => void
  onDelete: (id: string) => void
  isPublishing?: boolean
}

const statusVariant: Record<string, 'default' | 'secondary'> = {
  published: 'default',
  draft: 'secondary',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ReleaseCard({ release, onPublish, onDelete, isPublishing }: ReleaseCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-card-foreground">{release.version}</h4>
          <Badge variant={statusVariant[release.status] ?? 'secondary'}>{release.status}</Badge>
        </div>
        <div className="flex gap-1">
          {release.status === 'draft' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPublish(release.id)}
              disabled={isPublishing}
              aria-label={`Publish ${release.version}`}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Rocket className="h-4 w-4" />
            </Button>
          )}
          {release.status === 'draft' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(release.id)}
              aria-label={`Delete ${release.version}`}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {release.notes && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{release.notes}</p>
      )}
      <div className="mt-3 text-xs text-muted-foreground">
        <span>Created {formatDate(release.createdAt)}</span>
        {release.publishedAt && <span> &middot; Published {formatDate(release.publishedAt)}</span>}
      </div>
    </div>
  )
}
