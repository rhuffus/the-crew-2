import { describe, it, expect, beforeEach } from 'vitest'
import { BootstrapConversationService } from './bootstrap-conversation.service'
import { InMemoryBootstrapConversationRepository } from '../infra/in-memory-bootstrap-conversation.repository'
import type {
  AssistantResponseProvider,
  AssistantResponseContext,
  AssistantResponse,
} from '../domain/assistant-response-provider'
import { InMemoryChatRepository } from '../../chat/infra/in-memory-chat.repository'
import { ChatService } from '../../chat/application/chat.service'
import { CeoFirstBootstrapService } from '../../bootstrap/ceo-first-bootstrap.service'
import { InMemoryProjectSeedRepository } from '../../project-seed/infra/in-memory-project-seed.repository'
import { InMemoryCompanyConstitutionRepository } from '../../constitution/infra/in-memory-company-constitution.repository'
import { InMemoryOrganizationalUnitRepository } from '../../organizational-units/infra/in-memory-organizational-unit.repository'
import { InMemoryLcpAgentRepository } from '../../lcp-agents/infra/in-memory-lcp-agent.repository'
import type { GrowthProposalSuggestion } from '@the-crew/shared-types'

class MockAssistantResponseProvider implements AssistantResponseProvider {
  async generateKickoff(ctx: AssistantResponseContext): Promise<AssistantResponse> {
    return {
      content: `Hello! I'm the CEO agent for **${ctx.companyName}**.`,
      suggestedNextStatus: null,
    }
  }

  async generateReply(ctx: AssistantResponseContext, userMessage: string): Promise<AssistantResponse> {
    const userMessageCount = ctx.recentMessages.filter((m) => m.role === 'user').length

    if (ctx.conversationStatus === 'collecting-context') {
      if (userMessageCount >= 3) {
        return {
          content: `Great, I think I have enough context to start drafting the foundation documents for **${ctx.companyName}**.`,
          suggestedNextStatus: 'drafting-foundation-docs',
        }
      }
      return {
        content: `Thank you for sharing that about **${ctx.companyName}**. That's very helpful context.`,
        suggestedNextStatus: null,
      }
    }

    if (ctx.conversationStatus === 'drafting-foundation-docs') {
      if (userMessageCount >= 2) {
        return {
          content: `The foundation documents are ready for your review.`,
          suggestedNextStatus: 'reviewing-foundation-docs',
        }
      }
      return {
        content: `I'm working on the foundation documents.`,
        suggestedNextStatus: null,
      }
    }

    if (ctx.conversationStatus === 'reviewing-foundation-docs') {
      const lower = userMessage.toLowerCase()
      const approvalSignals = ['approve', 'looks good', 'lgtm', 'go ahead', 'ship it', 'ready', 'done']
      if (approvalSignals.some((s) => lower.includes(s))) {
        return {
          content: `Excellent! Foundation documents approved for **${ctx.companyName}**.`,
          suggestedNextStatus: 'ready-to-grow',
        }
      }
      return {
        content: `I've noted your feedback on the documents.`,
        suggestedNextStatus: null,
      }
    }

    if (ctx.conversationStatus === 'ready-to-grow' || ctx.conversationStatus === 'growth-started') {
      if (userMessage === '__propose_growth__') {
        return this.generateGrowthProposals(ctx)
      }
      if (ctx.conversationStatus === 'ready-to-grow') {
        return {
          content: `The company foundation is solid. I'm ready to start creating the organizational structure.`,
          suggestedNextStatus: null,
        }
      }
      return {
        content: `The organizational structure is taking shape.`,
        suggestedNextStatus: null,
      }
    }

    return {
      content: `Thank you for your input. Let me process that and get back to you.`,
      suggestedNextStatus: null,
    }
  }

  private generateGrowthProposals(ctx: AssistantResponseContext): AssistantResponse {
    const companyType = ctx.companyType?.toLowerCase() ?? ''
    const proposals = this.suggestDepartments(companyType, ctx.companyName)
    return {
      content: `Based on **${ctx.companyName}**'s profile as a ${ctx.companyType || 'company'}, I recommend starting with these departments.`,
      suggestedNextStatus: null,
      growthProposals: proposals,
    }
  }

  private suggestDepartments(companyType: string, companyName: string): GrowthProposalSuggestion[] {
    if (companyType.includes('tech') || companyType.includes('software') || companyType.includes('saas')) {
      return [
        {
          proposalType: 'create-department',
          name: 'Engineering',
          description: `Core engineering department for ${companyName}.`,
          mandate: 'Build and maintain the technical product',
          motivation: 'Every tech company needs an engineering function.',
        },
        {
          proposalType: 'create-department',
          name: 'Product',
          description: `Product management department for ${companyName}.`,
          mandate: 'Define what to build and why',
          motivation: 'Product direction is critical for market fit.',
        },
        {
          proposalType: 'create-department',
          name: 'Operations',
          description: `Operations department for ${companyName}.`,
          mandate: 'Keep the company running efficiently',
          motivation: 'Operational foundations are needed from day one.',
        },
      ]
    }

    return [
      {
        proposalType: 'create-department',
        name: 'Operations',
        description: `Core operations for ${companyName}.`,
        mandate: 'Run core business operations',
        motivation: 'Every company needs operational capacity.',
      },
      {
        proposalType: 'create-department',
        name: 'Strategy',
        description: `Strategy department for ${companyName}.`,
        mandate: 'Define strategic direction and growth plans',
        motivation: 'Strategic thinking is essential for sustainable growth.',
      },
    ]
  }
}

