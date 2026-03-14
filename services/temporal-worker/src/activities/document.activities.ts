import type {
  FoundationDocumentWorkflowInput,
  FoundationDocumentWorkflowOutput,
} from '@the-crew/shared-types'

/**
 * Document slug → human-readable title mapping (from docs/60-foundation-documents-spec.md)
 */
const SLUG_TITLES: Record<string, string> = {
  '00-company-overview': 'Company Overview',
  '01-mission-vision': 'Mission & Vision',
  '02-founder-constraints-and-preferences': 'Founder Constraints & Preferences',
  '03-operating-principles': 'Operating Principles',
  '04-initial-objectives': 'Initial Objectives',
  '05-initial-roadmap': 'Initial Roadmap',
  '06-initial-backlog': 'Initial Backlog',
  '07-bootstrap-decisions-log': 'Bootstrap Decisions Log',
  '08-product-scope': 'Product Scope',
  '09-user-and-market-notes': 'User & Market Notes',
  '10-org-bootstrapping-plan': 'Org Bootstrapping Plan',
}

/**
 * Build a prompt for the Claude runner to generate/update a foundation document.
 */
function buildDocumentPrompt(input: FoundationDocumentWorkflowInput): string {
  const { operation, documentSlug, context, existingBody, additionalInstructions } = input
  const { companyName, companyMission, companyType, bootstrapStatus, existingDocSummaries } = context

  const title = SLUG_TITLES[documentSlug] ?? input.documentTitle ?? documentSlug

  const persona = [
    `You are the CEO agent for "${companyName || 'a new company'}".`,
    companyMission ? `Company mission: "${companyMission}"` : '',
    companyType ? `Company type: ${companyType}` : '',
    `Current bootstrap phase: ${bootstrapStatus}`,
  ].filter(Boolean).join('\n')

  const existingDocsContext = existingDocSummaries.length > 0
    ? `\nExisting documents for cross-reference:\n${existingDocSummaries.map((d) => `- ${d.slug}: ${d.title}`).join('\n')}`
    : ''

  let task: string
  if (operation === 'generate') {
    task = [
      `Generate the foundation document: "${title}" (slug: ${documentSlug}).`,
      '',
      'Requirements:',
      '1. Write the full document content in Markdown format',
      '2. Include appropriate headers, sections, and structure',
      '3. Be specific and actionable — avoid generic filler',
      '4. Base content on what you know about the company from the bootstrap conversation',
      '5. Keep the document focused and under 1500 words',
      '6. Use professional but approachable tone',
      existingDocsContext,
      additionalInstructions ? `\nAdditional instructions: ${additionalInstructions}` : '',
    ].filter(Boolean).join('\n')
  } else {
    task = [
      `Update the foundation document: "${title}" (slug: ${documentSlug}).`,
      '',
      'Current document content:',
      '```markdown',
      existingBody ?? '(empty)',
      '```',
      '',
      'Requirements:',
      '1. Revise the document based on new information or feedback',
      '2. Maintain the existing structure where possible',
      '3. Improve clarity and completeness',
      '4. Keep the document focused and under 1500 words',
      existingDocsContext,
      additionalInstructions ? `\nAdditional instructions: ${additionalInstructions}` : '',
    ].filter(Boolean).join('\n')
  }

  const format = [
    '',
    'IMPORTANT: You MUST respond with ONLY a valid JSON object, no other text:',
    '{',
    '  "title": "Document Title",',
    '  "bodyMarkdown": "Full document content in Markdown"',
    '}',
  ].join('\n')

  return `${persona}\n\n${task}\n${format}`
}

/**
 * Parse the Claude runner output to extract document content.
 * Handles JSON responses and falls back to treating raw text as body.
 */
