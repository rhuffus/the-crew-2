import { Inject, Injectable, Logger, NotFoundException, ConflictException, Optional } from '@nestjs/common'
import { randomUUID } from 'crypto'
import type {
  BootstrapConversationDto,
  SendBootstrapMessageResponseDto,
  ChatMessageDto,
  ProposeGrowthResponseDto,
  ApproveGrowthProposalResponseDto,
  RejectGrowthProposalResponseDto,
} from '@the-crew/shared-types'
import {
  BOOTSTRAP_CONVERSATION_REPOSITORY,
  type BootstrapConversationRepository,
} from '../domain/bootstrap-conversation-repository'
import {
  ASSISTANT_RESPONSE_PROVIDER,
  type AssistantResponseProvider,
  type AssistantResponseContext,
} from '../domain/assistant-response-provider'
import { BootstrapConversation } from '../domain/bootstrap-conversation'
import { BootstrapConversationMapper } from './bootstrap-conversation.mapper'
import { ChatService } from '../../chat/application/chat.service'
import { ChatMapper } from '../../chat/application/chat.mapper'
import { CHAT_REPOSITORY, type ChatRepository } from '../../chat/domain/chat-repository'
import { CeoFirstBootstrapService } from '../../bootstrap/ceo-first-bootstrap.service'
import {
  PROJECT_SEED_REPOSITORY,
  type ProjectSeedRepository,
} from '../../project-seed/domain/project-seed-repository'
import { GrowthEngineAppService, type ImplementProposalResult } from '../../growth-engine/application/growth-engine.app-service'
import { toProposalDto } from '../../proposals/application/proposal.mapper'

@Injectable()
export class BootstrapConversationService {
  private readonly logger = new Logger(BootstrapConversationService.name)

  constructor(
    @Inject(BOOTSTRAP_CONVERSATION_REPOSITORY)
    private readonly repo: BootstrapConversationRepository,
    @Inject(ASSISTANT_RESPONSE_PROVIDER)
    private readonly assistantProvider: AssistantResponseProvider,
    @Inject(PROJECT_SEED_REPOSITORY)
    private readonly seedRepo: ProjectSeedRepository,
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepo: ChatRepository,
    private readonly chatService: ChatService,
    private readonly bootstrapService: CeoFirstBootstrapService,
    @Optional()
    private readonly growthEngine?: GrowthEngineAppService,
  ) {}

  async startConversation(projectId: string): Promise<BootstrapConversationDto> {
    // Idempotent: return existing if already started
    const existing = await this.repo.findByProjectId(projectId)
    if (existing && existing.status !== 'not-started') {
      return BootstrapConversationMapper.toDto(existing)
    }

    // Verify bootstrap exists
    const bootstrapStatus = await this.bootstrapService.getStatus(projectId)
    if (!bootstrapStatus.bootstrapped) {
      throw new NotFoundException(`Project ${projectId} has not been bootstrapped`)
    }

    const ceoAgentId = bootstrapStatus.ceoAgentId ?? ''

    // Get or create chat thread for company scope
    const threadDto = await this.chatService.getOrCreateThread(projectId, 'company', null)

    let conversation: BootstrapConversation
    if (existing) {
      conversation = existing
    } else {
      conversation = BootstrapConversation.create(projectId, threadDto.id, ceoAgentId)
    }

    // Advance to collecting-context
    conversation.advanceTo('collecting-context')

    // Generate CEO kickoff message (may fail if Temporal/AI is unavailable)
    let kickoffContent: string
    try {
      const ctx = await this.buildContext(projectId, conversation, [])
      const kickoff = await this.assistantProvider.generateKickoff(ctx)
      kickoffContent = kickoff.content
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.warn(`CEO kickoff AI response failed for project ${projectId}: ${message}`)
      kickoffContent =
        `👋 Welcome! I'm the CEO agent for your company. ` +
        `I wasn't able to connect to the AI service right now, but you can start telling me about your company ` +
        `and I'll respond as soon as the service is available. What are you building?`
    }

    // Persist the assistant kickoff message
    const thread = await this.chatRepo.findById(threadDto.id)
    if (!thread) throw new NotFoundException(`Chat thread ${threadDto.id} not found`)
    thread.addMessage('assistant', kickoffContent)
    await this.chatRepo.save(thread)

    await this.repo.save(conversation)

    this.logger.log(`Bootstrap conversation started for project ${projectId}`)
    return BootstrapConversationMapper.toDto(conversation)
  }

