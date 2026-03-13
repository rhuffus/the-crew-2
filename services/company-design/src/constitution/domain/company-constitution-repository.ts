import type { CompanyConstitution } from './company-constitution'

export interface CompanyConstitutionRepository {
  findByProjectId(projectId: string): Promise<CompanyConstitution | null>
  save(constitution: CompanyConstitution): Promise<void>
}

export const COMPANY_CONSTITUTION_REPOSITORY = Symbol('COMPANY_CONSTITUTION_REPOSITORY')
