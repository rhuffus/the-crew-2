import { Inject, Injectable, Logger } from '@nestjs/common'
import type {
  AssistantResponseProvider,
  AssistantResponseContext,
  AssistantResponse,
} from '../domain/assistant-response-provider'
import { TEMPORAL_WORKFLOW_CLIENT, type LazyWorkflowClient } from '../../temporal-client/temporal-client.module'
import type { BootstrapConversationStatus } from '@the-crew/shared-types'

const TASK_QUEUE = 'bootstrap'
const WORKFLOW_TIMEOUT_MS = 30_000

/**
 * Temporal-backed assistant response provider.
 *
 * Delegates CEO bootstrap responses to the BootstrapConversationWorkflow
 * running in the temporal-worker service, which in turn calls the Claude
 * runner for real AI-powered responses.
 *
 * This is the sole production provider — no local fallback exists.
 */
@Injectable()
export class TemporalAssistantResponseProvider implements AssistantResponseProvider {
  private readonly logger = new Logger(TemporalAssistantResponseProvider.name)

  constructor(
    @Inject(TEMPORAL_WORKFLOW_CLIENT) private readonly lazy: LazyWorkflowClient,
  ) {}

  async generateKickoff(ctx: AssistantResponseContext): Promise<AssistantResponse> {
    const workflowId = `bootstrap-kickoff-${ctx.projectId}-${Date.now()}`
    this.logger.log(`Starting kickoff workflow ${workflowId}`)

    const client = await this.lazy.getClient()
    const handle = await client.start('bootstrapConversationWorkflow', {
      args: [{
        projectId: ctx.projectId,
        isKickoff: true,
        context: {
          companyName: ctx.companyName,
          companyMission: ctx.companyMission,
          companyType: ctx.companyType,
          conversationStatus: ctx.conversationStatus,
          recentMessages: ctx.recentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      }],
      taskQueue: TASK_QUEUE,
      workflowId,
    })

    const result = await this.withTimeout(handle.result(), workflowId)
    this.logger.log(`Kickoff workflow ${workflowId} completed`)

    return {
      content: result.content,
      suggestedNextStatus: result.suggestedNextStatus as BootstrapConversationStatus | null,
    }
  }

  async generateReply(ctx: AssistantResponseContext, userMessage: string): Promise<AssistantResponse> {
    const workflowId = `bootstrap-reply-${ctx.projectId}-${Date.now()}`
    this.logger.log(`Starting reply workflow ${workflowId}`)

    const client = await this.lazy.getClient()
    const handle = await client.start('bootstrapConversationWorkflow', {
      args: [{
        projectId: ctx.projectId,
        isKickoff: false,
        userMessage,
        context: {
          companyName: ctx.companyName,
          companyMission: ctx.companyMission,
          companyType: ctx.companyType,
          conversationStatus: ctx.conversationStatus,
          recentMessages: ctx.recentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      }],
      taskQueue: TASK_QUEUE,
      workflowId,
    })

    const result = await this.withTimeout(handle.result(), workflowId)
    this.logger.log(`Reply workflow ${workflowId} completed`)

    return {
      content: result.content,
      suggestedNextStatus: result.suggestedNextStatus as BootstrapConversationStatus | null,
    }
  }

  private withTimeout<T>(promise: Promise<T>, workflowId: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Temporal workflow ${workflowId} timed out after ${WORKFLOW_TIMEOUT_MS / 1000}s — is the temporal-worker running?`)),
          WORKFLOW_TIMEOUT_MS,
        ),
      ),
    ])
  }
}
