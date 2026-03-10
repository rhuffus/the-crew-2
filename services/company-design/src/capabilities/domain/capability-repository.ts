import type { Repository } from '@the-crew/domain-core'
import type { Capability } from './capability'

export interface CapabilityRepository extends Repository<Capability, string> {
  findByProjectId(projectId: string): Promise<Capability[]>
}

export const CAPABILITY_REPOSITORY = Symbol('CAPABILITY_REPOSITORY')
