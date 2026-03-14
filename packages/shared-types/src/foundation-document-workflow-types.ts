/**
 * Foundation Document Workflow — I/O types
 *
 * Shared contract between:
 * - company-design (Temporal client → starts workflow)
 * - temporal-worker (workflow + activities)
 *
 * Source of truth: docs/63-temporal-orchestration-spec.md
 */

import type { DocumentStatus, DocumentSourceType } from './index'

/** Valid foundation document slugs (from docs/60-foundation-documents-spec.md) */
export type FoundationDocumentSlug =
  | '00-company-overview'
  | '01-mission-vision'
  | '02-founder-constraints-and-preferences'
  | '03-operating-principles'
  | '04-initial-objectives'
  | '05-initial-roadmap'
  | '06-initial-backlog'
  | '07-bootstrap-decisions-log'
  | '08-product-scope'
  | '09-user-and-market-notes'
  | '10-org-bootstrapping-plan'

/** Operation type for the workflow */
export type FoundationDocumentOperation = 'generate' | 'update'

/** Context about the project for document generation */
export interface FoundationDocumentContext {
  companyName: string
  companyMission: string
  companyType: string
  bootstrapStatus: string
  /** Summaries of existing docs for cross-referencing during generation */
  existingDocSummaries: Array<{ slug: string; title: string }>
}

/** Input for FoundationDocumentWorkflow */
export interface FoundationDocumentWorkflowInput {
  projectId: string
  operation: FoundationDocumentOperation
  documentSlug: FoundationDocumentSlug | string
  /** Human-readable document title (used as fallback if AI doesn't provide one) */
  documentTitle?: string
  /** Existing body (provided for 'update' operations) */
  existingBody?: string
  /** Optional instructions for the AI (e.g., "focus on fintech constraints") */
  additionalInstructions?: string
  context: FoundationDocumentContext
}

/** Output from FoundationDocumentWorkflow */
export interface FoundationDocumentWorkflowOutput {
  documentId: string
  projectId: string
  slug: string
  title: string
  status: DocumentStatus
  sourceType: DocumentSourceType
  persisted: boolean
}