  async sendMessage(projectId: string, content: string): Promise<SendBootstrapMessageResponseDto> {
    const conversation = await this.repo.findByProjectId(projectId)
    if (!conversation) {
      throw new NotFoundException(`No bootstrap conversation for project ${projectId}`)
    }

    if (conversation.status === 'not-started') {
      throw new ConflictException('Bootstrap conversation has not been started')
    }

    // Persist user message first — this must succeed even if the AI fails
    const thread = await this.chatRepo.findById(conversation.threadId)
    if (!thread) throw new NotFoundException(`Chat thread ${conversation.threadId} not found`)
    const userMsg = thread.addMessage('user', content)
    await this.chatRepo.save(thread)

    // Generate assistant response (may fail if Temporal/AI is unavailable)
    let assistantMsg: ReturnType<typeof thread.addMessage>
    try {
      const recentMessages = await this.chatService.listMessages(conversation.threadId, 20)
      const ctx = await this.buildContext(projectId, conversation, recentMessages)
      const response = await this.assistantProvider.generateReply(ctx, content)

      // Re-fetch thread (may have been updated), persist assistant response
      const threadAfter = await this.chatRepo.findById(conversation.threadId)
      if (!threadAfter) throw new NotFoundException(`Chat thread ${conversation.threadId} not found`)
      assistantMsg = threadAfter.addMessage('assistant', response.content)
      await this.chatRepo.save(threadAfter)

      // Advance status if suggested
      if (response.suggestedNextStatus && conversation.canAdvanceTo(response.suggestedNextStatus)) {
        conversation.advanceTo(response.suggestedNextStatus)
        this.logger.log(
          `Bootstrap conversation ${projectId} advanced to ${response.suggestedNextStatus}`,
        )
      }

      await this.repo.save(conversation)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.warn(`AI response failed for project ${projectId}: ${message}`)

      // Build a user-friendly error from the real error
      let userMessage: string
      if (message.includes('Claude Max not configured')) {
        userMessage = `⚠️ Claude Max is not configured. Go to Settings and set up your Claude Max subscription.`
      } else if (message.includes('401') || message.includes('invalid') || message.includes('unauthorized')) {
        userMessage = `⚠️ The Claude Max authentication token is invalid or expired. Please re-authenticate in Settings.`
      } else if (message.includes('credit') || message.includes('billing') || message.includes('rate')) {
        userMessage = `⚠️ There was a billing or rate limit issue. Please try again in a moment.`
      } else {
        userMessage = `⚠️ I wasn't able to generate a response: ${message.slice(0, 200)}. Please try again in a moment.`
      }

      // Persist the error message so the user sees feedback
      const threadAfter = await this.chatRepo.findById(conversation.threadId)
      if (!threadAfter) throw new NotFoundException(`Chat thread ${conversation.threadId} not found`)
      assistantMsg = threadAfter.addMessage('assistant', userMessage)
      await this.chatRepo.save(threadAfter)
    }

    return {
      userMessage: ChatMapper.messageToDto(userMsg),
      assistantMessage: ChatMapper.messageToDto(assistantMsg),
      conversationStatus: conversation.status,
    }
  }

  async getStatus(projectId: string): Promise<BootstrapConversationDto | null> {
    const conversation = await this.repo.findByProjectId(projectId)
    if (!conversation) return null
    return BootstrapConversationMapper.toDto(conversation)
  }

  async proposeGrowth(projectId: string): Promise<ProposeGrowthResponseDto> {
    if (!this.growthEngine) {
      throw new ConflictException('Growth engine not available')
    }

    const conversation = await this.repo.findByProjectId(projectId)
    if (!conversation) {
      throw new NotFoundException(`No bootstrap conversation for project ${projectId}`)
    }
    if (conversation.status !== 'ready-to-grow' && conversation.status !== 'growth-started') {
      throw new ConflictException(
        `Cannot propose growth when bootstrap status is '${conversation.status}'. Must be 'ready-to-grow' or 'growth-started'.`,
      )
    }

    // Generate structural proposals from the CEO
    const recentMessages = await this.chatService.listMessages(conversation.threadId, 20)
    const ctx = await this.buildContext(projectId, conversation, recentMessages)
    const response = await this.assistantProvider.generateReply(ctx, '__propose_growth__')

    const suggestions = response.growthProposals ?? []
    const proposalDtos = []

    for (const suggestion of suggestions) {
      const { proposal } = await this.growthEngine.submitProposal({
        id: randomUUID(),
        projectId,
        proposalType: suggestion.proposalType,
        title: `Create ${suggestion.proposalType.replace('create-', '')}: ${suggestion.name}`,
        description: suggestion.description,
        motivation: suggestion.motivation,
        problemDetected: 'Company needs initial organizational structure',
        expectedBenefit: suggestion.mandate,
        contextToAssign: suggestion.parentUoId ? `parentUoId:${suggestion.parentUoId}` : '',
        proposedByAgentId: conversation.ceoAgentId,
      })
      proposalDtos.push(toProposalDto(proposal))
    }

    // Persist the CEO message about proposals
    const thread = await this.chatRepo.findById(conversation.threadId)
    if (!thread) throw new NotFoundException(`Chat thread ${conversation.threadId} not found`)
    const assistantMsg = thread.addMessage('assistant', response.content)
    await this.chatRepo.save(thread)

    // Advance to growth-started if still ready-to-grow
    if (conversation.status === 'ready-to-grow' && conversation.canAdvanceTo('growth-started')) {
      conversation.advanceTo('growth-started')
      await this.repo.save(conversation)
    }

    return {
      proposals: proposalDtos,
      assistantMessage: ChatMapper.messageToDto(assistantMsg),
      conversationStatus: conversation.status,
    }
  }

