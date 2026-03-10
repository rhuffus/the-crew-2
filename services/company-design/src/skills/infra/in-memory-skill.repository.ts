import { Injectable } from '@nestjs/common'
import type { SkillRepository } from '../domain/skill-repository'
import type { Skill } from '../domain/skill'

@Injectable()
export class InMemorySkillRepository implements SkillRepository {
  private readonly store = new Map<string, Skill>()

  async findById(id: string): Promise<Skill | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Skill[]> {
    return [...this.store.values()].filter((s) => s.projectId === projectId)
  }

  async save(skill: Skill): Promise<void> {
    this.store.set(skill.id, skill)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
