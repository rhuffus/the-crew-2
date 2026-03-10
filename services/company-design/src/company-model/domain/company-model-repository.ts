import type { CompanyModel } from './company-model'

export interface CompanyModelRepository {
  findByProjectId(projectId: string): Promise<CompanyModel | null>
  save(model: CompanyModel): Promise<void>
}

export const COMPANY_MODEL_REPOSITORY = Symbol('COMPANY_MODEL_REPOSITORY')