function parseDocumentResponse(
  stdoutSummary: string,
  fallbackTitle: string,
): { title: string; bodyMarkdown: string } {
  if (!stdoutSummary || stdoutSummary.trim().length === 0) {
    return {
      title: fallbackTitle,
      bodyMarkdown: `# ${fallbackTitle}\n\n*This document could not be generated. Please try again.*`,
    }
  }

  // Try direct JSON parse
  try {
    const parsed = JSON.parse(stdoutSummary.trim())
    if (typeof parsed.bodyMarkdown === 'string' && parsed.bodyMarkdown.length > 0) {
      return {
        title: typeof parsed.title === 'string' && parsed.title.length > 0
          ? parsed.title
          : fallbackTitle,
        bodyMarkdown: parsed.bodyMarkdown,
      }
    }
  } catch {
    // Not JSON — fall through
  }

  // Try to extract JSON from markdown code blocks
  const jsonMatch = stdoutSummary.match(/\{[\s\S]*"bodyMarkdown"\s*:\s*"[\s\S]*"\s*[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (typeof parsed.bodyMarkdown === 'string' && parsed.bodyMarkdown.length > 0) {
        return {
          title: typeof parsed.title === 'string' && parsed.title.length > 0
            ? parsed.title
            : fallbackTitle,
          bodyMarkdown: parsed.bodyMarkdown,
        }
      }
    } catch {
      // Still not valid JSON
    }
  }

  // Fallback: treat raw text as body
  return {
    title: fallbackTitle,
    bodyMarkdown: stdoutSummary.trim(),
  }
}

/**
 * Main activity: calls the Claude runner to generate or update a foundation document.
 */
export async function generateFoundationDocument(
  input: FoundationDocumentWorkflowInput,
): Promise<{ title: string; bodyMarkdown: string }> {
  const platformUrl = process.env.PLATFORM_SERVICE_URL ?? 'http://localhost:4010'
  const prompt = buildDocumentPrompt(input)
  const fallbackTitle = SLUG_TITLES[input.documentSlug] ?? input.documentTitle ?? input.documentSlug

  const response = await fetch(`${platformUrl}/claude-runner/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: input.projectId,
      agentId: 'ceo-bootstrap',
      taskType: input.operation === 'generate' ? 'document-drafting' : 'document-revision',
      instruction: prompt,
      contextBundle: {
        companyName: input.context.companyName,
        companyMission: input.context.companyMission,
        companyType: input.context.companyType,
        bootstrapStatus: input.context.bootstrapStatus,
        documentSlug: input.documentSlug,
        operation: input.operation,
      },
      maxTurns: 1,
      timeout: 120,
      runMode: 'one-shot' as const,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown error')
    throw new Error(`Claude runner returned ${response.status}: ${errorText}`)
  }

  const result = (await response.json()) as { stdoutSummary?: string }
  return parseDocumentResponse(result.stdoutSummary ?? '', fallbackTitle)
}

/**
 * Activity: persists the generated/updated document via the company-design service.
 * Non-critical — failures don't break the workflow.
 */
export async function persistDocumentResult(
  input: FoundationDocumentWorkflowInput,
  generated: { title: string; bodyMarkdown: string },
): Promise<FoundationDocumentWorkflowOutput> {
  const companyDesignUrl = process.env.COMPANY_DESIGN_SERVICE_URL ?? 'http://localhost:4020'
  const { projectId, documentSlug, operation } = input

  try {
    if (operation === 'generate') {
      // Create new document
      const createResponse = await fetch(
        `${companyDesignUrl}/projects/${projectId}/documents`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: documentSlug,
            title: generated.title,
            bodyMarkdown: generated.bodyMarkdown,
            status: 'draft',
            sourceType: 'agent',
            lastUpdatedBy: 'ceo-bootstrap',
          }),
        },
      )

      if (!createResponse.ok) {
        const errorText = await createResponse.text().catch(() => 'unknown error')
        throw new Error(`Create document failed ${createResponse.status}: ${errorText}`)
      }

      const doc = (await createResponse.json()) as { id: string }
      return {
        documentId: doc.id,
        projectId,
        slug: documentSlug,
        title: generated.title,
        status: 'draft',
        sourceType: 'agent',
        persisted: true,
      }
    } else {
      // Find existing document by slug, then update
      const findResponse = await fetch(
        `${companyDesignUrl}/projects/${projectId}/documents/by-slug?slug=${encodeURIComponent(documentSlug)}`,
      )

      if (!findResponse.ok) {
        throw new Error(`Find document by slug failed ${findResponse.status}`)
      }

      const existingDoc = (await findResponse.json()) as { id: string }
      const updateResponse = await fetch(
        `${companyDesignUrl}/projects/${projectId}/documents/${existingDoc.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: generated.title,
            bodyMarkdown: generated.bodyMarkdown,
            lastUpdatedBy: 'ceo-bootstrap',
          }),
        },
      )

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text().catch(() => 'unknown error')
        throw new Error(`Update document failed ${updateResponse.status}: ${errorText}`)
      }

      return {
        documentId: existingDoc.id,
        projectId,
        slug: documentSlug,
        title: generated.title,
        status: 'draft',
        sourceType: 'agent',
        persisted: true,
      }
    }
  } catch {
    // Non-critical: return result with persisted=false
    return {
      documentId: '',
      projectId,
      slug: documentSlug,
      title: generated.title,
      status: 'draft',
      sourceType: 'agent',
      persisted: false,
    }
  }
}
