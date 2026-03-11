import type { Repository } from '@the-crew/domain-core'
import type { Artifact } from './artifact'

export interface ArtifactRepository extends Repository<Artifact, string> {
  findByProjectId(projectId: string): Promise<Artifact[]>
}

export const ARTIFACT_REPOSITORY = Symbol('ARTIFACT_REPOSITORY')
