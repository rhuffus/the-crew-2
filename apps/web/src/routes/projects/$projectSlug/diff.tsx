import { useCallback, useEffect, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { VisualDiffStatus } from '@the-crew/shared-types'
import { useCurrentProject } from '@/providers/project-provider'
import { VisualShell } from '@/components/visual-shell/visual-shell'
import { DiffSelector } from '@/components/visual-shell/diff-selector'
import { DiffLegend } from '@/components/visual-shell/diff-legend'
import { visualNodeTypes } from '@/components/visual-shell/nodes'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useVisualDiff } from '@/hooks/use-visual-diff'
import { useReleases } from '@/hooks/use-releases'
import { layoutDiffGraph } from '@/lib/graph-to-flow'
import { saveDiffViewState, loadDiffViewState } from '@/lib/view-persistence'

export interface DiffSearchParams {
  base?: string
  compare?: string
}

export const Route = createFileRoute('/projects/$projectSlug/diff')({
  validateSearch: (search: Record<string, unknown>): DiffSearchParams => ({
    base: typeof search.base === 'string' ? search.base : undefined,
    compare: typeof search.compare === 'string' ? search.compare : undefined,
  }),
  component: DiffCanvasPage,
})

const DIFF_FILTER_OPTIONS: { label: string; value: VisualDiffStatus[] | null }[] = [
  { label: 'Show All', value: null },
  { label: 'Changes Only', value: ['added', 'removed', 'modified'] },
  { label: 'Added', value: ['added'] },
  { label: 'Removed', value: ['removed'] },
  { label: 'Modified', value: ['modified'] },
]

function DiffCanvasPage() {
  const { projectId, projectSlug } = useCurrentProject()
  const { base: baseReleaseId, compare: compareReleaseId } = Route.useSearch()
  const navigate = useNavigate()

  const diffFilter = useVisualWorkspaceStore((s) => s.diffFilter)
  const activeLayers = useVisualWorkspaceStore((s) => s.activeLayers)
  const nodeTypeFilter = useVisualWorkspaceStore((s) => s.nodeTypeFilter)
  const statusFilter = useVisualWorkspaceStore((s) => s.statusFilter)

  // Enter diff mode and restore persisted state
  useEffect(() => {
    const state = useVisualWorkspaceStore.getState()
    state.setView('org')
    state.setProjectId(projectId)

    if (baseReleaseId && compareReleaseId) {
      state.enterDiffMode(baseReleaseId, compareReleaseId)

      const saved = loadDiffViewState(projectId, baseReleaseId, compareReleaseId, 'L1')
      if (saved) {
        state.setActiveLayers(saved.activeLayers)
        state.setNodeTypeFilter(saved.nodeTypeFilter)
        state.setStatusFilter(saved.statusFilter)
        state.setDiffFilter(saved.diffFilter)
      }
    }

    return () => {
      useVisualWorkspaceStore.getState().exitDiffMode()
    }
  }, [projectId, baseReleaseId, compareReleaseId])

  // Auto-save view state on filter changes
  useEffect(() => {
    if (baseReleaseId && compareReleaseId) {
      saveDiffViewState(projectId, baseReleaseId, compareReleaseId, 'L1', {
        activeLayers,
        nodeTypeFilter,
        statusFilter,
        diffFilter,
      })
    }
  }, [projectId, baseReleaseId, compareReleaseId, activeLayers, nodeTypeFilter, statusFilter, diffFilter])

  const { data: releases } = useReleases(projectId)
  const { data: diff, isLoading, error } = useVisualDiff(
    projectId,
    baseReleaseId ?? null,
    compareReleaseId ?? null,
  )

  // Sync breadcrumb from diff response
  useEffect(() => {
    if (diff?.breadcrumb) {
      useVisualWorkspaceStore.getState().setBreadcrumb(diff.breadcrumb)
    }
  }, [diff])

  // Sync graph nodes to store for explorer
  useEffect(() => {
    if (diff) {
      const state = useVisualWorkspaceStore.getState()
      state.setGraphNodes(diff.nodes)
      state.setGraphEdges(diff.edges)
    }
  }, [diff])

  // Apply diff filter and layout
  const { nodes, edges } = useMemo(() => {
    if (!diff) return { nodes: [], edges: [] }

    let filteredDiff = diff
    if (diffFilter) {
      filteredDiff = {
        ...diff,
        nodes: diff.nodes.filter((n) => diffFilter.includes(n.diffStatus)),
        edges: diff.edges.filter((e) => diffFilter.includes(e.diffStatus)),
      }
    }

    return layoutDiffGraph(filteredDiff)
  }, [diff, diffFilter])

  const handleBaseChange = useCallback(
    (releaseId: string) => {
      navigate({
        to: '/projects/$projectSlug/diff',
        params: { projectSlug },
        search: { base: releaseId || undefined, compare: compareReleaseId },
      })
    },
    [navigate, projectSlug, compareReleaseId],
  )

  const handleCompareChange = useCallback(
    (releaseId: string) => {
      navigate({
        to: '/projects/$projectSlug/diff',
        params: { projectSlug },
        search: { base: baseReleaseId, compare: releaseId || undefined },
      })
    },
    [navigate, projectSlug, baseReleaseId],
  )

  const handleSwap = useCallback(() => {
    navigate({
      to: '/projects/$projectSlug/diff',
      params: { projectSlug },
      search: { base: compareReleaseId, compare: baseReleaseId },
    })
  }, [navigate, projectSlug, baseReleaseId, compareReleaseId])

  const needsSelection = !baseReleaseId || !compareReleaseId

  return (
    <VisualShell diffSummary={diff?.summary}>
      <div data-testid="diff-canvas-page" className="flex flex-1 flex-col overflow-hidden">
        <DiffSelector
          releases={releases ?? []}
          baseReleaseId={baseReleaseId ?? null}
          compareReleaseId={compareReleaseId ?? null}
          summary={diff?.summary ?? null}
          onBaseChange={handleBaseChange}
          onCompareChange={handleCompareChange}
          onSwap={handleSwap}
        />

        <div className="flex items-center gap-1 border-b border-border bg-card px-3 py-1">
          {DIFF_FILTER_OPTIONS.map((opt) => {
            const isActive = diffFilter === opt.value ||
              (diffFilter === null && opt.value === null) ||
              (diffFilter !== null && opt.value !== null &&
                diffFilter.length === opt.value.length &&
                diffFilter.every((s) => opt.value!.includes(s)))
            return (
              <button
                key={opt.label}
                type="button"
                data-testid={`diff-filter-${opt.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => useVisualWorkspaceStore.getState().setDiffFilter(opt.value)}
                className={`rounded px-2 py-0.5 text-xs ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {needsSelection && (
          <div data-testid="diff-empty-state" className="flex flex-1 items-center justify-center text-muted-foreground">
            Select two published releases to compare
          </div>
        )}

        {!needsSelection && isLoading && (
          <div data-testid="diff-loading" className="flex flex-1 items-center justify-center text-muted-foreground">
            Loading diff...
          </div>
        )}

        {!needsSelection && error && (
          <div data-testid="diff-error" className="flex flex-1 items-center justify-center text-red-500">
            Failed to load visual diff
          </div>
        )}

        {!needsSelection && !isLoading && !error && diff && (
          <div className="relative flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={visualNodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              deleteKeyCode={null}
              fitView
              minZoom={0.1}
              maxZoom={4}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
              <Controls showInteractive={false} />
              <MiniMap zoomable pannable />
            </ReactFlow>
            <DiffLegend />
          </div>
        )}
      </div>
    </VisualShell>
  )
}
