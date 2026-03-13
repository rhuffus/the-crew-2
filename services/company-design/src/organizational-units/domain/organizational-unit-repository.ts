import type { Repository } from '@the-crew/domain-core'
import type { OrganizationalUnit } from './organizational-unit'

export interface OrganizationalUnitRepository extends Repository<OrganizationalUnit, string> {
  findByProjectId(projectId: string): Promise<OrganizationalUnit[]>
}

export const ORGANIZATIONAL_UNIT_REPOSITORY = Symbol('ORGANIZATIONAL_UNIT_REPOSITORY')