describe('BootstrapConversationService', () => {
  let service: BootstrapConversationService
  let convRepo: InMemoryBootstrapConversationRepository
  let chatRepo: InMemoryChatRepository
  let chatService: ChatService
  let bootstrapService: CeoFirstBootstrapService
  let seedRepo: InMemoryProjectSeedRepository

  const projectId = 'proj-001'

  async function bootstrapProject() {
    await bootstrapService.bootstrap({
      projectId,
      name: 'Acme Corp',
      mission: 'Build the best widgets',
      companyType: 'saas-startup',
    })
  }

  beforeEach(() => {
    convRepo = new InMemoryBootstrapConversationRepository()
    chatRepo = new InMemoryChatRepository()
    chatService = new ChatService(chatRepo)
    seedRepo = new InMemoryProjectSeedRepository()

    const constitutionRepo = new InMemoryCompanyConstitutionRepository()
    const uoRepo = new InMemoryOrganizationalUnitRepository()
    const agentRepo = new InMemoryLcpAgentRepository()

    bootstrapService = new CeoFirstBootstrapService(
      seedRepo,
      constitutionRepo,
      uoRepo,
      agentRepo,
    )

    service = new BootstrapConversationService(
      convRepo,
      new MockAssistantResponseProvider(),
      seedRepo,
      chatRepo,
      chatService,
      bootstrapService,
    )
  })

  describe('startConversation', () => {
    it('should create conversation and chat thread with kickoff message', async () => {
      await bootstrapProject()

      const result = await service.startConversation(projectId)

      expect(result.projectId).toBe(projectId)
      expect(result.status).toBe('collecting-context')
      expect(result.threadId).toBeTruthy()
      expect(result.ceoAgentId).toBeTruthy()
    })

    it('should persist a CEO kickoff message in the chat thread', async () => {
      await bootstrapProject()

      const conv = await service.startConversation(projectId)
      const messages = await chatService.listMessages(conv.threadId)

      expect(messages).toHaveLength(1)
      expect(messages[0]!.role).toBe('assistant')
      expect(messages[0]!.content).toContain('Acme Corp')
    })

    it('should be idempotent — return same conversation on second call', async () => {
      await bootstrapProject()

      const first = await service.startConversation(projectId)
      const second = await service.startConversation(projectId)

      expect(second.id).toBe(first.id)
      expect(second.threadId).toBe(first.threadId)
    })

    it('should throw if project not bootstrapped', async () => {
      await expect(service.startConversation('nonexistent'))
        .rejects.toThrow('has not been bootstrapped')
    })
  })

  describe('sendMessage', () => {
    it('should persist user message and assistant reply', async () => {
      await bootstrapProject()
      await service.startConversation(projectId)

      const response = await service.sendMessage(projectId, 'We solve payment problems')

      expect(response.userMessage.role).toBe('user')
      expect(response.userMessage.content).toBe('We solve payment problems')
      expect(response.assistantMessage.role).toBe('assistant')
      expect(response.assistantMessage.content).toBeTruthy()
      expect(response.conversationStatus).toBe('collecting-context')
    })

    it('should accumulate messages in the chat thread', async () => {
      await bootstrapProject()
      const conv = await service.startConversation(projectId)

      await service.sendMessage(projectId, 'First message')
      await service.sendMessage(projectId, 'Second message')
      await service.sendMessage(projectId, 'Third message')

      const messages = await chatService.listMessages(conv.threadId)
      // 1 kickoff + 3 * (user + assistant) = 7
      expect(messages).toHaveLength(7)
    })

    it('should advance status when assistant suggests transition', async () => {
      await bootstrapProject()
      await service.startConversation(projectId)

      // Send enough messages to trigger state transition
      await service.sendMessage(projectId, 'We solve payment problems for small businesses')
      await service.sendMessage(projectId, 'Our team has 5 engineers')
      const response = await service.sendMessage(projectId, 'We need to ship in 3 months')

      // After 3 user messages the local provider suggests drafting-foundation-docs
      expect(response.conversationStatus).toBe('drafting-foundation-docs')
    })

    it('should throw if conversation not started', async () => {
      await expect(service.sendMessage(projectId, 'hello'))
        .rejects.toThrow('No bootstrap conversation')
    })
  })

  describe('getStatus', () => {
    it('should return null for project without conversation', async () => {
      const status = await service.getStatus('nonexistent')

      expect(status).toBeNull()
    })

    it('should return conversation status after start', async () => {
      await bootstrapProject()
      await service.startConversation(projectId)

      const status = await service.getStatus(projectId)

      expect(status).not.toBeNull()
      expect(status!.status).toBe('collecting-context')
      expect(status!.projectId).toBe(projectId)
    })
  })
})
