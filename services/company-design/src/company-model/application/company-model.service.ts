import { Inject, Injectable, Optional } from '@nestjs/common'
import type { CompanyModelDto, UpdateCompanyModelDto } from '@the-crew/shared-types'
import { CompanyModel } from '../domain/company-model'
import {
  COMPANY_MODEL_REPOSITORY,
  type CompanyModelRepository,
} from '../domain/company-model-repository'
import { CompanyModelMapper } from './company-model.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class CompanyModelService {
  constructor(
    @Inject(COMPANY_MODEL_REPOSITORY) private readonly repo: CompanyModelRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async get(projectId: string): Promise<CompanyModelDto> {
    let model = await this.repo.findByProjectId(projectId)
    if (!model) {
      model = CompanyModel.createEmpty(projectId)
      await this.repo.save(model)
    }
    return CompanyModelMapper.toDto(model)
  }

  async update(projectId: string, dto: UpdateCompanyModelDto): Promise<CompanyModelDto> {
    let model = await this.repo.findByProjectId(projectId)
    if (!model) {
      model = CompanyModel.createEmpty(projectId)
    }
    model.update(dto)
    await this.repo.save(model)
    const result = CompanyModelMapper.toDto(model)
    await this.auditService?.record({
      projectId,
      entityType: 'companyModel',
      entityId: projectId,
      entityName: 'Company Model',
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }
}
