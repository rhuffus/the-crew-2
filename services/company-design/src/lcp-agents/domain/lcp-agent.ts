import { AggregateRoot } from '@the-crew/domain-core'

export type LcpAgentType = 'coordinator' | 'specialist'
export type LcpAgentStatus = 'active' | 'inactive' | 'proposed'

export interface AgentSkillProps {
  name: string
  description: string
  category: string
}

export interface AgentBudgetProps {
  maxMonthlyTokens: number | null
  maxConcurrentTasks: number | null
  costLimit: number | null
}

export interface LcpAgentProps {
  projectId: string
  name: string
  description: string
  agentType: LcpAgentType
  uoId: string
  role: string
  skills: AgentSkillProps[]
  inputs: string[]
  outputs: string[]
  responsibilities: string[]
  budget: AgentBudgetProps | null
  contextWindow: number | null
  status: LcpAgentStatus
  systemPromptRef: string | null
  createdAt: Date
  updatedAt: Date
}

export class LcpAgent extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _agentType: LcpAgentType
  private _uoId: string
  private _role: string
  private _skills: AgentSkillProps[]
  private _inputs: string[]
  private _outputs: string[]
  private _responsibilities: string[]
  private _budget: AgentBudgetProps | null
  private _contextWindow: number | null
  private _status: LcpAgentStatus
  private _systemPromptRef: string | null
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: LcpAgentProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._agentType = props.agentType
    this._uoId = props.uoId
    this._role = props.role
    this._skills = props.skills
    this._inputs = props.inputs
    this._outputs = props.outputs
    this._responsibilities = props.responsibilities
    this._budget = props.budget
    this._contextWindow = props.contextWindow
    this._status = props.status
    this._systemPromptRef = props.systemPromptRef
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this._projectId
  }
  get name() {
    return this._name
  }
  get description() {
    return this._description
  }
  get agentType() {
    return this._agentType
  }
  get uoId() {
    return this._uoId
  }
  get role() {
    return this._role
  }
  get skills(): AgentSkillProps[] {
    return this._skills.map((s) => ({ ...s }))
  }
  get inputs(): string[] {
    return [...this._inputs]
  }
  get outputs(): string[] {
    return [...this._outputs]
  }
  get responsibilities(): string[] {
    return [...this._responsibilities]
  }
  get budget(): AgentBudgetProps | null {
    return this._budget ? { ...this._budget } : null
  }
  get contextWindow() {
    return this._contextWindow
  }
  get status() {
    return this._status
  }
  get systemPromptRef() {
    return this._systemPromptRef
  }
  get createdAt() {
    return this._createdAt
  }
  get updatedAt() {
    return this._updatedAt
  }

  static create(props: {
    id: string
    projectId: string
    name: string
    description?: string
    agentType: LcpAgentType
    uoId: string
    role: string
    skills?: AgentSkillProps[]
    inputs?: string[]
    outputs?: string[]
    responsibilities?: string[]
    budget?: AgentBudgetProps | null
    contextWindow?: number | null
    status?: LcpAgentStatus
    systemPromptRef?: string | null
  }): LcpAgent {
    if (!props.name.trim()) {
      throw new Error('Agent name cannot be empty')
    }
    if (!props.role.trim()) {
      throw new Error('Agent role cannot be empty')
    }
    if (!props.uoId.trim()) {
      throw new Error('Agent uoId cannot be empty')
    }
    const now = new Date()
    const agent = new LcpAgent(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description ?? '',
      agentType: props.agentType,
      uoId: props.uoId,
      role: props.role.trim(),
      skills: props.skills ?? [],
      inputs: props.inputs ?? [],
      outputs: props.outputs ?? [],
      responsibilities: props.responsibilities ?? [],
      budget: props.budget ?? null,
      contextWindow: props.contextWindow ?? null,
      status: props.status ?? 'active',
      systemPromptRef: props.systemPromptRef ?? null,
      createdAt: now,
      updatedAt: now,
    })
    agent.addDomainEvent({
      eventType: 'AgentCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name, agentType: props.agentType },
    })
    return agent
  }

  static reconstitute(id: string, props: LcpAgentProps): LcpAgent {
    return new LcpAgent(id, props)
  }

  update(props: {
    name?: string
    description?: string
    agentType?: LcpAgentType
    uoId?: string
    role?: string
    skills?: AgentSkillProps[]
    inputs?: string[]
    outputs?: string[]
    responsibilities?: string[]
    budget?: AgentBudgetProps | null
    contextWindow?: number | null
    status?: LcpAgentStatus
    systemPromptRef?: string | null
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Agent name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.role !== undefined) {
      if (!props.role.trim()) {
        throw new Error('Agent role cannot be empty')
      }
      this._role = props.role.trim()
    }
    if (props.uoId !== undefined) {
      if (!props.uoId.trim()) {
        throw new Error('Agent uoId cannot be empty')
      }
      this._uoId = props.uoId
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.agentType !== undefined) {
      this._agentType = props.agentType
    }
    if (props.skills !== undefined) {
      this._skills = props.skills
    }
    if (props.inputs !== undefined) {
      this._inputs = props.inputs
    }
    if (props.outputs !== undefined) {
      this._outputs = props.outputs
    }
    if (props.responsibilities !== undefined) {
      this._responsibilities = props.responsibilities
    }
    if (props.budget !== undefined) {
      this._budget = props.budget
    }
    if (props.contextWindow !== undefined) {
      this._contextWindow = props.contextWindow
    }
    if (props.status !== undefined) {
      this._status = props.status
    }
    if (props.systemPromptRef !== undefined) {
      this._systemPromptRef = props.systemPromptRef
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'AgentUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
