import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { InMemoryOrganizationalUnitRepository } from './infra/in-memory-organizational-unit.repository'
import { DrizzleOrganizationalUnitRepository } from './infra/drizzle-organizational-unit.repository'
import { ORGANIZATIONAL_UNIT_REPOSITORY } from './domain/organizational-unit-repository'
import { OrganizationalUnitsController } from './application/organizational-units.controller'

@Module({
  controllers: [OrganizationalUnitsController],
  providers: [
    {
      provide: ORGANIZATIONAL_UNIT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleOrganizationalUnitRepository
        : InMemoryOrganizationalUnitRepository,
    },
  ],
  exports: [ORGANIZATIONAL_UNIT_REPOSITORY],
})
export class OrganizationalUnitsModule {}
