import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DocumentEmbeddedView } from '@/components/documents/document-embedded-view'
import type { ProjectDocumentDto } from '@the-crew/shared-types'

// Mock MDXEditor — requires browser APIs not available in jsdom
vi.mock('@mdxeditor/editor', () => ({
  MDXEditor: React.forwardRef(({ markdown, onChange }: { markdown: string; onChange?: (md: string) => void }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      getMarkdown: () => markdown,
      setMarkdown: () => {},
    }))
    return React.createElement('div', {
      'data-testid': 'mdx-editor',
      contentEditable: true,
      onInput: (e: Event) => onChange?.((e.target as HTMLElement).textContent ?? ''),
    }, markdown)
  }),
  headingsPlugin: () => ({}),
  listsPlugin: () => ({}),
  quotePlugin: () => ({}),
  thematicBreakPlugin: () => ({}),
  markdownShortcutPlugin: () => ({}),
  toolbarPlugin: () => ({}),
  BoldItalicUnderlineToggles: () => null,
  BlockTypeSelect: () => null,
  ListsToggle: () => null,
  UndoRedo: () => null,
}))

vi.mock('@mdxeditor/editor/style.css', () => ({}))

const mockDoc: ProjectDocumentDto = {
  id: 'doc-1',
  projectId: 'proj-1',
  slug: 'company-overview',
  title: 'Company Overview',
  bodyMarkdown: '# Overview\n\nThis is the overview.',
  status: 'draft',
  linkedEntityIds: [],
  lastUpdatedBy: 'user',
  sourceType: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockDocApproved: ProjectDocumentDto = {
  ...mockDoc,
  id: 'doc-2',
  slug: 'approved-doc',
  title: 'Approved Document',
  status: 'approved',
  sourceType: 'agent',
}

const mockUpdate = vi.fn()

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocument: (_projectId: string, id: string) => ({
    data: id === 'doc-1' ? mockDoc : id === 'doc-2' ? mockDocApproved : undefined,
    isLoading: id === 'loading-doc',
  }),
  useProjectDocuments: () => ({ data: [mockDoc, mockDocApproved] }),
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

function renderView(documentId: string = 'doc-1') {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <DocumentEmbeddedView projectId="proj-1" documentId={documentId} />
    </QueryClientProvider>,
  )
}

describe('DocumentEmbeddedView', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  it('renders with document-embedded-view testid', () => {
    renderView()
    expect(screen.getByTestId('document-embedded-view')).toBeDefined()
  })

  it('renders document title and metadata', () => {
    renderView()
    expect(screen.getByText('Company Overview')).toBeDefined()
    expect(screen.getByText('draft')).toBeDefined()
    expect(screen.getByText('user')).toBeDefined()
  })

  it('shows visual mode by default with MDXEditor', () => {
    renderView()
    expect(screen.getByTestId('mdx-editor')).toBeDefined()
    expect(screen.getByTestId('mode-visual').className).toContain('bg-primary')
  })

  it('toggles to source mode', () => {
    renderView()
    fireEvent.click(screen.getByTestId('mode-source'))
    expect(screen.getByTestId('source-textarea')).toBeDefined()
    expect(screen.getByTestId('mode-source').className).toContain('bg-primary')
  })

  it('toggles back to visual mode from source', () => {
    renderView()
    fireEvent.click(screen.getByTestId('mode-source'))
    expect(screen.getByTestId('source-textarea')).toBeDefined()
    fireEvent.click(screen.getByTestId('mode-visual'))
    expect(screen.getByTestId('mdx-editor')).toBeDefined()
  })

  it('save button disabled when no changes', () => {
    renderView()
    expect(screen.getByTestId('save-button').hasAttribute('disabled')).toBe(true)
  })

  it('enables save button when source text changes', () => {
    renderView()
    fireEvent.click(screen.getByTestId('mode-source'))
    const textarea = screen.getByTestId('source-textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '# Updated' } })
    expect(screen.getByTestId('save-button').hasAttribute('disabled')).toBe(false)
  })

  it('calls update mutation on save', () => {
    renderView()
    fireEvent.click(screen.getByTestId('mode-source'))
    const textarea = screen.getByTestId('source-textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '# Updated' } })
    fireEvent.click(screen.getByTestId('save-button'))
    expect(mockUpdate).toHaveBeenCalledWith(
      { id: 'doc-1', dto: { bodyMarkdown: '# Updated', lastUpdatedBy: 'user' } },
      expect.any(Object),
    )
  })

  it('shows not found when document does not exist', () => {
    renderView('nonexistent')
    expect(screen.getByText('Document not found')).toBeDefined()
  })

  it('shows loading spinner for loading document', () => {
    renderView('loading-doc')
    const view = screen.getByTestId('document-embedded-view')
    expect(view.querySelector('.animate-spin')).toBeDefined()
  })

  it('renders approved status badge correctly', () => {
    renderView('doc-2')
    expect(screen.getByText('Approved Document')).toBeDefined()
    expect(screen.getByText('approved')).toBeDefined()
    expect(screen.getByText('agent')).toBeDefined()
  })

  it('has no Dialog wrapper — is a plain div', () => {
    renderView()
    const view = screen.getByTestId('document-embedded-view')
    expect(view.tagName).toBe('DIV')
    // Should not have role="dialog"
    expect(view.getAttribute('role')).toBeNull()
  })

  it('fills full height via flex layout', () => {
    renderView()
    const view = screen.getByTestId('document-embedded-view')
    expect(view.className).toContain('h-full')
    expect(view.className).toContain('flex-col')
  })

  it('has editor area that fills remaining space', () => {
    renderView()
    const editorArea = screen.getByTestId('editor-area')
    expect(editorArea.className).toContain('flex-1')
    expect(editorArea.className).toContain('min-h-0')
  })
})
