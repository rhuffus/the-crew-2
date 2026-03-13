import { AggregateRoot } from '@the-crew/domain-core'

export type ApprovalScope =
  | 'create-department'
  | 'create-team'
  | 'create-specialist'
  | 'retire-unit'
  | 'revise-contract'
  | 'revise-workflow'
  | 'update-constitution'

export type ApproverLevel = 'founder' | 'ceo' | 'executive' | 'team-lead' | 'auto'

export interface AutonomyLimitsProps {
  maxDepth: number
  maxFanOut: number
  maxAgentsPerTeam: number
  coordinatorToSpecialistRatio: number
}

export interface BudgetConfigProps {
  globalBudget: number | null
  perUoBudget: number | null
  perAgentBudget: number | null
  alertThresholds: number[]
}

export interface ApprovalCriterionProps {
  scope: ApprovalScope
  requiredApprover: ApproverLevel
  requiresJustification: boolean
}

export interface ExpansionRuleProps {
  targetType: 'department' | 'team' | 'specialist'
  conditions: string[]
  requiresBudget: boolean
  requiresOwner: boolean
}

export interface CompanyConstitutionProps {
  operationalPrinciples: string[]
  autonomyLimits: AutonomyLimitsProps
  budgetConfig: BudgetConfigProps
  approvalCriteria: ApprovalCriterionProps[]
  namingConventions: string[]
  expansionRules: ExpansionRuleProps[]
  contextMinimizationPolicy: string
  qualityRules: string[]
  deliveryRules: string[]
  createdAt: Date
  updatedAt: Date
}

function cloneAutonomyLimits(limits: AutonomyLimitsProps): AutonomyLimitsProps {
  return { ...limits }
}

function cloneBudgetConfig(config: BudgetConfigProps): BudgetConfigProps {
  return {
    globalBudget: config.globalBudget,
    perUoBudget: config.perUoBudget,
    perAgentBudget: config.perAgentBudget,
    alertThresholds: [...config.alertThresholds],
  }
}

function cloneApprovalCriteria(criteria: ApprovalCriterionProps[]): ApprovalCriterionProps[] {
  return criteria.map((c) => ({ ...c }))
}

function cloneExpansionRules(rules: ExpansionRuleProps[]): ExpansionRuleProps[] {
  return rules.map((r) => ({
    targetType: r.targetType,
    conditions: [...r.conditions],
    requiresBudget: r.requiresBudget,
    requiresOwner: r.requiresOwner,
  }))
}

export class CompanyConstitution extends AggregateRoot<string> {
  private _operationalPrinciples: string[]
  private _autonomyLimits: AutonomyLimitsProps
  private _budgetConfig: BudgetConfigProps
  private _approvalCriteria: ApprovalCriterionProps[]
  private _namingConventions: string[]
  private _expansionRules: ExpansionRuleProps[]
  private _contextMinimizationPolicy: string
  private _qualityRules: string[]
  private _deliveryRules: string[]
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(projectId: string, props: CompanyConstitutionProps) {
    super(projectId)
    this._operationalPrinciples = [...props.operationalPrinciples]
    this._autonomyLimits = cloneAutonomyLimits(props.autonomyLimits)
    this._budgetConfig = cloneBudgetConfig(props.budgetConfig)
    this._approvalCriteria = cloneApprovalCriteria(props.approvalCriteria)
    this._namingConventions = [...props.namingConventions]
    this._expansionRules = cloneExpansionRules(props.expansionRules)
    this._contextMinimizationPolicy = props.contextMinimizationPolicy
    this._qualityRules = [...props.qualityRules]
    this._deliveryRules = [...props.deliveryRules]
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this.id
  }

  get operationalPrinciples(): readonly string[] {
    return [...this._operationalPrinciples]
  }

  get autonomyLimits(): AutonomyLimitsProps {
    return cloneAutonomyLimits(this._autonomyLimits)
  }

  get budgetConfig(): BudgetConfigProps {
    return cloneBudgetConfig(this._budgetConfig)
  }

