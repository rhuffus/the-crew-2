/**
 * Bootstrap Conversation Workflow — I/O types
 *
 * Shared contract between:
 * - company-design (Temporal client → starts workflow)
 * - temporal-worker (workflow + activities)
 *
 * Source of truth: docs/63-temporal-orchestration-spec.md
 */

export interface BootstrapWorkflowMessage {
  role: string
  content: string
}

export interface BootstrapWorkflowContext {
  companyName: string
  companyMission: string
  companyType: string
  conversationStatus: string
  recentMessages: BootstrapWorkflowMessage[]
}

export interface BootstrapWorkflowInput {
  projectId: string
  isKickoff: boolean
  userMessage?: string
  context: BootstrapWorkflowContext
}

export interface BootstrapWorkflowOutput {
  content: string
  suggestedNextStatus: string | null
}
