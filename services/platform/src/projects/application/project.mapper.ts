import type { ProjectSummary } from '@the-crew/shared-types'
import type { Project } from '../domain/project'

export class ProjectMapper {
  static toSummary(project: Project): ProjectSummary {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  }
}
