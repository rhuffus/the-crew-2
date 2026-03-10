import type { Repository } from '@the-crew/domain-core'
import type { Skill } from './skill'

export interface SkillRepository extends Repository<Skill, string> {
  findByProjectId(projectId: string): Promise<Skill[]>
}

export const SKILL_REPOSITORY = Symbol('SKILL_REPOSITORY')
