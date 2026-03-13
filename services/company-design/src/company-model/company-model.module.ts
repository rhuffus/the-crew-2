import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { CompanyModelController } from './company-model.controller'
import { CompanyModelService } from './application/company-model.service'
import { InMemoryCompanyModelRepository } from './infra/in-memory-company-model.repository'
import { DrizzleCompanyModelRepository } from './infra/drizzle-company-model.repository'
import { COMPANY_MODEL_REPOSITORY } from './domain/company-model-repository'

@Module({
  controllers: [CompanyModelController],
  providers: [
    CompanyModelService,
    {
      provide: COMPANY_MODEL_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleCompanyModelRepository
        : InMemoryCompanyModelRepository,
    },
  ],
  exports: [COMPANY_MODEL_REPOSITORY],
})
export class CompanyModelModule {}
