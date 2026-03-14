import { Module } from '@nestjs/common'
import { CompanyModelController } from './company-model.controller'
import { CompanyModelService } from './application/company-model.service'
import { PrismaCompanyModelRepository } from './infra/prisma-company-model.repository'
import { COMPANY_MODEL_REPOSITORY } from './domain/company-model-repository'

@Module({
  controllers: [CompanyModelController],
  providers: [
    CompanyModelService,
    {
      provide: COMPANY_MODEL_REPOSITORY,
      useClass: PrismaCompanyModelRepository,
    },
  ],
  exports: [COMPANY_MODEL_REPOSITORY],
})
export class CompanyModelModule {}
