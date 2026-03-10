import type { ReleaseDto } from '@the-crew/shared-types'
import { ReleaseCard } from './release-card'

interface ReleaseListProps {
  releases: ReleaseDto[]
  onPublish: (id: string) => void
  onDelete: (id: string) => void
  publishingId?: string | null
}

export function ReleaseList({ releases, onPublish, onDelete, publishingId }: ReleaseListProps) {
  if (releases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No releases yet. Create your first release to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {releases.map((release) => (
        <ReleaseCard
          key={release.id}
          release={release}
          onPublish={onPublish}
          onDelete={onDelete}
          isPublishing={publishingId === release.id}
        />
      ))}
    </div>
  )
}
