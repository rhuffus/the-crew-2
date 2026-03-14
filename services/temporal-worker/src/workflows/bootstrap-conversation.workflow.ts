import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities'

const { generateBootstrapResponse } = proxyActivities<typeof activities>({
  startToCloseTimeout: '120s',
  retry: {
    maximumAttempts: 2,
  },
})

export interface BootstrapConversationWorkflowInput {
  projectId: string
  isKickoff: boolean
  userMessage?: string
  context: {
    companyName: string
    companyMission: string
    companyType: string
    conversationStatus: string
    recentMessages: Array<{ role: string; content: string }>
  }
}

export interface BootstrapConversationWorkflowOutput {
  content: string
  suggestedNextStatus: string | null
}

/**
 * BootstrapConversationWorkflow
 *
 * Orchestrates a single bootstrap conversation turn:
 * 1. Receives conversation context and user message (or kickoff request)
 * 2. Delegates to the generateBootstrapResponse activity (Claude runner)
 * 3. Returns assistant response with optional status suggestion
 *
 * The workflow is per-interaction (one workflow execution per user message).
 * Persistence and status advancement happen in the calling service.
 */
export async function bootstrapConversationWorkflow(
  input: BootstrapConversationWorkflowInput,
): Promise<BootstrapConversationWorkflowOutput> {
  const result = await generateBootstrapResponse({
    projectId: input.projectId,
    isKickoff: input.isKickoff,
    userMessage: input.userMessage,
    context: input.context,
  })

  return {
    content: result.content,
    suggestedNextStatus: result.suggestedNextStatus,
  }
}
