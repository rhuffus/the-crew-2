import { describe, it, expect } from 'vitest'
import type {
  FoundationDocumentWorkflowInput,
  FoundationDocumentWorkflowOutput,
  FoundationDocumentContext,
  FoundationDocumentSlug,
  FoundationDocumentOperation,
} from '../foundation-document-workflow-types'

describe('foundation-document-workflow-types', () => {
  it('should accept a valid generate input', () => {
    const input: FoundationDocumentWorkflowInput = {
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
    }
    expect(input.operation).toBe('generate')
    expect(input.existingBody).toBeUndefined()
  })

  it('should accept a valid update input with existing body', () => {
    const input: FoundationDocumentWorkflowInput = {
      projectId: 'proj-1',
      operation: 'update',
      documentSlug: '01-mission-vision',
      existingBody: '# Mission\n\nOld content here.',
      additionalInstructions: 'Focus on fintech angle',
      context: {
        companyName: 'Acme Corp',
        companyMission: 'Build great software',
        companyType: 'saas-startup',
        bootstrapStatus: 'reviewing-foundation-docs',
        existingDocSummaries: [
          { slug: '00-company-overview', title: 'Company Overview' },
        ],
      },
    }
    expect(input.operation).toBe('update')
    expect(input.existingBody).toContain('Old content')
    expect(input.additionalInstructions).toBe('Focus on fintech angle')
    expect(input.context.existingDocSummaries).toHaveLength(1)
  })

  it('should accept a valid output with persisted=true', () => {
    const output: FoundationDocumentWorkflowOutput = {
      documentId: 'doc-123',
      projectId: 'proj-1',
      slug: '00-company-overview',
      title: 'Company Overview',
      status: 'draft',
      sourceType: 'agent',
      persisted: true,
    }
    expect(output.documentId).toBe('doc-123')
    expect(output.persisted).toBe(true)
  })

  it('should accept output with persisted=false for non-critical failure', () => {
    const output: FoundationDocumentWorkflowOutput = {
      documentId: '',
      projectId: 'proj-1',
      slug: '00-company-overview',
      title: 'Company Overview',
      status: 'draft',
      sourceType: 'agent',
      persisted: false,
    }
    expect(output.persisted).toBe(false)
    expect(output.documentId).toBe('')
  })

  it('should support FoundationDocumentContext independently', () => {
    const ctx: FoundationDocumentContext = {
      companyName: 'Test Corp',
      companyMission: 'Testing things',
      companyType: 'testing',
      bootstrapStatus: 'collecting-context',
      existingDocSummaries: [],
    }
    expect(ctx.companyName).toBe('Test Corp')
    expect(ctx.existingDocSummaries).toHaveLength(0)
  })

  it('should support all valid foundation document slugs', () => {
    const slugs: FoundationDocumentSlug[] = [
      '00-company-overview',
      '01-mission-vision',
      '02-founder-constraints-and-preferences',
      '03-operating-principles',
      '04-initial-objectives',
      '05-initial-roadmap',
      '06-initial-backlog',
      '07-bootstrap-decisions-log',
      '08-product-scope',
      '09-user-and-market-notes',
      '10-org-bootstrapping-plan',
    ]
    expect(slugs).toHaveLength(11)
  })

  it('should support both operation types', () => {
    const ops: FoundationDocumentOperation[] = ['generate', 'update']
    expect(ops).toHaveLength(2)
  })

  it('should accept custom string slug for extensibility', () => {
    const input: FoundationDocumentWorkflowInput = {
      projectId: 'proj-1',
      operation: 'generate',
      documentSlug: 'custom-doc',
      documentTitle: 'Custom Document',
      context: {
        companyName: 'Acme',
        companyMission: '',
        companyType: '',
        bootstrapStatus: 'drafting-foundation-docs',
        existingDocSummaries: [],
      },
    }
    expect(input.documentSlug).toBe('custom-doc')
    expect(input.documentTitle).toBe('Custom Document')
  })
})
