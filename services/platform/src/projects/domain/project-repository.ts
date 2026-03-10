import type { Repository } from '@the-crew/domain-core'
import type { Project } from './project'

export interface ProjectRepository extends Repository<Project, string> {
  findAll(): Promise<Project[]>
}

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY')
