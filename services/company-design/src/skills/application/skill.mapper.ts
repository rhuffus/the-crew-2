import type { SkillDto } from '@the-crew/shared-types'
import type { Skill } from '../domain/skill'

export class SkillMapper {
  static toDto(skill: Skill): SkillDto {
    return {
      id: skill.id,
      projectId: skill.projectId,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      tags: [...skill.tags],
      compatibleRoleIds: [...skill.compatibleRoleIds],
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    }
  }
}
