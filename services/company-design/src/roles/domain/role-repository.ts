import type { Repository } from '@the-crew/domain-core'
import type { Role } from './role'

export interface RoleRepository extends Repository<Role, string> {
  findByProjectId(projectId: string): Promise<Role[]>
}

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY')
