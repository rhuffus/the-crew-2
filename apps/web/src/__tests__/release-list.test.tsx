import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReleaseList } from '@/components/releases/release-list'
import { ReleaseCard } from '@/components/releases/release-card'
import type { ReleaseDto } from '@the-crew/shared-types'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const draftRelease: ReleaseDto = {
  id: 'r1',
  projectId: 'p1',
  version: '1.0.0',
  status: 'draft',
  notes: 'Initial release notes',
  snapshot: null,
  validationIssues: [],
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
  publishedAt: null,
}

const publishedRelease: ReleaseDto = {
  id: 'r2',
  projectId: 'p1',
  version: '0.9.0',
  status: 'published',
  notes: 'Previous release',
  snapshot: null,
  validationIssues: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-10T00:00:00Z',
  publishedAt: '2026-01-10T00:00:00Z',
}

describe('ReleaseList', () => {
  it('should show empty state', () => {
    renderWithQuery(
      <ReleaseList releases={[]} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText(/no releases yet/i)).toBeDefined()
  })

  it('should render release cards', () => {
    renderWithQuery(
      <ReleaseList
        releases={[draftRelease]}
        onPublish={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('1.0.0')).toBeDefined()
    expect(screen.getByText('Initial release notes')).toBeDefined()
  })
})

describe('ReleaseCard', () => {
  it('should display version and status badge', () => {
    renderWithQuery(
      <ReleaseCard release={draftRelease} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('1.0.0')).toBeDefined()
    expect(screen.getByText('draft')).toBeDefined()
  })

  it('should display notes', () => {
    renderWithQuery(
      <ReleaseCard release={draftRelease} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('Initial release notes')).toBeDefined()
  })

  it('should show publish and delete buttons for draft releases', () => {
    renderWithQuery(
      <ReleaseCard release={draftRelease} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /publish 1\.0\.0/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /delete 1\.0\.0/i })).toBeDefined()
  })

  it('should not show publish or delete buttons for published releases', () => {
    renderWithQuery(
      <ReleaseCard release={publishedRelease} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.queryByRole('button', { name: /publish/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull()
  })

  it('should show published date for published releases', () => {
    renderWithQuery(
      <ReleaseCard release={publishedRelease} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('published')).toBeDefined()
    expect(screen.getByText(/published jan/i)).toBeDefined()
  })

  it('should show created date', () => {
    renderWithQuery(
      <ReleaseCard release={draftRelease} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText(/created jan/i)).toBeDefined()
  })

  it('should disable publish button when isPublishing is true', () => {
    renderWithQuery(
      <ReleaseCard release={draftRelease} onPublish={vi.fn()} onDelete={vi.fn()} isPublishing />,
    )
    const button = screen.getByRole('button', { name: /publish 1\.0\.0/i })
    expect(button).toHaveProperty('disabled', true)
  })

  it('should render without notes', () => {
    const noNotes = { ...draftRelease, notes: '' }
    renderWithQuery(
      <ReleaseCard release={noNotes} onPublish={vi.fn()} onDelete={vi.fn()} />,
    )
    expect(screen.getByText('1.0.0')).toBeDefined()
  })
})
