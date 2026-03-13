import { AggregateRoot } from '@the-crew/domain-core'

export type MaturityPhase =
  | 'seed'
  | 'formation'
  | 'structured'
  | 'operating'
  | 'scaling'
  | 'optimizing'

type ApprovalLevel = 'all-changes' | 'structural-only' | 'budget-only' | 'none'
type CommunicationStyle = 'detailed' | 'concise' | 'minimal'
type GrowthPace = 'conservative' | 'moderate' | 'aggressive'

export interface AiBudgetProps {
  maxMonthlyTokens: number | null
  maxConcurrentAgents: number | null
  costAlertThreshold: number | null
}

export interface FounderPreferencesProps {
  approvalLevel: ApprovalLevel
  communicationStyle: CommunicationStyle
  growthPace: GrowthPace
}

export interface ProjectSeedProps {
  name: string
  description: string
  mission: string
  vision: string
  companyType: string
  restrictions: string[]
  principles: string[]
  aiBudget: AiBudgetProps
  initialObjectives: string[]
  founderPreferences: FounderPreferencesProps
  maturityPhase: MaturityPhase
  createdAt: Date
  updatedAt: Date
}

const PHASE_ORDER: readonly MaturityPhase[] = [
  'seed',
  'formation',
  'structured',
  'operating',
  'scaling',
  'optimizing',
]

export class ProjectSeed extends AggregateRoot<string> {
  private _name: string
  private _description: string
  private _mission: string
  private _vision: string
  private _companyType: string
  private _restrictions: string[]
  private _principles: string[]
  private _aiBudget: AiBudgetProps
  private _initialObjectives: string[]
  private _founderPreferences: FounderPreferencesProps
  private _maturityPhase: MaturityPhase
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(projectId: string, props: ProjectSeedProps) {
    super(projectId)
    this._name = props.name
    this._description = props.description
    this._mission = props.mission
    this._vision = props.vision
    this._companyType = props.companyType
    this._restrictions = [...props.restrictions]
    this._principles = [...props.principles]
    this._aiBudget = { ...props.aiBudget }
    this._initialObjectives = [...props.initialObjectives]
    this._founderPreferences = { ...props.founderPreferences }
    this._maturityPhase = props.maturityPhase
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this.id
  }
  get name() {
    return this._name
  }
  get description() {
    return this._description
  }
  get mission() {
    return this._mission
  }
  get vision() {
    return this._vision
  }
  get companyType() {
    return this._companyType
  }
  get restrictions(): readonly string[] {
    return [...this._restrictions]
  }
  get principles(): readonly string[] {
    return [...this._principles]
  }
  get aiBudget(): AiBudgetProps {
    return { ...this._aiBudget }
  }
  get initialObjectives(): readonly string[] {
    return [...this._initialObjectives]
  }
  get founderPreferences(): FounderPreferencesProps {
    return { ...this._founderPreferences }
  }
  get maturityPhase() {
    return this._maturityPhase
  }
  get createdAt() {
    return this._createdAt
  }
  get updatedAt() {
    return this._updatedAt
  }

