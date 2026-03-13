import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useReleases, usePublishRelease, useDeleteRelease, useReleaseDiff } from '@/hooks/use-releases'
import { ReleaseList } from '@/components/releases/release-list'
import { CreateReleaseForm } from '@/components/releases/create-release-form'
import { ReleaseDiffView } from '@/components/releases/release-diff-view'
import { Button } from '@/components/ui/button'
import { GitCompareArrows } from 'lucide-react'
import type { ReleaseDto } from '@the-crew/shared-types'
import { useCurrentProject } from '@/providers/project-provider'

export const Route = createFileRoute('/projects/$projectSlug/admin/releases')({
  component: ReleasesPage,
})

function ReleasesPage() {
  const { projectId } = useCurrentProject()
  const { data: releases, isLoading, error } = useReleases(projectId)
  const publishRelease = usePublishRelease(projectId)
  const deleteRelease = useDeleteRelease(projectId)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [diffMode, setDiffMode] = useState(false)
  const [baseId, setBaseId] = useState<string | null>(null)
  const [compareId, setCompareId] = useState<string | null>(null)

  const { data: diffData, isLoading: isDiffLoading } = useReleaseDiff(projectId, baseId, compareId)

  const publishedReleases = releases?.filter((r) => r.status === 'published') ?? []

  function handlePublish(id: string) {
    setPublishingId(id)
    publishRelease.mutate(id, {
      onSettled: () => setPublishingId(null),
    })
  }

  function handleStartDiff() {
    setDiffMode(true)
    setBaseId(null)
    setCompareId(null)
  }

  function handleCloseDiff() {
    setDiffMode(false)
    setBaseId(null)
    setCompareId(null)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Releases</h3>
        <div className="flex gap-2">
          {publishedReleases.length >= 2 && !diffMode && (
            <Button variant="outline" size="sm" onClick={handleStartDiff}>
              <GitCompareArrows className="mr-1.5 h-4 w-4" />
              Compare
            </Button>
          )}
          <CreateReleaseForm projectId={projectId} />
        </div>
      </div>

      {diffMode && (
        <DiffSelector
          releases={publishedReleases}
          baseId={baseId}
          compareId={compareId}
          onBaseChange={setBaseId}
          onCompareChange={setCompareId}
          onClose={handleCloseDiff}
          isDiffLoading={isDiffLoading}
        />
      )}

      {diffData && (
        <div className="mb-6">
          <ReleaseDiffView diff={diffData} onClose={handleCloseDiff} />
        </div>
      )}

      {isLoading && <p className="text-muted-foreground">Loading releases...</p>}
      {error && <p className="text-destructive">Failed to load releases.</p>}
      {releases && (
        <ReleaseList
          releases={releases}
          onPublish={handlePublish}
          onDelete={(id) => deleteRelease.mutate(id)}
          publishingId={publishingId}
        />
      )}
    </div>
  )
}

function DiffSelector({
  releases,
  baseId,
  compareId,
  onBaseChange,
  onCompareChange,
  onClose,
  isDiffLoading,
}: {
  releases: ReleaseDto[]
  baseId: string | null
  compareId: string | null
  onBaseChange: (id: string | null) => void
  onCompareChange: (id: string | null) => void
  onClose: () => void
  isDiffLoading: boolean
}) {
  return (
    <div className="mb-6 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="diff-base" className="text-sm font-medium">Base</label>
          <select
            id="diff-base"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={baseId ?? ''}
            onChange={(e) => onBaseChange(e.target.value || null)}
          >
            <option value="">Select...</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === compareId}>
                {r.version}
              </option>
            ))}
          </select>
        </div>

        <GitCompareArrows className="h-4 w-4 text-muted-foreground" />

        <div className="flex items-center gap-2">
          <label htmlFor="diff-compare" className="text-sm font-medium">Compare</label>
          <select
            id="diff-compare"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={compareId ?? ''}
            onChange={(e) => onCompareChange(e.target.value || null)}
          >
            <option value="">Select...</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === baseId}>
                {r.version}
              </option>
            ))}
          </select>
        </div>

        {isDiffLoading && <span className="text-sm text-muted-foreground">Loading diff...</span>}

        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
