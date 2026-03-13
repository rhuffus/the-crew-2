import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { InMemoryCompanyConstitutionRepository } from './infra/in-memory-company-constitution.repository'
import { DrizzleCompanyConstitutionRepository } from './infra/drizzle-company-constitution.repository'
import { COMPANY_CONSTITUTION_REPOSITORY } from './domain/company-constitution-repository'

@Module({
  providers: [
    {
      provide: COMPANY_CONSTITUTION_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleCompanyConstitutionRepository
        : InMemoryCompanyConstitutionRepository,
    },
  ],
  exports: [COMPANY_CONSTITUTION_REPOSITORY],
})
export class ConstitutionModule {}
