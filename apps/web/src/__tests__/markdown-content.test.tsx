import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MarkdownContent } from '@/components/visual-shell/chat-dock/markdown-content'

vi.mock('@/hooks/use-project-documents', () => ({
  useProjectDocuments: () => ({
    data: [
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
    ],
  }),
}))

vi.mock('@/stores/visual-workspace-store', () => ({
  useVisualWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ openDocumentView: vi.fn() }),
}))

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderMarkdown(content: string) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MarkdownContent content={content} projectId="proj-1" />
    </QueryClientProvider>,
  )
}

describe('MarkdownContent', () => {
  it('renders plain text', () => {
    renderMarkdown('Hello world')
    expect(screen.getByText('Hello world')).toBeDefined()
  })

  it('renders bold text', () => {
    renderMarkdown('This is **bold** text')
    const strong = screen.getByText('bold')
    expect(strong.tagName).toBe('STRONG')
  })

  it('renders italic text', () => {
    renderMarkdown('This is *italic* text')
    const em = screen.getByText('italic')
    expect(em.tagName).toBe('EM')
  })

  it('renders headings', () => {
    renderMarkdown('# Title')
    const heading = screen.getByText('Title')
    expect(heading.tagName).toBe('H1')
  })

  it('renders unordered lists', () => {
    renderMarkdown('- Item 1\n- Item 2')
    expect(screen.getByText('Item 1')).toBeDefined()
    expect(screen.getByText('Item 2')).toBeDefined()
  })

  it('renders code blocks', () => {
    renderMarkdown('```\nconst x = 1\n```')
    expect(screen.getByText('const x = 1')).toBeDefined()
  })

  it('renders inline code', () => {
    renderMarkdown('Use `useState` hook')
    const code = screen.getByText('useState')
    expect(code.tagName).toBe('CODE')
  })

  it('renders links as external', () => {
    renderMarkdown('[Click here](https://example.com)')
    const link = screen.getByText('Click here')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('renders @doc: mentions as DocumentLinks', () => {
    renderMarkdown('See @doc:company-overview for details')
    expect(screen.getByTestId('doc-link-company-overview')).toBeDefined()
    expect(screen.getByText('Company Overview')).toBeDefined()
  })

  it('has data-testid markdown-content', () => {
    renderMarkdown('Test')
    expect(screen.getByTestId('markdown-content')).toBeDefined()
  })

  it('renders blockquotes', () => {
    renderMarkdown('> This is a quote')
    const blockquote = screen.getByText('This is a quote').closest('blockquote')
    expect(blockquote).toBeDefined()
  })

  it('renders tables (GFM)', () => {
    renderMarkdown('| Col A | Col B |\n| --- | --- |\n| 1 | 2 |')
    expect(screen.getByText('Col A')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
  })
})
