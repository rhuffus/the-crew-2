import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateFoundationDocument,
  persistDocumentResult,
} from '../activities/document.activities'
import type { FoundationDocumentWorkflowInput } from '@the-crew/shared-types'

function makeInput(
  overrides: Partial<FoundationDocumentWorkflowInput> = {},
): FoundationDocumentWorkflowInput {
  return {
    projectId: 'proj-1',
    operation: 'generate',
    documentSlug: '00-company-overview',
    context: {
      companyName: 'Acme Corp',
      companyMission: 'Build great software',
      companyType: 'saas-startup',
      bootstrapStatus: 'drafting-foundation-docs',
      existingDocSummaries: [],
    },
    ...overrides,
  }
}

// --------------------------------------------------------------------------
// generateFoundationDocument
// --------------------------------------------------------------------------

describe('generateFoundationDocument', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should call the Claude runner with correct payload for generate', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({
          title: 'Company Overview',
          bodyMarkdown: '# Company Overview\n\nAcme Corp builds great software.',
        }),
      }),
    })
    globalThis.fetch = mockFetch

    const result = await generateFoundationDocument(makeInput())

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:4010/claude-runner/execute')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body as string)
    expect(body.projectId).toBe('proj-1')
    expect(body.agentId).toBe('ceo-bootstrap')
    expect(body.taskType).toBe('document-drafting')
    expect(body.instruction).toContain('Acme Corp')
    expect(body.instruction).toContain('Company Overview')
    expect(body.instruction).toContain('00-company-overview')
    expect(body.contextBundle.documentSlug).toBe('00-company-overview')
    expect(body.contextBundle.operation).toBe('generate')
    expect(body.runMode).toBe('one-shot')
    expect(body.timeout).toBe(120)
    expect(result.title).toBe('Company Overview')
    expect(result.bodyMarkdown).toContain('Acme Corp')
  })

  it('should use document-revision taskType for update operations', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({
          title: 'Company Overview',
          bodyMarkdown: '# Updated Overview',
        }),
      }),
    })
    globalThis.fetch = mockFetch

    await generateFoundationDocument(makeInput({
      operation: 'update',
      existingBody: '# Old content',
    }))

    const body = JSON.parse(
      (mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string,
    )
    expect(body.taskType).toBe('document-revision')
    expect(body.instruction).toContain('Update the foundation document')
    expect(body.instruction).toContain('Old content')
  })

  it('should use PLATFORM_SERVICE_URL env var', async () => {
    process.env.PLATFORM_SERVICE_URL = 'http://platform:4010'
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({ title: 'ok', bodyMarkdown: 'ok' }),
      }),
    })
    globalThis.fetch = mockFetch

    await generateFoundationDocument(makeInput())

    expect((mockFetch.mock.calls[0] as [string])[0]).toBe('http://platform:4010/claude-runner/execute')
    delete process.env.PLATFORM_SERVICE_URL
  })

  it('should parse JSON response correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({
          title: 'Mission & Vision',
          bodyMarkdown: '# Mission\n\nWe build software.\n\n# Vision\n\nGlobal scale.',
        }),
      }),
    })

    const result = await generateFoundationDocument(
      makeInput({ documentSlug: '01-mission-vision' }),
    )

    expect(result.title).toBe('Mission & Vision')
    expect(result.bodyMarkdown).toContain('# Mission')
    expect(result.bodyMarkdown).toContain('# Vision')
  })

  it('should extract JSON embedded in markdown', async () => {
    const markdown = 'Some intro text\n```json\n{"title":"Extracted","bodyMarkdown":"# Extracted Doc"}\n```'
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stdoutSummary: markdown }),
    })

    const result = await generateFoundationDocument(makeInput())

    expect(result.title).toBe('Extracted')
    expect(result.bodyMarkdown).toBe('# Extracted Doc')
  })

  it('should handle plain text response as body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: '# Company Overview\n\nJust raw markdown without JSON wrapper.',
      }),
    })

    const result = await generateFoundationDocument(makeInput())

    expect(result.title).toBe('Company Overview') // fallback title from slug
    expect(result.bodyMarkdown).toContain('Just raw markdown')
  })

  it('should handle empty response gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stdoutSummary: '' }),
    })

    const result = await generateFoundationDocument(makeInput())

    expect(result.title).toBe('Company Overview')
    expect(result.bodyMarkdown).toContain('could not be generated')
  })

  it('should handle missing stdoutSummary field', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const result = await generateFoundationDocument(makeInput())

    expect(result.bodyMarkdown).toContain('could not be generated')
  })

  it('should throw on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })

    await expect(generateFoundationDocument(makeInput())).rejects.toThrow(
      'Claude runner returned 500',
    )
  })

  it('should include existing doc summaries in prompt', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({ title: 'ok', bodyMarkdown: 'ok' }),
      }),
    })
    globalThis.fetch = mockFetch

    await generateFoundationDocument(makeInput({
      context: {
        companyName: 'Acme',
        companyMission: '',
        companyType: '',
        bootstrapStatus: 'drafting-foundation-docs',
        existingDocSummaries: [
          { slug: '00-company-overview', title: 'Company Overview' },
          { slug: '01-mission-vision', title: 'Mission & Vision' },
        ],
      },
    }))

    const body = JSON.parse(
      (mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string,
    )
    expect(body.instruction).toContain('00-company-overview: Company Overview')
    expect(body.instruction).toContain('01-mission-vision: Mission & Vision')
  })

  it('should include additional instructions in prompt', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({ title: 'ok', bodyMarkdown: 'ok' }),
      }),
    })
    globalThis.fetch = mockFetch

    await generateFoundationDocument(makeInput({
      additionalInstructions: 'Focus on B2B fintech angle',
    }))

    const body = JSON.parse(
      (mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string,
    )
    expect(body.instruction).toContain('Focus on B2B fintech angle')
  })

  it('should use documentTitle as fallback when slug is unknown', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stdoutSummary: '' }),
    })

    const result = await generateFoundationDocument(makeInput({
      documentSlug: 'custom-doc',
      documentTitle: 'My Custom Document',
    }))

    expect(result.title).toBe('My Custom Document')
  })

  it('should use JSON title over fallback when response has title', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        stdoutSummary: JSON.stringify({
          title: 'AI-Generated Title',
          bodyMarkdown: '# Content',
        }),
      }),
    })

    const result = await generateFoundationDocument(makeInput())

    expect(result.title).toBe('AI-Generated Title')
  })
})

