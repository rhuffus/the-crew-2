import type { Repository } from '@the-crew/domain-core'
import type { Release } from './release'

export interface ReleaseRepository extends Repository<Release, string> {
  findByProjectId(projectId: string): Promise<Release[]>
}

export const RELEASE_REPOSITORY = Symbol('RELEASE_REPOSITORY')
