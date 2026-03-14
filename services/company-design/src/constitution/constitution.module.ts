import { Module } from '@nestjs/common'
import { PrismaCompanyConstitutionRepository } from './infra/prisma-company-constitution.repository'
import { COMPANY_CONSTITUTION_REPOSITORY } from './domain/company-constitution-repository'

@Module({
  providers: [
    {
      provide: COMPANY_CONSTITUTION_REPOSITORY,
      useClass: PrismaCompanyConstitutionRepository,
    },
  ],
  exports: [COMPANY_CONSTITUTION_REPOSITORY],
})
export class ConstitutionModule {}