// --------------------------------------------------------------------------
// persistDocumentResult
// --------------------------------------------------------------------------

describe('persistDocumentResult', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  const generated = {
    title: 'Company Overview',
    bodyMarkdown: '# Company Overview\n\nAcme builds great software.',
  }

  it('should create a new document for generate operation', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'doc-abc' }),
    })
    globalThis.fetch = mockFetch

    const result = await persistDocumentResult(makeInput(), generated)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:4020/projects/proj-1/documents')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body as string)
    expect(body.slug).toBe('00-company-overview')
    expect(body.title).toBe('Company Overview')
    expect(body.bodyMarkdown).toContain('Acme')
    expect(body.status).toBe('draft')
    expect(body.sourceType).toBe('agent')
    expect(body.lastUpdatedBy).toBe('ceo-bootstrap')

    expect(result.documentId).toBe('doc-abc')
    expect(result.persisted).toBe(true)
    expect(result.slug).toBe('00-company-overview')
    expect(result.title).toBe('Company Overview')
    expect(result.status).toBe('draft')
    expect(result.sourceType).toBe('agent')
  })

  it('should find and update existing document for update operation', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'doc-existing' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'doc-existing' }),
      })
    globalThis.fetch = mockFetch

    const result = await persistDocumentResult(
      makeInput({ operation: 'update' }),
      generated,
    )

    expect(mockFetch).toHaveBeenCalledTimes(2)

    // First call: find by slug
    const [findUrl] = mockFetch.mock.calls[0] as [string]
    expect(findUrl).toContain('/projects/proj-1/documents/by-slug?slug=00-company-overview')

    // Second call: update
    const [updateUrl, updateOptions] = mockFetch.mock.calls[1] as [string, RequestInit]
    expect(updateUrl).toBe('http://localhost:4020/projects/proj-1/documents/doc-existing')
    expect(updateOptions.method).toBe('PATCH')
    const body = JSON.parse(updateOptions.body as string)
    expect(body.title).toBe('Company Overview')
    expect(body.bodyMarkdown).toContain('Acme')
    expect(body.lastUpdatedBy).toBe('ceo-bootstrap')

    expect(result.documentId).toBe('doc-existing')
    expect(result.persisted).toBe(true)
  })

  it('should use COMPANY_DESIGN_SERVICE_URL env var', async () => {
    process.env.COMPANY_DESIGN_SERVICE_URL = 'http://custom:8888'
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'doc-1' }),
    })
    globalThis.fetch = mockFetch

    await persistDocumentResult(makeInput(), generated)

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('http://custom:8888')
    delete process.env.COMPANY_DESIGN_SERVICE_URL
  })

  it('should return persisted=false on create failure', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })
    globalThis.fetch = mockFetch

    const result = await persistDocumentResult(makeInput(), generated)

    expect(result.persisted).toBe(false)
    expect(result.documentId).toBe('')
    expect(result.slug).toBe('00-company-overview')
    expect(result.title).toBe('Company Overview')
  })

  it('should return persisted=false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await persistDocumentResult(makeInput(), generated)

    expect(result.persisted).toBe(false)
    expect(result.documentId).toBe('')
  })

  it('should return persisted=false on find-by-slug failure during update', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found'),
    })
    globalThis.fetch = mockFetch

    const result = await persistDocumentResult(
      makeInput({ operation: 'update' }),
      generated,
    )

    expect(result.persisted).toBe(false)
  })

  it('should return persisted=false on update PATCH failure', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'doc-existing' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server Error'),
      })
    globalThis.fetch = mockFetch

    const result = await persistDocumentResult(
      makeInput({ operation: 'update' }),
      generated,
    )

    expect(result.persisted).toBe(false)
  })
})
