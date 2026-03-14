import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DocumentMentionPopover } from '@/components/visual-shell/chat-dock/document-mention-popover'
import { renderWithDocLinks } from '@/components/visual-shell/chat-dock/document-link'
import type { ProjectDocumentDto } from '@the-crew/shared-types'

const mockDocs: ProjectDocumentDto[] = [
  {
    id: 'doc-1',
    projectId: 'proj-1',
    slug: 'company-overview',
    title: 'Company Overview',
    bodyMarkdown: '# Overview',
    status: 'draft',
    linkedEntityIds: [],
    lastUpdatedBy: 'user',
    sourceType: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-2',
    projectId: 'proj-1',
    slug: 'mission-vision',
    title: 'Mission & Vision',
    bodyMarkdown: '# Mission',
    status: 'approved',
    linkedEntityIds: [],
    lastUpdatedBy: 'agent',
    sourceType: 'agent',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const mockOpenDocumentView = vi.fn()

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocuments: () => ({ data: mockDocs }),
  useProjectDocument: () => ({ data: null, isLoading: false }),
  useUpdateProjectDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateProjectDocument: () => ({ mutate: vi.fn() }),
  useDeleteProjectDocument: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/stores/visual-workspace-store', () => ({
  useVisualWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ openDocumentView: mockOpenDocumentView }),
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

describe('DocumentMentionPopover', () => {
  beforeEach(() => {
    mockOpenDocumentView.mockReset()
  })

  it('renders mention button', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <DocumentMentionPopover projectId="proj-1" onSelect={vi.fn()} />
      </QueryClientProvider>,
    )
    expect(screen.getByLabelText('Mention a document')).toBeDefined()
  })

  it('shows document list on click', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <DocumentMentionPopover projectId="proj-1" onSelect={vi.fn()} />
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByLabelText('Mention a document'))
    expect(screen.getByTestId('doc-mention-list')).toBeDefined()
    expect(screen.getByText('Company Overview')).toBeDefined()
    expect(screen.getByText('Mission & Vision')).toBeDefined()
  })

  it('calls onSelect when a document is clicked', () => {
    const onSelect = vi.fn()
    render(
      <QueryClientProvider client={createQueryClient()}>
        <DocumentMentionPopover projectId="proj-1" onSelect={onSelect} />
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByLabelText('Mention a document'))
    fireEvent.click(screen.getByTestId('mention-doc-company-overview'))
    expect(onSelect).toHaveBeenCalledWith(mockDocs[0])
  })

  it('closes popover after selection', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <DocumentMentionPopover projectId="proj-1" onSelect={vi.fn()} />
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByLabelText('Mention a document'))
    fireEvent.click(screen.getByTestId('mention-doc-company-overview'))
    expect(screen.queryByTestId('doc-mention-list')).toBeNull()
  })
})

describe('renderWithDocLinks', () => {
  it('returns plain text when no mentions', () => {
    const result = renderWithDocLinks('Hello world', 'proj-1')
    expect(result).toEqual(['Hello world'])
  })

  it('splits text around @doc:slug mentions', () => {
    const result = renderWithDocLinks('Check @doc:company-overview for details', 'proj-1')
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('Check ')
    expect(result[2]).toBe(' for details')
  })

  it('handles multiple mentions', () => {
    const result = renderWithDocLinks('@doc:company-overview and @doc:mission-vision', 'proj-1')
    expect(result).toHaveLength(3)
    expect(result[1]).toBe(' and ')
  })

  it('handles mention at start of text', () => {
    const result = renderWithDocLinks('@doc:company-overview is important', 'proj-1')
    expect(result).toHaveLength(2)
    expect(result[1]).toBe(' is important')
  })

  it('handles mention at end of text', () => {
    const result = renderWithDocLinks('See @doc:company-overview', 'proj-1')
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('See ')
  })
})

describe('DocumentLink (rendered)', () => {
  it('renders clickable link for known doc', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <p>{renderWithDocLinks('See @doc:company-overview', 'proj-1')}</p>
      </QueryClientProvider>,
    )
    expect(screen.getByTestId('doc-link-company-overview')).toBeDefined()
    expect(screen.getByText('Company Overview')).toBeDefined()
  })

  it('opens document in center view on click', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <p>{renderWithDocLinks('See @doc:company-overview', 'proj-1')}</p>
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByTestId('doc-link-company-overview'))
    expect(mockOpenDocumentView).toHaveBeenCalledWith('doc-1')
  })

  it('renders fallback for unknown doc slug', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <p>{renderWithDocLinks('See @doc:unknown-doc', 'proj-1')}</p>
      </QueryClientProvider>,
    )
    expect(screen.getByText('@doc:unknown-doc')).toBeDefined()
  })
})
