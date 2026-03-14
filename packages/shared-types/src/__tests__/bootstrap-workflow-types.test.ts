import { describe, it, expect } from 'vitest'
import type {
  BootstrapWorkflowInput,
  BootstrapWorkflowOutput,
  BootstrapWorkflowContext,
  BootstrapWorkflowMessage,
} from '../bootstrap-workflow-types'

describe('bootstrap-workflow-types', () => {
  it('should accept a valid BootstrapWorkflowInput for kickoff', () => {
    const input: BootstrapWorkflowInput = {
      projectId: 'proj-1',
      isKickoff: true,
      context: {
        companyName: 'Acme Corp',
        companyMission: 'Build great software',
        companyType: 'saas-startup',
        conversationStatus: 'collecting-context',
        recentMessages: [],
      },
    }
    expect(input.isKickoff).toBe(true)
    expect(input.userMessage).toBeUndefined()
  })

  it('should accept a valid BootstrapWorkflowInput for reply', () => {
    const input: BootstrapWorkflowInput = {
      projectId: 'proj-1',
      isKickoff: false,
      userMessage: 'We focus on fintech',
      context: {
        companyName: 'Acme Corp',
        companyMission: 'Build great software',
        companyType: 'saas-startup',
        conversationStatus: 'collecting-context',
        recentMessages: [
          { role: 'assistant', content: 'Welcome!' },
          { role: 'user', content: 'We focus on fintech' },
        ],
      },
    }
    expect(input.isKickoff).toBe(false)
    expect(input.userMessage).toBe('We focus on fintech')
    expect(input.context.recentMessages).toHaveLength(2)
  })

  it('should accept a valid BootstrapWorkflowOutput with status', () => {
    const output: BootstrapWorkflowOutput = {
      content: 'Great context! Moving to drafting.',
      suggestedNextStatus: 'drafting-foundation-docs',
    }
    expect(output.content).toBeTruthy()
    expect(output.suggestedNextStatus).toBe('drafting-foundation-docs')
  })

  it('should accept a valid BootstrapWorkflowOutput without status', () => {
    const output: BootstrapWorkflowOutput = {
      content: 'Tell me more about your team.',
      suggestedNextStatus: null,
    }
    expect(output.suggestedNextStatus).toBeNull()
  })

  it('should support BootstrapWorkflowContext independently', () => {
    const ctx: BootstrapWorkflowContext = {
      companyName: 'Test',
      companyMission: '',
      companyType: '',
      conversationStatus: 'not-started',
      recentMessages: [],
    }
    expect(ctx.companyName).toBe('Test')
  })

  it('should support BootstrapWorkflowMessage independently', () => {
    const msg: BootstrapWorkflowMessage = {
      role: 'user',
      content: 'Hello',
    }
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Hello')
  })
})
