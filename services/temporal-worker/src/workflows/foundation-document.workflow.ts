import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities'
import type { FoundationDocumentWorkflowInput, FoundationDocumentWorkflowOutput } from '@the-crew/shared-types'

const { generateFoundationDocument } = proxyActivities<typeof activities>({
  startToCloseTimeout: '180s',
  retry: { maximumAttempts: 2 },
})

const { persistDocumentResult } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: { maximumAttempts: 2 },
})

/**
 * FoundationDocumentWorkflow — generates or updates a foundation document
 * via the Claude runner, then persists the result to the company-design service.
 *
 * Per-document workflow: one execution per document operation.
 * Task queue: 'documents'
 */
export async function foundationDocumentWorkflow(
  input: FoundationDocumentWorkflowInput,
): Promise<FoundationDocumentWorkflowOutput> {
  // Step 1: Generate or update document content via Claude runner
  const generated = await generateFoundationDocument(input)

  // Step 2: Persist to company-design service (non-critical)
  const result = await persistDocumentResult(input, generated)

  return result
}