  static create(
    projectId: string,
    props: {
      name: string
      description?: string
      mission: string
      vision?: string
      companyType: string
      restrictions?: string[]
      principles?: string[]
      aiBudget?: Partial<AiBudgetProps>
      initialObjectives?: string[]
      founderPreferences?: Partial<FounderPreferencesProps>
    },
  ): ProjectSeed {
    if (!props.name.trim()) {
      throw new Error('ProjectSeed name is required')
    }
    if (!props.mission.trim()) {
      throw new Error('ProjectSeed mission is required')
    }

    const now = new Date()
    const seed = new ProjectSeed(projectId, {
      name: props.name.trim(),
      description: (props.description ?? '').trim(),
      mission: props.mission.trim(),
      vision: (props.vision ?? '').trim(),
      companyType: props.companyType.trim(),
      restrictions: (props.restrictions ?? []).map((r) => r.trim()).filter(Boolean),
      principles: (props.principles ?? []).map((p) => p.trim()).filter(Boolean),
      aiBudget: {
        maxMonthlyTokens: props.aiBudget?.maxMonthlyTokens ?? null,
        maxConcurrentAgents: props.aiBudget?.maxConcurrentAgents ?? null,
        costAlertThreshold: props.aiBudget?.costAlertThreshold ?? null,
      },
      initialObjectives: (props.initialObjectives ?? []).map((o) => o.trim()).filter(Boolean),
      founderPreferences: {
        approvalLevel: props.founderPreferences?.approvalLevel ?? 'all-changes',
        communicationStyle: props.founderPreferences?.communicationStyle ?? 'detailed',
        growthPace: props.founderPreferences?.growthPace ?? 'moderate',
      },
      maturityPhase: 'seed',
      createdAt: now,
      updatedAt: now,
    })

    seed.addDomainEvent({
      eventType: 'ProjectSeedCreated',
      occurredOn: now,
      aggregateId: projectId,
      payload: {
        name: seed._name,
        mission: seed._mission,
        companyType: seed._companyType,
      },
    })

    return seed
  }

  static reconstitute(projectId: string, props: ProjectSeedProps): ProjectSeed {
    return new ProjectSeed(projectId, props)
  }

  update(props: {
    name?: string
    description?: string
    mission?: string
    vision?: string
    companyType?: string
    restrictions?: string[]
    principles?: string[]
    aiBudget?: Partial<AiBudgetProps>
    initialObjectives?: string[]
    founderPreferences?: Partial<FounderPreferencesProps>
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('ProjectSeed name is required')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description.trim()
    }
    if (props.mission !== undefined) {
      if (!props.mission.trim()) {
        throw new Error('ProjectSeed mission is required')
      }
      this._mission = props.mission.trim()
    }
    if (props.vision !== undefined) {
      this._vision = props.vision.trim()
    }
    if (props.companyType !== undefined) {
      this._companyType = props.companyType.trim()
    }
    if (props.restrictions !== undefined) {
      this._restrictions = props.restrictions.map((r) => r.trim()).filter(Boolean)
    }
    if (props.principles !== undefined) {
      this._principles = props.principles.map((p) => p.trim()).filter(Boolean)
    }
    if (props.aiBudget !== undefined) {
      this._aiBudget = {
        maxMonthlyTokens: props.aiBudget.maxMonthlyTokens ?? this._aiBudget.maxMonthlyTokens,
        maxConcurrentAgents:
          props.aiBudget.maxConcurrentAgents ?? this._aiBudget.maxConcurrentAgents,
        costAlertThreshold:
          props.aiBudget.costAlertThreshold ?? this._aiBudget.costAlertThreshold,
      }
    }
    if (props.initialObjectives !== undefined) {
      this._initialObjectives = props.initialObjectives.map((o) => o.trim()).filter(Boolean)
    }
    if (props.founderPreferences !== undefined) {
      this._founderPreferences = {
        approvalLevel:
          props.founderPreferences.approvalLevel ?? this._founderPreferences.approvalLevel,
        communicationStyle:
          props.founderPreferences.communicationStyle ??
          this._founderPreferences.communicationStyle,
        growthPace: props.founderPreferences.growthPace ?? this._founderPreferences.growthPace,
      }
    }

    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ProjectSeedUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: {
        name: this._name,
        mission: this._mission,
        companyType: this._companyType,
      },
    })
  }

  advancePhase(to: MaturityPhase): void {
    const currentIndex = PHASE_ORDER.indexOf(this._maturityPhase)
    const targetIndex = PHASE_ORDER.indexOf(to)

    if (targetIndex <= currentIndex) {
      throw new Error(
        `Cannot advance from '${this._maturityPhase}' to '${to}': phase must move forward`,
      )
    }

    const from = this._maturityPhase
    this._maturityPhase = to
    this._updatedAt = new Date()

    this.addDomainEvent({
      eventType: 'MaturityPhaseAdvanced',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { from, to },
    })
  }
}
