import { Injectable } from '@nestjs/common'
import type { CompanyModelRepository } from '../domain/company-model-repository'
import type { CompanyModel } from '../domain/company-model'

@Injectable()
export class InMemoryCompanyModelRepository implements CompanyModelRepository {
  private readonly store = new Map<string, CompanyModel>()

  async findByProjectId(projectId: string): Promise<CompanyModel | null> {
    return this.store.get(projectId) ?? null
  }

  async save(model: CompanyModel): Promise<void> {
    this.store.set(model.projectId, model)
  }
}
