import { AggregateRoot } from '@the-crew/domain-core'

export interface SkillProps {
  projectId: string
  name: string
  description: string
  category: string
  tags: string[]
  compatibleRoleIds: string[]
  createdAt: Date
  updatedAt: Date
}

export class Skill extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _category: string
  private _tags: string[]
  private _compatibleRoleIds: string[]
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: SkillProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._category = props.category
    this._tags = props.tags
    this._compatibleRoleIds = props.compatibleRoleIds
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
  get category() {
    return this._category
  }
  get tags(): string[] {
    return [...this._tags]
  }
  get compatibleRoleIds(): string[] {
    return [...this._compatibleRoleIds]
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
    description: string
    category: string
    tags?: string[]
    compatibleRoleIds?: string[]
  }): Skill {
    if (!props.name.trim()) {
      throw new Error('Skill name cannot be empty')
    }
    if (!props.category.trim()) {
      throw new Error('Skill category cannot be empty')
    }
    const now = new Date()
    const skill = new Skill(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      category: props.category.trim(),
      tags: (props.tags ?? []).filter(Boolean),
      compatibleRoleIds: (props.compatibleRoleIds ?? []).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    })
    skill.addDomainEvent({
      eventType: 'SkillCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return skill
  }

  static reconstitute(id: string, props: SkillProps): Skill {
    return new Skill(id, props)
  }

  update(props: {
    name?: string
    description?: string
    category?: string
    tags?: string[]
    compatibleRoleIds?: string[]
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Skill name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.category !== undefined) {
      if (!props.category.trim()) {
        throw new Error('Skill category cannot be empty')
      }
      this._category = props.category.trim()
    }
    if (props.tags !== undefined) {
      this._tags = props.tags.filter(Boolean)
    }
    if (props.compatibleRoleIds !== undefined) {
      this._compatibleRoleIds = props.compatibleRoleIds.filter(Boolean)
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'SkillUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
