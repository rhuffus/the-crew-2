import { describe, it, expect } from 'vitest'
import { LcpAgent } from './lcp-agent'

describe('LcpAgent', () => {
  const baseProps = {
    id: 'a1',
    projectId: 'p1',
    name: 'CEO Agent',
    description: 'Coordinates company strategy',
    agentType: 'coordinator' as const,
    uoId: 'uo-1',
    role: 'Chief Executive',
  }

  it('should create an agent with defaults', () => {
    const agent = LcpAgent.create(baseProps)
    expect(agent.id).toBe('a1')
    expect(agent.projectId).toBe('p1')
    expect(agent.name).toBe('CEO Agent')
    expect(agent.description).toBe('Coordinates company strategy')
    expect(agent.agentType).toBe('coordinator')
    expect(agent.uoId).toBe('uo-1')
    expect(agent.role).toBe('Chief Executive')
    expect(agent.skills).toEqual([])
    expect(agent.inputs).toEqual([])
    expect(agent.outputs).toEqual([])
    expect(agent.responsibilities).toEqual([])
    expect(agent.budget).toBeNull()
    expect(agent.contextWindow).toBeNull()
    expect(agent.status).toBe('active')
    expect(agent.systemPromptRef).toBeNull()
  })

  it('should emit AgentCreated event', () => {
    const agent = LcpAgent.create(baseProps)
    expect(agent.domainEvents).toHaveLength(1)
    expect(agent.domainEvents[0]!.eventType).toBe('AgentCreated')
    expect(agent.domainEvents[0]!.payload).toEqual({
      projectId: 'p1',
      name: 'CEO Agent',
      agentType: 'coordinator',
    })
  })

  it('should reject empty name', () => {
    expect(() => LcpAgent.create({ ...baseProps, name: '  ' })).toThrow(
      'Agent name cannot be empty',
    )
  })

  it('should reject empty role', () => {
    expect(() => LcpAgent.create({ ...baseProps, role: '  ' })).toThrow(
      'Agent role cannot be empty',
    )
  })

  it('should reject empty uoId', () => {
    expect(() => LcpAgent.create({ ...baseProps, uoId: '  ' })).toThrow(
      'Agent uoId cannot be empty',
    )
  })

  it('should trim name on create', () => {
    const agent = LcpAgent.create({ ...baseProps, name: '  CEO Agent  ' })
    expect(agent.name).toBe('CEO Agent')
  })

  it('should trim role on create', () => {
    const agent = LcpAgent.create({ ...baseProps, role: '  Chief Executive  ' })
    expect(agent.role).toBe('Chief Executive')
  })

  it('should default description to empty string', () => {
    const { description: _, ...propsWithoutDesc } = baseProps
    const agent = LcpAgent.create(propsWithoutDesc)
    expect(agent.description).toBe('')
  })

  it('should create with all optional props', () => {
    const skills = [{ name: 'Strategy', description: 'Strategic planning', category: 'leadership' }]
    const budget = { maxMonthlyTokens: 1000000, maxConcurrentTasks: 5, costLimit: 100 }
    const agent = LcpAgent.create({
      ...baseProps,
      skills,
      inputs: ['market-data'],
      outputs: ['strategy-doc'],
      responsibilities: ['Set direction'],
      budget,
      contextWindow: 128000,
      status: 'proposed',
      systemPromptRef: 'prompts/ceo-v1',
    })
    expect(agent.skills).toEqual(skills)
    expect(agent.inputs).toEqual(['market-data'])
    expect(agent.outputs).toEqual(['strategy-doc'])
    expect(agent.responsibilities).toEqual(['Set direction'])
    expect(agent.budget).toEqual(budget)
    expect(agent.contextWindow).toBe(128000)
    expect(agent.status).toBe('proposed')
    expect(agent.systemPromptRef).toBe('prompts/ceo-v1')
  })

  it('should return copies of arrays from getters', () => {
    const agent = LcpAgent.create({
      ...baseProps,
      skills: [{ name: 'S1', description: 'D1', category: 'C1' }],
      inputs: ['in1'],
      outputs: ['out1'],
      responsibilities: ['r1'],
    })
    const skills = agent.skills
    const inputs = agent.inputs
    const outputs = agent.outputs
    const responsibilities = agent.responsibilities
    skills.push({ name: 'S2', description: 'D2', category: 'C2' })
    inputs.push('in2')
    outputs.push('out2')
    responsibilities.push('r2')
    expect(agent.skills).toHaveLength(1)
    expect(agent.inputs).toHaveLength(1)
    expect(agent.outputs).toHaveLength(1)
    expect(agent.responsibilities).toHaveLength(1)
  })

  it('should return copy of budget from getter', () => {
    const budget = { maxMonthlyTokens: 1000, maxConcurrentTasks: 3, costLimit: 50 }
    const agent = LcpAgent.create({ ...baseProps, budget })
    const gotBudget = agent.budget!
    gotBudget.maxMonthlyTokens = 9999
    expect(agent.budget!.maxMonthlyTokens).toBe(1000)
  })

  it('should update name and role', () => {
    const agent = LcpAgent.create(baseProps)
    agent.update({ name: 'CTO Agent', role: 'Chief Technology' })
    expect(agent.name).toBe('CTO Agent')
    expect(agent.role).toBe('Chief Technology')
  })

  it('should reject empty name on update', () => {
    const agent = LcpAgent.create(baseProps)
    expect(() => agent.update({ name: '' })).toThrow('Agent name cannot be empty')
  })

  it('should reject empty role on update', () => {
    const agent = LcpAgent.create(baseProps)
    expect(() => agent.update({ role: '  ' })).toThrow('Agent role cannot be empty')
  })

  it('should reject empty uoId on update', () => {
    const agent = LcpAgent.create(baseProps)
    expect(() => agent.update({ uoId: '' })).toThrow('Agent uoId cannot be empty')
  })

  it('should emit AgentUpdated event on update', () => {
    const agent = LcpAgent.create(baseProps)
    agent.clearEvents()
    agent.update({ name: 'Updated Agent' })
    expect(agent.domainEvents).toHaveLength(1)
    expect(agent.domainEvents[0]!.eventType).toBe('AgentUpdated')
  })

  it('should preserve unchanged fields on partial update', () => {
    const agent = LcpAgent.create({
      ...baseProps,
      skills: [{ name: 'S1', description: 'D1', category: 'C1' }],
      inputs: ['in1'],
    })
    agent.update({ description: 'New description' })
    expect(agent.name).toBe('CEO Agent')
    expect(agent.role).toBe('Chief Executive')
    expect(agent.skills).toEqual([{ name: 'S1', description: 'D1', category: 'C1' }])
    expect(agent.inputs).toEqual(['in1'])
    expect(agent.description).toBe('New description')
  })

  it('should update all optional fields', () => {
    const agent = LcpAgent.create(baseProps)
    agent.update({
      agentType: 'specialist',
      uoId: 'uo-2',
      skills: [{ name: 'Coding', description: 'Write code', category: 'engineering' }],
      inputs: ['requirements'],
      outputs: ['code'],
      responsibilities: ['Implement features'],
      budget: { maxMonthlyTokens: 500000, maxConcurrentTasks: 10, costLimit: null },
      contextWindow: 32000,
      status: 'inactive',
      systemPromptRef: 'prompts/dev-v2',
    })
    expect(agent.agentType).toBe('specialist')
    expect(agent.uoId).toBe('uo-2')
    expect(agent.skills).toEqual([{ name: 'Coding', description: 'Write code', category: 'engineering' }])
    expect(agent.inputs).toEqual(['requirements'])
    expect(agent.outputs).toEqual(['code'])
    expect(agent.responsibilities).toEqual(['Implement features'])
    expect(agent.budget).toEqual({ maxMonthlyTokens: 500000, maxConcurrentTasks: 10, costLimit: null })
    expect(agent.contextWindow).toBe(32000)
    expect(agent.status).toBe('inactive')
    expect(agent.systemPromptRef).toBe('prompts/dev-v2')
  })

  it('should reconstitute from props', () => {
    const now = new Date()
    const agent = LcpAgent.reconstitute('a1', {
      projectId: 'p1',
      name: 'Existing Agent',
      description: 'Pre-existing',
      agentType: 'specialist',
      uoId: 'uo-1',
      role: 'Developer',
      skills: [],
      inputs: [],
      outputs: [],
      responsibilities: [],
      budget: null,
      contextWindow: null,
      status: 'active',
      systemPromptRef: null,
      createdAt: now,
      updatedAt: now,
    })
    expect(agent.name).toBe('Existing Agent')
    expect(agent.domainEvents).toHaveLength(0)
  })

  it('should update budget to null', () => {
    const agent = LcpAgent.create({
      ...baseProps,
      budget: { maxMonthlyTokens: 1000, maxConcurrentTasks: 5, costLimit: 100 },
    })
    agent.update({ budget: null })
    expect(agent.budget).toBeNull()
  })

  it('should update systemPromptRef to null', () => {
    const agent = LcpAgent.create({ ...baseProps, systemPromptRef: 'prompts/v1' })
    agent.update({ systemPromptRef: null })
    expect(agent.systemPromptRef).toBeNull()
  })
})
