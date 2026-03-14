/**
 * AIR-020 — Smoke test: Full bootstrap flow end-to-end
 *
 * Validates the complete chain:
 *   create project → CEO chat → docs → ready-to-grow → first specialist task
 *
 * Uses in-memory repos and MockAssistantResponseProvider (no network).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { BootstrapConversationService } from '../bootstrap-conversation/application/bootstrap-conversation.service'
import { InMemoryBootstrapConversationRepository } from '../bootstrap-conversation/infra/in-memory-bootstrap-conversation.repository'
import type {
  AssistantResponseProvider,
  AssistantResponseContext,
  AssistantResponse,
} from '../bootstrap-conversation/domain/assistant-response-provider'
import { InMemoryChatRepository } from '../chat/infra/in-memory-chat.repository'
import { ChatService } from '../chat/application/chat.service'
import { CeoFirstBootstrapService } from '../bootstrap/ceo-first-bootstrap.service'
import { InMemoryProjectSeedRepository } from '../project-seed/infra/in-memory-project-seed.repository'
import { InMemoryCompanyConstitutionRepository } from '../constitution/infra/in-memory-company-constitution.repository'
import { InMemoryOrganizationalUnitRepository } from '../organizational-units/infra/in-memory-organizational-unit.repository'
import { InMemoryLcpAgentRepository } from '../lcp-agents/infra/in-memory-lcp-agent.repository'
import { InMemoryProposalRepository } from '../proposals/infra/in-memory-proposal.repository'
import { InMemoryProjectDocumentRepository } from '../project-documents/infra/in-memory-project-document.repository'
import { ProjectDocumentService } from '../project-documents/application/project-document.service'
import { GrowthEngineAppService } from '../growth-engine/application/growth-engine.app-service'
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

describe('Smoke: Full Bootstrap Flow', () => {
  let convService: BootstrapConversationService
  let docService: ProjectDocumentService
  let growthEngine: GrowthEngineAppService
  let bootstrapService: CeoFirstBootstrapService
  let chatService: ChatService
  let seedRepo: InMemoryProjectSeedRepository
  let uoRepo: InMemoryOrganizationalUnitRepository
  let agentRepo: InMemoryLcpAgentRepository

  const projectId = 'smoke-project-001'

  beforeEach(() => {
    const convRepo = new InMemoryBootstrapConversationRepository()
    const chatRepo = new InMemoryChatRepository()
    chatService = new ChatService(chatRepo)
    seedRepo = new InMemoryProjectSeedRepository()
    const constitutionRepo = new InMemoryCompanyConstitutionRepository()
    uoRepo = new InMemoryOrganizationalUnitRepository()
    agentRepo = new InMemoryLcpAgentRepository()
    const proposalRepo = new InMemoryProposalRepository()
    const docRepo = new InMemoryProjectDocumentRepository()

    bootstrapService = new CeoFirstBootstrapService(
      seedRepo,
      constitutionRepo,
      uoRepo,
      agentRepo,
    )

    growthEngine = new GrowthEngineAppService(
      proposalRepo,
      constitutionRepo,
      uoRepo,
      seedRepo,
      agentRepo,
    )

    convService = new BootstrapConversationService(
      convRepo,
      new MockAssistantResponseProvider(),
      seedRepo,
      chatRepo,
      chatService,
      bootstrapService,
      growthEngine,
    )

    docService = new ProjectDocumentService(docRepo)
  })

  // -------------------------------------------------------------------------
  // Phase 1: Bootstrap project
  // -------------------------------------------------------------------------
  it('should bootstrap a new project with seed, constitution, company UO and CEO agent', async () => {
    const result = await bootstrapService.bootstrap({
      projectId,
      name: 'SmokeTest Inc',
      mission: 'Validate the full flow',
      companyType: 'saas-startup',
    })

    expect(result.projectSeedId).toBe(projectId)
    expect(result.companyUoId).toBeTruthy()
    expect(result.ceoAgentId).toBeTruthy()
    expect(result.maturityPhase).toBe('seed')
    expect(result.nextStep).toBe('bootstrap-conversation')
  })

  // -------------------------------------------------------------------------
  // Phase 2: CEO bootstrap conversation → collecting-context
  // -------------------------------------------------------------------------
  it('should start CEO conversation and reach collecting-context', async () => {
    await bootstrapService.bootstrap({
      projectId,
      name: 'SmokeTest Inc',
      mission: 'Validate the full flow',
      companyType: 'saas-startup',
    })

    const conv = await convService.startConversation(projectId)

    expect(conv.status).toBe('collecting-context')
    expect(conv.threadId).toBeTruthy()

    // CEO kickoff message should be in the thread
    const messages = await chatService.listMessages(conv.threadId)
    expect(messages.length).toBe(1)
    expect(messages[0]!.role).toBe('assistant')
    expect(messages[0]!.content).toContain('SmokeTest Inc')
  })

  // -------------------------------------------------------------------------
  // Phase 3: Full conversation cycle → ready-to-grow
  // -------------------------------------------------------------------------
  it('should progress through all status phases via conversation', async () => {
    await bootstrapService.bootstrap({
      projectId,
      name: 'SmokeTest Inc',
      mission: 'Validate the full flow',
      companyType: 'saas-startup',
    })

    await convService.startConversation(projectId)

    // collecting-context: 3 messages trigger transition to drafting-foundation-docs
    await convService.sendMessage(projectId, 'We solve payment problems for SMBs')
    await convService.sendMessage(projectId, 'Team of 5 engineers, React + Node stack')
    const afterContext = await convService.sendMessage(projectId, 'Ship MVP in 3 months')
    expect(afterContext.conversationStatus).toBe('drafting-foundation-docs')

    // drafting-foundation-docs: 2 messages trigger transition to reviewing-foundation-docs
    await convService.sendMessage(projectId, 'Sounds good, keep going')
    const afterDrafting = await convService.sendMessage(projectId, 'Yes, let me review')
    expect(afterDrafting.conversationStatus).toBe('reviewing-foundation-docs')

    // reviewing-foundation-docs: approval signal triggers ready-to-grow
    const afterReview = await convService.sendMessage(projectId, 'Looks good, approved!')
    expect(afterReview.conversationStatus).toBe('ready-to-grow')
  })

  // -------------------------------------------------------------------------
  // Phase 4: Foundation documents created alongside conversation
  // -------------------------------------------------------------------------
  it('should allow creating foundation docs during the conversation', async () => {
    const doc = await docService.create(projectId, {
      slug: '00-company-overview',
      title: 'Company Overview',
      bodyMarkdown: '# SmokeTest Inc\n\nWe validate the full flow.',
      sourceType: 'agent',
    })

    expect(doc.slug).toBe('00-company-overview')
    expect(doc.status).toBe('draft')
    expect(doc.sourceType).toBe('agent')

    await docService.create(projectId, {
      slug: '01-mission-vision',
      title: 'Mission & Vision',
      bodyMarkdown: '# Mission\nValidate everything end-to-end.',
      sourceType: 'agent',
    })

    const allDocs = await docService.list(projectId)
    expect(allDocs).toHaveLength(2)
  })

  // -------------------------------------------------------------------------
  // Phase 5: Propose growth → departments
  // -------------------------------------------------------------------------
  it('should propose and create departments when ready-to-grow', async () => {
    await bootstrapService.bootstrap({
      projectId,
      name: 'SmokeTest Inc',
      mission: 'Validate the full flow',
      companyType: 'saas-startup',
    })

    await convService.startConversation(projectId)

    // Drive conversation to ready-to-grow
    await convService.sendMessage(projectId, 'We solve payment problems for SMBs')
    await convService.sendMessage(projectId, 'Team of 5 engineers')
    await convService.sendMessage(projectId, 'Ship MVP in 3 months')
    await convService.sendMessage(projectId, 'Sounds good')
    await convService.sendMessage(projectId, 'Review please')
    await convService.sendMessage(projectId, 'Looks good, approved!')

    // Verify ready-to-grow
    const status = await convService.getStatus(projectId)
    expect(status!.status).toBe('ready-to-grow')

    // Propose growth
    const growthResponse = await convService.proposeGrowth(projectId)

    // SaaS startup → 3 departments (Engineering, Product, Operations)
    expect(growthResponse.proposals.length).toBe(3)
    expect(growthResponse.proposals.map((p) => p.proposalType)).toEqual([
      'create-department',
      'create-department',
      'create-department',
    ])
    expect(growthResponse.conversationStatus).toBe('growth-started')
  })

  // -------------------------------------------------------------------------
  // Phase 6: Approve proposal → department + coordinator created
  // -------------------------------------------------------------------------
  it('should approve a proposal and create department with coordinator', async () => {
    await bootstrapService.bootstrap({
      projectId,
      name: 'SmokeTest Inc',
      mission: 'Validate the full flow',
      companyType: 'saas-startup',
    })

    await convService.startConversation(projectId)
    await convService.sendMessage(projectId, 'We solve payment problems for SMBs')
    await convService.sendMessage(projectId, 'Team of 5 engineers')
    await convService.sendMessage(projectId, 'Ship MVP in 3 months')
    await convService.sendMessage(projectId, 'Sounds good')
    await convService.sendMessage(projectId, 'Review please')
    await convService.sendMessage(projectId, 'Looks good, approved!')

    const growthResponse = await convService.proposeGrowth(projectId)
    const firstProposal = growthResponse.proposals[0]!

    // Approve the first proposal
    const approvalResult = await convService.approveGrowthProposal(
      projectId,
      firstProposal.id,
    )

    expect(approvalResult.result.createdUnitId).toBeTruthy()
    expect(approvalResult.result.createdAgentId).toBeTruthy()
    expect(approvalResult.result.newPhase).toBe('formation')

    // Verify the department was created
    const units = await uoRepo.findByProjectId(projectId)
    const departments = units.filter((u) => u.uoType === 'department')
    expect(departments.length).toBe(1)
    expect(departments[0]!.status).toBe('active')

    // Verify coordinator agent was created
    const agents = await agentRepo.findByProjectId(projectId)
    const coordinators = agents.filter(
      (a) => a.agentType === 'coordinator' && a.role === 'Department Executive',
    )
    expect(coordinators.length).toBe(1)

    // Verify phase advanced to formation
    const seed = await seedRepo.findByProjectId(projectId)
    expect(seed!.maturityPhase).toBe('formation')
  })

  // -------------------------------------------------------------------------
  // Phase 7: Full end-to-end — bootstrap → conversation → docs → growth → specialist
  // -------------------------------------------------------------------------
  it('should complete the full flow: bootstrap → chat → docs → growth → specialist', async () => {
    // 1. Bootstrap
    const bootstrap = await bootstrapService.bootstrap({
      projectId,
      name: 'FullFlow Corp',
      mission: 'Complete end-to-end validation',
      companyType: 'tech-startup',
    })
    expect(bootstrap.maturityPhase).toBe('seed')

    // 2. Start conversation
    const conv = await convService.startConversation(projectId)
    expect(conv.status).toBe('collecting-context')

    // 3. Drive through collecting-context → drafting-foundation-docs
    await convService.sendMessage(projectId, 'We build developer tools')
    await convService.sendMessage(projectId, 'Small team, lean approach')
    await convService.sendMessage(projectId, 'First release in Q1')

    // 4. Drive through drafting-foundation-docs → reviewing-foundation-docs
    await convService.sendMessage(projectId, 'Continue drafting')
    await convService.sendMessage(projectId, 'Ready for review')

    // 5. Approve foundation docs → ready-to-grow
    const afterApproval = await convService.sendMessage(projectId, 'LGTM, approve')
    expect(afterApproval.conversationStatus).toBe('ready-to-grow')

    // 6. Create foundation documents
    await docService.create(projectId, {
      slug: '00-company-overview',
      title: 'Company Overview',
      bodyMarkdown: '# FullFlow Corp\n\nDeveloper tools company.',
      sourceType: 'agent',
    })
    await docService.create(projectId, {
      slug: '01-mission-vision',
      title: 'Mission & Vision',
      bodyMarkdown: '# Mission\nBuild the best dev tools.',
      sourceType: 'agent',
    })
    const docs = await docService.list(projectId)
    expect(docs).toHaveLength(2)

    // 7. Propose growth → departments
    const growthResponse = await convService.proposeGrowth(projectId)
    expect(growthResponse.proposals.length).toBeGreaterThanOrEqual(2)
    expect(growthResponse.conversationStatus).toBe('growth-started')

    // 8. Approve first department
    const deptProposal = growthResponse.proposals[0]!
    const deptResult = await convService.approveGrowthProposal(projectId, deptProposal.id)
    expect(deptResult.result.createdUnitId).toBeTruthy()
    expect(deptResult.result.newPhase).toBe('formation')

    // 9. Create a specialist under the department
    const specialistResult = await growthEngine.submitProposal({
      id: crypto.randomUUID(),
      projectId,
      proposalType: 'create-specialist',
      title: 'Create Specialist: Backend Developer',
      description: 'Backend specialist for API development',
      motivation: 'Need backend capability',
      problemDetected: 'No backend specialist',
      expectedBenefit: 'API development capacity',
      contextToAssign: `parentUoId:${deptResult.result.createdUnitId}`,
      proposedByAgentId: bootstrap.ceoAgentId,
    })

    // Specialist proposals stay in 'proposed' after evaluation (founder approval required)
    expect(specialistResult.proposal.status).toBe('proposed')
    await growthEngine.approveProposal(specialistResult.proposal.id, 'founder')
    const implResult = await growthEngine.implementProposal(specialistResult.proposal.id)

    expect(implResult.createdAgentId).toBeTruthy()
    expect(implResult.proposal.status).toBe('implemented')

    // 10. Verify final state
    const allAgents = await agentRepo.findByProjectId(projectId)
    const specialists = allAgents.filter((a) => a.agentType === 'specialist')
    expect(specialists.length).toBe(1)
    expect(specialists[0]!.name).toBe('Backend Developer')

    const allUnits = await uoRepo.findByProjectId(projectId)
    expect(allUnits.filter((u) => u.uoType === 'company')).toHaveLength(1)
    expect(allUnits.filter((u) => u.uoType === 'department')).toHaveLength(1)
  })

  // -------------------------------------------------------------------------
  // Edge: Reject a growth proposal
  // -------------------------------------------------------------------------
  it('should reject a growth proposal and allow re-proposal', async () => {
    await bootstrapService.bootstrap({
      projectId,
      name: 'SmokeTest Inc',
      mission: 'Validate rejection flow',
      companyType: 'saas-startup',
    })

    await convService.startConversation(projectId)
    await convService.sendMessage(projectId, 'We solve payment problems')
    await convService.sendMessage(projectId, 'Team of 5')
    await convService.sendMessage(projectId, 'Ship in 3 months')
    await convService.sendMessage(projectId, 'Sounds good')
    await convService.sendMessage(projectId, 'Ready')
    await convService.sendMessage(projectId, 'Approved')

    const growth = await convService.proposeGrowth(projectId)
    const proposalId = growth.proposals[0]!.id

    // Reject the first proposal
    const rejection = await convService.rejectGrowthProposal(
      projectId,
      proposalId,
      'Not needed right now',
    )
    expect(rejection.proposal.status).toBe('rejected')

    // Can still propose again
    const growth2 = await convService.proposeGrowth(projectId)
    expect(growth2.proposals.length).toBeGreaterThan(0)
  })

  // -------------------------------------------------------------------------
  // Edge: Document update flow
  // -------------------------------------------------------------------------
  it('should support creating, updating, and approving foundation documents', async () => {
    const doc = await docService.create(projectId, {
      slug: '00-overview',
      title: 'Company Overview',
      bodyMarkdown: '# Draft\nInitial content.',
      sourceType: 'agent',
    })

    // Update by user
    const updated = await docService.update(doc.id, {
      bodyMarkdown: '# Company Overview\nRevised content by founder.',
      lastUpdatedBy: 'founder-user-id',
      status: 'review',
    })
    expect(updated.status).toBe('review')
    expect(updated.bodyMarkdown).toContain('Revised content')

    // Approve
    const approved = await docService.update(doc.id, { status: 'approved' })
    expect(approved.status).toBe('approved')
  })

  // -------------------------------------------------------------------------
  // Edge: Idempotent bootstrap and conversation start
  // -------------------------------------------------------------------------
  it('should be idempotent for bootstrap and conversation start', async () => {
    await bootstrapService.bootstrap({
      projectId,
      name: 'Idempotent Corp',
      mission: 'Test idempotency',
      companyType: 'tech-startup',
    })
    const second = await bootstrapService.bootstrap({
      projectId,
      name: 'Idempotent Corp',
      mission: 'Test idempotency',
      companyType: 'tech-startup',
    })
    expect(second.projectSeedId).toBe(projectId)

    const conv1 = await convService.startConversation(projectId)
    const conv2 = await convService.startConversation(projectId)
    expect(conv2.id).toBe(conv1.id)
    expect(conv2.threadId).toBe(conv1.threadId)
  })
})