  get approvalCriteria(): readonly ApprovalCriterionProps[] {
    return cloneApprovalCriteria(this._approvalCriteria)
  }

  get namingConventions(): readonly string[] {
    return [...this._namingConventions]
  }

  get expansionRules(): readonly ExpansionRuleProps[] {
    return cloneExpansionRules(this._expansionRules)
  }

  get contextMinimizationPolicy() {
    return this._contextMinimizationPolicy
  }

  get qualityRules(): readonly string[] {
    return [...this._qualityRules]
  }

  get deliveryRules(): readonly string[] {
    return [...this._deliveryRules]
  }

  get createdAt() {
    return this._createdAt
  }

  get updatedAt() {
    return this._updatedAt
  }

  static create(projectId: string, props: CompanyConstitutionProps): CompanyConstitution {
    if (!props.operationalPrinciples.length) {
      throw new Error('CompanyConstitution requires at least one operational principle')
    }
    const now = new Date()
    const constitution = new CompanyConstitution(projectId, {
      ...props,
      createdAt: now,
      updatedAt: now,
    })
    constitution.addDomainEvent({
      eventType: 'ConstitutionCreated',
      occurredOn: now,
      aggregateId: projectId,
      payload: {},
    })
    return constitution
  }

  static reconstitute(projectId: string, props: CompanyConstitutionProps): CompanyConstitution {
    return new CompanyConstitution(projectId, props)
  }

  update(props: {
    operationalPrinciples?: string[]
    autonomyLimits?: Partial<AutonomyLimitsProps>
    budgetConfig?: Partial<BudgetConfigProps>
    approvalCriteria?: ApprovalCriterionProps[]
    namingConventions?: string[]
    expansionRules?: ExpansionRuleProps[]
    contextMinimizationPolicy?: string
    qualityRules?: string[]
    deliveryRules?: string[]
  }): void {
    if (props.operationalPrinciples !== undefined) {
      const filtered = props.operationalPrinciples.map((p) => p.trim()).filter(Boolean)
      if (!filtered.length) {
        throw new Error('CompanyConstitution requires at least one operational principle')
      }
      this._operationalPrinciples = filtered
    }
    if (props.autonomyLimits !== undefined) {
      this._autonomyLimits = {
        ...this._autonomyLimits,
        ...props.autonomyLimits,
      }
    }
    if (props.budgetConfig !== undefined) {
      this._budgetConfig = {
        ...this._budgetConfig,
        ...props.budgetConfig,
        alertThresholds: props.budgetConfig.alertThresholds ?? this._budgetConfig.alertThresholds,
      }
    }
    if (props.approvalCriteria !== undefined) {
      this._approvalCriteria = cloneApprovalCriteria(props.approvalCriteria)
    }
    if (props.namingConventions !== undefined) {
      this._namingConventions = props.namingConventions.map((n) => n.trim()).filter(Boolean)
    }
    if (props.expansionRules !== undefined) {
      this._expansionRules = cloneExpansionRules(props.expansionRules)
    }
    if (props.contextMinimizationPolicy !== undefined) {
      this._contextMinimizationPolicy = props.contextMinimizationPolicy.trim()
    }
    if (props.qualityRules !== undefined) {
      this._qualityRules = props.qualityRules.map((r) => r.trim()).filter(Boolean)
    }
    if (props.deliveryRules !== undefined) {
      this._deliveryRules = props.deliveryRules.map((r) => r.trim()).filter(Boolean)
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ConstitutionUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: {
        operationalPrinciples: [...this._operationalPrinciples],
        autonomyLimits: cloneAutonomyLimits(this._autonomyLimits),
        budgetConfig: cloneBudgetConfig(this._budgetConfig),
        approvalCriteria: cloneApprovalCriteria(this._approvalCriteria),
        namingConventions: [...this._namingConventions],
        expansionRules: cloneExpansionRules(this._expansionRules),
        contextMinimizationPolicy: this._contextMinimizationPolicy,
        qualityRules: [...this._qualityRules],
        deliveryRules: [...this._deliveryRules],
      },
    })
  }
}
