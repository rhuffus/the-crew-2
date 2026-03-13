import { Injectable } from '@nestjs/common'
import type { CompanyConstitutionRepository } from '../domain/company-constitution-repository'
import type { CompanyConstitution } from '../domain/company-constitution'

@Injectable()
export class InMemoryCompanyConstitutionRepository implements CompanyConstitutionRepository {
  private readonly store = new Map<string, CompanyConstitution>()

  async findByProjectId(projectId: string): Promise<CompanyConstitution | null> {
    return this.store.get(projectId) ?? null
  }

  async save(constitution: CompanyConstitution): Promise<void> {
    this.store.set(constitution.projectId, constitution)
  }
}
