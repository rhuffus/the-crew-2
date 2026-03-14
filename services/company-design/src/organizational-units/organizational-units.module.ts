import { Module } from '@nestjs/common'
import { PrismaOrganizationalUnitRepository } from './infra/prisma-organizational-unit.repository'
import { ORGANIZATIONAL_UNIT_REPOSITORY } from './domain/organizational-unit-repository'
import { OrganizationalUnitsController } from './application/organizational-units.controller'

@Module({
  controllers: [OrganizationalUnitsController],
  providers: [
    {
      provide: ORGANIZATIONAL_UNIT_REPOSITORY,
      useClass: PrismaOrganizationalUnitRepository,
    },
  ],
  exports: [ORGANIZATIONAL_UNIT_REPOSITORY],
})
export class OrganizationalUnitsModule {}
