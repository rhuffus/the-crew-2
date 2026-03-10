import type { Repository } from '@the-crew/domain-core'
import type { Policy } from './policy'

export interface PolicyRepository extends Repository<Policy, string> {
  findByProjectId(projectId: string): Promise<Policy[]>
}

export const POLICY_REPOSITORY = Symbol('POLICY_REPOSITORY')