  async approveGrowthProposal(
    projectId: string,
    proposalId: string,
  ): Promise<ApproveGrowthProposalResponseDto> {
    if (!this.growthEngine) {
      throw new ConflictException('Growth engine not available')
    }

    const conversation = await this.repo.findByProjectId(projectId)
    if (!conversation) {
      throw new NotFoundException(`No bootstrap conversation for project ${projectId}`)
    }

    // Approve the proposal
    await this.growthEngine.approveProposal(proposalId, 'founder')

    // Implement the approved proposal
    const result = await this.growthEngine.implementProposal(proposalId)

    // Post confirmation in chat
    const thread = await this.chatRepo.findById(conversation.threadId)
    if (!thread) throw new NotFoundException(`Chat thread ${conversation.threadId} not found`)

    const confirmationContent = this.buildApprovalConfirmation(result)
    const assistantMsg = thread.addMessage('assistant', confirmationContent)
    await this.chatRepo.save(thread)

    return {
      result: {
        proposal: toProposalDto(result.proposal),
        createdUnitId: result.createdUnitId,
        createdAgentId: result.createdAgentId,
        newPhase: result.newPhase,
      },
      assistantMessage: ChatMapper.messageToDto(assistantMsg),
      conversationStatus: conversation.status,
    }
  }

  async rejectGrowthProposal(
    projectId: string,
    proposalId: string,
    reason: string,
  ): Promise<RejectGrowthProposalResponseDto> {
    if (!this.growthEngine) {
      throw new ConflictException('Growth engine not available')
    }

    const conversation = await this.repo.findByProjectId(projectId)
    if (!conversation) {
      throw new NotFoundException(`No bootstrap conversation for project ${projectId}`)
    }

    const proposal = await this.growthEngine.rejectProposal(proposalId, reason)

    // Post rejection note in chat
    const thread = await this.chatRepo.findById(conversation.threadId)
    if (!thread) throw new NotFoundException(`Chat thread ${conversation.threadId} not found`)

    const rejectionContent = `Understood. The proposal **"${proposal.title}"** has been withdrawn. ${reason ? `Reason: ${reason}` : ''}\n\nI can propose alternative structures if you'd like.`
    const assistantMsg = thread.addMessage('assistant', rejectionContent)
    await this.chatRepo.save(thread)

    return {
      proposal: toProposalDto(proposal),
      assistantMessage: ChatMapper.messageToDto(assistantMsg),
      conversationStatus: conversation.status,
    }
  }

  private buildApprovalConfirmation(result: ImplementProposalResult): string {
    const { proposal, createdAgentId, newPhase } = result
    const lines: string[] = []

    const entityName = proposal.title
      .replace(/^Create (Department|Team|Specialist): /i, '')

    switch (proposal.proposalType) {
      case 'create-department':
        lines.push(`**${entityName}** department has been created and is now active.`)
        if (createdAgentId) {
          lines.push(`A **Department Executive** coordinator has been assigned.`)
        }
        break
      case 'create-team':
        lines.push(`**${entityName}** team has been created and is now active.`)
        if (createdAgentId) {
          lines.push(`A **Team Lead** coordinator has been assigned.`)
        }
        break
      case 'create-specialist':
        lines.push(`**${entityName}** specialist has been created and is ready for work.`)
        break
      default:
        lines.push(`Proposal **"${proposal.title}"** has been implemented.`)
    }

    if (newPhase) {
      lines.push(`\nThe company has advanced to the **${newPhase}** phase.`)
    }

    lines.push(`\nWould you like me to propose more structure, or shall we start assigning work?`)

    return lines.join('\n')
  }

  private async buildContext(
    projectId: string,
    conversation: BootstrapConversation,
    recentMessages: ChatMessageDto[],
  ): Promise<AssistantResponseContext> {
    const seed = await this.seedRepo.findByProjectId(projectId)
    return {
      projectId,
      companyName: seed?.name ?? 'Unnamed Company',
      companyMission: seed?.mission ?? '',
      companyType: seed?.companyType ?? '',
      conversationStatus: conversation.status,
      recentMessages,
    }
  }
}
