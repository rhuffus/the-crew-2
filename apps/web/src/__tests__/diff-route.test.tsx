import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter } from './test-utils'
import { screen, waitFor } from '@testing-library/react'
import { useVisualWorkspaceStore } from '../stores/visual-workspace-store'

// Stable mock data (same reference across renders to avoid infinite loops)
const releasesData = [
  {
    id: 'rel-1',
    projectId: 'p1',
    version: 'v1.0',
    status: 'published' as const,
    notes: '',
    snapshot: null,
    validationIssues: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rel-2',
    projectId: 'p1',
    version: 'v2.0',
    status: 'published' as const,
    notes: '',
    snapshot: null,
    validationIssues: [],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    publishedAt: '2026-02-01T00:00:00Z',
  },
]

const diffData = {
  projectId: 'p1',
  scope: { level: 'L1', entityId: null, entityType: null },
  zoomLevel: 'L1',
  baseReleaseId: 'rel-1',
  compareReleaseId: 'rel-2',
  nodes: [
    {
      id: 'company:p1',
      nodeType: 'company',
      entityId: 'p1',
      label: 'Company',
      sublabel: null,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: null,
      diffStatus: 'unchanged',
    },
    {
      id: 'dept:d1',
      nodeType: 'department',
      entityId: 'd1',
      label: 'Engineering',
      sublabel: null,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: 'company:p1',
      diffStatus: 'added',
    },
  ],
  edges: [],
  activeLayers: ['organization'],
  breadcrumb: [{ label: 'Company', path: '/projects/p1/org' }],
  summary: {
    nodesAdded: 1,
    nodesRemoved: 0,
    nodesModified: 0,
    nodesUnchanged: 1,
    edgesAdded: 0,
    edgesRemoved: 0,
    edgesModified: 0,
    edgesUnchanged: 0,
  },
}

const emptyResult = { data: undefined, isLoading: false, error: null }
const loadedResult = { data: diffData, isLoading: false, error: null }

vi.mock('../hooks/use-releases', () => ({
  useReleases: () => ({
    data: releasesData,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../hooks/use-visual-diff', () => ({
  useVisualDiff: (_projectId: string, baseId: string | null, compareId: string | null) => {
    if (!baseId || !compareId) return emptyResult
    return loadedResult
  },
}))

beforeEach(() => {
  useVisualWorkspaceStore.getState().setView('org')
})

describe('Diff route', () => {
  it('should render empty state when no releases selected', async () => {
    renderWithRouter('/projects/p1/diff')

    await waitFor(() => {
      expect(screen.getByTestId('diff-empty-state')).toBeInTheDocument()
    })
  })

  it('should render diff selector with release dropdowns', async () => {
    renderWithRouter('/projects/p1/diff')

    await waitFor(() => {
      expect(screen.getByTestId('diff-selector')).toBeInTheDocument()
      expect(screen.getByTestId('diff-base-select')).toBeInTheDocument()
      expect(screen.getByTestId('diff-compare-select')).toBeInTheDocument()
    })
  })

  it('should render diff canvas when both releases are selected', async () => {
    renderWithRouter('/projects/p1/diff?base=rel-1&compare=rel-2')

    await waitFor(() => {
      expect(screen.getByTestId('diff-canvas-page')).toBeInTheDocument()
      expect(screen.getByTestId('diff-legend')).toBeInTheDocument()
    })
  })

  it('should render diff summary when data is loaded', async () => {
    renderWithRouter('/projects/p1/diff?base=rel-1&compare=rel-2')

    await waitFor(() => {
      expect(screen.getByTestId('diff-summary')).toBeInTheDocument()
    })
  })

  it('should render diff filter buttons', async () => {
    renderWithRouter('/projects/p1/diff?base=rel-1&compare=rel-2')

    await waitFor(() => {
      expect(screen.getByTestId('diff-filter-show-all')).toBeInTheDocument()
      expect(screen.getByTestId('diff-filter-changes-only')).toBeInTheDocument()
      expect(screen.getByTestId('diff-filter-added')).toBeInTheDocument()
      expect(screen.getByTestId('diff-filter-removed')).toBeInTheDocument()
      expect(screen.getByTestId('diff-filter-modified')).toBeInTheDocument()
    })
  })
})
