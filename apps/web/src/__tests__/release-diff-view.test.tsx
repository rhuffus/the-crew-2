import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReleaseDiffView } from '@/components/releases/release-diff-view'
import type { ReleaseDiffDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const emptyDiff: ReleaseDiffDto = {
  baseReleaseId: 'r1',
  baseVersion: 'v1.0',
  compareReleaseId: 'r2',
  compareVersion: 'v2.0',
  changes: [],
  summary: { added: 0, removed: 0, modified: 0 },
}

const diffWithChanges: ReleaseDiffDto = {
  baseReleaseId: 'r1',
  baseVersion: 'v1.0',
  compareReleaseId: 'r2',
  compareVersion: 'v2.0',
  changes: [
    {
      changeType: 'added',
      entityType: 'department',
      entityId: 'd1',
      entityName: 'Sales',
      before: null,
      after: { id: 'd1', name: 'Sales', description: 'Sales dept', mandate: 'Sell' },
    },
    {
      changeType: 'removed',
      entityType: 'capability',
      entityId: 'c1',
      entityName: 'Legacy Processing',
      before: { id: 'c1', name: 'Legacy Processing', description: 'Old' },
      after: null,
    },
    {
      changeType: 'modified',
      entityType: 'companyModel',
      entityId: null,
      entityName: 'Company Model',
      before: { purpose: 'Old purpose', type: 'SaaS', scope: '', principles: [] },
      after: { purpose: 'New purpose', type: 'SaaS', scope: 'Global', principles: ['speed'] },
    },
  ],
  summary: { added: 1, removed: 1, modified: 1 },
}

describe('ReleaseDiffView', () => {
  it('should display diff header with versions', () => {
    renderWithQuery(<ReleaseDiffView diff={emptyDiff} onClose={vi.fn()} />)
    expect(screen.getByText(/v1\.0 → v2\.0/)).toBeDefined()
  })

  it('should display summary counts', () => {
    renderWithQuery(<ReleaseDiffView diff={diffWithChanges} onClose={vi.fn()} />)
    expect(screen.getByText(/1 added, 1 removed, 1 modified/)).toBeDefined()
  })

  it('should show empty state when no changes', () => {
    renderWithQuery(<ReleaseDiffView diff={emptyDiff} onClose={vi.fn()} />)
    expect(screen.getByText(/no differences found/i)).toBeDefined()
  })

  it('should group changes by entity type', () => {
    renderWithQuery(<ReleaseDiffView diff={diffWithChanges} onClose={vi.fn()} />)
    expect(screen.getByText('Departments')).toBeDefined()
    expect(screen.getByText('Capabilities')).toBeDefined()
    expect(screen.getAllByText('Company Model').length).toBeGreaterThanOrEqual(1)
  })

  it('should display entity names and badges', () => {
    renderWithQuery(<ReleaseDiffView diff={diffWithChanges} onClose={vi.fn()} />)
    expect(screen.getByText('Sales')).toBeDefined()
    expect(screen.getByText('Legacy Processing')).toBeDefined()
    expect(screen.getByText('Added')).toBeDefined()
    expect(screen.getByText('Removed')).toBeDefined()
    expect(screen.getByText('Modified')).toBeDefined()
  })

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn()
    renderWithQuery(<ReleaseDiffView diff={diffWithChanges} onClose={onClose} />)
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should expand change item to show field details', () => {
    renderWithQuery(<ReleaseDiffView diff={diffWithChanges} onClose={vi.fn()} />)
    const companyModelButton = screen.getByText('Company Model', { selector: 'span' })
    fireEvent.click(companyModelButton)
    expect(screen.getByText('purpose:')).toBeDefined()
    expect(screen.getByText('Old purpose')).toBeDefined()
    expect(screen.getByText('New purpose')).toBeDefined()
  })
})
