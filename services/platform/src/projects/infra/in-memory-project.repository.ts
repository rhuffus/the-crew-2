import { Injectable } from '@nestjs/common'
import type { ProjectRepository } from '../domain/project-repository'
import type { Project } from '../domain/project'

@Injectable()
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly store = new Map<string, Project>()

  async findById(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null
  }

  async findAll(): Promise<Project[]> {
    return [...this.store.values()]
  }

  async save(project: Project): Promise<void> {
    this.store.set(project.id, project)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
