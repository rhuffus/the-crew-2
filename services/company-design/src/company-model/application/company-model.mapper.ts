import type { CompanyModelDto } from '@the-crew/shared-types'
import type { CompanyModel } from '../domain/company-model'

export class CompanyModelMapper {
  static toDto(model: CompanyModel): CompanyModelDto {
    return {
      projectId: model.projectId,
      purpose: model.purpose,
      type: model.type,
      scope: model.scope,
      principles: [...model.principles],
      updatedAt: model.updatedAt.toISOString(),
    }
  }
}
