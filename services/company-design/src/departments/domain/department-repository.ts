import type { Repository } from '@the-crew/domain-core'
import type { Department } from './department'

export interface DepartmentRepository extends Repository<Department, string> {
  findByProjectId(projectId: string): Promise<Department[]>
}

export const DEPARTMENT_REPOSITORY = Symbol('DEPARTMENT_REPOSITORY')
