import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DocumentInspectorPanel } from '@/components/visual-shell/inspector/document-inspector-panel'
import type { ProjectDocumentDto } from '@the-crew/shared-types'

const mockDocDraft: ProjectDocumentDto = {
  id: 'doc-1',
  projectId: 'proj-1',
  slug: 'company-overview',
  title: 'Company Overview',
  bodyMarkdown: '# Overview',
  status: 'draft',
  linkedEntityIds: [],
  lastUpdatedBy: 'user',
  sourceType: 'user',
  createdAt: '2024-06-15T10:30:00Z',
  updatedAt: '2024-06-16T14:00:00Z',
}

const mockDocReview: ProjectDocumentDto = {
  ...mockDocDraft,
  id: 'doc-review',
  slug: 'review-doc',
  title: 'Review Document',
  status: 'review',
  sourceType: 'agent',
  linkedEntityIds: ['entity-a', 'entity-b'],
}

const mockDocApproved: ProjectDocumentDto = {
  ...mockDocDraft,
  id: 'doc-approved',
  slug: 'approved-doc',
  title: 'Approved Document',
  status: 'approved',
}

const mockUpdate = vi.fn()

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocument: (_projectId: string, id: string) => {
    const docs: Record<string, ProjectDocumentDto> = {
      'doc-1': mockDocDraft,
      'doc-review': mockDocReview,
      'doc-approved': mockDocApproved,
    }
    return {
      data: docs[id],
      isLoading: id === 'loading-doc',
    }
  },
  useProjectDocuments: () => ({ data: [] }),
  useUpdateProjectDocument: () => ({
    mutate: mockUpdate,
    isPending: false,
  }),
  useCreateProjectDocument: () => ({ mutate: vi.fn() }),
  useDeleteProjectDocument: () => ({ mutate: vi.fn() }),
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderPanel(documentId: string = 'doc-1') {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <DocumentInspectorPanel projectId="proj-1" documentId={documentId} />
    </QueryClientProvider>,
  )
}

describe('DocumentInspectorPanel', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it('renders with document-inspector-panel testid', () => {
    renderPanel()
    expect(screen.getByTestId('document-inspector-panel')).toBeDefined()
  })

  it('shows document title and slug', () => {
    renderPanel()
    expect(screen.getByText('Company Overview')).toBeDefined()
    expect(screen.getByText('company-overview')).toBeDefined()
  })

  it('shows draft status badge', () => {
    renderPanel()
    const badge = screen.getByTestId('status-badge')
    expect(badge.textContent).toBe('draft')
    expect(badge.className).toContain('bg-yellow-100')
  })

  it('shows source type', () => {
    renderPanel()
    expect(screen.getByTestId('source-type').textContent).toBe('user')
  })

  it('shows history dates and last updated by', () => {
    renderPanel()
    expect(screen.getByTestId('created-at').textContent).toBe('Jun 15, 2024')
    expect(screen.getByTestId('updated-at').textContent).toBe('Jun 16, 2024')
    expect(screen.getByTestId('last-updated-by').textContent).toBe('user')
  })

  it('shows "Send to Review" action for draft documents', () => {
    renderPanel()
    expect(screen.getByTestId('action-review')).toBeDefined()
    expect(screen.getByText('Send to Review')).toBeDefined()
  })

  it('calls update mutation with review status on "Send to Review" click', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('action-review'))
    expect(mockUpdate).toHaveBeenCalledWith(
      { id: 'doc-1', dto: { status: 'review', lastUpdatedBy: 'user' } },
    )
  })

  it('shows "Approve" and "Back to Draft" actions for review documents', () => {
    renderPanel('doc-review')
    expect(screen.getByTestId('action-approved')).toBeDefined()
    expect(screen.getByText('Approve')).toBeDefined()
    expect(screen.getByTestId('action-draft')).toBeDefined()
    expect(screen.getByText('Back to Draft')).toBeDefined()
  })

  it('calls update mutation with approved status on "Approve" click', () => {
    renderPanel('doc-review')
    fireEvent.click(screen.getByTestId('action-approved'))
    expect(mockUpdate).toHaveBeenCalledWith(
      { id: 'doc-review', dto: { status: 'approved', lastUpdatedBy: 'user' } },
    )
  })

  it('shows "Reopen as Draft" action for approved documents', () => {
    renderPanel('doc-approved')
    expect(screen.getByTestId('action-draft')).toBeDefined()
    expect(screen.getByText('Reopen as Draft')).toBeDefined()
  })

  it('shows agent source type for agent-created documents', () => {
    renderPanel('doc-review')
    expect(screen.getByTestId('source-type').textContent).toBe('agent')
  })

  it('shows linked entities when present', () => {
    renderPanel('doc-review')
    expect(screen.getByText('entity-a')).toBeDefined()
    expect(screen.getByText('entity-b')).toBeDefined()
  })

  it('does not show linked entities section when empty', () => {
    renderPanel()
    expect(screen.queryByText('Linked Entities')).toBeNull()
  })

  it('shows loading state', () => {
    renderPanel('loading-doc')
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows not found state', () => {
    renderPanel('nonexistent')
    expect(screen.getByText('Document not found')).toBeDefined()
  })

  it('review status badge has blue styling', () => {
    renderPanel('doc-review')
    const badge = screen.getByTestId('status-badge')
    expect(badge.textContent).toBe('review')
    expect(badge.className).toContain('bg-blue-100')
  })

  it('approved status badge has green styling', () => {
    renderPanel('doc-approved')
    const badge = screen.getByTestId('status-badge')
    expect(badge.textContent).toBe('approved')
    expect(badge.className).toContain('bg-green-100')
  })
})
